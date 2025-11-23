import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAllShopifyCustomers, formatCustomerForSupabase } from "@/lib/shopify-admin";
import { supabase } from "@/lib/supabaseClient";

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

    // Prüfe Admin-Berechtigung
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentifizierung erforderlich" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Ungültiger Authentifizierungstoken" },
        { status: 401 }
      );
    }

    // Prüfe ob User Admin ist
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData || profileData.role !== 'admin') {
      return NextResponse.json(
        { error: "Zugriff verweigert. Nur Administratoren können diese Funktion nutzen." },
        { status: 403 }
      );
    }

    // Hole alle Shopify-Kunden
    console.log('Fetching all Shopify customers...');
    const shopifyCustomers = await getAllShopifyCustomers();
    console.log(`Found ${shopifyCustomers.length} Shopify customers`);

    // Hole alle Supabase-User mit E-Mail-Adressen
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching Supabase users:', usersError);
      return NextResponse.json(
        { error: "Fehler beim Laden der Supabase-Benutzer" },
        { status: 500 }
      );
    }

    // Erstelle E-Mail-zu-User-ID Mapping
    const emailToUserIdMap = new Map<string, string>();
    authUsers.users.forEach(u => {
      if (u.email) {
        emailToUserIdMap.set(u.email.toLowerCase(), u.id);
      }
    });

    // Statistik
    const stats = {
      linked: 0,
      skipped: 0,
      errors: 0
    };

    const details = {
      linked: [] as Array<{ email: string; shopify_id: number; user_id: string }>,
      skipped: [] as Array<{ email: string; shopify_id: number; reason: string }>,
      errors: [] as Array<{ email: string; shopify_id: number; error: string }>
    };

    // Verknüpfe jeden Shopify-Kunden
    for (const shopifyCustomer of shopifyCustomers) {
      try {
        // Überspringe Kunden ohne E-Mail
        if (!shopifyCustomer.email) {
          stats.skipped++;
          details.skipped.push({
            email: 'N/A',
            shopify_id: shopifyCustomer.id,
            reason: 'Keine E-Mail-Adresse'
          });
          continue;
        }

        const email = shopifyCustomer.email.toLowerCase();
        const userId = emailToUserIdMap.get(email);

        // Prüfe ob User existiert
        if (!userId) {
          stats.skipped++;
          details.skipped.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            reason: 'Kein Partnerportal-User mit dieser E-Mail gefunden'
          });
          continue;
        }

        // Prüfe ob bereits verknüpft
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('shopify_customer_id')
          .eq('id', userId)
          .single();

        if (existingProfile?.shopify_customer_id) {
          stats.skipped++;
          details.skipped.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            reason: 'Bereits verknüpft'
          });
          continue;
        }

        // Verknüpfe und synchronisiere Daten
        const supabaseData = formatCustomerForSupabase(shopifyCustomer);
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(supabaseData)
          .eq('id', userId);

        if (updateError) {
          console.error(`Error linking customer ${shopifyCustomer.email}:`, updateError);
          stats.errors++;
          details.errors.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            error: updateError.message
          });
        } else {
          stats.linked++;
          details.linked.push({
            email: shopifyCustomer.email,
            shopify_id: shopifyCustomer.id,
            user_id: userId
          });
        }

        // Rate limiting: Kleine Pause zwischen Updates
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`Error processing customer ${shopifyCustomer.email}:`, error);
        stats.errors++;
        details.errors.push({
          email: shopifyCustomer.email || 'N/A',
          shopify_id: shopifyCustomer.id,
          error: error.message || 'Unbekannter Fehler'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verknüpfung abgeschlossen. ${stats.linked} verknüpft, ${stats.skipped} übersprungen, ${stats.errors} Fehler.`,
      stats,
      details
    });

  } catch (error: any) {
    console.error('Bulk link customers error:', error);
    return NextResponse.json(
      { error: `Interner Serverfehler: ${error.message}` },
      { status: 500 }
    );
  }
}

