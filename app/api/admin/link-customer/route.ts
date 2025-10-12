import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getShopifyCustomer } from "@/lib/shopify-admin";

// Admin client mit Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'temp-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    // Prüfe Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'temp-key') {
      return NextResponse.json(
        { error: "Service Role Key nicht konfiguriert. Bitte SUPABASE_SERVICE_ROLE_KEY in Vercel setzen." },
        { status: 500 }
      );
    }

    const { shopifyCustomerId, email } = await req.json();

    if (!shopifyCustomerId || !email) {
      return NextResponse.json(
        { error: "Shopify-Kunden-ID und E-Mail sind erforderlich" },
        { status: 400 }
      );
    }

    // Prüfe, ob bereits ein Supabase-Benutzer mit dieser E-Mail existiert
    let existingUser;
    try {
      // Verwende direkte Datenbankabfrage über auth.users
      const { data: authUsers, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id, email, created_at')
        .eq('email', email)
        .limit(1);
      
      if (userError) {
        console.error('Error checking existing user:', userError);
        return NextResponse.json(
          { error: `Fehler beim Prüfen des bestehenden Benutzers: ${userError.message}` },
          { status: 500 }
        );
      }
      
      existingUser = authUsers?.[0] ? { user: authUsers[0] } : null;
    } catch (supabaseError: any) {
      console.error('Supabase connection error:', supabaseError);
      return NextResponse.json(
        { error: `Supabase-Verbindungsfehler: ${supabaseError.message}` },
        { status: 500 }
      );
    }

    if (existingUser?.user) {
      // Bestehender Benutzer gefunden - verknüpfe mit Shopify-Kunde
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          shopify_customer_id: shopifyCustomerId,
          phone: shopifyCustomer.phone,
          address: shopifyCustomer.default_address ? {
            company: shopifyCustomer.default_address.company,
            address1: shopifyCustomer.default_address.address1,
            address2: shopifyCustomer.default_address.address2,
            city: shopifyCustomer.default_address.city,
            province: shopifyCustomer.default_address.province,
            country: shopifyCustomer.default_address.country,
            zip: shopifyCustomer.default_address.zip,
            phone: shopifyCustomer.default_address.phone,
          } : null,
          shopify_verified: shopifyCustomer.verified_email,
          shopify_accepts_marketing: shopifyCustomer.accepts_marketing,
          shopify_tags: shopifyCustomer.tags,
          shopify_note: shopifyCustomer.note,
        })
        .eq('id', existingUser.user.id);

      if (profileError) {
        console.error('Error updating existing profile:', profileError);
        return NextResponse.json(
          { error: "Fehler beim Verknüpfen des bestehenden Accounts" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Bestehender Partnerportal-Account erfolgreich mit Shopify-Kunde verknüpft",
        user: {
          id: existingUser.user.id,
          email: existingUser.user.email,
          shopify_customer_id: shopifyCustomerId,
          existing: true
        }
      });
    }

    // Hole Shopify-Kundendaten
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

    // Erstelle Supabase-Benutzer über SQL-Funktion
    const { data: authData, error: authError } = await supabaseAdmin.rpc('create_user_with_profile', {
      user_email: shopifyCustomer.email,
      user_password: generateRandomPassword(),
      first_name: shopifyCustomer.first_name,
      last_name: shopifyCustomer.last_name,
      company: extractCompanyFromNote(shopifyCustomer.note),
      customer_number: extractCustomerNumberFromNote(shopifyCustomer.note),
      shopify_customer_id: shopifyCustomer.id,
      phone: shopifyCustomer.phone,
      address: shopifyCustomer.default_address ? {
        company: shopifyCustomer.default_address.company,
        address1: shopifyCustomer.default_address.address1,
        address2: shopifyCustomer.default_address.address2,
        city: shopifyCustomer.default_address.city,
        province: shopifyCustomer.default_address.province,
        country: shopifyCustomer.default_address.country,
        zip: shopifyCustomer.default_address.zip,
        phone: shopifyCustomer.default_address.phone,
      } : null,
      shopify_verified: shopifyCustomer.verified_email,
      shopify_accepts_marketing: shopifyCustomer.accepts_marketing,
      shopify_tags: shopifyCustomer.tags,
      shopify_note: shopifyCustomer.note,
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: `Fehler beim Erstellen des Benutzers: ${authError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kunde erfolgreich verknüpft",
      user: {
        id: authData.user_id,
        email: shopifyCustomer.email,
        shopify_customer_id: shopifyCustomer.id,
      }
    });

  } catch (error: any) {
    console.error('Link customer error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// Hilfsfunktionen
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function extractCompanyFromNote(note: string | undefined): string {
  if (!note) return '';
  const match = note.match(/Unternehmen: ([^,]+)/);
  return match ? match[1] : '';
}

function extractCustomerNumberFromNote(note: string | undefined): string {
  if (!note) return '';
  const match = note.match(/Kundennummer: ([^,]+)/);
  return match ? match[1] : '';
}
