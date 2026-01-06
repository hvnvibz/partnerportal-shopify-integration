import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/shopify-storefront'
import { searchProductsAdminPaginated } from '@/lib/shopify-admin'

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
  // Page number for Admin API search (cursor is used as page number for search)
  const page = cursor ? parseInt(cursor, 10) : 1;

  try {
    // Wenn eine Suchanfrage vorhanden ist, nutze Admin API (unterstützt SKU-Suche)
    if (query && query.trim().length > 0) {
      console.log(`[Shop API] Suche via Admin API: "${query}" (Seite ${page})`);
      
      const adminResults = await searchProductsAdminPaginated(query, {
        limit: PRODUCTS_PER_PAGE,
        page: page,
        sortKey: sortKey.toUpperCase(),
        reverse,
      });

      // Filtere nach productType wenn angegeben
      let filteredProducts = adminResults.products;
      if (productType) {
        filteredProducts = filteredProducts.filter(p => 
          p.productType?.toLowerCase() === productType.toLowerCase()
        );
      }

      return NextResponse.json({
        products: filteredProducts,
        hasNextPage: adminResults.hasNextPage,
        endCursor: adminResults.endCursor,
        totalCount: adminResults.totalCount,
      });
    }

    // Ohne Suchanfrage: Storefront API für Collection-Browsing (performanter)
    // Build filter query for Shopify Storefront API
    let filterQuery = ""

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