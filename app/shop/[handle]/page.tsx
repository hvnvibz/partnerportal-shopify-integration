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
import { PriceVisibilityDropdown } from "@/components/shop/price-visibility-dropdown"
import type { Product } from "@/types"

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
      productType: p.productType,
      cross_selling_1: p.cross_selling_1,
      cross_selling_2: p.cross_selling_2,
      cross_selling_3: p.cross_selling_3,
      hide_from_listing,
      // Upselling-Metafields übernehmen
      upselling_1a: p.upselling_1a,
      upselling_2a: p.upselling_2a,
      upselling_single: p.upselling_single,
    };
  }

  // params.handle ist jetzt synchron verfügbar
  let productRaw = await getProductByHandle(params.handle);
  let product = productRaw ? toProduct(productRaw) : undefined;

  // Fetch related products - hole alle Produkte und filtere im Code nach Kategorie
  let relatedProducts: Product[] = [];
  if (product && product.productType) {
    const { products: allProductsRaw } = await getProducts({
      page: 1,
      perPage: 100,
    });
    relatedProducts = allProductsRaw
      .map(toProduct)
      .filter((p: Product) =>
        p.hide_from_listing !== true &&
        p.handle !== product.handle &&
        p.productType?.trim().toLowerCase() === product.productType?.trim().toLowerCase()
      );
  }

  // Upsell-Produkte anhand der Metafelder laden (GIDs und Arrays unterstützen)
  let upsell1aIds: string[] = [];
  let upsell2aIds: string[] = [];
  let upsellingSingleId: string | null = null;

  // upselling_1a (Array oder String)
  if (product?.upselling_1a) {
    try {
      const val = JSON.parse(product.upselling_1a);
      if (Array.isArray(val)) upsell1aIds.push(...val);
      else if (typeof val === 'string') upsell1aIds.push(val);
    } catch {
      upsell1aIds.push(product.upselling_1a);
    }
  }
  // upselling_2a (Array oder String)
  if (product?.upselling_2a) {
    try {
      const val = JSON.parse(product.upselling_2a);
      if (Array.isArray(val)) upsell2aIds.push(...val);
      else if (typeof val === 'string') upsell2aIds.push(val);
    } catch {
      upsell2aIds.push(product.upselling_2a);
    }
  }
  // upselling_single (Einzelprodukt)
  if (product?.upselling_single) {
    upsellingSingleId = product.upselling_single;
  }

  // Filtere leere Strings, null, undefined, offensichtlichen Müll
  upsell1aIds = upsell1aIds.filter(id => typeof id === 'string' && id.trim().length > 0 && id.startsWith('gid://shopify/Product/'));
  upsell2aIds = upsell2aIds.filter(id => typeof id === 'string' && id.trim().length > 0 && id.startsWith('gid://shopify/Product/'));
  if (typeof upsellingSingleId !== 'string' || upsellingSingleId.trim().length === 0 || !upsellingSingleId.startsWith('gid://shopify/Product/')) {
    upsellingSingleId = null;
  }

  // Produkte laden
  let upsell1aProducts: Product[] = [];
  let upsell2aProducts: Product[] = [];
  let upsellingSingleProduct: Product | null = null;
  // 1a-Produkte laden (max. 2)
  if (upsell1aIds.length > 0) {
    const loaded = await Promise.all(
      upsell1aIds.slice(0, 2).map(async (gid) => {
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
        return toProduct(p);
      })
    );
    upsell1aProducts = loaded.filter(Boolean) as Product[];
  }
  // 2a-Produkte laden (max. 2)
  if (upsell2aIds.length > 0) {
    const loaded = await Promise.all(
      upsell2aIds.slice(0, 2).map(async (gid) => {
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
        return toProduct(p);
      })
    );
    upsell2aProducts = loaded.filter(Boolean) as Product[];
  }
  // Single-Produkt laden
  if (upsellingSingleId) {
    const p = await getProductById(upsellingSingleId);
    if (p && !(typeof p.hide_from_listing === 'boolean' ? p.hide_from_listing : p.hide_from_listing === 'true')) {
      upsellingSingleProduct = toProduct(p);
    }
  }

  // Cross-Sell-Produkte anhand der Metafelder laden (GIDs und Arrays unterstützen)
  let crossSellProducts: Product[] = [];
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
        return toProduct(p);
      })
    );
    crossSellProducts = loadedCrossSells.filter(Boolean) as Product[];
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
            <div className="flex items-center gap-4">
              <PriceVisibilityDropdown />
              <Cart />
            </div>
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
                <BreadcrumbLink href="/shop">{product.productType || "Produkt"}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <PriceVisibilityDropdown />
            <Cart />
          </div>
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
              }}
              relatedProducts={relatedProducts}
              upsell1aProducts={upsell1aProducts}
              upsell2aProducts={upsell2aProducts}
              singleUpsellProduct={upsellingSingleProduct}
              crossSellProducts={crossSellProducts}
            />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export async function generateMetadata({ params }: { params: { handle: string } }) {
  const { handle } = params;
  // Hole Produktdaten für besseren Title
  let productTitle = handle;
  try {
    const productRaw = await (await import("@/lib/shopify-storefront")).getProductByHandle(handle);
    if (productRaw && productRaw.title) {
      productTitle = productRaw.title;
    }
  } catch {}
  return {
    title: `${productTitle} | INDUWA Partnerportal`,
    description: `Details und Informationen zum Produkt ${productTitle} im Partnerportal INDUWA.`,
  };
}

