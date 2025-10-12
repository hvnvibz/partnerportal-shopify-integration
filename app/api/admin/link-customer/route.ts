import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getShopifyCustomer } from "@/lib/shopify-admin";

export async function POST(req: Request) {
  try {
    const { shopifyCustomerId, email } = await req.json();

    if (!shopifyCustomerId || !email) {
      return NextResponse.json(
        { error: "Shopify-Kunden-ID und E-Mail sind erforderlich" },
        { status: 400 }
      );
    }

    // Prüfe, ob bereits ein Supabase-Benutzer mit dieser E-Mail existiert
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError && userError.message !== 'User not found') {
      console.error('Error checking existing user:', userError);
      return NextResponse.json(
        { error: "Fehler beim Prüfen des bestehenden Benutzers" },
        { status: 500 }
      );
    }

    if (existingUser?.user) {
      // Bestehender Benutzer gefunden - verknüpfe mit Shopify-Kunde
      const { error: profileError } = await supabase
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
    const shopifyCustomer = await getShopifyCustomer(shopifyCustomerId);
    if (!shopifyCustomer) {
      return NextResponse.json(
        { error: "Shopify-Kunde nicht gefunden" },
        { status: 404 }
      );
    }

    // Erstelle Supabase-Benutzer
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: shopifyCustomer.email,
      password: generateRandomPassword(), // Temporäres Passwort
      email_confirm: true, // E-Mail sofort bestätigen
      user_metadata: {
        first_name: shopifyCustomer.first_name,
        last_name: shopifyCustomer.last_name,
        company: extractCompanyFromNote(shopifyCustomer.note),
        customer_number: extractCustomerNumberFromNote(shopifyCustomer.note),
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Benutzers" },
        { status: 500 }
      );
    }

    // Aktualisiere Profil mit Shopify-Daten
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
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
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Benutzer wurde erstellt, aber Profil-Update fehlgeschlagen
      // Das ist nicht kritisch, kann später manuell korrigiert werden
    }

    // Sende E-Mail mit Login-Daten
    try {
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: shopifyCustomer.email,
      });
    } catch (emailError) {
      console.error('Error sending recovery email:', emailError);
      // E-Mail-Versand ist nicht kritisch
    }

    return NextResponse.json({
      success: true,
      message: "Kunde erfolgreich verknüpft",
      user: {
        id: authData.user.id,
        email: authData.user.email,
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
