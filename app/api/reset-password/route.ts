import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyHCaptcha } from "@/lib/hcaptcha";

export async function POST(req: Request) {
  try {
    const { email, captchaToken } = await req.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "E-Mail-Adresse ist erforderlich" },
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

    // Get the origin from headers for redirect URL
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectTo = `${origin}/reset-password/update`;

    // Send password reset email (hCAPTCHA already validated server-side, but pass token to Supabase as well)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      captchaToken, // Pass token to Supabase even though we validated it server-side
    });

    if (resetError) {
      console.error('Reset password error:', resetError);
      return NextResponse.json(
        { error: `Fehler beim Senden der E-Mail: ${resetError.message}` },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet, falls die Adresse existiert.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

