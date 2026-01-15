import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

// GET: Prüfen in welchen Listen ein Produkt ist
export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt-ID ist erforderlich" },
        { status: 400 }
      );
    }

    // Get all lists where this product is favorited
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('favorite_items')
      .select(`
        id,
        list_id,
        favorite_lists!inner(id, name, user_id)
      `)
      .eq('product_id', productId)
      .eq('favorite_lists.user_id', user.id);

    if (itemsError) {
      console.error('Error checking favorite status:', itemsError);
      return NextResponse.json(
        { error: "Fehler beim Prüfen des Favoriten-Status" },
        { status: 500 }
      );
    }

    // Extract list IDs where the product is favorited
    const listIds = items?.map(item => item.list_id) || [];

    return NextResponse.json({
      success: true,
      isFavorited: listIds.length > 0,
      listIds,
    });

  } catch (error: any) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST: Produkt zu einer Liste hinzufügen
export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();
    const { listId, productId, productHandle } = body;

    if (!listId) {
      return NextResponse.json(
        { error: "Listen-ID ist erforderlich" },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt-ID ist erforderlich" },
        { status: 400 }
      );
    }

    if (!productHandle) {
      return NextResponse.json(
        { error: "Produkt-Handle ist erforderlich" },
        { status: 400 }
      );
    }

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Liste nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if product is already in the list
    const { data: existingItem } = await supabaseAdmin
      .from('favorite_items')
      .select('id')
      .eq('list_id', listId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: "Produkt ist bereits in dieser Liste" },
        { status: 409 }
      );
    }

    // Add product to list
    const { data: newItem, error: insertError } = await supabaseAdmin
      .from('favorite_items')
      .insert({
        list_id: listId,
        product_id: productId,
        product_handle: productHandle,
      })
      .select('id, product_id, product_handle, added_at')
      .single();

    if (insertError) {
      console.error('Error adding favorite:', insertError);
      return NextResponse.json(
        { error: "Fehler beim Hinzufügen des Favoriten" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: newItem,
      message: "Produkt wurde zur Liste hinzugefügt",
    });

  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE: Produkt aus einer Liste entfernen
export async function DELETE(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');
    const productId = searchParams.get('productId');
    const itemId = searchParams.get('itemId');

    // Option 1: Delete by itemId directly
    if (itemId) {
      // Verify the item belongs to a list owned by the user
      const { data: item, error: itemError } = await supabaseAdmin
        .from('favorite_items')
        .select(`
          id,
          favorite_lists!inner(user_id)
        `)
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        return NextResponse.json(
          { error: "Favorit nicht gefunden" },
          { status: 404 }
        );
      }

      if ((item.favorite_lists as any).user_id !== user.id) {
        return NextResponse.json(
          { error: "Zugriff verweigert" },
          { status: 403 }
        );
      }

      const { error: deleteError } = await supabaseAdmin
        .from('favorite_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        return NextResponse.json(
          { error: "Fehler beim Entfernen des Favoriten" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Produkt wurde aus der Liste entfernt",
      });
    }

    // Option 2: Delete by listId and productId
    if (!listId || !productId) {
      return NextResponse.json(
        { error: "Listen-ID und Produkt-ID sind erforderlich (oder Item-ID)" },
        { status: 400 }
      );
    }

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Liste nicht gefunden" },
        { status: 404 }
      );
    }

    // Delete the item
    const { error: deleteError } = await supabaseAdmin
      .from('favorite_items')
      .delete()
      .eq('list_id', listId)
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Error removing favorite:', deleteError);
      return NextResponse.json(
        { error: "Fehler beim Entfernen des Favoriten" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produkt wurde aus der Liste entfernt",
    });

  } catch (error: any) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
