"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function SuchePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header mit Burger-Menü */}
        <header className="flex md:hidden h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-40">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold text-lg text-blue-900">Globale Suche</span>
        </header>
        <div className="container mx-auto py-8 md:py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Globale Suche</h1>
          <div className="text-base md:text-lg text-muted-foreground">
            Die globale Suche ist in Kürze verfügbar.
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 