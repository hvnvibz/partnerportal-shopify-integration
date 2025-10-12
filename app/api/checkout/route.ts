import { NextResponse } from "next/server"
import { createCart } from "@/lib/shopify-cart"
import { supabase } from "@/lib/supabaseClient"
import { generateDirectCheckoutUrl } from "@/lib/shopify-customer-account"

export async function POST(req: Request) {
  try {
    const { items, discounts, note, authToken } = await req.json()

    if (process.env.NODE_ENV === "development") {
      console.log("Checkout API: Empfangene Warenkorbdaten:", JSON.stringify(items, null, 2));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Ungültige oder leere Artikelliste" },
        { status: 400 }
      )
    }

    // Format line items für die Cart-Erstellung
    // Die variantId muss vollständig sein, z.B. "gid://shopify/ProductVariant/12345"
    // Stelle sicher, dass die ID im richtigen Format ist
    const lines = items.map((item: any) => {
      let merchandiseId = item.variantId;
      
      // Überprüfe, ob die ID bereits im richtigen Format ist
      if (!merchandiseId.startsWith("gid://shopify/ProductVariant/")) {
        // Falls nicht, füge das Präfix hinzu
        merchandiseId = `gid://shopify/ProductVariant/${merchandiseId.replace("gid://shopify/ProductVariant/", "")}`;
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log(`Artikel: ${item.title}, VariantID formatiert: ${merchandiseId}`);
      }
      
      return {
        merchandiseId,
        quantity: item.quantity,
      };
    });

    // Erstelle Cart mit der Shopify Storefront API
    if (process.env.NODE_ENV === "development") {
      console.log("Sende an Shopify: ", JSON.stringify({
        lines,
        discountCodes: discounts,
        note: note,
      }, null, 2));
    }

    // Notiz auf 26 Zeichen begrenzen
    const safeNote = typeof note === "string" ? note.slice(0, 26) : "";

    const cart = await createCart({
      lines,
      discountCodes: discounts,
      note: safeNote,
    })

    if (process.env.NODE_ENV === "development") {
      console.log("Checkout erfolgreich, URL:", cart.checkoutUrl);
    }

    // Check if user is authenticated and pre-fill customer data
    let checkoutUrl = cart.checkoutUrl;
    let customerPrefilledUrl = null;

    if (authToken) {
      try {
        // Verify Supabase JWT token
        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
        
        if (!authError && user) {
          // Get user profile with customer data
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, address')
            .eq('id', user.id)
            .single();

          // Create customer data for pre-fill
          const customerData = {
            email: user.email!,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            phone: profile?.phone,
            addresses: profile?.address ? [profile.address] : undefined,
          };

          // Generate checkout URL with customer data pre-fill
          customerPrefilledUrl = generateDirectCheckoutUrl(customerData);
          
          if (process.env.NODE_ENV === "development") {
            console.log("Customer pre-filled URL generiert:", customerPrefilledUrl);
          }
        }
      } catch (customerError) {
        console.error("Customer pre-fill Fehler:", customerError);
        // Fallback to regular checkout URL
      }
    }

    // Sende die Checkout-URL und Cart-ID für die Client-seitige Weiterleitung
    return NextResponse.json({
      success: true,
      url: customerPrefilledUrl || checkoutUrl,
      cartId: cart.id,
      customerPrefilled: !!customerPrefilledUrl,
    })
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("Fehler beim Erstellen des Carts:", error)
    }
    return NextResponse.json(
      { error: error.message || "Fehler beim Erstellen des Carts" },
      { status: 500 }
    )
  }
} 