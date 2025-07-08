"use client";
// Diese Datei wird zur Übersichtsseite umgebaut. Die Detailansicht wird nach [slug]/page.tsx verschoben. 

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Cart } from "@/components/shop/cart"

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
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Start</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Digitale Handbücher</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="container mx-auto py-12 flex items-center justify-center min-h-[40vh]">
          <div className="text-center text-xl text-gray-600 font-semibold">
            Diese Funktion wird in Kürze freigeschaltet.
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 