import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProductsByIds } from "@/lib/shopify-storefront";

// Helper function to get authenticated user
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: "Nicht autorisiert" };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Nicht autorisiert" };
  }

  return { user, error: null };
}

// GET: Alle Produkte einer Liste mit vollständigen Shopify-Daten abrufen
export async function GET(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { listId } = await params;

    // Check if list belongs to user and get list details
    const { data: list, error: listError } = await supabaseAdmin
      .from('favorite_lists')
      .select('id, name, created_at, updated_at')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Liste nicht gefunden" },
        { status: 404 }
      );
    }

    // Get all items in the list
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('favorite_items')
      .select('id, product_id, product_handle, added_at')
      .eq('list_id', listId)
      .order('added_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching favorite items:', itemsError);
      return NextResponse.json(
        { error: "Fehler beim Laden der Favoriten" },
        { status: 500 }
      );
    }

    // If no items, return empty list
    if (!items || items.length === 0) {
      return NextResponse.json({
        success: true,
        list: {
          ...list,
          item_count: 0,
        },
        products: [],
      });
    }

    // Get product IDs for Shopify API
    const productIds = items.map(item => item.product_id);

    // Fetch full product data from Shopify
    let products: any[] = [];
    try {
      products = await getProductsByIds(productIds);
    } catch (shopifyError) {
      console.error('Error fetching products from Shopify:', shopifyError);
      // Return items without full product data
      return NextResponse.json({
        success: true,
        list: {
          ...list,
          item_count: items.length,
        },
        products: items.map(item => ({
          favorite_item_id: item.id,
          product_id: item.product_id,
          product_handle: item.product_handle,
          added_at: item.added_at,
          // Product data not available
          title: 'Produkt nicht gefunden',
          featuredImage: null,
          price: null,
        })),
      });
    }

    // Merge favorite item data with product data
    const mergedProducts = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const variantId = product?.variants?.edges?.[0]?.node?.id || undefined;
      return {
        favorite_item_id: item.id,
        product_id: item.product_id,
        variantId,
        product_handle: item.product_handle,
        added_at: item.added_at,
        // Product data from Shopify
        ...(product || {
          title: 'Produkt nicht gefunden',
          featuredImage: null,
          price: null,
        }),
      };
    });

    return NextResponse.json({
      success: true,
      list: {
        ...list,
        item_count: items.length,
      },
      products: mergedProducts,
    });

  } catch (error: any) {
    console.error('Favorites list GET error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
