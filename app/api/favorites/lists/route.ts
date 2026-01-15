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

// GET: Alle Listen des Nutzers abrufen (inkl. Produkt-Anzahl)
export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Get all lists for the user with item count
    const { data: lists, error: listsError } = await supabaseAdmin
      .from('favorite_lists')
      .select(`
        id,
        name,
        created_at,
        updated_at,
        favorite_items(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (listsError) {
      console.error('Error fetching favorite lists:', listsError);
      return NextResponse.json(
        { error: "Fehler beim Laden der Favoriten-Listen" },
        { status: 500 }
      );
    }

    // Format the response to include item_count
    const formattedLists = lists?.map(list => ({
      id: list.id,
      name: list.name,
      created_at: list.created_at,
      updated_at: list.updated_at,
      item_count: (list.favorite_items as any)?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      lists: formattedLists,
    });

  } catch (error: any) {
    console.error('Favorites lists GET error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST: Neue Liste erstellen
export async function POST(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Bitte geben Sie einen Namen für die Liste ein" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if list with this name already exists for user
    const { data: existingList } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', trimmedName)
      .single();

    if (existingList) {
      return NextResponse.json(
        { error: "Eine Liste mit diesem Namen existiert bereits" },
        { status: 409 }
      );
    }

    // Create the new list
    const { data: newList, error: createError } = await supabaseAdmin
      .from('favorite_lists')
      .insert({
        user_id: user.id,
        name: trimmedName,
      })
      .select('id, name, created_at, updated_at')
      .single();

    if (createError) {
      console.error('Error creating favorite list:', createError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen der Liste" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      list: {
        ...newList,
        item_count: 0,
      },
    });

  } catch (error: any) {
    console.error('Favorites lists POST error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// PATCH: Liste umbenennen
export async function PATCH(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await req.json();
    const { listId, name } = body;

    if (!listId) {
      return NextResponse.json(
        { error: "Listen-ID ist erforderlich" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Bitte geben Sie einen Namen für die Liste ein" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if list belongs to user
    const { data: existingList, error: checkError } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingList) {
      return NextResponse.json(
        { error: "Liste nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if another list with this name already exists
    const { data: duplicateList } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', trimmedName)
      .neq('id', listId)
      .single();

    if (duplicateList) {
      return NextResponse.json(
        { error: "Eine Liste mit diesem Namen existiert bereits" },
        { status: 409 }
      );
    }

    // Update the list
    const { data: updatedList, error: updateError } = await supabaseAdmin
      .from('favorite_lists')
      .update({ name: trimmedName })
      .eq('id', listId)
      .select('id, name, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating favorite list:', updateError);
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren der Liste" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      list: updatedList,
    });

  } catch (error: any) {
    console.error('Favorites lists PATCH error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE: Liste löschen
export async function DELETE(req: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');

    if (!listId) {
      return NextResponse.json(
        { error: "Listen-ID ist erforderlich" },
        { status: 400 }
      );
    }

    // Check if list belongs to user
    const { data: existingList, error: checkError } = await supabaseAdmin
      .from('favorite_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingList) {
      return NextResponse.json(
        { error: "Liste nicht gefunden" },
        { status: 404 }
      );
    }

    // Delete the list (cascade will delete items)
    const { error: deleteError } = await supabaseAdmin
      .from('favorite_lists')
      .delete()
      .eq('id', listId);

    if (deleteError) {
      console.error('Error deleting favorite list:', deleteError);
      return NextResponse.json(
        { error: "Fehler beim Löschen der Liste" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Liste erfolgreich gelöscht",
    });

  } catch (error: any) {
    console.error('Favorites lists DELETE error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
