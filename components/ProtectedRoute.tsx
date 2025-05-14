"use client";
import { useUser } from "@/lib/useUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/anmelden", "/reset-password"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

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