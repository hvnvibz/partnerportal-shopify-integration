"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DoorOpen } from "lucide-react";

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
      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
      disabled={loading}
      title="Abmelden"
      aria-label="Abmelden"
    >
      <DoorOpen className="h-4 w-4" />
      <span className="sr-only">Abmelden</span>
    </button>
  );
} 