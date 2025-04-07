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

// YouTube video component
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

export default function SupportvideosPage() {
  // Video data sorted by view count as specified
  const videos = [
    {
      id: "L2iOPkP8ctM",
      title: "Injektor reinigen am INDUWA Steuerventil IMP",
      views: 2599
    },
    {
      id: "R-ZBI1uzMXY",
      title: "Verschneidung einstellen am INDUWA Steuerventil IMP",
      views: 2092
    },
    {
      id: "RC1pmEhGlqw",
      title: "Messing-Verschneidung einstellen",
      views: 1332
    },
    {
      id: "_BbFQwiyGSw",
      title: "Inbetriebnahme der KAWK Enthärtungsanlage",
      views: 981
    },
    {
      id: "-bjMFU5G2tQ",
      title: "Ventilzerlegung am INDUWA Steuerventil IMP",
      views: 766
    },
    {
      id: "ER1Bd2G21II",
      title: "Inbetriebnahme der KAWK-D Stadtwasser-Enthärtungsanlage",
      views: 644
    },
    {
      id: "9El9ixlIeCw",
      title: "Nachträgliche Heizungswasseraufbereitung mit INDUWA Zirkulation",
      views: 510
    },
    {
      id: "jgwEoToJXRA",
      title: "Patronenwechsel bei der INDUWA Heizungswasserfülleinheit",
      views: 314
    },
    {
      id: "WHg38kpv8cU",
      title: "Inbetriebnahme der Dosieranlage INDUWA DOS",
      views: 235
    },
    {
      id: "43HsB7tk0xU",
      title: "Befüllung von Heizungsanlagen mit Osmoseanlage INDUWA ECO-F",
      views: 223
    },
    {
      id: "LPzFtAIYLhM",
      title: "Uhrzeit einstellen am Steuerventil IMP",
      views: 200
    },
    {
      id: "-vtB7pNUWHo",
      title: "Filtermaterial mit Resup reinigen",
      views: 190
    },
    {
      id: "yZQyNrmwmFs",
      title: "Inbetriebnahme Doppeltank-Enthärtungsanlage Typ DWK3",
      views: 150
    },
    {
      id: "4X1ymTacttk",
      title: "Inbetriebnahme der Doppeltank-Enthärtungsanlage Typ DWK1-2",
      views: 140
    },
    {
      id: "o_XcJBIC08E",
      title: "Inbetriebnahme der Doppeltank-Enthärtungsanlage Typ DWK-D",
      views: 130
    },
    {
      id: "06HqUGOrQeI",
      title: "Inbetriebnahme der Doppeltank-Enthärtungsanlage Typ DWK",
      views: 120
    },
    {
      id: "jgwEoToJXRA",
      title: "Befüllung von Heizungsanlagen mit dem INDUWA Füllwagen",
      views: 110
    }
  ]

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
                <BreadcrumbPage>Supportvideos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto py-12">
          <div className="mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-600 font-medium mb-4">Hilfe & Support</p>
              <h1 className="text-4xl font-bold mb-4">
                Supportvideos für Ihre Wasseraufbereitungsanlagen
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Unsere Supportvideos zeigen Ihnen, wie Sie Ihre Anlagen optimal nutzen, warten und gängige Probleme selbst beheben können.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {videos.map((video) => (
                <YouTubeVideo key={video.title} videoId={video.id} title={video.title} />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 