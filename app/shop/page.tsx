import { Suspense } from "react"
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
import { ShopFilters } from "@/components/shop/shop-filters"
import { getProducts, getCollections, getFallbackProducts, getProductTypes } from "@/lib/shopify-storefront"
import { ShopContent } from "@/components/shop/shop-content"
import { Cart } from "@/components/shop/cart"
import { Loader2 } from "lucide-react"

// Disable caching for this page to ensure fresh data on each visit
export const revalidate = 0;

// Helper function to merge search params
function mergeSearchParams(params: URLSearchParams, updates: Record<string, string | null>) {
  const merged = new URLSearchParams(params.toString());
  
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      merged.delete(key);
    } else {
      merged.set(key, value);
    }
  }
  
  return merged;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    sort?: string
    collection?: string
    productType?: string
    query?: string
    cursor?: string
    previousCursor?: string
  }
}) {
  // In Next.js 13+, searchParams are already parsed and ready to use
  const sort = searchParams.sort || "PRICE-desc"
  const [sortKey, sortDirection] = sort.split("-")
  const reverse = sortDirection === "desc"
  const collectionHandle = Object.prototype.hasOwnProperty.call(searchParams, 'collection') ? (searchParams.collection ?? '') : 'meistverkauft-bestseller'
  const productType = searchParams.productType || ""
  const query = searchParams.query || ""
  const cursor = searchParams.cursor || null

  // Fetch collections and product types for the filter sidebar
  const collections = await getCollections()
  const productTypes = await getProductTypes()

  // Build filter query for Shopify API
  let filterQuery = ""

  // Remove collection filter from query string logic
  // Add product type filter
  if (productType) {
    filterQuery += `product_type:"${productType}" `
  }

  // Add search query
  if (query) {
    filterQuery += `(title:*${query}* OR tag:*${query}*) `
  }

  console.log("Final Filter Query:", filterQuery.trim());
  console.log("Collection Handle:", collectionHandle);

  // Fetch initial products with filters
  let productsData
  
  try {
    // Get the first page products
    productsData = await getProducts({
      perPage: 12,
      sortKey: sortKey.toUpperCase() as any,
      reverse,
      query: filterQuery.trim(),
      cursor: cursor as string | null,
      collectionHandle, // pass collectionHandle directly
    });
    
    console.log(`Successfully fetched ${productsData?.products?.length || 0} products`);
  } catch (error) {
    console.error("Error fetching products:", error)
    productsData = await getFallbackProducts()
  }

  // Ensure productsData has valid values
  const { 
    products = [],
    hasNextPage = false, 
    endCursor = null 
  } = productsData || {}

  // Generate the URL for client-side "Load more" button
  const nextPageParams = new URLSearchParams(searchParams.toString())
  
  if (endCursor) {
    nextPageParams.set("cursor", endCursor)
  }
  
  const nextPageUrl = `/shop?${nextPageParams.toString()}`

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Start</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64 shrink-0">
              <ShopFilters
                collections={collections}
                productTypes={productTypes}
                activeCollection={collectionHandle}
                activeProductType={productType}
                activeSort={sort}
              />
            </aside>
            <Suspense fallback={<div className="flex-1 min-h-[200px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#8abfdf] mb-2" />
                <span className="text-sm text-gray-500">Produkte werden geladen...</span>
              </div>
            </div>}>
              <ShopContent 
                products={products} 
                hasNextPage={hasNextPage} 
                endCursor={endCursor}
                nextPageUrl={nextPageUrl}
                query={query} 
                sort={sort} 
              />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

