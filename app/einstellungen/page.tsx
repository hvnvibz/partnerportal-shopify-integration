import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function EinstellungenPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold text-blue-900">Einstellungen</h1>
        </header>
        <div className="container mx-auto py-12 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Profil</h2>
            <p className="text-lg text-gray-700 mb-8">Verwalten Sie Ihre persönlichen Daten wie Name und E-Mail-Adresse.</p>
            <div className="text-center text-gray-500 text-base mt-12">
              Weitere Funktionen sind in Kürze verfügbar.
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const metadata = {
  title: "Einstellungen – Partnerportal INDUWA",
  description: "Verwalten Sie Ihre persönlichen Einstellungen im Partnerportal INDUWA.",
}; 