import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
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

    // Check if user is admin
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

    // Get all users - query auth.users directly via admin client
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return NextResponse.json(
        { error: "Fehler beim Laden der Benutzer" },
        { status: 500 }
      );
    }

    // Get profiles for all users
    const userIds = authUsers.users.map(u => u.id);
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, role, status, customer_number')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: "Fehler beim Laden der Benutzerprofile" },
        { status: 500 }
      );
    }

    // Combine auth users with profiles
    const formattedUsers = authUsers.users.map((authUser) => {
      const profile = profilesData?.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email || '',
        display_name: profile?.display_name || '',
        customer_number: profile?.customer_number || '',
        role: profile?.role || 'partner',
        status: profile?.status || 'pending',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
      };
    });

    // Sort by created_at descending
    formattedUsers.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });

  } catch (error: any) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

