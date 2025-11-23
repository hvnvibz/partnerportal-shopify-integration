"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Eye, EyeOff } from 'lucide-react';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    customerNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      address1: '',
      address2: '',
      city: '',
      province: '',
      country: 'Deutschland',
      zip: ''
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const captchaRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

    if (!captchaToken) {
      setError('Bitte bestätigen Sie das Captcha.');
      return;
    }

    setLoading(true);

    try {
      // Registriere den Benutzer über die neue API-Route
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          captchaToken
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registrierung fehlgeschlagen');
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        // Registrierung erfolgreich
        setError(null);
        alert(result.message || 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail-Adresse und bestätigen Sie Ihr Konto.');
        router.push('/anmelden');
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/signin-bg.avif"
          alt="INDUWA background"
          className="object-cover w-full h-full"
          style={{ objectPosition: 'center' }}
          loading="eager"
        />
      </div>
      
      {/* Centered Form Container */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-12 px-4">
        <div className="w-full max-w-4xl p-12 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-gray-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-900 mb-6 leading-tight">Registrierung für das<br />INDUWA Partnerportal</h1>
          <p className="text-center text-gray-700 mb-10 text-lg">
            Erstellen Sie Ihr Konto und erhalten Sie Zugang zu unseren Wasseraufbereitungsanlagen, digitalen Produkthandbüchern, Supportvideos und vielen weiteren Services.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Vorname *</label>
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
                <label className="block mb-1 text-sm font-semibold text-gray-700">Nachname *</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Unternehmen *</label>
                <input
                  type="text"
                  name="company"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="Mustermann GmbH"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Kundennummer *</label>
                <input
                  type="text"
                  name="customerNumber"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="12345"
                  value={formData.customerNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">E-Mail Adresse *</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="max.muster@unternehmen.de"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Telefonnummer</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                  placeholder="+49 123 456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Straße *</label>
                  <input
                    type="text"
                    name="address.address1"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="Musterstraße 123"
                    value={formData.address.address1}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Adresszusatz</label>
                  <input
                    type="text"
                    name="address.address2"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="Etage 2"
                    value={formData.address.address2}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">PLZ *</label>
                  <input
                    type="text"
                    name="address.zip"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="12345"
                    value={formData.address.zip}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Stadt *</label>
                  <input
                    type="text"
                    name="address.city"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="Musterstadt"
                    value={formData.address.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Bundesland</label>
                  <input
                    type="text"
                    name="address.province"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="Bayern"
                    value={formData.address.province}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Land *</label>
                  <input
                    type="text"
                    name="address.country"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-sm"
                    placeholder="Deutschland"
                    value={formData.address.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Passwort *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                    placeholder="Mindestens 6 Zeichen"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Passwort bestätigen *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 placeholder-gray-400 text-base"
                    placeholder="Passwort wiederholen"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Passwort ausblenden" : "Passwort anzeigen"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-5 flex justify-center">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
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
              {loading ? 'Registrierung läuft...' : 'Jetzt registrieren'}
            </button>
          </form>

          <div className="mt-8 text-center text-base text-gray-700">
            Haben Sie bereits ein Konto?{' '}
            <a href="/anmelden" className="text-blue-900 underline hover:text-blue-700">Hier anmelden</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
