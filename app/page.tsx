"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { ShoppingBag, Wrench, Video, FileText } from "lucide-react"
import { useUser } from "@/lib/useUser";

const tiles = [
  {
    title: "Shop",
    description: "Produkte & Zubehör bestellen",
    href: "/shop",
    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
  },
  {
    title: "Wartung & Service",
    description: "Serviceleistungen & Wartungsanfragen",
    href: "/wartung-service",
    icon: <Wrench className="h-8 w-8 text-green-600" />,
    color: "bg-green-50 hover:bg-green-100 border-green-200"
  },
  {
    title: "Supportvideos",
    description: "Videoanleitungen für Ihre Produkte",
    href: "/supportvideos",
    icon: <Video className="h-8 w-8 text-purple-600" />,
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
  },
  {
    title: "Digitale Handbücher",
    description: "Alle Produkthandbücher & Datenblätter",
    href: "/produkthandbuecher",
    icon: <FileText className="h-8 w-8 text-yellow-600" />,
    color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
  },
]

export default function DashboardPage() {
  const { profile, loading } = useUser();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header mit Burger-Menü */}
        <header className="flex md:hidden h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-40">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold text-lg text-blue-900">INDUWA Partnerportal</span>
        </header>
        <div className="container mx-auto py-8 md:py-12 px-4 md:px-0 md:pl-8 md:pr-0">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12 md:mb-16 overflow-hidden">
            <div className="flex-1 flex flex-col justify-center text-center md:text-left order-2 md:order-1">
              {/* Personalisierte Ansprache */}
              {!loading && profile?.display_name && (
                <div className="mb-4 md:mb-6 px-4 py-2 inline-block border-2 border-blue-600 rounded-xl bg-white/80 shadow-sm self-center md:self-start">
                  <span className="text-base md:text-xl text-blue-900 font-normal">Willkommen Firma </span>
                  <span className="text-base md:text-xl text-blue-900 font-bold">{profile.display_name}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 mb-3 md:mb-4 leading-tight tracking-tight">
                Anlagen, Ersatzteile, Service, Expertise – sofort verfügbar
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-xl mb-4 md:mb-6">
                Ihr zentraler Zugang zu Shop, Service, Support und digitalen Handbüchern für alle INDUWA-Produkte.
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end items-center order-1 md:order-2">
              <img
                src="/signin-bg.avif"
                alt="INDUWA visual"
                className="object-contain w-full h-48 sm:h-56 md:h-96 max-w-md md:max-w-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8">
          {/* Section: Shop & Wartung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Shop Tile */}
            <Link
              href="/shop"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">🛒</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">INDUWA Shop</div>
                <div className="text-gray-500 text-sm">Produkte & Zubehör bestellen</div>
              </div>
            </Link>
            {/* Wartung & Service Tile */}
            <Link
              href="/wartung-service"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">🛠️</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Wartung & Service</div>
                <div className="text-gray-500 text-sm">Serviceleistungen & Wartungsanfragen</div>
              </div>
            </Link>
          </div>

          {/* Section: Anlagen & Services */}
          <div className="mb-4">
            <h2 className="uppercase tracking-widest text-xs text-gray-500 font-semibold mb-2">Weitere Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Produktkatalog Tile */}
            <Link
              href="/produktkatalog"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">📦</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">INDUWA Produktkatalog</div>
                <div className="text-gray-500 text-sm">Blättern Sie im aktuellen Katalog</div>
              </div>
            </Link>
            {/* Anfrage Eigenwasser Tile */}
            <Link
              href="/anfrage-eigenwasser"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">💧</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Anfrage Eigenwasser</div>
                <div className="text-gray-500 text-sm">Individuelle Wasserlösungen anfragen</div>
              </div>
            </Link>
            {/* Anfrage Enthärtung Tile */}
            <Link
              href="/anfrage-enthartung"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">🧂</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Anfrage Enthärtung</div>
                <div className="text-gray-500 text-sm">Enthärtungslösungen anfragen</div>
              </div>
            </Link>
            {/* Schulungsanfragen Tile */}
            <Link
              href="/schulungsanfragen"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">📚</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Schulungsanfragen</div>
                <div className="text-gray-500 text-sm">Schulungen & Trainings anfragen</div>
              </div>
            </Link>
          </div>

          {/* Section: Support */}
          <div className="mb-4">
            <h2 className="uppercase tracking-widest text-xs text-gray-500 font-semibold mb-2">Support & Hilfe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Supportvideos Tile */}
            <Link
              href="/supportvideos"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">🎬</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Supportvideos</div>
                <div className="text-gray-500 text-sm">Videoanleitungen für Ihre Produkte</div>
              </div>
            </Link>
            {/* Digitale Handbücher Tile */}
            <Link
              href="/produkthandbuecher"
              className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-100 p-6 min-h-[180px] shadow hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-lg">📄</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-xl text-blue-900 mb-1">Digitale Handbücher</div>
                <div className="text-gray-500 text-sm">Alle Produkthandbücher & Datenblätter</div>
              </div>
            </Link>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 