import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyHCaptcha } from "@/lib/hcaptcha";

export async function POST(req: Request) {
  try {
    const { email, password, captchaToken } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
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

    // Sign in user (hCAPTCHA already validated server-side, but pass token to Supabase as well)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken, // Pass token to Supabase even though we validated it server-side
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // Translate error messages to German
      let germanError = authError.message;
      switch (authError.message) {
        case 'Invalid login credentials':
          germanError = 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.';
          break;
        case 'Email not confirmed':
          germanError = 'E-Mail-Adresse nicht bestätigt. Bitte bestätigen Sie Ihre E-Mail-Adresse.';
          break;
        case 'Too many requests':
          germanError = 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
          break;
        case 'User not found':
          germanError = 'Benutzer nicht gefunden. Bitte überprüfen Sie Ihre E-Mail-Adresse.';
          break;
        case 'Invalid email or password':
          germanError = 'Ungültige E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.';
          break;
        default:
          germanError = `Anmeldefehler: ${authError.message}`;
      }

      return NextResponse.json(
        { error: germanError },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Anmeldung fehlgeschlagen" },
        { status: 500 }
      );
    }

    // Check user status - only active users can login
    // Use raw SQL query to ensure we get the correct status
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('status, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      console.error('User ID:', authData.user.id);
      console.error('Email:', authData.user.email);
      
      // Try alternative query to debug
      const { data: altData, error: altError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      console.error('Alternative query result:', { altData, altError });
      
      return NextResponse.json(
        { error: `Fehler beim Laden des Benutzerprofils: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (!profileData) {
      console.error('Profile not found for user:', authData.user.id);
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    // Normalize status to lowercase for comparison (handle case sensitivity)
    const userStatus = profileData.status?.toLowerCase()?.trim();
    
    // Log for debugging
    console.log('User login attempt:', {
      userId: authData.user.id,
      email: authData.user.email,
      status: profileData.status,
      statusType: typeof profileData.status,
      statusLength: profileData.status?.length,
      normalizedStatus: userStatus,
      role: profileData.role,
      rawProfileData: JSON.stringify(profileData)
    });

    // Check if user is active (handle NULL, empty string, or case variations)
    if (!userStatus || userStatus !== 'active') {
      if (userStatus === 'blocked') {
        return NextResponse.json(
          { error: "Ihr Konto wurde gesperrt. Bitte kontaktieren Sie den Support." },
          { status: 403 }
        );
      } else {
        // Return detailed error with status information
        const statusInfo = profileData.status 
          ? `Status: "${profileData.status}" (Typ: ${typeof profileData.status}, Länge: ${profileData.status.length})`
          : 'Status: nicht gesetzt (NULL)';
        return NextResponse.json(
          { error: `Ihr Konto wurde noch nicht freigeschaltet. ${statusInfo}` },
          { status: 403 }
        );
      }
    }

    // Return success response with session data
    // The client will set the session using the tokens
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session ? {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
      } : null
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

