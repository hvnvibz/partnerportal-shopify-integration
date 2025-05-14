"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Link from "next/link"
import { ShoppingBag, Wrench, Video, FileText } from "lucide-react"

const tiles = [
  {
    title: "Shop",
    description: "Produkte & Zubehör bestellen",
    href: "/shop",
    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
  },
  {
    title: "Wartung & Service",
    description: "Serviceleistungen & Wartungsanfragen",
    href: "/wartung-service",
    icon: <Wrench className="h-8 w-8 text-green-600" />,
    color: "bg-green-50 hover:bg-green-100 border-green-200"
  },
  {
    title: "Supportvideos",
    description: "Videoanleitungen für Ihre Produkte",
    href: "/supportvideos",
    icon: <Video className="h-8 w-8 text-purple-600" />,
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
  },
  {
    title: "Digitale Handbücher",
    description: "Alle Produkthandbücher & Datenblätter",
    href: "/produkthandbuecher",
    icon: <FileText className="h-8 w-8 text-yellow-600" />,
    color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
  },
]

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-2">Willkommen im Partnerportal</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ihr zentraler Zugang zu Shop, Service, Support und digitalen Handbüchern für alle INDUWA-Produkte.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {tiles.map(tile => (
              <Link
                key={tile.title}
                href={tile.href}
                className={`flex flex-col items-start border rounded-2xl p-8 shadow transition ${tile.color}`}
              >
                {tile.icon}
                <div className="mt-4 font-bold text-2xl">{tile.title}</div>
                <div className="mt-2 text-muted-foreground">{tile.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 