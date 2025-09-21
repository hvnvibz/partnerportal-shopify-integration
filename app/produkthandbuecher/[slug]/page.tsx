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
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Cart } from "@/components/shop/cart"
import { useState, useEffect } from "react"

interface Handbook {
  title: string;
  slug: string;
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg">{title}</h3>
        </div>
      </CardContent>
    </Card>
  )
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
                  <BreadcrumbPage>Lade...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Cart />
          </header>
          <div className="container mx-auto py-12 flex items-center justify-center min-h-[40vh]">
            <div className="text-center text-xl text-gray-600 font-semibold">
              Lade Handbuch...
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !handbook) {
    return notFound()
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
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-600 font-medium mb-4">Handbuch & Datenblatt</p>
              <h1 className="text-4xl font-bold mb-4">
                {handbook.title}
              </h1>
              {handbook.beschreibung && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {handbook.beschreibung}
                </p>
              )}
            </div>

            {handbook.videoId && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Videoanleitung</h2>
                <YouTubeVideo videoId={handbook.videoId} title={handbook.title} />
              </section>
            )}

            {handbook.handbuchUrl && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Schriftliche Anleitung</h2>
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <Link href={handbook.handbuchUrl} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                    Handbuch als PDF anzeigen <Download className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            )}

            {handbook.datenblattUrl && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Produktdatenblatt</h2>
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <Link href={handbook.datenblattUrl} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                    Datenblatt als PDF anzeigen <Download className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            )}

            {handbook.wartungUrl && (
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Wartungsinformation</h2>
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <Link href={handbook.wartungUrl} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                    Wartungsinformation als PDF anzeigen <Download className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            )}

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Weitere Fragen?</h2>
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <p className="mb-2 font-medium">Kontaktieren Sie uns gerne:</p>
                  <p className="mb-1">
                    <span className="font-semibold">E-Mail:</span> <a href="mailto:info@induwa.de" className="text-blue-700 underline">info@induwa.de</a>
                  </p>
                  <p>
                    <span className="font-semibold">Telefon:</span> <a href="tel:+4925728070320" className="text-blue-700 underline">+49 2572 807 03 20</a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // Optional: Hole Handbuchdaten für besseren Title
  return {
    title: `Handbuch: ${slug} – Partnerportal INDUWA`,
    description: `Handbuch für ${slug} zum Download und Nachlesen im Partnerportal INDUWA.`,
  };
} 