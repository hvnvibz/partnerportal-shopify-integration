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

export default function ProduktanfrageEigenwasserPage() {
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
                <BreadcrumbPage>Produktanfrage Eigenwasser</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-600 font-medium mb-4">Eigenwasserversorgung</p>
              <h1 className="text-4xl font-bold mb-4">
                Ihr Eigenwasser optimal aufbereiten – Komplettlösungen für höchste Qualität
              </h1>
              <p className="text-xl text-muted-foreground">
                Von der Erstberatung bis zur Installation – nutzen Sie unsere Expertise für Ihre individuellen Anforderungen. Jetzt anfragen!
              </p>
            </div>

            <div className="mt-8">
              <TallyForm
                formId="mV846N"
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