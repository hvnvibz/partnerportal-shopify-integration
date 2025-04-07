import { Suspense } from "react"
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
import { TallyFormWrapper } from "@/components/contact/tally-form-wrapper"

export default function ContactPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Kontakt</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container py-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Kontaktieren Sie uns</h1>
            <p className="text-lg text-muted-foreground mb-10">
              Haben Sie Fragen oder Anregungen? Füllen Sie bitte das Formular aus und wir werden uns so schnell wie möglich bei Ihnen melden.
            </p>
            <Suspense fallback={<div>Formular wird geladen...</div>}>
              <TallyFormWrapper />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 