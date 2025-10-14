import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STOREFRONT_API_ENDPOINT } from "./shopify-constants"

interface CartLine {
  merchandiseId: string
  quantity: number
  attributes?: Array<{ key: string; value: string }>
}

interface CartCreateInput {
  lines: CartLine[]
  discountCodes?: string[]
  note?: string
}

/**
 * Erstellt einen neuen Warenkorb in Shopify und gibt die Checkout-URL zurück
 */
export async function createCart(input: CartCreateInput) {
  const { lines, discountCodes = [], note = "" } = input

  // GraphQL mutation zum Erstellen eines Warenkorbs
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      featuredImage {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `

  try {
    // Basic runtime config validation to surface misconfiguration in logs
    if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.error("[ShopifyCart] Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN env var")
    }
    if (!SHOPIFY_STOREFRONT_API_ENDPOINT) {
      console.error("[ShopifyCart] Missing SHOPIFY_STOREFRONT_API_ENDPOINT env var")
    }
    console.log("[ShopifyCart] Using endpoint:", SHOPIFY_STOREFRONT_API_ENDPOINT.replace(/(https:\/\/)([^/]+)(.*)/, "$1$2$3"))

    // Verwende den konfigurierten API-Endpunkt
    const response = await fetch(SHOPIFY_STOREFRONT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            lines,
            note,
            ...(discountCodes.length > 0 && { discountCodes }),
          },
        },
      }),
    })

    // Logge Response-Metadaten
    console.log("[ShopifyCart] Response Status:", response.status)
    
    if (!response.ok) {
      // Versuche, die Fehlerinformationen zu extrahieren
      let errorText = "";
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Fehlertext konnte nicht gelesen werden";
      }
      console.error("[ShopifyCart] HTTP Fehler:", errorText)
      throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
    }

    const responseData = await response.json()
    console.log("[ShopifyCart] GraphQL Antwort erhalten")
    
    const { data, errors } = responseData

    if (errors) {
      console.error("[ShopifyCart] GraphQL errors:", errors)
      throw new Error(`Shopify cart creation failed: ${errors[0].message}`)
    }

    if (data?.cartCreate?.userErrors?.length > 0) {
      console.error("[ShopifyCart] Cart user errors:", data.cartCreate.userErrors)
      throw new Error(`Cart creation failed: ${data.cartCreate.userErrors[0].message}`)
    }

    if (!data?.cartCreate?.cart?.checkoutUrl) {
      console.error("[ShopifyCart] Missing checkoutUrl in response:", data)
      throw new Error("No checkout URL received from Shopify")
    }

    return data.cartCreate.cart
  } catch (error) {
    console.error("[ShopifyCart] Error creating cart:", error)
    throw error
  }
} 