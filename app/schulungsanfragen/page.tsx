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

export default function SchulungsanfragenPage() {
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
                <BreadcrumbPage>Schulungsanfragen</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="container mx-auto py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-900 font-medium mb-4">Schulung & Fortbildung</p>
              <h1 className="text-4xl font-bold mb-4">
                Professionelle Schulungen für Ihre Wasseraufbereitungssysteme
              </h1>
              <p className="text-xl text-muted-foreground">
                Erweitern Sie Ihr Know-how mit unseren maßgeschneiderten Schulungen. Für Fachkräfte und interessierte Anwender!
              </p>
            </div>

            <div className="mt-8">
              <TallyForm
                formId="wajABB"
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
  title: "Schulungsanfragen – Partnerportal INDUWA",
  description: "Stellen Sie eine Schulungsanfrage für INDUWA-Produkte und -Anlagen.",
}; 