import { NextResponse } from "next/server"
import { createCart } from "@/lib/shopify-cart"
// Removed auth-based checkout URL personalization to restore default Shopify checkout handoff

export async function POST(req: Request) {
  try {
    const { items, discounts, note } = await req.json()

    // Debug: Eingehende Checkout-Daten
    console.log("[CheckoutAPI] Eingehende Items:", Array.isArray(items) ? items.length : 0)
    if (discounts && discounts.length) console.log("[CheckoutAPI] Discounts:", discounts)
    if (note) console.log("[CheckoutAPI] Note:", note)

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
    console.log("[CheckoutAPI] Erzeuge Cart mit", {
      linesCount: lines.length,
      hasDiscounts: Array.isArray(discounts) && discounts.length > 0,
      noteLength: safeNote.length,
    })

    // Notiz auf 26 Zeichen begrenzen
    const safeNote = typeof note === "string" ? note.slice(0, 26) : "";

    let cart
    try {
      cart = await createCart({
        lines,
        discountCodes: discounts,
        note: safeNote,
      })
    } catch (e: any) {
      console.error("[CheckoutAPI] createCart failed:", e)
      return NextResponse.json({
        success: false,
        step: "createCart",
        error: e?.message || String(e),
      }, { status: 500 })
    }

    // Debug: Cart-Details
    console.log("[CheckoutAPI] Cart erstellt:", { id: cart.id, checkoutUrl: cart.checkoutUrl })

    // Antwort für Client
    return NextResponse.json({
      success: true,
      url: cart.checkoutUrl,
      cartId: cart.id,
      customerPrefilled: false,
    })
  } catch (error: any) {
    console.error("[CheckoutAPI] Uncaught error:", error)
    return NextResponse.json(
      { step: "uncaught", error: typeof error?.message === 'string' ? error.message : String(error), stack: error?.stack },
      { status: 500 }
    )
  }
} 