/**
 * Bulk Link Customers Script
 * 
 * Dieses Script verknüpft alle Shopify-Kunden automatisch mit bestehenden Partnerportal-Usern.
 * 
 * Ausführung:
 *   npx ts-node --esm scripts/bulk-link-customers.ts
 * 
 * Oder mit tsx:
 *   npx tsx scripts/bulk-link-customers.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from "@supabase/supabase-js";
import { getAllShopifyCustomers, formatCustomerForSupabase, ShopifyCustomer } from "../lib/shopify-admin";

// Helper functions to extract data from Shopify notes
function extractCustomerNumberFromNote(note: string | undefined): string {
  if (!note) return '';
  
  // Strategie 1: Suche nach Format "Kundennummer: ..."
  const formatMatch = note.match(/Kundennummer:\s*([^,\n]+)/i);
  if (formatMatch) {
    return formatMatch[1].trim();
  }
  
  // Strategie 2: Wenn die Note nur eine Zahl (oder hauptsächlich eine Zahl) enthält, verwende diese
  const trimmedNote = note.trim();
  
  // Prüfe ob die Note nur aus Zahlen besteht (mit optionalen Leerzeichen)
  const onlyNumbers = /^\s*\d+\s*$/.test(trimmedNote);
  if (onlyNumbers) {
    return trimmedNote.replace(/\s+/g, ''); // Entferne Leerzeichen
  }
  
  // Strategie 3: Suche nach der ersten Zahl in der Note (falls mehrere vorhanden)
  const firstNumber = trimmedNote.match(/^\s*(\d+)/);
  if (firstNumber) {
    return firstNumber[1];
  }
  
  return '';
}

function extractCompanyFromNote(note: string | undefined): string {
  if (!note) return '';
  const match = note.match(/Unternehmen:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

// Environment variables check (silent unless error)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein");
  process.exit(1);
}

if (!SHOPIFY_ADMIN_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
  console.error("❌ Fehler: SHOPIFY_ADMIN_ACCESS_TOKEN und NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN müssen gesetzt sein");
  process.exit(1);
}

// Admin client mit Service Role Key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function bulkLinkCustomers() {
  console.log("🚀 Starte Massen-Verknüpfung...\n");

  try {
    // Hole alle Shopify-Kunden
    console.log("📥 Lade alle Shopify-Kunden...");
    const shopifyCustomers = await getAllShopifyCustomers();
    console.log(`✅ ${shopifyCustomers.length} Shopify-Kunden gefunden\n`);

    // Hole alle Supabase-User mit Profilen
    console.log("📥 Lade alle Partnerportal-User...");
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Fehler beim Laden der User: ${usersError.message}`);
    }

    console.log(`✅ ${authUsers.users.length} Partnerportal-User gefunden\n`);

    // Lade Profile-Daten für alle User
    const userIds = authUsers.users.map(u => u.id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, customer_number, display_name, shopify_customer_id')
      .in('id', userIds);

    if (profilesError) {
      console.warn(`⚠️  Warnung beim Laden der Profile: ${profilesError.message}`);
    }

    // Erstelle verschiedene Mappings für Matching
    const emailToUserIdMap = new Map<string, string>();
    const customerNumberToUserIdMap = new Map<string, string>();
    const nameToUserIdMap = new Map<string, string[]>();

    authUsers.users.forEach(u => {
      if (u.email) {
        emailToUserIdMap.set(u.email.toLowerCase(), u.id);
      }
    });

    // Erstelle Kundennummer-Mapping
    if (profiles) {
      profiles.forEach(profile => {
        // Kundennummer kann String oder Number sein
        let customerNumber: string | null = null;
        if (profile.customer_number) {
          if (typeof profile.customer_number === 'string') {
            customerNumber = profile.customer_number.trim();
          } else if (typeof profile.customer_number === 'number') {
            customerNumber = String(profile.customer_number);
          }
        }
        
        if (customerNumber) {
          customerNumberToUserIdMap.set(customerNumber.toLowerCase(), profile.id);
        }
      });
    }

    console.log(`📊 Matching-Strategien vorbereitet:`);
    console.log(`   - E-Mail-Matching: ${emailToUserIdMap.size} Einträge`);
    console.log(`   - Kundennummer-Matching: ${customerNumberToUserIdMap.size} Einträge\n`);

    // Statistik
    const stats = {
      linked: 0,
      skipped: 0,
      errors: 0
    };

    const details = {
      linked: [] as Array<{ email: string; shopify_id: number; user_id: string }>,
      skipped: [] as Array<{ email: string; shopify_id: number; reason: string }>,
      errors: [] as Array<{ email: string; shopify_id: number; error: string }>
    };

    console.log("🔗 Starte Verknüpfung...\n");

    // Verknüpfe jeden Shopify-Kunden
    for (let i = 0; i < shopifyCustomers.length; i++) {
      const shopifyCustomer = shopifyCustomers[i];
      const progress = `[${i + 1}/${shopifyCustomers.length}]`;

      try {
        // Überspringe Kunden ohne E-Mail
        if (!shopifyCustomer.email) {
          stats.skipped++;
          details.skipped.push({
            email: 'N/A',
            shopify_id: shopifyCustomer.id,
            reason: 'Keine E-Mail-Adresse'
          });
          continue;
        }

        const email = shopifyCustomer.email.toLowerCase();
        let userId = emailToUserIdMap.get(email);
        let matchMethod = 'E-Mail';

        // Strategie 1: E-Mail-Matching (bereits geprüft)
        
        // Strategie 2: Kundennummer-Matching (falls E-Mail nicht gefunden)
        if (!userId) {
          const customerNumber = extractCustomerNumberFromNote(shopifyCustomer.note);
          if (customerNumber) {
            userId = customerNumberToUserIdMap.get(customerNumber.toLowerCase());
            if (userId) {
              matchMethod = 'Kundennummer';
              console.log(`   ℹ️  ${shopifyCustomer.email}: E-Mail-Match fehlgeschlagen, aber Kundennummer-Match gefunden (${customerNumber})`);
            }
          }
        }

        // Prüfe ob User gefunden wurde
        if (!userId) {
          stats.skipped++;
          const customerNumber = extractCustomerNumberFromNote(shopifyCustomer.note);
          const reason = customerNumber 
            ? `Kein Partnerportal-User gefunden (E-Mail: ${shopifyCustomer.email}, Kundennummer: ${customerNumber})`
            : `Kein Partnerportal-User mit dieser E-Mail gefunden (${shopifyCustomer.email})`;
          
          details.skipped.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            reason: reason
          });
          continue;
        }

        // Prüfe ob bereits verknüpft
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('shopify_customer_id')
          .eq('id', userId)
          .single();

        if (existingProfile?.shopify_customer_id) {
          stats.skipped++;
          details.skipped.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            reason: 'Bereits verknüpft'
          });
          continue;
        }

        // Verknüpfe und synchronisiere Daten
        const supabaseData = formatCustomerForSupabase(shopifyCustomer);
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(supabaseData)
          .eq('id', userId);

        if (updateError) {
          console.error(`${progress} ❌ Fehler bei ${shopifyCustomer.email}: ${updateError.message}`);
          stats.errors++;
          details.errors.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            error: updateError.message
          });
        } else {
          console.log(`${progress} ✅ Verknüpft: ${shopifyCustomer.email} → Shopify ID ${shopifyCustomer.id} (via ${matchMethod})`);
          stats.linked++;
          details.linked.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            user_id: userId
          });
        }

        // Rate limiting: Kleine Pause zwischen Updates
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`${progress} ❌ Fehler bei ${shopifyCustomer.email || 'N/A'}:`, error.message);
        stats.errors++;
        details.errors.push({
          email: shopifyCustomer.email || 'N/A',
          shopify_id: shopifyCustomer.id,
          error: error.message || 'Unbekannter Fehler'
        });
      }
    }

    // Zusammenfassung
    console.log("\n" + "=".repeat(60));
    console.log("📊 ZUSAMMENFASSUNG");
    console.log("=".repeat(60));
    console.log(`✅ Verknüpft:     ${stats.linked}`);
    console.log(`⏭️  Übersprungen:  ${stats.skipped}`);
    console.log(`❌ Fehler:        ${stats.errors}`);
    console.log("=".repeat(60) + "\n");

    if (details.linked.length > 0) {
      console.log("✅ Verknüpfte Kunden:");
      details.linked.slice(0, 10).forEach(item => {
        console.log(`   - ${item.email} (Shopify ID: ${item.shopify_id})`);
      });
      if (details.linked.length > 10) {
        console.log(`   ... und ${details.linked.length - 10} weitere`);
      }
      console.log();
    }

    if (details.skipped.length > 0) {
      console.log("⏭️  Übersprungene Kunden (erste 10):");
      details.skipped.slice(0, 10).forEach(item => {
        console.log(`   - ${item.email}: ${item.reason}`);
      });
      if (details.skipped.length > 10) {
        console.log(`   ... und ${details.skipped.length - 10} weitere`);
      }
      console.log();
    }

    if (details.errors.length > 0) {
      console.log("❌ Fehler (erste 10):");
      details.errors.slice(0, 10).forEach(item => {
        console.log(`   - ${item.email}: ${item.error}`);
      });
      if (details.errors.length > 10) {
        console.log(`   ... und ${details.errors.length - 10} weitere`);
      }
      console.log();
    }

    console.log("✨ Verknüpfung abgeschlossen!\n");

  } catch (error: any) {
    console.error("\n❌ Fehler:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Script ausführen
bulkLinkCustomers()
  .then(() => {
    console.log("✅ Script erfolgreich beendet");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script fehlgeschlagen:", error);
    process.exit(1);
  });

