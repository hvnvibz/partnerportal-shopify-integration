import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { status, display_name, customer_number } = await req.json();

    // Validate that at least one field is provided
    if (status === undefined && display_name === undefined && customer_number === undefined) {
      return NextResponse.json(
        { error: "Mindestens ein Feld (status, display_name oder customer_number) muss angegeben werden" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined && !['pending', 'active', 'blocked'].includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status. Erlaubte Werte: pending, active, blocked" },
        { status: 400 }
      );
    }

    // Validate display_name if provided (max length, trim)
    if (display_name !== undefined) {
      const trimmedName = display_name?.trim();
      if (trimmedName && trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Display-Name darf maximal 100 Zeichen lang sein" },
          { status: 400 }
        );
      }
    }

    // Validate customer_number if provided (max length, trim)
    if (customer_number !== undefined) {
      const trimmedNumber = customer_number?.trim();
      if (trimmedNumber && trimmedNumber.length > 50) {
        return NextResponse.json(
          { error: "Kundennummer darf maximal 50 Zeichen lang sein" },
          { status: 400 }
        );
      }
    }

    // Get the current user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData || profileData.role !== 'admin') {
      return NextResponse.json(
        { error: "Zugriff verweigert. Nur Administratoren können diese Funktion nutzen." },
        { status: 403 }
      );
    }

    // Build update object with only provided fields
    const updateData: { status?: string; display_name?: string | null; customer_number?: string | null } = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (display_name !== undefined) {
      updateData.display_name = display_name?.trim() || null;
    }
    if (customer_number !== undefined) {
      updateData.customer_number = customer_number?.trim() || null;
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user status:', updateError);
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren des Benutzerstatus" },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        status: updatedUser.status,
        display_name: updatedUser.display_name,
        customer_number: updatedUser.customer_number,
      },
    });

  } catch (error: any) {
    console.error('Admin update user API error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

