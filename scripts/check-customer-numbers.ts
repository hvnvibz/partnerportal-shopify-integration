/**
 * Check Customer Numbers Script
 * 
 * Prüft, welche Shopify-Kunden Kundennummern in ihren Notes haben
 * und ob es Partnerportal-User mit diesen Kundennummern gibt.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from "@supabase/supabase-js";
import { getAllShopifyCustomers, ShopifyCustomer } from "../lib/shopify-admin";

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
  // Versuche verschiedene Formate
  const patterns = [
    /Kundennummer:\s*([^,\n]+)/i,
    /Kunden-Nummer:\s*([^,\n]+)/i,
    /KdNr\.?:\s*([^,\n]+)/i,
    /Kd-Nr\.?:\s*([^,\n]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = note.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

async function checkCustomerNumbers() {
  console.log("🔍 Prüfe Kundennummern...\n");

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
      .select('id, customer_number, display_name, shopify_customer_id, email')
      .in('id', userIds);

    // Erstelle Kundennummer-Mapping
    const customerNumberToUsers = new Map<string, Array<{ id: string; email: string; display_name?: string }>>();
    
    if (profiles) {
      profiles.forEach(profile => {
        if (profile.customer_number && typeof profile.customer_number === 'string') {
          const cn = profile.customer_number.trim().toLowerCase();
          if (!customerNumberToUsers.has(cn)) {
            customerNumberToUsers.set(cn, []);
          }
          const user = authUsers?.users.find(u => u.id === profile.id);
          customerNumberToUsers.get(cn)!.push({
            id: profile.id,
            email: user?.email || 'N/A',
            display_name: profile.display_name || undefined
          });
        }
      });
    }

    console.log(`📊 Partnerportal-User mit Kundennummern: ${customerNumberToUsers.size}\n`);

    // Prüfe Shopify-Kunden
    console.log("=".repeat(80));
    console.log("📋 SHOPIFY-KUNDEN MIT KUNDENNUMMERN");
    console.log("=".repeat(80));
    console.log();

    const unlinkedWithCustomerNumbers: Array<{
      shopify: ShopifyCustomer;
      customerNumber: string;
      possibleMatches: Array<{ id: string; email: string; display_name?: string }>;
    }> = [];

    for (const shopifyCustomer of shopifyCustomers) {
      const customerNumber = extractCustomerNumberFromNote(shopifyCustomer.note);
      
      if (customerNumber) {
        const isLinked = profiles?.find(p => p.shopify_customer_id === shopifyCustomer.id);
        const possibleMatches = customerNumberToUsers.get(customerNumber.toLowerCase()) || [];

        console.log(`Shopify ID: ${shopifyCustomer.id}`);
        console.log(`  E-Mail: ${shopifyCustomer.email || 'N/A'}`);
        console.log(`  Name: ${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`);
        console.log(`  Kundennummer (aus Note): "${customerNumber}"`);
        console.log(`  Status: ${isLinked ? '✅ Verknüpft' : '❌ Nicht verknüpft'}`);
        
        if (possibleMatches.length > 0 && !isLinked) {
          console.log(`  🔗 Mögliche Matches:`);
          possibleMatches.forEach(match => {
            console.log(`     → ${match.email} (${match.display_name || 'N/A'})`);
          });
          unlinkedWithCustomerNumbers.push({
            shopify: shopifyCustomer,
            customerNumber,
            possibleMatches
          });
        } else if (possibleMatches.length === 0 && !isLinked) {
          console.log(`  ⚠️  Keine Partnerportal-User mit dieser Kundennummer gefunden`);
        }
        console.log();
      }
    }

    if (unlinkedWithCustomerNumbers.length > 0) {
      console.log("=".repeat(80));
      console.log(`🔗 ${unlinkedWithCustomerNumbers.length} UNVERKNÜPFTE KUNDEN MIT MATCHENDEN KUNDENNUMMERN`);
      console.log("=".repeat(80));
      console.log();
      console.log("Diese Kunden können automatisch verknüpft werden!\n");
      console.log("Führen Sie das Bulk-Linking-Script aus:");
      console.log("  npx tsx scripts/bulk-link-customers.ts\n");
    } else {
      console.log("✅ Alle Shopify-Kunden mit Kundennummern sind bereits verknüpft oder haben keine Matches.\n");
    }

  } catch (error: any) {
    console.error(`\n❌ Fehler: ${error.message}`);
    process.exit(1);
  }
}

checkCustomerNumbers()
  .then(() => {
    console.log("✅ Script erfolgreich beendet");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script fehlgeschlagen:", error);
    process.exit(1);
  });

