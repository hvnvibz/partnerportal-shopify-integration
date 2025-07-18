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
  images?: Array<{
    url: string
    altText: string
  }> | null
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
  induwaConnect?: boolean
  upselling_1a?: string | null
  upselling_2?: string | null
  upselling_2a?: string | null
  upselling_single?: string | null
  productType?: string
  cross_selling_1?: string | null
  cross_selling_2?: string | null
  cross_selling_3?: string | null
  hide_from_listing?: boolean
}

