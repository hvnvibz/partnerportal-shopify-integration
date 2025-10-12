"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Search, Link, User, Mail, Phone, MapPin } from "lucide-react";

export default function LinkCustomerPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [linking, setLinking] = useState(false);
  const { toast } = useToast();

  const searchCustomer = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/search-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCustomer(result.customer);
      } else {
        toast({
          title: "Kunde nicht gefunden",
          description: result.message,
          variant: "destructive",
        });
        setCustomer(null);
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const linkCustomer = async () => {
    if (!customer) return;
    
    setLinking(true);
    try {
      const response = await fetch('/api/admin/link-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopifyCustomerId: customer.id,
          email: customer.email 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Kunde erfolgreich verknüpft",
          description: `Supabase-Benutzer erstellt: ${result.user.email}`,
        });
        setCustomer(null);
        setEmail("");
      } else {
        toast({
          title: "Verknüpfung fehlgeschlagen",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-900" />
              Bestehenden Shopify-Kunden verknüpfen
            </CardTitle>
            <CardDescription>
              Verknüpfen Sie bestehende Shopify-Kundenkonten mit Partnerportal-Accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse des Shopify-Kunden</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="kunde@unternehmen.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                  />
                  <Button 
                    onClick={searchCustomer} 
                    disabled={loading || !email.trim()}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? "Suche..." : "Suchen"}
                  </Button>
                </div>
              </div>
            </div>

            {customer && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Shopify-Kunde gefunden
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        E-Mail
                      </Label>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                    {customer.phone && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Telefon
                        </Label>
                        <p className="text-gray-900">{customer.phone}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Kunden-ID</Label>
                      <p className="text-gray-900">#{customer.id}</p>
                    </div>
                  </div>

                  {customer.default_address && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Adresse
                      </Label>
                      <div className="text-gray-900">
                        {customer.default_address.address1 && <p>{customer.default_address.address1}</p>}
                        {customer.default_address.address2 && <p>{customer.default_address.address2}</p>}
                        <p>{customer.default_address.zip} {customer.default_address.city}</p>
                        {customer.default_address.province && <p>{customer.default_address.province}</p>}
                        <p>{customer.default_address.country}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      onClick={linkCustomer}
                      disabled={linking}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {linking ? "Verknüpfe..." : "Kunde mit Partnerportal verknüpfen"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Falls bereits ein Partnerportal-Account existiert, wird dieser automatisch verknüpft.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
