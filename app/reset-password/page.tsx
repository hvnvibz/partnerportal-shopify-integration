"use client";
import { useState, useRef } from 'react';
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (!captchaToken) {
      setError('Bitte bestätigen Sie das Captcha.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send password reset email via API route (hCAPTCHA validated server-side)
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          captchaToken
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Fehler beim Senden der E-Mail');
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        setMessage(result.message || 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet, falls die Adresse existiert.');
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      }
    } catch (err) {
      console.error('Unerwarteter Fehler:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100">
        <div className="w-full max-w-xl p-12 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-6 leading-tight">Passwort zurücksetzen</h1>
          <p className="text-center text-gray-700 mb-10 text-lg">
            Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
          </p>
          <form onSubmit={handleSubmit}>
            <label className="block mb-1 text-base font-semibold text-gray-800">Ihre E-Mail Adresse</label>
            <input
              type="email"
              className="w-full p-3 mb-5 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="max.muster@unternehmen.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="mb-5 flex justify-center">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                onVerify={setCaptchaToken}
                ref={captchaRef}
                theme="light"
              />
            </div>
            {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
            {message && <div className="mb-4 text-green-700 text-sm text-center">{message}</div>}
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-900 transition mb-2 shadow-md"
              disabled={loading}
            >
              {loading ? 'Sende E-Mail...' : 'Passwort zurücksetzen'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <a href="/anmelden" className="text-blue-900 underline hover:text-blue-700 text-base">Zurück zum Login</a>
          </div>
        </div>
      </div>
      {/* Right: Background Image */}
      <div className="hidden md:block w-1/2 h-full relative">
        <img
          src="/signin-bg.avif"
          alt="INDUWA background"
          className="object-cover w-full h-full min-h-screen rounded-l-3xl"
          style={{ objectPosition: 'center' }}
          loading="eager"
        />
      </div>
    </div>
  );
} 