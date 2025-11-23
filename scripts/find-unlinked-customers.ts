/**
 * Find Unlinked Customers Script
 * 
 * Zeigt alle Shopify-Kunden, die noch nicht mit Partnerportal-Usern verknüpft sind,
 * zusammen mit möglichen Match-Kandidaten basierend auf verschiedenen Kriterien.
 * 
 * Ausführung:
 *   npx tsx scripts/find-unlinked-customers.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from "@supabase/supabase-js";
import { getAllShopifyCustomers, ShopifyCustomer } from "../lib/shopify-admin";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SHOPIFY_ADMIN_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
  console.error("❌ Fehler: Alle erforderlichen Environment-Variablen müssen gesetzt sein.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function extractCustomerNumberFromNote(note: string | undefined): string {
  if (!note) return '';
  const match = note.match(/Kundennummer:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

function extractCompanyFromNote(note: string | undefined): string {
  if (!note) return '';
  const match = note.match(/Unternehmen:\s*([^,\n]+)/i);
  return match ? match[1].trim() : '';
}

async function findUnlinkedCustomers() {
  console.log("🔍 Suche nach unverknüpften Shopify-Kunden...\n");

  try {
    // Lade alle Shopify-Kunden
    console.log("📥 Lade Shopify-Kunden...");
    const shopifyCustomers = await getAllShopifyCustomers();
    console.log(`✅ ${shopifyCustomers.length} Shopify-Kunden gefunden\n`);

    // Lade alle Partnerportal-User mit Profilen
    console.log("📥 Lade Partnerportal-User...");
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userIds = authUsers?.users.map(u => u.id) || [];
    
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, customer_number, display_name, shopify_customer_id')
      .in('id', userIds);

    // Erstelle Mappings
    const emailToUserMap = new Map<string, { id: string; email: string; customer_number?: string; display_name?: string }>();
    const customerNumberToUserMap = new Map<string, { id: string; email: string; customer_number?: string; display_name?: string }>();

    authUsers?.users.forEach(u => {
      if (u.email) {
        const profile = profiles?.find(p => p.id === u.id);
        emailToUserMap.set(u.email.toLowerCase(), {
          id: u.id,
          email: u.email,
          customer_number: profile?.customer_number || undefined,
          display_name: profile?.display_name || undefined
        });

        if (profile?.customer_number && typeof profile.customer_number === 'string') {
          customerNumberToUserMap.set(profile.customer_number.trim().toLowerCase(), {
            id: u.id,
            email: u.email,
            customer_number: profile.customer_number,
            display_name: profile.display_name || undefined
          });
        }
      }
    });

    // Finde unverknüpfte Shopify-Kunden
    const unlinkedCustomers: Array<{
      shopify: ShopifyCustomer;
      possibleMatches: Array<{ user: { id: string; email: string; customer_number?: string; display_name?: string }; matchReason: string }>;
    }> = [];

    for (const shopifyCustomer of shopifyCustomers) {
      // Prüfe ob bereits verknüpft
      const linkedProfile = profiles?.find(p => p.shopify_customer_id === shopifyCustomer.id);
      if (linkedProfile) {
        continue; // Bereits verknüpft
      }

      const possibleMatches: Array<{ user: { id: string; email: string; customer_number?: string; display_name?: string }; matchReason: string }> = [];

      // Suche nach möglichen Matches
      if (shopifyCustomer.email) {
        const emailMatch = emailToUserMap.get(shopifyCustomer.email.toLowerCase());
        if (emailMatch) {
          possibleMatches.push({ user: emailMatch, matchReason: 'E-Mail-Adresse' });
        }
      }

      const customerNumber = extractCustomerNumberFromNote(shopifyCustomer.note);
      if (customerNumber) {
        const cnMatch = customerNumberToUserMap.get(customerNumber.toLowerCase());
        if (cnMatch && !possibleMatches.find(m => m.user.id === cnMatch.id)) {
          possibleMatches.push({ user: cnMatch, matchReason: 'Kundennummer' });
        }
      }

      if (possibleMatches.length > 0 || !shopifyCustomer.email) {
        unlinkedCustomers.push({
          shopify: shopifyCustomer,
          possibleMatches
        });
      }
    }

    // Ausgabe
    console.log("=".repeat(80));
    console.log("📊 UNVERKNÜPFTE SHOPIFY-KUNDEN");
    console.log("=".repeat(80));
    console.log(`Gesamt: ${unlinkedCustomers.length} unverknüpfte Kunden\n`);

    if (unlinkedCustomers.length === 0) {
      console.log("✅ Alle Shopify-Kunden sind verknüpft!\n");
      return;
    }

    // Gruppiere nach Match-Status
    const withMatches = unlinkedCustomers.filter(c => c.possibleMatches.length > 0);
    const withoutMatches = unlinkedCustomers.filter(c => c.possibleMatches.length === 0);

    if (withMatches.length > 0) {
      console.log(`\n🔗 Kunden mit möglichen Matches (${withMatches.length}):\n`);
      withMatches.forEach((item, idx) => {
        const c = item.shopify;
        console.log(`${idx + 1}. Shopify ID: ${c.id}`);
        console.log(`   E-Mail: ${c.email || 'N/A'}`);
        console.log(`   Name: ${c.first_name} ${c.last_name}`);
        const customerNumber = extractCustomerNumberFromNote(c.note);
        if (customerNumber) {
          console.log(`   Kundennummer (aus Note): ${customerNumber}`);
        }
        console.log(`   Mögliche Matches:`);
        item.possibleMatches.forEach(match => {
          console.log(`     → ${match.user.email} (${match.user.display_name || 'N/A'}) - ${match.matchReason}`);
          if (match.user.customer_number) {
            console.log(`       Kundennummer: ${match.user.customer_number}`);
          }
        });
        console.log();
      });
    }

    if (withoutMatches.length > 0) {
      console.log(`\n❓ Kunden ohne Matches (${withoutMatches.length}):\n`);
      withoutMatches.forEach((item, idx) => {
        const c = item.shopify;
        console.log(`${idx + 1}. Shopify ID: ${c.id}`);
        console.log(`   E-Mail: ${c.email || 'N/A'}`);
        console.log(`   Name: ${c.first_name} ${c.last_name}`);
        const customerNumber = extractCustomerNumberFromNote(c.note);
        if (customerNumber) {
          console.log(`   Kundennummer (aus Note): ${customerNumber}`);
        }
        const company = extractCompanyFromNote(c.note);
        if (company) {
          console.log(`   Firma (aus Note): ${company}`);
        }
        console.log();
      });
    }

    console.log("=".repeat(80));
    console.log("\n💡 Tipp: Verwenden Sie das Admin-Interface oder das manuelle Linking-Script,");
    console.log("   um diese Kunden manuell zu verknüpfen.\n");

  } catch (error: any) {
    console.error(`\n❌ Fehler: ${error.message}`);
    process.exit(1);
  }
}

findUnlinkedCustomers()
  .then(() => {
    console.log("✅ Script erfolgreich beendet");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script fehlgeschlagen:", error);
    process.exit(1);
  });

