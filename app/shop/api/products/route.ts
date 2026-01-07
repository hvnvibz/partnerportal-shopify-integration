import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/shopify-storefront'

// Deaktiviere das Caching für diesen Endpunkt
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Konstante für konsistente Seitengröße
const PRODUCTS_PER_PAGE = 24;

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

  try {
    // Build filter query for Shopify Storefront API
    let filterQuery = ""

    // Suche in Titel und Tags (SKUs werden als Tags hinterlegt)
    if (query && query.trim().length > 0) {
      console.log(`[Shop API] Suche via Storefront API: "${query}"`);
      filterQuery += `(title:*${query}* OR tag:*${query}*) `;
    }

    // Add product type filter
    if (productType) {
      filterQuery += `product_type:"${productType}" `
    }

    // Hide products marked with hide_product_grid metafield
    filterQuery += `NOT metafields.custom.hide_product_grid:true `

    // Fetch products with filters via Storefront API
    const productsData = await getProducts({
      perPage: PRODUCTS_PER_PAGE,
      sortKey: sortKey.toUpperCase() as any,
      reverse,
      query: filterQuery.trim(),
      cursor: cursor as string | null,
      collectionHandle: query ? "" : collectionHandle, // Bei Suche keine Collection
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