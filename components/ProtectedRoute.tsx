"use client";
import { useUser } from "@/lib/useUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/anmelden", "/registrierung", "/reset-password", "/reset-password/update"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
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
    }
  }, [user, loading, router, pathname, isPublic]);

  if (loading || (!user && !isPublic)) {
    return <div className="flex justify-center items-center min-h-screen">Lade...</div>;
  }

  return <>{children}</>;
} 