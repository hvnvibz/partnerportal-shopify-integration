// Shopify API Constants
// Diese Werte sollten in einer .env-Datei gespeichert und über process.env abgerufen werden
// für eine sichere Produktionsumgebung

export const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "your-store.myshopify.com"
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "your-storefront-access-token"
export const SHOPIFY_STOREFRONT_API_ENDPOINT = process.env.SHOPIFY_STOREFRONT_API_ENDPOINT || `https://${SHOPIFY_STORE_DOMAIN}/api/graphql` 