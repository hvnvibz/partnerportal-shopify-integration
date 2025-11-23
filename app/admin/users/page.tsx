"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Loader2, Edit2, Check, X, Link2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  display_name: string;
  customer_number: string;
  role: string;
  status: string;
  created_at: string;
  last_activity_at: string | null;
  shopify_customer_id: number | null;
}

export default function AdminUsersPage() {
  const { user, role, loading: userLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>("");
  const [editingCustomerNumber, setEditingCustomerNumber] = useState<string | null>(null);
  const [editingCustomerNumberValue, setEditingCustomerNumberValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [linkingUser, setLinkingUser] = useState<User | null>(null);
  const [shopifyCustomerId, setShopifyCustomerId] = useState<string>("");
  const [linking, setLinking] = useState(false);

  // Redirect if not admin
  // Wichtig: Warte bis role geladen ist (nicht null) bevor wir weiterleiten
  useEffect(() => {
    // Nur weiterleiten wenn:
    // 1. User-Daten geladen sind (userLoading = false)
    // 2. Rolle geladen ist (role !== null)
    // 3. Entweder kein User ODER Rolle ist nicht 'admin'
    if (!userLoading && role !== null && (!user || role !== 'admin')) {
      console.log('Redirecting non-admin user:', { user: user?.email, role });
      router.push('/');
    }
  }, [user, role, userLoading, router]);

  // Fetch users
  useEffect(() => {
    if (user && role === 'admin') {
      fetchUsers();
    }
  }, [user, role]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          (u.display_name && u.display_name.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Laden der Benutzer");
        return;
      }

      const result = await response.json();
      setUsers(result.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError("Fehler beim Laden der Benutzer");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setUpdating(userId);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Aktualisieren des Status");
        return;
      }

      const result = await response.json();
      // Update local state with response data
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { 
            ...u, 
            status: result.user.status, 
            display_name: result.user.display_name,
            customer_number: result.user.customer_number || u.customer_number
          } : u
        )
      );
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError("Fehler beim Aktualisieren des Status");
    } finally {
      setUpdating(null);
    }
  };

  const updateUserDisplayName = async (userId: string, newDisplayName: string) => {
    try {
      setUpdating(userId);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ display_name: newDisplayName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Aktualisieren des Display-Namens");
        return;
      }

      const result = await response.json();
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, display_name: result.user.display_name } : u
        )
      );
      
      // Exit edit mode
      setEditingName(null);
      setEditingNameValue("");
    } catch (err: any) {
      console.error('Error updating display name:', err);
      setError("Fehler beim Aktualisieren des Display-Namens");
    } finally {
      setUpdating(null);
    }
  };

  const startEditingName = (userId: string, currentName: string) => {
    setEditingName(userId);
    setEditingNameValue(currentName || "");
  };

  const cancelEditingName = () => {
    setEditingName(null);
    setEditingNameValue("");
  };

  const updateUserCustomerNumber = async (userId: string, newCustomerNumber: string) => {
    try {
      setUpdating(userId);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ customer_number: newCustomerNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Aktualisieren der Kundennummer");
        return;
      }

      const result = await response.json();
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, customer_number: result.user.customer_number } : u
        )
      );
      
      // Exit edit mode
      setEditingCustomerNumber(null);
      setEditingCustomerNumberValue("");
    } catch (err: any) {
      console.error('Error updating customer number:', err);
      setError("Fehler beim Aktualisieren der Kundennummer");
    } finally {
      setUpdating(null);
    }
  };

  const startEditingCustomerNumber = (userId: string, currentNumber: string) => {
    setEditingCustomerNumber(userId);
    setEditingCustomerNumberValue(currentNumber || "");
  };

  const cancelEditingCustomerNumber = () => {
    setEditingCustomerNumber(null);
    setEditingCustomerNumberValue("");
  };

  const startLinkingShopify = (user: User) => {
    setLinkingUser(user);
    setShopifyCustomerId("");
    setError(null);
  };

  const cancelLinkingShopify = () => {
    setLinkingUser(null);
    setShopifyCustomerId("");
    setError(null);
  };

  const linkShopifyCustomer = async () => {
    if (!linkingUser || !shopifyCustomerId.trim()) {
      setError("Bitte geben Sie eine Shopify-Kunden-ID ein");
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Nicht autorisiert");
        return;
      }

      const response = await fetch(`/api/admin/users/${linkingUser.id}/link-shopify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ shopifyCustomerId: parseInt(shopifyCustomerId.trim()) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Verknüpfen mit Shopify-Kunde");
        return;
      }

      const result = await response.json();
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === linkingUser.id 
            ? { ...u, shopify_customer_id: result.user.shopify_customer_id }
            : u
        )
      );

      // Close dialog
      cancelLinkingShopify();
      
      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      console.error('Error linking Shopify customer:', err);
      setError("Fehler beim Verknüpfen mit Shopify-Kunde");
    } finally {
      setLinking(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
        return 'Wartend';
      case 'blocked':
        return 'Gesperrt';
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'partner':
        return 'Partner';
      default:
        return role;
    }
  };

  // Warte bis User-Daten und Rolle geladen sind
  // Zeige Loading nur wenn:
  // - User-Daten noch geladen werden ODER
  // - Rolle noch nicht geladen ist (null) ODER
  // - Kein User vorhanden ODER
  // - Rolle ist nicht 'admin' (aber nur wenn sie bereits geladen wurde, nicht null)
  if (userLoading || role === null || !user || (role !== null && role !== 'admin')) {
    // Wenn Rolle geladen ist und nicht 'admin', wird der useEffect weiterleiten
    // Hier zeigen wir nur Loading während des Ladens
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
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
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Start</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Benutzerverwaltung</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Benutzerverwaltung</h1>
            <p className="text-gray-600">Verwalten Sie Benutzerrollen und -status</p>
          </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Suche nach E-Mail oder Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Wartend</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="blocked">Gesperrt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchUsers} variant="outline">
          Aktualisieren
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Displayname</TableHead>
                <TableHead>Kundennummer</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shopify Konto</TableHead>
                <TableHead>Registriert</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Keine Benutzer gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {editingName === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            className="w-[200px]"
                            maxLength={100}
                            disabled={updating === user.id}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateUserDisplayName(user.id, editingNameValue);
                              } else if (e.key === 'Escape') {
                                cancelEditingName();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateUserDisplayName(user.id, editingNameValue)}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingName}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{user.display_name || '-'}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingName(user.id, user.display_name || '')}
                            disabled={updating === user.id}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Display-Name bearbeiten"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCustomerNumber === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingCustomerNumberValue}
                            onChange={(e) => setEditingCustomerNumberValue(e.target.value)}
                            className="w-[150px]"
                            maxLength={50}
                            disabled={updating === user.id}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateUserCustomerNumber(user.id, editingCustomerNumberValue);
                              } else if (e.key === 'Escape') {
                                cancelEditingCustomerNumber();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateUserCustomerNumber(user.id, editingCustomerNumberValue)}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingCustomerNumber}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{user.customer_number || '-'}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingCustomerNumber(user.id, user.customer_number || '')}
                            disabled={updating === user.id}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Kundennummer bearbeiten"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {getStatusLabel(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.shopify_customer_id ? (
                          <Badge className="bg-green-100 text-green-800">
                            Verknüpft
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline" className="bg-gray-50 text-gray-600">
                              Keine Verbindung
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startLinkingShopify(user)}
                              disabled={updating === user.id}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Mit Shopify-Kunde verknüpfen"
                            >
                              <Link2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('de-DE')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {user.last_activity_at
                        ? new Date(user.last_activity_at).toLocaleDateString('de-DE')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(newStatus) =>
                          updateUserStatus(user.id, newStatus)
                        }
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Wartend</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="blocked">Gesperrt</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

          <div className="mt-4 text-sm text-gray-500">
            Gesamt: {filteredUsers.length} Benutzer
          </div>
        </div>
      </SidebarInset>

      {/* Dialog für Shopify-Verknüpfung */}
      <Dialog open={linkingUser !== null} onOpenChange={(open) => !open && cancelLinkingShopify()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopify-Kunde verknüpfen</DialogTitle>
            <DialogDescription>
              Verknüpfen Sie den Benutzer <strong>{linkingUser?.email}</strong> mit einem Shopify-Kunden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Shopify-Kunden-ID
              </label>
              <Input
                type="number"
                value={shopifyCustomerId}
                onChange={(e) => setShopifyCustomerId(e.target.value)}
                placeholder="z.B. 9398914875720"
                disabled={linking}
              />
              <p className="mt-1 text-xs text-gray-500">
                Die Shopify-Kunden-ID finden Sie im Shopify Admin unter Kunden.
              </p>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelLinkingShopify}
              disabled={linking}
            >
              Abbrechen
            </Button>
            <Button
              onClick={linkShopifyCustomer}
              disabled={linking || !shopifyCustomerId.trim()}
            >
              {linking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verknüpfe...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Verknüpfen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

