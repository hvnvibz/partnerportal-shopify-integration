"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Mail } from "lucide-react";

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
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Profil Sektion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-900" />
                  Profil
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre persönlichen Daten wie Name und E-Mail-Adresse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 text-base py-8">
                  Weitere Funktionen sind in Kürze verfügbar.
                </div>
              </CardContent>
            </Card>

            {/* Passwort Sektion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-900" />
                  Passwort & Sicherheit
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihr Passwort und die Sicherheit Ihres Kontos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Passwort ändern</p>
                      <p className="text-sm text-gray-600">
                        Setzen Sie Ihr Passwort zurück, falls Sie es vergessen haben.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/reset-password'}
                    className="bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
                  >
                    Passwort zurücksetzen
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900 mb-1">Hinweis:</p>
                  <p>
                    Beim Zurücksetzen Ihres Passworts erhalten Sie eine E-Mail mit einem Link. 
                    Dieser Link ist 60 Minuten gültig und kann nur einmal verwendet werden.
                  </p>
                </div>
              </CardContent>
            </Card>

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