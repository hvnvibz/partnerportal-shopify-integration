import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShopifyCustomer, formatCustomerForSupabase } from "@/lib/shopify-admin";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
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

    // Get shopifyCustomerId from request body
    const { shopifyCustomerId } = await req.json();

    if (!shopifyCustomerId) {
      return NextResponse.json(
        { error: "Shopify-Kunden-ID ist erforderlich" },
        { status: 400 }
      );
    }

    const userId = params.userId;

    // Verify user exists
    const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if user is already linked to a different Shopify customer
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('shopify_customer_id')
      .eq('id', userId)
      .single();

    if (existingProfile?.shopify_customer_id && existingProfile.shopify_customer_id !== shopifyCustomerId) {
      return NextResponse.json(
        { error: `Benutzer ist bereits mit einem anderen Shopify-Kunden verknüpft (ID: ${existingProfile.shopify_customer_id})` },
        { status: 400 }
      );
    }

    // Get Shopify customer data
    let shopifyCustomer;
    try {
      shopifyCustomer = await getShopifyCustomer(shopifyCustomerId);
      if (!shopifyCustomer) {
        return NextResponse.json(
          { error: "Shopify-Kunde nicht gefunden" },
          { status: 404 }
        );
      }
    } catch (shopifyError: any) {
      console.error('Error fetching Shopify customer:', shopifyError);
      return NextResponse.json(
        { error: `Fehler beim Laden der Shopify-Kundendaten: ${shopifyError.message}` },
        { status: 500 }
      );
    }

    // Format and update profile with Shopify data
    const supabaseData = formatCustomerForSupabase(shopifyCustomer);

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(supabaseData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: "Fehler beim Verknüpfen des Benutzers mit Shopify-Kunde" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Benutzer erfolgreich mit Shopify-Kunde verknüpft",
      user: {
        id: userId,
        email: targetUser.user.email,
        shopify_customer_id: shopifyCustomerId,
      },
      shopify_customer: {
        id: shopifyCustomer.id,
        email: shopifyCustomer.email,
        first_name: shopifyCustomer.first_name,
        last_name: shopifyCustomer.last_name,
      }
    });

  } catch (error: any) {
    console.error('Link Shopify customer error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

