// This is the actual Shopify Storefront API integration

import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_API_ENDPOINT } from "./shopify-constants"

// Types
export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml?: string
  featuredImage: {
    url: string
    altText: string
  } | null
  priceRange?: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants?: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        price: {
          amount: string
          currencyCode: string
        }
        compareAtPrice: {
          amount: string
          currencyCode: string
        } | null
      }
    }>
  }
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  onSale?: boolean
  availableForSale: boolean
  // Felder für die vereinfachte Produktansicht
  productType?: string
  tags?: string[]
  price?: {
    amount: string
    currencyCode: string
  }
  compareAtPrice?: {
    amount: string
    currencyCode: string
  } | null
  cursor?: string | null
}

export type ShopifyCollection = {
  id: string
  title: string
  handle: string
  description: string
}

export type ProductsResponse = {
  products: ShopifyProduct[]
  hasNextPage: boolean
  endCursor: string | null
  totalPages: number
}

// Helper function to make GraphQL requests to Shopify
async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  try {
    console.log("Shopify API variables:", JSON.stringify(variables));
    
    const response = await fetch(SHOPIFY_STOREFRONT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Shopify API responded with status ${response.status}`)
    }

    const json = await response.json()

    if (json.errors) {
      console.log("Shopify API errors:", JSON.stringify(json.errors));
      throw new Error(json.errors.map((e: any) => e.message).join("\n"))
    }

    console.log("Shopify API response (first level):", 
      Object.keys(json.data).map(key => `${key}: ${!!json.data[key]}`).join(", "));

    return json.data
  } catch (error) {
    console.error("Error fetching from Shopify:", error)
    throw error
  }
}

// Get products
export async function getProducts({
  page = 1,
  perPage = 24,
  sortKey = "TITLE",
  reverse = false,
  query = "",
  cursor = null,
}: {
  page?: number;
  perPage?: number;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  cursor?: string | null;
}) {
  try {
    console.log("getProducts called with query:", query);
    console.log("getProducts parameters:", JSON.stringify({ page, perPage, sortKey, reverse, cursor }));
    
    // Verwende die normale Produktsuche
    const data = await shopifyFetch({
      query: `
        query getProducts(
          $perPage: Int!
          $sortKey: ProductSortKeys
          $reverse: Boolean
          $query: String
          $cursor: String
        ) {
          products(
            first: $perPage
            after: $cursor
            sortKey: $sortKey
            reverse: $reverse
            query: $query
          ) {
            edges {
              cursor
              node {
                id
                title
                description
                handle
                availableForSale
                productType
                tags
                featuredImage {
                  url
                  altText
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      variables: {
        perPage,
        sortKey,
        reverse,
        query,
        cursor
      },
    });

    console.log("API response products count:", data.products?.edges?.length || 0);
    
    if (data.products?.edges?.length === 0) {
      console.warn("No products found with query:", query);
    } else {
      // Log product titles for debugging
      console.log("Products found:", data.products.edges.map((edge: any) => edge.node.title).join(", "));
    }
    
    const products = data.products.edges.map(({ node, cursor }: any) => {
      // Check if any variant has a compareAtPrice that's higher than its price
      const hasCompareAtPrice =
        node.compareAtPriceRange.minVariantPrice.amount > 0 &&
        Number(node.compareAtPriceRange.minVariantPrice.amount) > Number(node.priceRange.minVariantPrice.amount);

      // Get the highest compareAtPrice from all variants
      return {
        id: node.id,
        title: node.title,
        description: node.description,
        handle: node.handle,
        availableForSale: node.availableForSale,
        productType: node.productType,
        tags: node.tags,
        featuredImage: node.featuredImage,
        price: node.priceRange.minVariantPrice,
        compareAtPrice: hasCompareAtPrice ? node.compareAtPriceRange.minVariantPrice : null,
        cursor
      };
    });

    const result = {
      products,
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor,
      totalPages: Math.ceil(products.length / perPage), // Hinweis: Dies ist nur eine Annäherung
    };
    
    console.log(`Returning ${result.products.length} products. hasNextPage: ${result.hasNextPage}`);
    
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Get a single product by handle
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data = await shopifyFetch({
      query: `
        query getProductByHandle($handle: String!) {
          product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            availableForSale
          }
        }
      `,
      variables: {
        handle,
      },
    })

    if (!data.product) {
      console.log(`Product with handle ${handle} not found`)
      return null
    }

    // Check if any variant has a compareAtPrice that's higher than its price
    const hasCompareAtPrice = data.product.variants.edges.some(
      ({ node: variant }: any) =>
        variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount),
    )

    // Get the highest compareAtPrice from all variants
    let highestCompareAtPrice = 0
    data.product.variants.edges.forEach(({ node: variant }: any) => {
      if (variant.compareAtPrice && Number(variant.compareAtPrice.amount) > highestCompareAtPrice) {
        highestCompareAtPrice = Number(variant.compareAtPrice.amount)
      }
    })

    // Determine if the product is on sale
    const onSale =
      hasCompareAtPrice ||
      (data.product.compareAtPriceRange &&
        Number(data.product.compareAtPriceRange.minVariantPrice.amount) >
          Number(data.product.priceRange.minVariantPrice.amount))

    return {
      ...data.product,
      onSale,
      highestCompareAtPrice: highestCompareAtPrice > 0 ? highestCompareAtPrice : null,
    }
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error)
    return null
  }
}

// Get all collections
export async function getCollections(): Promise<ShopifyCollection[]> {
  try {
    const data = await shopifyFetch({
      query: `
        query getCollections {
          collections(first: 100) {
            edges {
              node {
                id
                title
                handle
                description
              }
            }
          }
        }
      `,
    })

    return data.collections.edges.map(({ node }: any) => node)
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}

// Get all unique product types
export async function getProductTypes(): Promise<string[]> {
  try {
    const data = await shopifyFetch({
      query: `
        query getProductTypes {
          productTypes(first: 100) {
            edges {
              node
            }
          }
        }
      `,
    })

    return data.productTypes.edges.map(({ node }: any) => node).filter(Boolean)
  } catch (error) {
    console.error("Error fetching product types:", error)
    return []
  }
}

// Fallback products for when the API fails
export async function getFallbackProducts(): Promise<ProductsResponse> {
  return {
    products: [
      {
        id: "fallback-1",
        title: "Sample Product",
        handle: "sample-product",
        description: "This is a sample product when the API is unavailable.",
        featuredImage: {
          url: "/placeholder.svg",
          altText: "Sample Product",
        },
        availableForSale: true,
        productType: "Sample",
        tags: ["sample"],
        price: {
          amount: "19.99",
          currencyCode: "EUR",
        },
        compareAtPrice: null,
        cursor: null
      },
    ],
    hasNextPage: false,
    endCursor: null,
    totalPages: 1,
  }
}

