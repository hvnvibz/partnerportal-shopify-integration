import { Suspense } from "react"
import { ProductDetail } from "@/components/shop/product-detail"
import { getProductByHandle, getProducts, type ShopifyProduct } from "@/lib/shopify-storefront"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Cart } from "@/components/shop/cart"

export default async function ProductPage({ params }: { params: { handle: string } }) {
  // Fetch the product data server-side for initial render
  const product = await getProductByHandle(params.handle)

  // Fetch related products - specifically KAWK-D and INDUWA Connect products
  const { products: relatedProductsRaw } = await getProducts({
    page: 1,
    perPage: 20,
    query: "title:*KAWK-D* OR title:*INDUWA* OR tag:*KAWK-D* OR tag:*INDUWA*",
  })

  console.log("Found related products:", relatedProductsRaw.map((p: any) => ({
    title: p.title,
    sku: p.sku || p.variants?.edges[0]?.node?.sku || "-"
  })));

  // Ensure all required fields are present for the Product type
  let relatedProducts: import("@/types").Product[] = relatedProductsRaw.map((p: import("@/lib/shopify-storefront").ShopifyProduct) => ({
    ...p,
    priceRange: p.priceRange || {
      minVariantPrice: { amount: "0", currencyCode: "EUR" },
      maxVariantPrice: { amount: "0", currencyCode: "EUR" }
    },
    variants: p.variants || { edges: [] },
    induwaConnect: Boolean(p.induwaConnect),
  }));

  // Upsell-Logik für INDUWA Connect
  const UPSALE_PRODUCT_ID = "gid://shopify/Product/9261144146248";
  if (product?.induwaConnect) {
    // Produkt mit der ID hinzufügen, falls nicht schon enthalten
    const alreadyIncluded = relatedProducts.some((p: import("@/types").Product) => p.id === UPSALE_PRODUCT_ID);
    if (!alreadyIncluded) {
      const upsellProduct = await getProductByHandle("9261144146248");
      if (upsellProduct) {
        relatedProducts = [
          ...relatedProducts,
          {
            ...upsellProduct,
            priceRange: upsellProduct.priceRange || {
              minVariantPrice: { amount: "0", currencyCode: "EUR" },
              maxVariantPrice: { amount: "0", currencyCode: "EUR" }
            },
            variants: upsellProduct.variants || { edges: [] },
            induwaConnect: Boolean(upsellProduct.induwaConnect),
          }
        ];
      }
    }
  } else {
    // Produkt mit der ID entfernen, falls enthalten
    relatedProducts = relatedProducts.filter((p: import("@/types").Product) => p.id !== UPSALE_PRODUCT_ID);
  }

  if (!product) {
    relatedProducts = [];
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Product Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Cart />
          </header>
          <div className="p-4">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">Product not found</h2>
              <p className="text-muted-foreground mt-2">The requested product could not be found.</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Zubehörteile</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="p-4">
          <Suspense fallback={<div>Loading product...</div>}>
            <ProductDetail 
              product={{
                ...product,
                priceRange: product.priceRange || {
                  minVariantPrice: { amount: "0", currencyCode: "EUR" },
                  maxVariantPrice: { amount: "0", currencyCode: "EUR" }
                },
                variants: product.variants || { edges: [] },
                induwaConnect: Boolean(product.induwaConnect),
              }}
              relatedProducts={relatedProducts}
            />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

