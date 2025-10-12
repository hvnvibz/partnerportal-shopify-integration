import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client mit Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'temp-key'
);

export async function GET(req: Request) {
  try {
    // Prüfe Service Role Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'temp-key') {
      return NextResponse.json(
        { error: "Service Role Key nicht konfiguriert" },
        { status: 500 }
      );
    }

    // Rufe sichere Admin-Funktion auf
    const { data, error } = await supabaseAdmin.rpc('get_admin_sync_dashboard');

    if (error) {
      console.error('Error fetching admin dashboard:', error);
      return NextResponse.json(
        { error: "Fehler beim Laden der Dashboard-Daten" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
