"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Mail, ShoppingBag, RefreshCw, MapPin, Phone, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

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

export default function EinstellungenPage() {
  const { user, profile: baseProfile, loading } = useUser();
  const { toast } = useToast();
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);

  // Memoize profile to prevent unnecessary re-renders
  const profile = useMemo(() => {
    return extendedProfile || (baseProfile as ExtendedProfile | null);
  }, [extendedProfile, baseProfile]);

  // Update extended profile when base profile changes (only if different)
  useEffect(() => {
    if (baseProfile) {
      setExtendedProfile((prev) => {
        // Only update if baseProfile actually changed
        if (prev?.display_name === baseProfile.display_name && 
            prev?.avatar_url === baseProfile.avatar_url) {
          return prev;
        }
        return baseProfile as ExtendedProfile;
      });
    }
  }, [baseProfile]);

  // Memoize loadShopifyData to prevent recreation on every render
  // Remove baseProfile dependency to prevent infinite loop
  const loadShopifyData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load basic Shopify customer data from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('shopify_customer_id, phone, address, shopify_synced_at, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setShopifyData({
          customer_id: profileData.shopify_customer_id,
          phone: profileData.phone,
          address: profileData.address,
          synced_at: profileData.shopify_synced_at,
        });
        
        // Update extended profile with Shopify data only if values actually changed
        // Use functional update to access current state and prevent infinite loop
        setExtendedProfile((prev) => {
          // Get current baseProfile values from prev or use profileData
          const currentDisplayName = prev?.display_name || profileData.display_name;
          const currentAvatarUrl = prev?.avatar_url || profileData.avatar_url;
          
          const newProfile = {
            display_name: currentDisplayName,
            avatar_url: currentAvatarUrl,
            shopify_customer_id: profileData.shopify_customer_id,
            phone: profileData.phone,
            address: profileData.address,
          } as ExtendedProfile;
          
          // Only update if values actually changed to prevent infinite loop
          if (
            prev?.shopify_customer_id === newProfile.shopify_customer_id &&
            prev?.phone === newProfile.phone &&
            JSON.stringify(prev?.address) === JSON.stringify(newProfile.address) &&
            prev?.display_name === newProfile.display_name &&
            prev?.avatar_url === newProfile.avatar_url
          ) {
            return prev;
          }
          
          return newProfile;
        });
      }
    } catch (error) {
      console.error('Error loading Shopify data:', error);
    }
  }, [user?.id]);

  // Memoize loadSyncStatus
  const loadSyncStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .rpc('get_customer_sync_status', { p_user_id: user.id });

      if (!error && data) {
        setSyncStatus(data[0]);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }, [user?.id]);

  // Load Shopify customer data when user changes
  // Only depend on user.id to prevent infinite loop with baseProfile
  useEffect(() => {
    if (user?.id) {
      loadShopifyData();
      loadSyncStatus();
    }
  }, [user?.id, loadShopifyData, loadSyncStatus]);

  // Memoize loadOrders
  const loadOrders = useCallback(async () => {
    const customerId = extendedProfile?.shopify_customer_id;
    if (!customerId) return;
    
    setIsLoadingOrders(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/shopify/customers/${customerId}/orders`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [extendedProfile?.shopify_customer_id]);

  // Load orders separately when shopify_customer_id is available
  // Only depend on user.id to prevent unnecessary re-runs
  useEffect(() => {
    if (user?.id && extendedProfile?.shopify_customer_id) {
      loadOrders();
    }
  }, [user?.id, extendedProfile?.shopify_customer_id, loadOrders]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/sync-customer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction: 'shopify-to-supabase' }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Synchronisation erfolgreich",
          description: "Ihre Kundendaten wurden aktualisiert.",
        });
        loadShopifyData();
        loadSyncStatus();
      } else {
        toast({
          title: "Synchronisation fehlgeschlagen",
          description: result.message || "Ein Fehler ist aufgetreten.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Synchronisation fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: string, currency: string = 'EUR') => {
    return `${parseFloat(price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-xl md:text-2xl font-bold text-blue-900">Einstellungen</h1>
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-900" />
              <p className="text-gray-600">Lade Einstellungen...</p>
            </div>
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
          <h1 className="text-xl md:text-2xl font-bold text-blue-900">Einstellungen</h1>
        </header>
        <div className="container mx-auto py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Profil Sektion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-900" />
                  Profil
                </CardTitle>
                <CardDescription>
                  Ihre persönlichen Informationen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">
                      {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">E-Mail</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  {profile?.phone && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefon
                      </label>
                      <p className="text-gray-900">{profile.phone}</p>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Adresse
                      </label>
                      <div className="text-gray-900">
                        {profile.address.address1 && <p>{profile.address.address1}</p>}
                        {profile.address.address2 && <p>{profile.address.address2}</p>}
                        <p>{profile.address.zip} {profile.address.city}</p>
                        {profile.address.province && <p>{profile.address.province}</p>}
                        <p>{profile.address.country}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {profile?.shopify_customer_id && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Mit Shopify verbunden</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Kundennummer: {profile.shopify_customer_id}
                    </p>
                    {syncStatus && (
                      <p className="text-xs text-green-600 mt-1">
                        Letzte Synchronisation: {formatDate(syncStatus.last_synced)}
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700">
                        💡 Ihre Kundendaten werden beim Checkout automatisch vorausgefüllt.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shopify Integration Sektion */}
            {profile?.shopify_customer_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-900" />
                    Shopify Integration
                  </CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Shopify-Kundendaten und Bestellhistorie.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Daten synchronisieren</p>
                        <p className="text-sm text-gray-600">
                          Aktualisieren Sie Ihre Kundendaten von Shopify.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Synchronisiere...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Synchronisieren
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Bestellhistorie */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Bestellhistorie
                      </h4>
                    </div>
                    {isLoadingOrders ? (
                      <div className="text-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Lade Bestellungen...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Sie haben {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}.
                        </div>
                        <Button
                          variant="outline"
                          className="w-full bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
                          onClick={() => window.location.href = '/bestellungen'}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Alle Bestellungen anzeigen
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Noch keine Bestellungen vorhanden</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Passwort Sektion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-900" />
                  Passwort & Sicherheit
                </CardTitle>
                <CardDescription>
                  Verwalten Sie Ihr Passwort und die Sicherheit Ihres Kontos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Passwort ändern</p>
                      <p className="text-sm text-gray-600">
                        Setzen Sie Ihr Passwort zurück, falls Sie es vergessen haben.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/reset-password'}
                    className="bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
                  >
                    Passwort zurücksetzen
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900 mb-1">Hinweis:</p>
                  <p>
                    Beim Zurücksetzen Ihres Passworts erhalten Sie eine E-Mail mit einem Link. 
                    Dieser Link ist 60 Minuten gültig und kann nur einmal verwendet werden.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 