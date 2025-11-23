"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Home, ShoppingBag, FileText, Video, GraduationCap, Wrench, Search, BookOpen, LayoutDashboard, ShoppingCart, Settings, LogOut, DoorOpen, UserCog, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import AppSidebarLogout from "@/components/AppSidebarLogout"
import { useUser } from "@/lib/useUser";

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { user, profile, role, loading } = useUser();

  // Debug logging for role
  useEffect(() => {
    if (!loading) {
      console.log('Sidebar - Role check:', {
        role,
        roleType: typeof role,
        isAdmin: role === 'admin',
        user: user?.email
      });
    }
  }, [role, loading, user]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/suche?query=${encodeURIComponent(search)}`)
    }
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Shop",
      icon: ShoppingBag,
      href: "/shop",
    },
    {
      title: "Bestellungen",
      icon: Package,
      href: "/bestellungen",
    },
    {
      title: "Produktkatalog",
      icon: FileText,
      href: "/produktkatalog",
    },
    {
      title: "Anfrage Eigenwasser",
      icon: FileText,
      href: "/anfrage-eigenwasser",
    },
    {
      title: "Anfrage Enthärtung",
      icon: FileText,
      href: "/anfrage-enthartung",
    },
    {
      title: "Supportvideos",
      icon: Video,
      href: "/supportvideos",
    },
    {
      title: "Schulungsanfragen",
      icon: BookOpen,
      href: "/schulungsanfragen",
    },
    {
      title: "Wartung & Service",
      icon: Wrench,
      href: "/wartung-service",
    },
    {
      title: "Digitale Handbücher",
      icon: FileText,
      href: "/produkthandbuecher",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="pb-0">
        <div className="px-6 py-4">
          <Link href="/">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INDUWA_Logo_mit-Wasseraufbereitung_Web-0vq0PESuB3aLzmp16MnZI2rSGCO035.png"
              alt="INDUWA Logo"
              width={180}
              height={60}
              priority
              className="w-full h-auto"
            />
          </Link>
        </div>
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Suche..."
              className="pl-9 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>
        {/* E-Mail-Adresse oben entfernt */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={`h-12 px-6 ${pathname === item.href ? "bg-gray-200 text-gray-800" : ""}`}
              >
                <Link href={item.href} className="flex items-center gap-3 text-base">
                  <item.icon className="h-5 w-5" />
                  <span className="ml-1">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto pb-4 border-t border-gray-200">
        <div className="flex flex-col gap-2 px-4 pt-4">
          {role === 'admin' && (
            <Link
              href="/admin/users"
              className={`flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium ${pathname === "/admin/users" ? "bg-gray-200 text-gray-900" : ""}`}
            >
              <UserCog className="h-4 w-4 flex-shrink-0" />
              <span>Admin</span>
            </Link>
          )}
          <div className="flex flex-row items-start gap-3 px-3 py-2.5">
            <div className="flex flex-col flex-1 items-start min-w-0">
              <Link
                href="/einstellungen"
                className={`flex items-center gap-2.5 text-sm px-0 py-1 rounded-md text-gray-700 hover:text-gray-900 transition-colors font-medium ${pathname === "/einstellungen" ? "text-gray-900" : ""}`}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span>Einstellungen</span>
              </Link>
              {profile?.display_name && (
                <div className="mt-1.5 text-xs text-gray-700 truncate w-full font-medium leading-tight">
                  {profile.display_name}
                </div>
              )}
              {user?.email && (
                <div className="text-xs text-gray-500 truncate w-full leading-tight">
                  {user.email}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 pt-0.5">
              <AppSidebarLogout />
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}

