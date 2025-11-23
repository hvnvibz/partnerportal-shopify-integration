/**
 * Test Shopify Token Script
 * Prüft, ob der Shopify Admin API Token funktioniert
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

if (!SHOPIFY_ADMIN_ACCESS_TOKEN || !SHOPIFY_STORE_DOMAIN) {
  console.error("❌ Fehler: SHOPIFY_ADMIN_ACCESS_TOKEN und NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN müssen gesetzt sein");
  process.exit(1);
}

const SHOPIFY_STORE_URL = `https://${SHOPIFY_STORE_DOMAIN}`;

async function testToken() {
  console.log("🔍 Teste Shopify Admin API Token...\n");
  console.log(`Store Domain: ${SHOPIFY_STORE_DOMAIN}`);
  console.log(`Store URL: ${SHOPIFY_STORE_URL}`);
  console.log(`Token (erste 10 Zeichen): ${SHOPIFY_ADMIN_ACCESS_TOKEN.substring(0, 10)}...`);
  console.log(`Token Länge: ${SHOPIFY_ADMIN_ACCESS_TOKEN.length}\n`);

  // Test mit verschiedenen API-Versionen
  const apiVersions = ['2024-01', '2024-10', '2025-01'];

  for (const version of apiVersions) {
    console.log(`\n📡 Teste API-Version: ${version}`);
    const url = `${SHOPIFY_STORE_URL}/admin/api/${version}/customers.json?limit=1`;
    console.log(`URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN.trim(),
          'Content-Type': 'application/json',
        },
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Erfolg! Gefundene Kunden: ${data.customers?.length || 0}`);
        console.log(`✅ API-Version ${version} funktioniert!\n`);
        break;
      } else {
        const errorText = await response.text();
        console.log(`❌ Fehler: ${errorText.substring(0, 200)}`);
      }
    } catch (error: any) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }
}

testToken().catch(console.error);

