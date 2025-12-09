import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateShopifyCustomer } from "@/lib/shopify-admin";

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

    // Get current profile to check for status change
    const { data: currentProfile, error: currentProfileError } = await supabaseAdmin
      .from('profiles')
      .select('status, shopify_customer_id')
      .eq('id', userId)
      .single();

    if (currentProfileError || !currentProfile) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if status is changing from 'pending' to 'active'
    const isActivatingUser = status === 'active' && currentProfile.status === 'pending';

    // Check if customer_number is being changed
    const newCustomerNumber = customer_number?.trim() || null;
    const isCustomerNumberChanging = customer_number !== undefined;

    // Build update object with only provided fields
    const updateData: { status?: string; display_name?: string | null; customer_number?: string | null; shopify_verified?: boolean; shopify_note?: string | null } = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (display_name !== undefined) {
      updateData.display_name = display_name?.trim() || null;
    }
    if (customer_number !== undefined) {
      updateData.customer_number = newCustomerNumber;
      // Also update shopify_note to keep Supabase in sync
      updateData.shopify_note = newCustomerNumber;
    }

    // If activating user, also set shopify_verified to true
    if (isActivatingUser) {
      updateData.shopify_verified = true;
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

    // Shopify sync: Build update object for Shopify
    const shopifyUpdateData: { verified_email?: boolean; note?: string } = {};

    // If activating user, set verified_email to true
    if (isActivatingUser) {
      shopifyUpdateData.verified_email = true;
    }

    // If customer_number changed, update Shopify note
    if (isCustomerNumberChanging) {
      shopifyUpdateData.note = newCustomerNumber || '';
    }

    // If there's something to update in Shopify and customer exists
    if (Object.keys(shopifyUpdateData).length > 0 && currentProfile.shopify_customer_id) {
      try {
        await updateShopifyCustomer(currentProfile.shopify_customer_id, shopifyUpdateData);
        console.log(`Shopify customer ${currentProfile.shopify_customer_id} updated:`, shopifyUpdateData);
      } catch (shopifyError: any) {
        // Log error but don't fail the request - Supabase was already updated
        console.error('Error updating Shopify customer:', shopifyError);
        console.error('Shopify update failed for customer:', {
          shopify_customer_id: currentProfile.shopify_customer_id,
          userId: userId,
          updateData: shopifyUpdateData,
          error: shopifyError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        status: updatedUser.status,
        display_name: updatedUser.display_name,
        customer_number: updatedUser.customer_number,
        shopify_verified: updatedUser.shopify_verified,
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

