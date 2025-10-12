import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { syncFromShopifyToSupabase, syncFromSupabaseToShopify } from "@/lib/sync-customer-data";

export async function POST(req: Request) {
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

    // Get request body
    const { direction } = await req.json();

    // Get user profile
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

    let result;

    switch (direction) {
      case 'shopify-to-supabase':
        if (!profile.shopify_customer_id) {
          return NextResponse.json(
            { error: "Keine Shopify-Kunden-ID gefunden" },
            { status: 400 }
          );
        }
        result = await syncFromShopifyToSupabase(profile.shopify_customer_id);
        break;

      case 'supabase-to-shopify':
        result = await syncFromSupabaseToShopify(user.id);
        break;

      default:
        return NextResponse.json(
          { error: "Ungültige Synchronisationsrichtung" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          error: result.message,
          details: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Sync customer error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
