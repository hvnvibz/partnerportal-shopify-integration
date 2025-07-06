"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function SuchePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold mb-8">Globale Suche</h1>
          <div className="text-lg text-muted-foreground">
            Die globale Suche ist in Kürze verfügbar.
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 