"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Home, ShoppingBag, FileText, Video, GraduationCap, Wrench, Search, BookOpen, LayoutDashboard, ShoppingCart, Settings, LogOut, DoorOpen, UserCog } from "lucide-react"
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
import { useState } from "react"
import AppSidebarLogout from "@/components/AppSidebarLogout"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState("")

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
        <div className="flex flex-row gap-2 px-6 pt-4 justify-end">
          <Link
            href="/einstellungen"
            className={`flex items-center gap-2 px-3 py-2 rounded text-gray-700 hover:bg-gray-100 font-semibold text-base ${pathname === "/einstellungen" ? "bg-gray-200 text-gray-800" : ""}`}
          >
            <span className="text-base">⚙️</span> Einstellungen
          </Link>
          <AppSidebarLogout />
        </div>
      </div>
    </Sidebar>
  )
}

