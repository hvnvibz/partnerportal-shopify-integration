import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Updates the last_activity_at timestamp for the current user.
 * This endpoint should be called periodically when a user is active.
 * It uses a debounced approach - only updates if more than 1 minute has passed since last update.
 */
export async function POST(req: Request) {
  try {
    // Get the current user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // Check if we need to update (only update if last_activity_at is more than 1 minute old)
    // This prevents excessive database writes
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('last_activity_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile for activity update:', profileError);
      // Continue anyway - we'll try to update
    }

    // Only update if last_activity_at is null or more than 1 minute old
    const now = new Date();
    const shouldUpdate = !profileData?.last_activity_at || 
      (now.getTime() - new Date(profileData.last_activity_at).getTime()) > 60000; // 1 minute

    if (shouldUpdate) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ last_activity_at: now.toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating last_activity_at:', updateError);
        return NextResponse.json(
          { error: "Fehler beim Aktualisieren der Aktivität" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      updated: shouldUpdate,
    });

  } catch (error: any) {
    console.error('Activity API error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

