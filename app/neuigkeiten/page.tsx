"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UpdatesCarousel } from "@/components/updates/updates-carousel"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function NeuigkeitenPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header mit Burger-Menü */}
        <header className="flex md:hidden h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-40">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold text-lg text-blue-900">Neuigkeiten</span>
        </header>

        <div className="container mx-auto py-8 md:py-12 px-4 md:px-8">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                  Was ist neu?
                </h1>
                <p className="text-gray-500 text-sm">
                  Entdecke die neuesten Features und Verbesserungen
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Section */}
          <div className="flex justify-center py-8">
            <UpdatesCarousel autoPlay={true} autoPlayInterval={6000} />
          </div>

          {/* Link to full Changelog */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-2">
              Alle Änderungen im Detail findest du im
            </p>
            <Link 
              href="/docs/CHANGELOG_USER.md" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm underline underline-offset-2"
            >
              vollständigen Changelog
            </Link>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
