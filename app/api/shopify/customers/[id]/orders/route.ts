import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getShopifyCustomerOrders } from "@/lib/shopify-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentifizierung erforderlich" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify Supabase JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Ungültiger Authentifizierungstoken" },
        { status: 401 }
      );
    }

    const customerId = parseInt(params.id);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Ungültige Kunden-ID" },
        { status: 400 }
      );
    }

    // Verify that the user has access to this customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('shopify_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    if (profile.shopify_customer_id !== customerId) {
      return NextResponse.json(
        { error: "Zugriff verweigert" },
        { status: 403 }
      );
    }

    // Get orders from Shopify
    const orders = await getShopifyCustomerOrders(customerId, 50);

    return NextResponse.json({
      success: true,
      orders: orders,
      count: orders.length
    });

  } catch (error: any) {
    console.error('Get customer orders error:', error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Bestellungen" },
      { status: 500 }
    );
  }
}
