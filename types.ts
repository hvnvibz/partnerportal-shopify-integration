export type Product = {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml?: string
  featuredImage: {
    url: string
    altText: string
  } | null
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        sku?: string
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
  highestCompareAtPrice?: number | null
  sku?: string
}

