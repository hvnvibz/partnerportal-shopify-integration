"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Cart } from "@/components/shop/cart";
import React from "react";

export default function ProduktkatalogPage() {
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
                <BreadcrumbPage>Produktkatalog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="container mx-auto py-12 px-4 md:px-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-6">INDUWA Produktkatalog 2025</h1>
          <div className="w-full flex flex-col items-center">
            <div style={{ position: 'relative', paddingTop: 'max(60%,324px)', width: '100%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', border: 'none', width: '100%', height: '100%', left: 0, top: 0 }}
                src="https://online.fliphtml5.com/sattu/epys/"
                seamless
                scrolling="no"
                frameBorder="0"
                allowTransparency
                allowFullScreen={true}
                title="INDUWA Produktkatalog 2025"
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const metadata = {
  title: "Produktkatalog – Partnerportal INDUWA",
  description: "Durchstöbern Sie den Produktkatalog von INDUWA und finden Sie die passenden Produkte für Ihre Anforderungen.",
}; 