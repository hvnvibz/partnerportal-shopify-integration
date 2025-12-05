"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { OrderHistory } from "@/components/orders/order-history";
import { Cart } from "@/components/shop/cart";
import { PriceVisibilityDropdown } from "@/components/shop/price-visibility-dropdown";
import type { ShopifyOrder } from "@/lib/shopify-admin";

interface ExtendedProfile {
  display_name?: string;
  avatar_url?: string;
  shopify_customer_id?: number;
  phone?: string;
  address?: {
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
    phone?: string;
  };
}

export default function BestellungenPage() {
  const { user, profile: baseProfile, loading: userLoading } = useUser();
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load extended profile with shopify_customer_id
  useEffect(() => {
    if (user?.id && !userLoading) {
      const loadProfile = async () => {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('shopify_customer_id, phone, address, display_name, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setExtendedProfile({
              display_name: profileData.display_name,
              avatar_url: profileData.avatar_url,
              shopify_customer_id: profileData.shopify_customer_id,
              phone: profileData.phone,
              address: profileData.address,
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      };
      loadProfile();
    }
  }, [user?.id, userLoading]);

  useEffect(() => {
    if (user && extendedProfile?.shopify_customer_id && !userLoading) {
      loadOrders();
    }
  }, [user, extendedProfile?.shopify_customer_id, userLoading]);

  const loadOrders = async () => {
    if (!extendedProfile?.shopify_customer_id) return;

    setIsLoadingOrders(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch(
        `/api/shopify/customers/${extendedProfile.shopify_customer_id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Laden der Bestellungen");
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError("Fehler beim Laden der Bestellungen");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (userLoading) {
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
                  <BreadcrumbLink href="/">Start</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bestellhistorie</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <PriceVisibilityDropdown />
              <Cart />
            </div>
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-900" />
              <p className="text-gray-600">Lade Bestellungen...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!extendedProfile?.shopify_customer_id) {
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
                  <BreadcrumbLink href="/">Start</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bestellhistorie</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <PriceVisibilityDropdown />
              <Cart />
            </div>
          </header>
          <div className="container mx-auto py-12 px-4 md:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-900" />
                  Bestellhistorie
                </CardTitle>
                <CardDescription>
                  Bislang ist noch keine Bestellung ausgeführt worden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sobald Sie eine Bestellung aufgeben, wird diese hier angezeigt.
                </p>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Start</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bestellhistorie</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <PriceVisibilityDropdown />
              <Cart />
            </div>
          </header>
        <div className="container mx-auto py-12 px-4 md:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-900" />
                Meine Bestellungen
              </CardTitle>
              <CardDescription>
                Übersicht über bisherige Bestellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}
              <OrderHistory orders={orders} loading={isLoadingOrders} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

