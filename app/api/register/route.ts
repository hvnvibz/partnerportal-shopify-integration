import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createShopifyCustomer, customerExists } from "@/lib/shopify-admin";
import { verifyHCaptcha } from "@/lib/hcaptcha";

// Mapping für deutsche Ländernamen zu Shopify-kompatiblen englischen Namen
const countryMapping: Record<string, string> = {
  'deutschland': 'Germany',
  'österreich': 'Austria',
  'schweiz': 'Switzerland',
  'germany': 'Germany',
  'austria': 'Austria',
  'switzerland': 'Switzerland',
  'niederlande': 'Netherlands',
  'belgien': 'Belgium',
  'frankreich': 'France',
  'italien': 'Italy',
  'spanien': 'Spain',
  'polen': 'Poland',
  'tschechien': 'Czech Republic',
  'dänemark': 'Denmark',
  'luxemburg': 'Luxembourg',
  // ISO codes
  'de': 'Germany',
  'at': 'Austria',
  'ch': 'Switzerland',
  'nl': 'Netherlands',
  'be': 'Belgium',
  'fr': 'France',
  'it': 'Italy',
  'es': 'Spain',
  'pl': 'Poland',
  'cz': 'Czech Republic',
  'dk': 'Denmark',
  'lu': 'Luxembourg',
};

function normalizeCountryForShopify(country?: string): string {
  if (!country || country.trim() === '') {
    return 'Germany'; // Standard: Deutschland
  }
  const normalized = country.toLowerCase().trim();
  return countryMapping[normalized] || country; // Fallback: Original zurückgeben
}

// Robuste E-Mail-Validierung (identisch zum Frontend)
function isValidEmail(email: string): boolean {
  // Regex prüft:
  // - Mindestens ein Zeichen vor dem @
  // - @ Zeichen vorhanden
  // - Mindestens ein Zeichen nach dem @ und vor dem Punkt
  // - Punkt vorhanden
  // - Mindestens 2 Zeichen nach dem letzten Punkt (TLD)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

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

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@firma.de)." },
        { status: 400 }
      );
    }

    // Validate hCAPTCHA token
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Bitte bestätigen Sie das Captcha." },
        { status: 400 }
      );
    }

    const isValidCaptcha = await verifyHCaptcha(captchaToken);
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Captcha-Validierung fehlgeschlagen. Bitte versuchen Sie es erneut." },
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

    // Register user in Supabase (hCAPTCHA already validated server-side, but pass token to Supabase as well)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken, // Pass token to Supabase even though we validated it server-side
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

    // Update profile immediately with customer_number and display_name
    // This ensures these fields are set regardless of Shopify success/failure
    // Use upsert to handle both insert and update cases
    
    // First, check if profile exists and what the current state is
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, customer_number, display_name, role, status')
      .eq('id', authData.user.id)
      .maybeSingle();
    
    console.log('Profile check before upsert:', {
      exists: !!existingProfile,
      currentValues: existingProfile,
      checkError: profileCheckError,
      userId: authData.user.id,
    });
    
    const { error: initialProfileError, data: upsertResult } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        customer_number: customerNumber,
        display_name: company,
        role: 'partner',
        status: 'pending',
      }, {
        onConflict: 'id'
      })
      .select();

    if (initialProfileError) {
      console.error('Initial profile upsert error:', initialProfileError);
      console.error('Error details:', {
        code: initialProfileError.code,
        message: initialProfileError.message,
        details: initialProfileError.details,
        hint: initialProfileError.hint,
      });
      console.error('Attempted values:', {
        userId: authData.user.id,
        customer_number: customerNumber,
        display_name: company,
      });
    } else {
      console.log('Profile upserted successfully:', {
        result: upsertResult,
        customer_number: customerNumber,
        display_name: company,
      });
      
      // Verify the values were actually saved
      const { data: verifyProfile } = await supabaseAdmin
        .from('profiles')
        .select('customer_number, display_name')
        .eq('id', authData.user.id)
        .single();
      
      console.log('Verified profile values after upsert:', verifyProfile);
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
        note: customerNumber,
        tags: `partnerportal,${company.replace(/\s+/g, '-').toLowerCase()}`,
        addresses: address ? [{
          first_name: firstName,
          last_name: lastName,
          company: company,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          country: normalizeCountryForShopify(address.country),
          zip: address.zip,
          phone: phone,
        }] : undefined,
      });

      shopifyCustomerId = shopifyCustomer.id;
      
      // Update Supabase profile with Shopify customer ID, role and status (use service role to bypass RLS)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          customer_number: customerNumber,
          display_name: company,
          shopify_customer_id: shopifyCustomerId,
          phone: phone || null,
          address: address ? {
            company: company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            province: address.province,
            country: normalizeCountryForShopify(address.country),
            zip: address.zip,
            phone: phone,
          } : null,
          shopify_verified: false,
          shopify_accepts_marketing: false,
          shopify_tags: `partnerportal,${company.replace(/\s+/g, '-').toLowerCase()}`,
          shopify_note: customerNumber,
          role: 'partner',
          status: 'pending',
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        console.error('Update data:', {
          userId: authData.user.id,
          customer_number: customerNumber,
          display_name: company,
          shopify_customer_id: shopifyCustomerId,
        });
        
        // Try to verify what's actually in the database
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('customer_number, display_name, shopify_customer_id')
          .eq('id', authData.user.id)
          .single();
        
        console.error('Current profile values:', currentProfile);
        // Don't fail the registration if profile update fails
        // The user can still use the system and we can sync later
      } else {
        console.log('Profile updated successfully:', {
          customer_number: customerNumber,
          display_name: company,
          shopify_customer_id: shopifyCustomerId,
        });
      }

    } catch (shopifyError: any) {
      console.error('Shopify customer creation error:', shopifyError);
      // Log error details for admin review
      console.error('Shopify error details:', {
        email,
        userId: authData.user.id,
        error: shopifyError.message || shopifyError,
        timestamp: new Date().toISOString()
      });
      // Don't fail the registration if Shopify creation fails
      // The user can still use the system and we can create the customer later via admin interface
      // shopifyCustomerId remains null, which will be visible in admin panel
      
      // Still update profile with customer_number and display_name even if Shopify fails
      // Use upsert to ensure the profile exists
      const { error: fallbackProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          customer_number: customerNumber,
          display_name: company,
          role: 'partner',
          status: 'pending',
        }, {
          onConflict: 'id'
        });

      if (fallbackProfileError) {
        console.error('Fallback profile upsert error:', fallbackProfileError);
        console.error('Attempted values:', {
          customer_number: customerNumber,
          display_name: company,
          userId: authData.user.id,
        });
      } else {
        console.log('Fallback profile upsert successful');
      }
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
