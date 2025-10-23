import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/shopify-storefront'

// Deaktiviere das Caching für diesen Endpunkt
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Parse request params
  const sort = searchParams.get('sort') || "TITLE-asc"
  const [sortKey, sortDirection] = sort.split("-")
  const reverse = sortDirection === "desc"
  const collectionHandle = searchParams.get('collection') || ""
  const productType = searchParams.get('productType') || ""
  const query = searchParams.get('query') || ""
  const cursor = searchParams.get('cursor') || null
  
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

  // Hide products marked with hide_product_grid metafield
  filterQuery += `NOT metafields.custom.hide_product_grid:true `

  try {
    // Fetch products with filters
    const productsData = await getProducts({
      perPage: 12,
      sortKey: sortKey.toUpperCase() as any,
      reverse,
      query: filterQuery.trim(),
      cursor: cursor as string | null,
      collectionHandle, // pass collectionHandle directly
    });
    
    // Return the results as JSON
    return NextResponse.json(productsData)
  } catch (error) {
    console.error("API Error fetching products:", error)
    return NextResponse.json({ 
      error: "Fehler beim Laden der Produkte",
      products: [],
      hasNextPage: false,
      endCursor: null
    }, { status: 500 })
  }
} 