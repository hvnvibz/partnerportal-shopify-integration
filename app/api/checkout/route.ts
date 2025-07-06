import { NextResponse } from "next/server"
import { createCart } from "@/lib/shopify-cart"

export async function POST(req: Request) {
  try {
    const { items, discounts, notes } = await req.json()

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
        note: notes,
      }, null, 2));
    }

    const cart = await createCart({
      lines,
      discountCodes: discounts,
      note: notes,
    })

    if (process.env.NODE_ENV === "development") {
      console.log("Checkout erfolgreich, URL:", cart.checkoutUrl);
    }

    // Sende die Checkout-URL und Cart-ID für die Client-seitige Weiterleitung
    return NextResponse.json({
      success: true,
      url: cart.checkoutUrl,
      cartId: cart.id,
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