import { ProductUpsellItem } from "@/components/shop/product-upsell-item"
import type { Product } from "@/types"

interface ProductUpsellProps {
  products: Product[]
  mainProductId: string // To avoid showing the current product as an upsell
}

export function ProductUpsell({ products, mainProductId }: ProductUpsellProps) {
  // Filter out the main product and ensure there are products to show
  const upsellProducts = products
    .filter(product => product.id !== mainProductId)
    .filter(product => product.title.includes("KAWK") || product.handle.includes("kawk"))

  // Create a single placeholder product for testing if no products are found
  const placeholderProduct: Product = {
    id: "placeholder1",
    title: "INDUWA Connect",
    handle: "induwa-connect",
    description: "Smart-Home Modul zur Fernüberwachung Ihrer Wasseraufbereitungsanlage",
    descriptionHtml: "Smart-Home Modul zur Fernüberwachung Ihrer Wasseraufbereitungsanlage",
    featuredImage: {
      url: "https://placehold.co/400x400?text=INDUWA+Connect",
      altText: "INDUWA Connect"
    },
    variants: {
      edges: [
        {
          node: {
            id: "variant1",
            title: "Standard",
            availableForSale: true,
            price: {
              amount: "299.90",
              currencyCode: "EUR"
            },
            compareAtPrice: null
          }
        }
      ]
    },
    priceRange: {
      minVariantPrice: {
        amount: "299.90",
        currencyCode: "EUR"
      },
      maxVariantPrice: {
        amount: "299.90",
        currencyCode: "EUR"
      }
    },
    availableForSale: true
  }

  // Use real product if available, otherwise use placeholder
  const displayProduct = upsellProducts.length > 0 ? upsellProducts[0] : placeholderProduct

  return (
    <div className="mt-6 border rounded-lg p-6 bg-gray-50">
      <ProductUpsellItem product={displayProduct} />
    </div>
  )
} 