"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Cart } from "@/components/shop/cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search } from "lucide-react"

interface Handbook {
  title: string;
  slug: string;
  titelbild?: string;
  beschreibung?: string;
  produktkategorie?: string;
  collectionId?: string;
  localeId?: string;
  itemId?: string;
  archived?: boolean;
  draft?: boolean;
  videoUrls?: {
    video1?: string;
    video2?: string;
    video3?: string;
    video4?: string;
    video5?: string;
    video6?: string;
  };
  handbuchUrls?: {
    einbauanleitung1?: string;
    einbauanleitung1Google?: string;
    einbauanleitung2?: string;
    schriftlicheAnleitung?: string;
    schriftlicheAnleitungGoogle?: string;
  };
  datenblattUrls?: {
    alt?: string;
    alteVersion?: string;
    neueVersion?: string;
    technische?: string;
  };
  wartungUrls?: {
    plan?: string;
    klein?: string;
    gross?: string;
    jaehrlich?: string;
  };
}

export default function ProdukthandbuecherUebersicht() {
  const [search, setSearch] = useState("")
  const [handbooks, setHandbooks] = useState<Handbook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/produkthandbuecher')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setHandbooks(Array.isArray(data) ? data : [])
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Fehler beim Laden der Handbücher')
        setLoading(false)
      })
  }, [])

      const filtered = handbooks
        .filter(handbook => 
          handbook.title.toLowerCase().includes(search.toLowerCase()) ||
          handbook.beschreibung?.toLowerCase().includes(search.toLowerCase()) ||
          handbook.produktkategorie?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.title.localeCompare(b.title, 'de'))

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
        
        <div className="container mx-auto py-12">
          <div className="text-center mb-12">
            <p className="text-lg text-blue-900 font-medium mb-4">Produktdokumentation</p>
            <h1 className="text-4xl font-bold mb-4">
              Digitale Produkthandbücher
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hier finden Sie alle wichtigen Handbücher, Datenblätter und Wartungsinformationen für Ihre INDUWA Wasseraufbereitungsanlagen.
            </p>
          </div>

          {/* Suchfeld */}
          <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Handbücher durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Lade Handbücher...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-lg text-red-600 mb-4">Fehler beim Laden der Handbücher</div>
              <div className="text-sm text-gray-600">{error}</div>
              <div className="mt-4 text-sm text-gray-500">
                Bitte überprüfen Sie die Notion-Datenbank-Konfiguration.
              </div>
            </div>
          )}

          {/* Handbücher Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-lg text-gray-600">
                    {search ? 'Keine Handbücher gefunden, die Ihrer Suche entsprechen.' : 'Keine Handbücher verfügbar.'}
                  </div>
                </div>
              ) : (
                filtered.map((handbook) => (
                  <Link key={handbook.slug} href={`/produkthandbuecher/${handbook.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                      {handbook.titelbild && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-50 flex items-center justify-center my-4 shadow-sm">
                          <img 
                            src={handbook.titelbild} 
                            alt={handbook.title}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-base">{handbook.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="flex-1">
                          {handbook.produktkategorie && (
                            <div className="text-xs text-blue-600 font-medium mb-3">
                              {handbook.produktkategorie}
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-4">
                          <p className="text-sm text-gray-600 text-right">{handbook.beschreibung}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 