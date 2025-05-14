"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AppSidebarLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/anmelden");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-6 py-3 text-red-700 hover:bg-red-50 border-t border-gray-200 font-semibold"
      disabled={loading}
    >
      {loading ? "Abmelden..." : "Abmelden"}
    </button>
  );
} 