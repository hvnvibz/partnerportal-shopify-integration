import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createShopifyCustomer, customerExists } from "@/lib/shopify-admin";

export async function POST(req: Request) {
  try {
    const { 
      firstName, 
      lastName, 
      company, 
      customerNumber, 
      email, 
      password,
      phone,
      address,
      captchaToken
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !company || !customerNumber || !email || !password) {
      return NextResponse.json(
        { error: "Alle Pflichtfelder müssen ausgefüllt werden" },
        { status: 400 }
      );
    }

    // Check if customer already exists in Shopify
    const existingShopifyCustomer = await customerExists(email);
    if (existingShopifyCustomer) {
      return NextResponse.json(
        { error: "Ein Kunde mit dieser E-Mail-Adresse existiert bereits in Shopify" },
        { status: 409 }
      );
    }

    // Register user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: {
          first_name: firstName,
          last_name: lastName,
          company: company,
          customer_number: customerNumber,
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Benutzer konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    // Create customer in Shopify (Admin API)
    let shopifyCustomerId: number | null = null;
    try {
      const shopifyCustomer = await createShopifyCustomer({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        verified_email: false,
        accepts_marketing: false,
        note: `Partnerportal-Kunde. Kundennummer: ${customerNumber}, Unternehmen: ${company}`,
        tags: `partnerportal,${company.replace(/\s+/g, '-').toLowerCase()}`,
        addresses: address ? [{
          first_name: firstName,
          last_name: lastName,
          company: company,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          country: address.country,
          zip: address.zip,
          phone: phone,
        }] : undefined,
      });

      shopifyCustomerId = shopifyCustomer.id;
      
      // Update Supabase profile with Shopify customer ID (use service role to bypass RLS)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          shopify_customer_id: shopifyCustomerId,
          phone: phone || null,
          address: address ? {
            company: company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            province: address.province,
            country: address.country,
            zip: address.zip,
            phone: phone,
          } : null,
          shopify_verified: false,
          shopify_accepts_marketing: false,
          shopify_tags: `partnerportal,${company.replace(/\s+/g, '-').toLowerCase()}`,
          shopify_note: `Partnerportal-Kunde. Kundennummer: ${customerNumber}, Unternehmen: ${company}`,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail the registration if profile update fails
        // The user can still use the system and we can sync later
      }

    } catch (shopifyError) {
      console.error('Shopify customer creation error:', shopifyError);
      // Don't fail the registration if Shopify creation fails
      // The user can still use the system and we can create the customer later
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail-Adresse.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        shopify_customer_id: shopifyCustomerId,
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
