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
      className="w-full flex items-center gap-3 text-left px-0 py-2 text-red-700 hover:bg-red-50 font-semibold rounded transition disabled:opacity-60"
      disabled={loading}
      title="Abmelden"
      aria-label="Abmelden"
    >
      <span className="inline-flex items-center justify-center h-10 w-10">
        <DoorOpen className="h-6 w-6" />
      </span>
      <span className="sr-only">Abmelden</span>
      {/* Optional: Text anzeigen, falls gewünscht */}
      {/* <span className="ml-2">{loading ? "Abmelden..." : "Abmelden"}</span> */}
    </button>
  );
} 