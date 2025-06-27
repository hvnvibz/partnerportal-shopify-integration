import { Suspense } from "react"
import { ProductDetail } from "@/components/shop/product-detail"
import { getProductByHandle, getProducts, type ShopifyProduct, getProductById } from "@/lib/shopify-storefront"
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
  function toProduct(p: import("@/lib/shopify-storefront").ShopifyProduct): import("@/types").Product {
    let hide_from_listing: boolean | undefined = undefined;
    if (typeof p.hide_from_listing === 'boolean') {
      hide_from_listing = p.hide_from_listing ? true : undefined;
    } else if (typeof p.hide_from_listing === 'string') {
      hide_from_listing = p.hide_from_listing === 'true' ? true : undefined;
    }
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      descriptionHtml: p.descriptionHtml,
      featuredImage: p.featuredImage,
      images: p.images,
      priceRange: p.priceRange || {
        minVariantPrice: { amount: "0", currencyCode: "EUR" },
        maxVariantPrice: { amount: "0", currencyCode: "EUR" }
      },
      variants: p.variants || { edges: [] },
      compareAtPriceRange: p.compareAtPriceRange,
      onSale: p.onSale,
      availableForSale: p.availableForSale,
      highestCompareAtPrice: typeof p.highestCompareAtPrice === 'number' ? p.highestCompareAtPrice : null,
      sku: typeof p.sku === 'string' ? p.sku : '',
      induwaConnect: Boolean(p.induwaConnect),
      upselling_1a: p.upselling_1a,
      upselling_2: p.upselling_2,
      productType: p.productType,
      cross_selling_1: p.cross_selling_1,
      cross_selling_2: p.cross_selling_2,
      cross_selling_3: p.cross_selling_3,
      hide_from_listing,
    };
  }

  let productRaw = await getProductByHandle(params.handle);
  let product = productRaw ? toProduct(productRaw) : undefined;
  console.log("[DEBUG] Produkt geladen:", product);

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

  let relatedProducts: import("@/types").Product[] = relatedProductsRaw
    .map(toProduct)
    .filter((p: import("@/types").Product) => p.hide_from_listing !== true);

  // Upsell-Logik für INDUWA Connect
  const UPSALE_PRODUCT_ID = "gid://shopify/Product/9261144146248";
  if (product?.induwaConnect) {
    // Produkt mit der ID hinzufügen, falls nicht schon enthalten
    const alreadyIncluded = relatedProducts.some((p: import("@/types").Product) => p.id === UPSALE_PRODUCT_ID);
    if (!alreadyIncluded) {
      const upsellProductRaw = await getProductByHandle("9261144146248");
      if (upsellProductRaw) {
        const upsellProduct = toProduct(upsellProductRaw);
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

  // Upsell-Produkte anhand der Metafelder laden (GIDs und Arrays unterstützen)
  let upsellProducts: import("@/types").Product[] = [];
  let upsellIds: string[] = [];
  if (product?.upselling_1a) {
    try {
      const val = JSON.parse(product.upselling_1a);
      if (Array.isArray(val)) upsellIds.push(...val);
      else if (typeof val === 'string') upsellIds.push(val);
    } catch {
      upsellIds.push(product.upselling_1a);
    }
  }
  if (product?.upselling_2) upsellIds.push(product.upselling_2);
  if (upsellIds.length > 0) {
    console.log("[DEBUG] Upsell GIDs:", upsellIds);
    const loadedUpsells = await Promise.all(
      upsellIds.map(async (gid) => {
        if (!gid) return null;
        const p = await getProductById(gid);
        if (!p) return null;
        let hide_from_listing: boolean | undefined = undefined;
        if (typeof p.hide_from_listing === 'boolean') {
          hide_from_listing = p.hide_from_listing ? true : undefined;
        } else if (typeof p.hide_from_listing === 'string') {
          hide_from_listing = p.hide_from_listing === 'true' ? true : undefined;
        }
        if (hide_from_listing) return null;
        return {
          id: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description,
          descriptionHtml: p.descriptionHtml,
          featuredImage: p.featuredImage,
          images: p.images,
          priceRange: p.priceRange || {
            minVariantPrice: { amount: "0", currencyCode: "EUR" },
            maxVariantPrice: { amount: "0", currencyCode: "EUR" }
          },
          variants: p.variants || { edges: [] },
          compareAtPriceRange: p.compareAtPriceRange,
          onSale: p.onSale,
          availableForSale: p.availableForSale,
          highestCompareAtPrice: typeof p.highestCompareAtPrice === 'number' ? p.highestCompareAtPrice : null,
          sku: typeof p.sku === 'string' ? p.sku : '',
          induwaConnect: Boolean(p.induwaConnect),
          upselling_1a: p.upselling_1a,
          upselling_2: p.upselling_2,
          productType: p.productType,
          cross_selling_1: p.cross_selling_1,
          cross_selling_2: p.cross_selling_2,
          cross_selling_3: p.cross_selling_3,
          hide_from_listing,
        } as import("@/types").Product;
      })
    );
    upsellProducts = loadedUpsells.filter(Boolean) as import("@/types").Product[];
    console.log("[DEBUG] Upsell Products final:", upsellProducts);
  }

  // Cross-Sell-Produkte anhand der Metafelder laden (GIDs und Arrays unterstützen)
  let crossSellProducts: import("@/types").Product[] = [];
  let crossSellIds: string[] = [];
  if (product?.cross_selling_1) {
    try {
      const val = JSON.parse(product.cross_selling_1);
      if (Array.isArray(val)) crossSellIds.push(...val);
      else if (typeof val === 'string') crossSellIds.push(val);
    } catch {
      crossSellIds.push(product.cross_selling_1);
    }
  }
  if (product?.cross_selling_2) crossSellIds.push(product.cross_selling_2);
  if (product?.cross_selling_3) crossSellIds.push(product.cross_selling_3);
  if (crossSellIds.length > 0) {
    const loadedCrossSells = await Promise.all(
      crossSellIds.map(async (gid) => {
        if (!gid) return null;
        const p = await getProductById(gid);
        if (!p) return null;
        let hide_from_listing: boolean | undefined = undefined;
        if (typeof p.hide_from_listing === 'boolean') {
          hide_from_listing = p.hide_from_listing ? true : undefined;
        } else if (typeof p.hide_from_listing === 'string') {
          hide_from_listing = p.hide_from_listing === 'true' ? true : undefined;
        }
        if (hide_from_listing) return null;
        return {
          id: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description,
          descriptionHtml: p.descriptionHtml,
          featuredImage: p.featuredImage,
          images: p.images,
          priceRange: p.priceRange || {
            minVariantPrice: { amount: "0", currencyCode: "EUR" },
            maxVariantPrice: { amount: "0", currencyCode: "EUR" }
          },
          variants: p.variants || { edges: [] },
          compareAtPriceRange: p.compareAtPriceRange,
          onSale: p.onSale,
          availableForSale: p.availableForSale,
          highestCompareAtPrice: typeof p.highestCompareAtPrice === 'number' ? p.highestCompareAtPrice : null,
          sku: typeof p.sku === 'string' ? p.sku : '',
          induwaConnect: Boolean(p.induwaConnect),
          upselling_1a: p.upselling_1a,
          upselling_2: p.upselling_2,
          productType: p.productType,
          cross_selling_1: p.cross_selling_1,
          cross_selling_2: p.cross_selling_2,
          cross_selling_3: p.cross_selling_3,
          hide_from_listing,
        } as import("@/types").Product;
      })
    );
    crossSellProducts = loadedCrossSells.filter(Boolean) as import("@/types").Product[];
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

  // Vor dem Rendern der Produktdetail-Komponente
  if (Array.isArray(upsellProducts)) {
    console.log("[DEBUG] page.tsx: upsellProducts.length", upsellProducts.length, upsellProducts.map(p => p?.title));
  } else {
    console.log("[DEBUG] page.tsx: upsellProducts ist kein Array", upsellProducts);
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
                <BreadcrumbLink href="/shop">{product.productType || "Produkt"}</BreadcrumbLink>
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
              upsellProducts={upsellProducts}
              crossSellProducts={crossSellProducts}
            />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

