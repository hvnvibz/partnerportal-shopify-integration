"use client";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Play, Wrench, FileDown, Video, Settings, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Cart } from "@/components/shop/cart"
import { useState, useEffect } from "react"

interface Handbook {
  title: string;
  slug: string;
  titelbild?: string;
  videoId?: string;
  videoUrl?: string;
  handbuchUrl?: string;
  datenblattUrl?: string;
  wartungUrl?: string;
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
  ekfKomponenten?: {
    kompressor?: string;
    oxidator?: string;
    dpr?: string;
    rsl?: string;
  };
  okfKomponenten?: {
    niveausteuerung?: string;
    rueckspuelautomatik?: string;
    komplettsteuerung?: string;
  };
  wartungsinformationenFreischalten?: boolean;
  createdOn?: string;
  updatedOn?: string;
  publishedOn?: string;
}

function YouTubeVideo({ videoId, title }: { videoId: string; title: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DownloadButton({ url, title, icon: Icon }: { url: string; title: string; icon: any }) {
  return (
    <Button asChild variant="outline" className="w-full justify-start">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </a>
    </Button>
  );
}

function LinkButton({ url, title, icon: Icon }: { url: string; title: string; icon: any }) {
  return (
    <Button asChild variant="outline" className="w-full justify-start">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </a>
    </Button>
  );
}

export default function ProdukthandbuchDetail({ params }: { params: { slug: string } }) {
  const [handbook, setHandbook] = useState<Handbook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/produkthandbuecher')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          const foundHandbook = data.find((h: Handbook) => h.slug === params.slug)
          if (foundHandbook) {
            setHandbook(foundHandbook)
          } else {
            setError('Handbuch nicht gefunden')
          }
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Fehler beim Laden des Handbuchs')
        setLoading(false)
      })
  }, [params.slug])

  if (loading) {
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
                  <BreadcrumbLink href="/produkthandbuecher">Digitale Handbücher</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Laden...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Cart />
          </header>
          <div className="container mx-auto py-12">
            <div className="text-center">
              <div className="text-lg text-gray-600">Lade Handbuch...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !handbook) {
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
                  <BreadcrumbLink href="/produkthandbuecher">Digitale Handbücher</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Fehler</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Cart />
          </header>
          <div className="container mx-auto py-12">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">Fehler beim Laden des Handbuchs</div>
              <div className="text-sm text-gray-600">{error}</div>
              <Link href="/produkthandbuecher" className="inline-block mt-4 text-blue-600 hover:underline">
                ← Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
                <BreadcrumbLink href="/produkthandbuecher">Digitale Handbücher</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{handbook.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        
        <div className="container mx-auto py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{handbook.title}</h1>
              <p className="text-xl text-muted-foreground">
                Vollständige Produktdokumentation und Handbücher
              </p>
            </div>

            {/* Titelbild */}
            {handbook.titelbild && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="aspect-video w-full overflow-hidden bg-gray-50 flex items-center justify-center rounded-lg">
                    <img 
                      src={handbook.titelbild} 
                      alt={handbook.title}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accordion mit allen Informationen */}
            <Accordion type="single" collapsible className="space-y-4">
              
              {/* Videos */}
              {(handbook.videoUrls?.video1 || handbook.videoUrls?.video2 || handbook.videoUrls?.video3 || 
                handbook.videoUrls?.video4 || handbook.videoUrls?.video5 || handbook.videoUrls?.video6) && (
                <AccordionItem value="videos" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Videos & Erklärungen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {handbook.videoId && (
                        <div>
                          <h4 className="font-medium mb-2">Hauptvideo</h4>
                          <YouTubeVideo videoId={handbook.videoId} title={handbook.title} />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {handbook.videoUrls?.video1 && (
                          <LinkButton url={handbook.videoUrls.video1} title="Video 1" icon={Play} />
                        )}
                        {handbook.videoUrls?.video2 && (
                          <LinkButton url={handbook.videoUrls.video2} title="Video 2" icon={Play} />
                        )}
                        {handbook.videoUrls?.video3 && (
                          <LinkButton url={handbook.videoUrls.video3} title="Video 3" icon={Play} />
                        )}
                        {handbook.videoUrls?.video4 && (
                          <LinkButton url={handbook.videoUrls.video4} title="Video 4" icon={Play} />
                        )}
                        {handbook.videoUrls?.video5 && (
                          <LinkButton url={handbook.videoUrls.video5} title="Video 5 (Sonderausführung)" icon={Play} />
                        )}
                        {handbook.videoUrls?.video6 && (
                          <LinkButton url={handbook.videoUrls.video6} title="Video 6" icon={Play} />
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Handbücher */}
              {(handbook.handbuchUrls?.einbauanleitung1 || handbook.handbuchUrls?.einbauanleitung1Google || 
                handbook.handbuchUrls?.einbauanleitung2 || handbook.handbuchUrls?.schriftlicheAnleitung || 
                handbook.handbuchUrls?.schriftlicheAnleitungGoogle) && (
                <AccordionItem value="handbooks" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Handbücher & Anleitungen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {handbook.handbuchUrls?.einbauanleitung1 && (
                        <DownloadButton url={handbook.handbuchUrls.einbauanleitung1} title="Einbauanleitung (1)" icon={Download} />
                      )}
                      {handbook.handbuchUrls?.einbauanleitung1Google && (
                        <DownloadButton url={handbook.handbuchUrls.einbauanleitung1Google} title="Einbauanleitung (1) Google Drive" icon={Download} />
                      )}
                      {handbook.handbuchUrls?.einbauanleitung2 && (
                        <DownloadButton url={handbook.handbuchUrls.einbauanleitung2} title="Einbauanleitung (2 - neue Serie)" icon={Download} />
                      )}
                      {handbook.handbuchUrls?.schriftlicheAnleitung && (
                        <DownloadButton url={handbook.handbuchUrls.schriftlicheAnleitung} title="Schriftliche Anleitung Sonderausführung" icon={Download} />
                      )}
                      {handbook.handbuchUrls?.schriftlicheAnleitungGoogle && (
                        <DownloadButton url={handbook.handbuchUrls.schriftlicheAnleitungGoogle} title="Schr. Anleit. Connect (Google Drive)" icon={Download} />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Datenblätter */}
              {(handbook.datenblattUrls?.alt || handbook.datenblattUrls?.alteVersion || 
                handbook.datenblattUrls?.neueVersion || handbook.datenblattUrls?.technische) && (
                <AccordionItem value="datasheets" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileDown className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Datenblätter & Technische Informationen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {handbook.datenblattUrls?.neueVersion && (
                        <DownloadButton url={handbook.datenblattUrls.neueVersion} title="Produktdatenblatt (neue Version)" icon={Download} />
                      )}
                      {handbook.datenblattUrls?.alteVersion && (
                        <DownloadButton url={handbook.datenblattUrls.alteVersion} title="Produktdatenblatt (alte Version)" icon={Download} />
                      )}
                      {handbook.datenblattUrls?.alt && (
                        <DownloadButton url={handbook.datenblattUrls.alt} title="Produktdatenblatt (alt)" icon={Download} />
                      )}
                      {handbook.datenblattUrls?.technische && (
                        <DownloadButton url={handbook.datenblattUrls.technische} title="Technische Datenblätter (Google Drive)" icon={Download} />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Wartungsinformationen */}
              {(handbook.wartungUrls?.plan || handbook.wartungUrls?.klein || 
                handbook.wartungUrls?.gross || handbook.wartungUrls?.jaehrlich) && (
                <AccordionItem value="maintenance" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold">Wartungsinformationen</span>
                      {handbook.wartungsinformationenFreischalten && (
                        <Badge variant="secondary" className="ml-2">Freigeschaltet</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {handbook.wartungUrls?.plan && (
                        <DownloadButton url={handbook.wartungUrls.plan} title="Wartungsplan" icon={Wrench} />
                      )}
                      {handbook.wartungUrls?.klein && (
                        <DownloadButton url={handbook.wartungUrls.klein} title="Wartungstätigkeiten (kleine Wartung)" icon={Wrench} />
                      )}
                      {handbook.wartungUrls?.gross && (
                        <DownloadButton url={handbook.wartungUrls.gross} title="Wartungstätigkeiten (große Wartung)" icon={Wrench} />
                      )}
                      {handbook.wartungUrls?.jaehrlich && (
                        <DownloadButton url={handbook.wartungUrls.jaehrlich} title="Wartungstätigkeiten (jährlich)" icon={Wrench} />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* EKF-Komponenten */}
              {(handbook.ekfKomponenten?.kompressor || handbook.ekfKomponenten?.oxidator || 
                handbook.ekfKomponenten?.dpr || handbook.ekfKomponenten?.rsl) && (
                <AccordionItem value="ekf" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">EKF-Komponenten</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {handbook.ekfKomponenten?.kompressor && (
                        <LinkButton url={handbook.ekfKomponenten.kompressor} title="Kompressor EKF" icon={Settings} />
                      )}
                      {handbook.ekfKomponenten?.oxidator && (
                        <LinkButton url={handbook.ekfKomponenten.oxidator} title="Oxidator EKF" icon={Settings} />
                      )}
                      {handbook.ekfKomponenten?.dpr && (
                        <LinkButton url={handbook.ekfKomponenten.dpr} title="DPR-EKF" icon={Settings} />
                      )}
                      {handbook.ekfKomponenten?.rsl && (
                        <LinkButton url={handbook.ekfKomponenten.rsl} title="RSL-EKF" icon={Settings} />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* OKF-Komponenten */}
              {(handbook.okfKomponenten?.niveausteuerung || handbook.okfKomponenten?.rueckspuelautomatik || 
                handbook.okfKomponenten?.komplettsteuerung) && (
                <AccordionItem value="okf" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-indigo-600" />
                      <span className="font-semibold">OKF-Komponenten</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-2">
                      {handbook.okfKomponenten?.niveausteuerung && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <strong>Niveausteuerung OKF:</strong> {handbook.okfKomponenten.niveausteuerung}
                        </div>
                      )}
                      {handbook.okfKomponenten?.rueckspuelautomatik && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <strong>Rücksülautomatik OKF:</strong> {handbook.okfKomponenten.rueckspuelautomatik}
                        </div>
                      )}
                      {handbook.okfKomponenten?.komplettsteuerung && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <strong>Komplettsteuerung OKF:</strong> {handbook.okfKomponenten.komplettsteuerung}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

            </Accordion>

            {/* Zurück Button */}
            <div className="mt-12 text-center">
              <Link href="/produkthandbuecher">
                <Button variant="outline">
                  ← Zurück zur Übersicht
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// generateMetadata entfernt - nicht kompatibel mit "use client"