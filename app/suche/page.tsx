"use client"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Link from "next/link"

// Platzhalterdaten für Demo
const SHOP = [
  { title: "KAWK Enthärtungsanlage", href: "/shop/enthaertungsanlage" },
  { title: "Dosieranlage", href: "/shop/dosieranlage" },
]
const HANDBUECHER = [
  { title: "KAWK Enthärtungsanlage", href: "/produkthandbuecher/kawk-enthaertungsanlage" },
  { title: "KAWK-D Stadtwasser-Enthärtungsanlage", href: "/produkthandbuecher/kawk-d-stadtwasser-enthaertungsanlage" },
  { title: "Nitratreduzierungsanlage Typ KAWN", href: "/produkthandbuecher/nitratreduzierungsanlage-kawn" },
]
const VIDEOS = [
  { title: "Inbetriebnahme der KAWK Enthärtungsanlage", href: "/supportvideos" },
]

export default function SuchePage() {
  const params = useSearchParams()
  const query = params.get("query")?.toLowerCase() || ""

  // Filtere die Demo-Daten
  const shopResults = SHOP.filter(item => item.title.toLowerCase().includes(query))
  const handbuchResults = HANDBUECHER.filter(item => item.title.toLowerCase().includes(query))
  const videoResults = VIDEOS.filter(item => item.title.toLowerCase().includes(query))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold mb-8">Suchergebnisse für „{query}“</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Shop</h2>
            {shopResults.length === 0 ? (
              <div className="text-gray-500">Keine Produkte gefunden.</div>
            ) : (
              <ul className="space-y-2">
                {shopResults.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 underline">{item.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Digitale Handbücher</h2>
            {handbuchResults.length === 0 ? (
              <div className="text-gray-500">Keine Handbücher gefunden.</div>
            ) : (
              <ul className="space-y-2">
                {handbuchResults.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 underline">{item.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Supportvideos</h2>
            {videoResults.length === 0 ? (
              <div className="text-gray-500">Keine Videos gefunden.</div>
            ) : (
              <ul className="space-y-2">
                {videoResults.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 underline">{item.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 