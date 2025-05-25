import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Settings, DoorOpen } from "lucide-react";
import Link from "next/link";

export default function AccountSettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-3">
            <Settings className="h-7 w-7 text-blue-700" />
            Accounteinstellungen
          </h1>
          <Separator className="mb-8" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Profil</h2>
            <p className="text-gray-700 mb-4">Verwalten Sie Ihre persönlichen Daten wie Name und E-Mail-Adresse.</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Name und Kontaktdaten ändern</li>
              <li>E-Mail-Adresse aktualisieren</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Sicherheit</h2>
            <p className="text-gray-700 mb-4">Schützen Sie Ihren Account durch ein sicheres Passwort.</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>
                <Link href="/reset-password" className="text-blue-700 underline hover:text-blue-900">Passwort zurücksetzen</Link>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Datenschutz & Account</h2>
            <p className="text-gray-700 mb-4">Erfahren Sie mehr über den Schutz Ihrer Daten und wie Sie Ihr Konto löschen können.</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>
                <a href="https://www.induwa.de/datenschutzerklarung" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">Datenschutzerklärung einsehen</a>
              </li>
              <li>Konto löschen</li>
            </ul>
          </section>

          <div className="mt-16 border-t border-gray-200 pt-6 flex flex-row gap-4 justify-end">
            <Link href="/anmelden" className="flex items-center gap-2 px-4 py-2 rounded text-red-700 hover:bg-red-50 font-semibold">
              <DoorOpen className="h-5 w-5" /> Abmelden
            </Link>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 