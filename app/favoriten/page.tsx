"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { 
  Heart, 
  Plus, 
  Loader2, 
  ShoppingCart, 
  Trash2, 
  MoreVertical, 
  Edit2,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { useFavorites, FavoriteList, FavoriteItem, FAVORITES_UPDATED_EVENT } from "@/hooks/use-favorites";
import { useUser } from "@/lib/useUser";
import { Cart, CART_UPDATED_EVENT, type CartItem } from "@/components/shop/cart";
import ProtectedRoute from "@/components/ProtectedRoute";

// Format price helper
function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return price.toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  });
}

function FavoritenContent() {
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { 
    lists, 
    loading: listsLoading, 
    createList, 
    renameList, 
    deleteList,
    getListProducts,
    removeByItemId,
  } = useFavorites();
  const { toast } = useToast();

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listProducts, setListProducts] = useState<FavoriteItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [renameListId, setRenameListId] = useState<string | null>(null);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingAllToCart, setAddingAllToCart] = useState(false);

  // Select list from query param or fallback to first list
  useEffect(() => {
    const listFromQuery = searchParams?.get("list");
    if (lists.length === 0) {
      setSelectedListId(null);
      setListProducts([]);
      return;
    }

    if (listFromQuery && lists.some(list => list.id === listFromQuery)) {
      if (selectedListId !== listFromQuery) {
        setSelectedListId(listFromQuery);
      }
      return;
    }

    if (!selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId, searchParams]);

  // Load products when selected list changes
  const loadProducts = useCallback(async () => {
    if (!selectedListId) {
      setListProducts([]);
      return;
    }

    setLoadingProducts(true);
    try {
      const data = await getListProducts(selectedListId);
      setListProducts(data.products);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Produkte konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedListId, getListProducts, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Listen for favorites updates
  useEffect(() => {
    const handleUpdate = () => {
      loadProducts();
    };

    window.addEventListener(FAVORITES_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleUpdate);
    };
  }, [loadProducts]);

  // Handle creating a new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsProcessing(true);
    try {
      const newList = await createList(newListName.trim());
      if (newList) {
        setSelectedListId(newList.id);
        toast({
          title: "Liste erstellt",
          description: `"${newListName}" wurde erstellt.`,
        });
      }
      setNewListName("");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Liste konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle renaming a list
  const handleRenameList = async () => {
    if (!renameListId || !newListName.trim()) return;

    setIsProcessing(true);
    try {
      await renameList(renameListId, newListName.trim());
      toast({
        title: "Liste umbenannt",
        description: `Liste wurde zu "${newListName}" umbenannt.`,
      });
      setNewListName("");
      setIsRenameDialogOpen(false);
      setRenameListId(null);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Liste konnte nicht umbenannt werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deleting a list
  const handleDeleteList = async () => {
    if (!deleteListId) return;

    setIsProcessing(true);
    try {
      await deleteList(deleteListId);
      if (selectedListId === deleteListId) {
        setSelectedListId(lists.find(l => l.id !== deleteListId)?.id || null);
      }
      toast({
        title: "Liste gelöscht",
        description: "Die Liste wurde gelöscht.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteListId(null);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Liste konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing a product from the list
  const handleRemoveProduct = async (item: FavoriteItem) => {
    if (!selectedListId) return;

    setRemovingItemId(item.favorite_item_id);
    try {
      await removeByItemId(item.favorite_item_id, selectedListId, item.product_id);
      setListProducts(prev => prev.filter(p => p.favorite_item_id !== item.favorite_item_id));
      toast({
        title: "Entfernt",
        description: `"${item.title || 'Produkt'}" wurde aus der Liste entfernt.`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Produkt konnte nicht entfernt werden.",
        variant: "destructive",
      });
    } finally {
      setRemovingItemId(null);
    }
  };

  // Handle adding all products to cart
  const handleAddAllToCart = () => {
    if (listProducts.length === 0) return;

    setAddingAllToCart(true);
    try {
      // Get current cart from localStorage
      const storedCart = localStorage.getItem("cart");
      let cartItems: CartItem[] = [];

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart);
        } catch (error) {
          cartItems = [];
        }
      }

      // Add each product to cart
      let addedCount = 0;
      let skippedCount = 0;
      listProducts.forEach((product) => {
        if (!product.price?.amount || !product.variantId) {
          skippedCount++;
          return;
        }

        const existingItemIndex = cartItems.findIndex(
          (item) => item.id === product.product_id
        );

        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += 1;
        } else {
          cartItems.push({
            id: product.product_id,
            variantId: product.variantId,
            title: product.title || "Produkt",
            price: parseFloat(product.price.amount),
            quantity: 1,
            image: product.featuredImage?.url,
            sku: product.sku || "",
            compareAtPrice: product.compareAtPrice 
              ? parseFloat(product.compareAtPrice.amount) 
              : undefined,
          });
        }
        addedCount++;
      });

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));

      // Dispatch custom event to notify cart component
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));

      toast({
        title: "Zum Warenkorb hinzugefügt",
        description: `${addedCount} Produkt(e) wurden zum Warenkorb hinzugefügt.`,
      });

      if (skippedCount > 0) {
        toast({
          title: "Einige Produkte übersprungen",
          description: `${skippedCount} Produkt(e) konnten nicht hinzugefügt werden (fehlende Varianten/Preise).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Produkte konnten nicht zum Warenkorb hinzugefügt werden.",
        variant: "destructive",
      });
    } finally {
      setAddingAllToCart(false);
    }
  };

  const selectedList = lists.find(l => l.id === selectedListId);
  const isLoading = userLoading || listsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8abfdf]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with list selector and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Meine Favoriten
          </h1>
          
          {lists.length > 0 && (
            <Select value={selectedListId || ""} onValueChange={setSelectedListId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Liste auswählen" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.item_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedList && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setRenameListId(selectedListId);
                    setNewListName(selectedList.name);
                    setIsRenameDialogOpen(true);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Liste umbenennen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteListId(selectedListId);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Liste löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Liste
          </Button>
        </div>
      </div>

      {/* No lists message */}
      {lists.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <Heart className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">Keine Favoriten-Listen</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Erstellen Sie Ihre erste Favoritenliste, um Produkte zu speichern, die Sie häufig bestellen.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 bg-[#8abfdf] hover:bg-[#8abfdf]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Erste Liste erstellen
          </Button>
        </div>
      )}

      {/* Products grid */}
      {selectedListId && (
        <>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#8abfdf]" />
            </div>
          ) : listProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Liste ist leer</h3>
              <p className="mt-2 text-sm text-gray-500">
                Fügen Sie Produkte aus dem Shop zu dieser Liste hinzu.
              </p>
              <Link href="/shop">
                <Button className="mt-4 bg-[#8abfdf] hover:bg-[#8abfdf]/90">
                  Zum Shop
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Add all to cart button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddAllToCart}
                  disabled={addingAllToCart}
                  className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
                >
                  {addingAllToCart ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  Alle zum Warenkorb hinzufügen
                </Button>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                {listProducts.map((product) => (
                  <div
                    key={product.favorite_item_id}
                    className="group bg-white relative flex flex-col h-full overflow-hidden rounded-md border shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 hover:bg-red-100 text-gray-500 hover:text-red-600"
                      onClick={() => handleRemoveProduct(product)}
                      disabled={removingItemId === product.favorite_item_id}
                    >
                      {removingItemId === product.favorite_item_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Link href={`/shop/${product.product_handle}`} className="flex flex-col h-full">
                      <div className="aspect-square relative overflow-hidden bg-white p-4">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title || "Produkt"}
                            fill
                            className="object-contain transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white">
                            <span className="text-gray-400 text-xs md:text-base">Kein Bild</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-grow p-2 md:p-4">
                        <div className="mb-1 md:mb-2">
                          <h3 className="font-semibold line-clamp-2 text-[0.7rem] md:text-[0.8rem]">
                            {product.title || "Produkt nicht gefunden"}
                          </h3>
                          {product.sku && (
                            <p className="text-[0.6rem] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Art.-Nr.: {product.sku}
                            </p>
                          )}
                        </div>
                        <div className="mt-auto pt-1 md:pt-2">
                          {product.price?.amount ? (
                            product.compareAtPrice?.amount ? (
                              <div className="flex flex-col md:flex-row gap-0.5 md:gap-2 md:items-center">
                                <span className="font-semibold text-xs md:text-sm">
                                  {formatPrice(product.price.amount)}
                                </span>
                                <span className="text-gray-500 line-through text-[0.6rem] md:text-xs">
                                  {formatPrice(product.compareAtPrice.amount)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-xs md:text-sm">
                                {formatPrice(product.price.amount)}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 text-xs">Preis nicht verfügbar</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Create List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Favoritenliste erstellen</DialogTitle>
            <DialogDescription>
              Geben Sie einen Namen für Ihre neue Liste ein.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="z.B. Wartungsprodukte"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newListName.trim()) {
                  handleCreateList();
                }
              }}
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewListName("");
              }}
              disabled={isProcessing}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateList}
              disabled={!newListName.trim() || isProcessing}
              className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                "Erstellen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename List Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Liste umbenennen</DialogTitle>
            <DialogDescription>
              Geben Sie einen neuen Namen für die Liste ein.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Neuer Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newListName.trim()) {
                  handleRenameList();
                }
              }}
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewListName("");
                setRenameListId(null);
              }}
              disabled={isProcessing}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleRenameList}
              disabled={!newListName.trim() || isProcessing}
              className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liste löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Liste löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. Alle Produkte in dieser Liste werden entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteListId(null);
              }}
              disabled={isProcessing}
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Löschen...
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function FavoritenPage() {
  return (
    <ProtectedRoute>
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
                  <BreadcrumbPage>Favoriten</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <Cart />
            </div>
          </header>
          <FavoritenContent />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
