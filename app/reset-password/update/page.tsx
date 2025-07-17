"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage("Das Passwort wurde erfolgreich geändert. Sie werden zur Login-Seite weitergeleitet.");
        setTimeout(() => {
          router.push("/anmelden");
        }, 2000);
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100">
        <div className="w-full max-w-xl p-12 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-6 leading-tight">Neues Passwort setzen</h1>
          
          <p className="text-center text-gray-700 mb-10 text-lg">
            Bitte geben Sie Ihr neues Passwort ein.
          </p>
          <form onSubmit={handleSubmit}>
            <label className="block mb-1 text-base font-semibold text-gray-800">Neues Passwort</label>
            <input
              type="password"
              className="w-full p-3 mb-5 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="Neues Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label className="block mb-1 text-base font-semibold text-gray-800">Passwort bestätigen</label>
            <input
              type="password"
              className="w-full p-3 mb-5 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="Passwort bestätigen"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
            {message && <div className="mb-4 text-green-700 text-sm text-center">{message}</div>}
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-900 transition mb-2 shadow-md"
              disabled={loading}
            >
              {loading ? 'Speichere...' : 'Passwort speichern'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <a href="/anmelden" className="text-blue-900 underline hover:text-blue-700 text-base">Zurück zum Login</a>
          </div>
        </div>
      </div>
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

function LoadingFallback() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100">
        <div className="w-full max-w-xl p-12 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <div className="text-center">
            <p className="text-gray-700 mb-4">Lade Seite...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
          </div>
        </div>
      </div>
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

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UpdatePasswordForm />
    </Suspense>
  );
} 