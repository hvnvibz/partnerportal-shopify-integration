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

    // Logge die vollständige Antwort für Debugging-Zwecke
    console.log("Shopify API Antwort Status:", response.status);
    
    if (!response.ok) {
      // Versuche, die Fehlerinformationen zu extrahieren
      let errorText = "";
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Fehlertext konnte nicht gelesen werden";
      }
      console.error("Shopify API Fehler:", errorText);
      throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`)
    }

    const responseData = await response.json()
    console.log("Shopify API Antwort:", JSON.stringify(responseData, null, 2));
    
    const { data, errors } = responseData

    if (errors) {
      console.error("Shopify GraphQL errors:", errors)
      throw new Error(`Shopify cart creation failed: ${errors[0].message}`)
    }

    if (data?.cartCreate?.userErrors?.length > 0) {
      console.error("Cart user errors:", data.cartCreate.userErrors)
      throw new Error(`Cart creation failed: ${data.cartCreate.userErrors[0].message}`)
    }

    if (!data?.cartCreate?.cart?.checkoutUrl) {
      throw new Error("No checkout URL received from Shopify")
    }

    return data.cartCreate.cart
  } catch (error) {
    console.error("Error creating cart:", error)
    throw error
  }
} 