"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function ProduktkatalogPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto py-12 px-4 md:px-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-6">INDUWA Produktkatalog 2025</h1>
          <div className="w-full flex flex-col items-center">
            <iframe
              allowFullScreen
              scrolling="no"
              className="fp-iframe"
              style={{ border: 0, width: "100%", height: 800 }}
              src="https://heyzine.com/flip-book/04d7f5bc8f.html"
              title="INDUWA Produktkatalog 2025"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 