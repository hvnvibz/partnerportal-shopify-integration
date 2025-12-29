"use client";
import React, { useEffect, useState } from 'react';
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
import { Cart } from "@/components/shop/cart"
import { VideoCard } from '@/components/shop/video-card';

export default function SupportvideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALLE' | 'INBETRIEBNAHME' | 'WARTUNG'>('ALLE');
  useEffect(() => {
    fetch('/api/supportvideos')
      .then(res => res.json())
      .then(data => {
        setVideos(Array.isArray(data) ? data : []);
      });
  }, []);

  let filteredVideos = videos;
  if (filter === 'INBETRIEBNAHME') {
    filteredVideos = videos.filter(v => v.kategorie?.toLowerCase() === 'inbetriebnahme');
  } else if (filter === 'WARTUNG') {
    filteredVideos = videos.filter(v => v.kategorie?.toLowerCase().includes('wartung'));
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
                <BreadcrumbPage>Supportvideos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Cart />
        </header>
        <div className="px-4 md:px-[5%] py-6 md:py-12">
          <div className="mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <p className="text-base md:text-lg text-blue-900 font-medium mb-2 md:mb-4">Hilfe & Support</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Supportvideos für Ihre Wasseraufbereitungsanlagen
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Unsere Supportvideos zeigen Ihnen, wie Sie Ihre Anlagen optimal nutzen, warten und gängige Probleme selbst beheben können.
              </p>
            </div>
            {/* Tabfilter */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
              <button
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base ${filter === 'ALLE' ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}
                onClick={() => setFilter('ALLE')}
              >
                Alle Kategorien
              </button>
              <button
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base ${filter === 'INBETRIEBNAHME' ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}
                onClick={() => setFilter('INBETRIEBNAHME')}
              >
                Inbetriebnahme
              </button>
              <button
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base ${filter === 'WARTUNG' ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}
                onClick={() => setFilter('WARTUNG')}
              >
                Service/Wartung
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
              {filteredVideos.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">Keine Videos gefunden oder ein Fehler ist aufgetreten.</div>
              ) : (
                filteredVideos.map((video) => (
                  <VideoCard
                    key={video.videoId}
                    videoId={video.videoId}
                    title={video.title}
                    kategorie={video.kategorie}
                    dauer={video.dauer}
                    videoUrl={video.videoUrl}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 