"use client"
// Diese Datei wird zur Übersichtsseite umgebaut. Die Detailansicht wird nach [slug]/page.tsx verschoben. 

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

// Beispiel-Daten für DPHs (später aus DB oder Datei)
const DPH_LIST = [
  {
    slug: "kawk-enthaertungsanlage",
    title: "KAWK Enthärtungsanlage",
  },
  {
    slug: "kawk-d-stadtwasser-enthaertungsanlage",
    title: "KAWK-D Stadtwasser-Enthärtungsanlage",
  },
  {
    slug: "nitratreduzierungsanlage-kawn",
    title: "Nitratreduzierungsanlage Typ KAWN",
  },
]

export default function ProdukthandbuecherUebersicht() {
  const [search, setSearch] = useState("")
  const filtered = DPH_LIST.filter(dph => dph.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold">Digitale Produkthandbücher</h1>
        </header>
        <div className="container mx-auto py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Alle digitalen Produkthandbücher</h2>
                <p className="text-muted-foreground">Suchen Sie nach einem Produkt und öffnen Sie das jeweilige Handbuch.</p>
              </div>
              <Input
                type="search"
                placeholder="Suche nach Produkt..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-500">Kein Handbuch gefunden.</div>
              )}
              {filtered.map(dph => (
                <Link
                  key={dph.slug}
                  href={`/produkthandbuecher/${dph.slug}`}
                  className="block border rounded-lg p-6 shadow hover:shadow-lg transition bg-white h-full"
                >
                  <div className="font-semibold text-lg mb-2">{dph.title}</div>
                  <div className="text-blue-700 underline">Handbuch öffnen</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 