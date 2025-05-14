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

// Beispiel-Daten für DPHs (später aus DB oder Datei)
const DPH_LIST = [
  {
    slug: "kawk-enthaertungsanlage",
    title: "KAWK Enthärtungsanlage",
    videoId: "BbFQwiyGSw",
    handbuch: "/handbuch-kawk.pdf",
    datenblatt: "/datenblatt-kawk.pdf"
  },
  {
    slug: "kawk-d-stadtwasser-enthaertungsanlage",
    title: "KAWK-D Stadtwasser-Enthärtungsanlage",
    videoId: "BbFQwiyGSw",
    handbuch: "/handbuch-kawk-d.pdf",
    datenblatt: "/datenblatt-kawk-d.pdf"
  },
  {
    slug: "nitratreduzierungsanlage-kawn",
    title: "Nitratreduzierungsanlage Typ KAWN",
    videoId: "BbFQwiyGSw",
    handbuch: "/handbuch-kawn.pdf",
    datenblatt: "/datenblatt-kawn.pdf"
  },
]

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
  const dph = DPH_LIST.find((d) => d.slug === params.slug)
  if (!dph) return notFound()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/produkthandbuecher">Digitale Produkthandbücher</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{dph.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto py-12">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-600 font-medium mb-4">Handbuch & Datenblatt</p>
              <h1 className="text-4xl font-bold mb-4">
                {dph.title}
              </h1>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Videoanleitung</h2>
              <YouTubeVideo videoId={dph.videoId} title={dph.title} />
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Schriftliche Anleitung</h2>
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <Link href={dph.handbuch} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                  Handbuch als PDF anzeigen <Download className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Produktdatenblatt</h2>
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <Link href={dph.datenblatt} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                  Datenblatt als PDF anzeigen <Download className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Wartungsinformation (PDF)</h2>
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <Link href={`/wartung-${dph.slug}.pdf`} target="_blank" className="text-blue-700 underline flex items-center gap-2">
                  Wartungsinformation als PDF anzeigen <Download className="h-4 w-4" />
                </Link>
              </div>
            </section>

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