"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const captchaRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!captchaToken) {
      setError('Bitte bestätigen Sie das Captcha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      // Captcha zurücksetzen, falls Fehler
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100">
        <div className="w-full max-w-xl p-12 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-900 mb-6 leading-tight">Willkommen zum<br />INDUWA Partnerportal</h1>
          <p className="text-center text-gray-700 mb-10 text-lg">
            Entdecken Sie unsere Wasseraufbereitungsanlagen, digitalen Produkt­handbücher, Supportvideos und mehr.
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
            <label className="block mb-1 text-base font-semibold text-gray-800">Ihr Passwort</label>
            <input
              type="password"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mb-5">
              <a href="/reset-password" className="text-sm text-blue-900 underline hover:text-blue-700">Passwort vergessen?</a>
            </div>
            <div className="mb-5 flex justify-center">
              <HCaptcha
                sitekey="a9283372-582e-4ee0-b196-b36448a2cbc6"
                onVerify={setCaptchaToken}
                ref={captchaRef}
                theme="light"
              />
            </div>
            {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-900 transition mb-2 shadow-md"
              disabled={loading}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
          <div className="mt-8 text-center text-base text-gray-700">
            Haben Sie noch keinen Account?{' '}
            <a href="/partneranfrage" className="text-blue-900 underline hover:text-blue-700">Jetzt anfragen</a>
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