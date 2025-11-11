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

    // Sign in user (hCAPTCHA already validated server-side)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('status, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: "Fehler beim Laden des Benutzerprofils" },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { error: "Benutzerprofil nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if user is active
    if (profileData.status !== 'active') {
      if (profileData.status === 'blocked') {
        return NextResponse.json(
          { error: "Ihr Konto wurde gesperrt. Bitte kontaktieren Sie den Support." },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: "Ihr Konto wurde noch nicht freigeschaltet." },
          { status: 403 }
        );
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

