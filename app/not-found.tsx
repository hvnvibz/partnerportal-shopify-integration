"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Die Seite wurde nicht gefunden.</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
      >
        Zurück zum Dashboard
      </Link>
    </div>
  );
} 