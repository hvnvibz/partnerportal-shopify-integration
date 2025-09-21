"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
// import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    customerNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const captchaRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Bitte geben Sie Ihren Vornamen ein.');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Bitte geben Sie Ihren Nachnamen ein.');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Bitte geben Sie Ihr Unternehmen ein.');
      return false;
    }
    if (!formData.customerNumber.trim()) {
      setError('Bitte geben Sie Ihre Kundennummer ein.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return false;
    }
    if (!formData.password) {
      setError('Bitte geben Sie ein Passwort ein.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    // if (!captchaToken) {
    //   setError('Bitte bestätigen Sie das Captcha.');
    //   return;
    // }

    setLoading(true);

    try {
      // Registriere den Benutzer bei Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            customer_number: formData.customerNumber,
          }
        }
        // options: { captchaToken }
      });

      if (authError) {
        // Übersetze Supabase-Fehlermeldungen ins Deutsche
        let germanError = authError.message;
        
        switch (authError.message) {
          case 'User already registered':
            germanError = 'Diese E-Mail-Adresse ist bereits registriert.';
            break;
          case 'Password should be at least 6 characters':
            germanError = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
            break;
          case 'Invalid email':
            germanError = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            break;
          case 'Signup is disabled':
            germanError = 'Die Registrierung ist derzeit deaktiviert. Bitte kontaktieren Sie den Administrator.';
            break;
          case 'Email rate limit exceeded':
            germanError = 'Zu viele E-Mail-Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
            break;
          default:
            germanError = `Registrierungsfehler: ${authError.message}`;
        }
        
        setError(germanError);
        // setCaptchaToken(null);
        // captchaRef.current?.resetCaptcha();
      } else {
        // Registrierung erfolgreich
        setError(null);
        alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail-Adresse und bestätigen Sie Ihr Konto.');
        router.push('/anmelden');
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-900 mb-6 leading-tight">Registrierung für das<br />INDUWA Partnerportal</h1>
          <p className="text-center text-gray-700 mb-10 text-lg">
            Erstellen Sie Ihr Konto und erhalten Sie Zugang zu unseren Wasseraufbereitungsanlagen, digitalen Produkthandbüchern und Supportvideos.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-base font-semibold text-gray-800">Vorname *</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="Max"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-base font-semibold text-gray-800">Nachname *</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="Mustermann"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <label className="block mb-1 text-base font-semibold text-gray-800">Unternehmen *</label>
            <input
              type="text"
              name="company"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="Mustermann GmbH"
              value={formData.company}
              onChange={handleInputChange}
              required
            />

            <label className="block mb-1 text-base font-semibold text-gray-800">Kundennummer *</label>
            <input
              type="text"
              name="customerNumber"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="12345"
              value={formData.customerNumber}
              onChange={handleInputChange}
              required
            />

            <label className="block mb-1 text-base font-semibold text-gray-800">E-Mail-Adresse *</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
              placeholder="max.muster@unternehmen.de"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-base font-semibold text-gray-800">Passwort *</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="Mindestens 6 Zeichen"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-base font-semibold text-gray-800">Passwort bestätigen *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mb-5 flex justify-center">
              {/*
              <HCaptcha
                sitekey="a9283372-582e-4ee0-b196-b36448a2cbc6"
                onVerify={setCaptchaToken}
                ref={captchaRef}
                theme="light"
              />
              */}
            </div>

            {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-900 transition mb-2 shadow-md"
              disabled={loading}
            >
              {loading ? 'Registrierung läuft...' : 'Jetzt registrieren'}
            </button>
          </form>

          <div className="mt-8 text-center text-base text-gray-700">
            Haben Sie bereits ein Konto?{' '}
            <a href="/anmelden" className="text-blue-900 underline hover:text-blue-700">Hier anmelden</a>
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

export const dynamic = "force-dynamic";
