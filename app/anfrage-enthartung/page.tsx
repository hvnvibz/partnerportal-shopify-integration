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
import { TallyForm } from "@/components/tally-form"
import { Cart } from "@/components/shop/cart"

export default function ProduktanfrageEnthartungPage() {
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
                <BreadcrumbPage>Anfrage Enthärtung</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="container mx-auto py-6 md:py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <p className="text-base md:text-lg text-blue-900 font-medium mb-2 md:mb-4">Wasserenthärtung</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Sorgenfreie Enthärtung von Wasser – Für jeden Bedarf die passende Antwort
              </h1>
              <p className="text-base md:text-xl text-muted-foreground">
                Unsere Experten begleiten Sie Schritt für Schritt – von der Beratung bis zur fertigen Lösung. Jetzt
                anfragen!
              </p>
            </div>

            <div className="mt-8">
              <TallyForm
                formId="wA8jeo"
                options={{
                  alignLeft: true,
                  hideTitle: true,
                  transparentBackground: true,
                  dynamicHeight: true,
                }}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const metadata = {
  title: "Anfrage Enthärtung – Partnerportal INDUWA",
  description: "Stellen Sie eine Anfrage für Enthärtungsanlagen bei INDUWA.",
}; 