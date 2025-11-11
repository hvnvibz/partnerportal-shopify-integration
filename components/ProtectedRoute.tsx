"use client";
import { useUser } from "@/lib/useUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/anmelden", "/registrierung", "/reset-password", "/reset-password/update"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, status, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname() || "";

  // Für alle /reset-password-Routen: immer öffentlich, keine User-Prüfung!
  if (pathname.startsWith("/reset-password")) {
    return <>{children}</>;
  }

  const isPublic = PUBLIC_PATHS.some(path => pathname === path || pathname === path + "/");

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.replace("/anmelden");
      return;
    }
    
    // Check if user is logged in but not active
    // Only block if status is explicitly set and not 'active'
    // If status is null/undefined, allow access (for existing users or if RLS blocks the query)
    // This is a safety measure: if we can't read the status, we assume the user is active
    if (!loading && user && status !== null && status !== undefined && status !== 'active' && !isPublic) {
      console.log('Blocking access - user status:', status);
      router.replace("/anmelden?error=not-activated");
    }
  }, [user, status, loading, router, pathname, isPublic]);

  if (loading || (!user && !isPublic)) {
    return <div className="flex justify-center items-center min-h-screen">Lade...</div>;
  }

  // Block access if user is not active (only if status is explicitly set)
  // If status is null/undefined, allow access (for existing users or if RLS blocks the query)
  if (user && status !== null && status !== undefined && status !== 'active' && !isPublic) {
    console.log('Blocking render - user status:', status);
    return <div className="flex justify-center items-center min-h-screen">Lade...</div>;
  }

  return <>{children}</>;
} 