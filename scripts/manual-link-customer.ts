/**
 * Manual Link Customer Script
 * 
 * Verknüpft einen einzelnen Shopify-Kunden manuell mit einem Partnerportal-User.
 * 
 * Verwendung:
 *   npx tsx scripts/manual-link-customer.ts <shopify-customer-id> <supabase-user-id>
 * 
 * Beispiel:
 *   npx tsx scripts/manual-link-customer.ts 9398914875720 abc123-def456-...
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from "@supabase/supabase-js";
import { getShopifyCustomer, formatCustomerForSupabase } from "../lib/shopify-admin";

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

async function manualLinkCustomer(shopifyCustomerId: string, supabaseUserId: string) {
  console.log(`🔗 Verknüpfe Shopify-Kunde ${shopifyCustomerId} mit Partnerportal-User ${supabaseUserId}...\n`);

  try {
    // Prüfe ob User existiert
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
    if (userError || !user) {
      console.error(`❌ Fehler: Partnerportal-User nicht gefunden: ${userError?.message || 'Unbekannter Fehler'}`);
      process.exit(1);
    }

    console.log(`✅ Partnerportal-User gefunden: ${user.user.email}`);

    // Prüfe ob bereits verknüpft
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('shopify_customer_id, email')
      .eq('id', supabaseUserId)
      .single();

    if (existingProfile?.shopify_customer_id) {
      console.log(`⚠️  Warnung: User ist bereits mit Shopify-Kunde ${existingProfile.shopify_customer_id} verknüpft.`);
      console.log(`   Diese Verknüpfung wird überschrieben.\n`);
    }

    // Hole Shopify-Kundendaten
    console.log(`📥 Lade Shopify-Kundendaten...`);
    const shopifyCustomer = await getShopifyCustomer(parseInt(shopifyCustomerId));
    if (!shopifyCustomer) {
      console.error(`❌ Fehler: Shopify-Kunde nicht gefunden`);
      process.exit(1);
    }

    console.log(`✅ Shopify-Kunde gefunden: ${shopifyCustomer.email || 'N/A'}`);
    console.log(`   Name: ${shopifyCustomer.first_name} ${shopifyCustomer.last_name}\n`);

    // Verknüpfe und synchronisiere
    const supabaseData = formatCustomerForSupabase(shopifyCustomer);
    
    console.log(`💾 Aktualisiere Partnerportal-Profil...`);
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(supabaseData)
      .eq('id', supabaseUserId);

    if (updateError) {
      console.error(`❌ Fehler beim Aktualisieren: ${updateError.message}`);
      process.exit(1);
    }

    console.log(`\n✅ Erfolgreich verknüpft!`);
    console.log(`   Shopify-Kunde: ${shopifyCustomer.id} (${shopifyCustomer.email || 'N/A'})`);
    console.log(`   Partnerportal-User: ${supabaseUserId} (${user.user.email})\n`);

  } catch (error: any) {
    console.error(`\n❌ Fehler: ${error.message}`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error("❌ Fehler: Ungültige Anzahl von Argumenten");
  console.error("\nVerwendung:");
  console.error("  npx tsx scripts/manual-link-customer.ts <shopify-customer-id> <supabase-user-id>");
  console.error("\nBeispiel:");
  console.error("  npx tsx scripts/manual-link-customer.ts 9398914875720 abc123-def456-...");
  process.exit(1);
}

const [shopifyCustomerId, supabaseUserId] = args;

manualLinkCustomer(shopifyCustomerId, supabaseUserId)
  .then(() => {
    console.log("✅ Script erfolgreich beendet");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script fehlgeschlagen:", error);
    process.exit(1);
  });

