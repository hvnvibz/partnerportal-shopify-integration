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

export default function WartungServicePage() {
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
                <BreadcrumbPage>Wartung & Service</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="container mx-auto py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg text-blue-900 font-medium mb-4">Wartung & Service</p>
              <h1 className="text-4xl font-bold mb-4">
                Professionelle Wartung für Ihre Wasseraufbereitungssysteme
              </h1>
              <p className="text-xl text-muted-foreground">
                Regelmäßige Wartung sichert die Lebensdauer und Leistungsfähigkeit Ihrer Anlagen. Vereinbaren Sie jetzt einen Termin mit unseren Experten!
              </p>
            </div>

            <div className="mt-8">
              <TallyForm
                formId="3xZlWE"
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