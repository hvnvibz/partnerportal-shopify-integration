"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/signin` : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet, falls die Adresse existiert.');
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
            <a href="/signin" className="text-blue-900 underline hover:text-blue-700 text-base">Zurück zum Login</a>
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