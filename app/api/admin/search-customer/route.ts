import { NextResponse } from "next/server";
import { getShopifyCustomerByEmail } from "@/lib/shopify-admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-Mail-Adresse ist erforderlich" },
        { status: 400 }
      );
    }

    // Suche Kunde in Shopify
    const customer = await getShopifyCustomerByEmail(email);

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: "Kein Shopify-Kunde mit dieser E-Mail-Adresse gefunden"
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        default_address: customer.default_address,
        verified_email: customer.verified_email,
        accepts_marketing: customer.accepts_marketing,
        tags: customer.tags,
        note: customer.note,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
      }
    });

  } catch (error: any) {
    console.error('Search customer error:', error);
    return NextResponse.json(
      { error: "Fehler beim Suchen des Kunden" },
      { status: 500 }
    );
  }
}
