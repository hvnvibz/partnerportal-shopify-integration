"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useFavorites, FAVORITES_UPDATED_EVENT } from "@/hooks/use-favorites";
import { useUser } from "@/lib/useUser";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  productHandle: string;
  productTitle?: string;
  variant?: "icon" | "icon-small" | "button";
  className?: string;
}

export function FavoriteButton({
  productId,
  productHandle,
  productTitle,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const { user, loading: userLoading } = useUser();
  const { 
    lists, 
    loading: listsLoading, 
    createList, 
    addToList, 
    removeFromList, 
    checkProductInLists 
  } = useFavorites();
  const { toast } = useToast();

  const [inLists, setInLists] = useState<string[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);

  const isFavorited = inLists.length > 0;

  // Check if product is in any lists
  const checkStatus = useCallback(async () => {
    if (!user) {
      setInLists([]);
      setCheckingStatus(false);
      return;
    }

    try {
      const listIds = await checkProductInLists(productId);
      setInLists(listIds);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setCheckingStatus(false);
    }
  }, [user, productId, checkProductInLists]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Listen for favorites updates
  useEffect(() => {
    const handleUpdate = () => {
      checkStatus();
    };

    window.addEventListener(FAVORITES_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleUpdate);
    };
  }, [checkStatus]);

  // Handle toggle favorite in a specific list
  const handleToggleFavorite = async (listId: string, listName: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Favoriten zu speichern.",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingFavorite(listId);

    try {
      const isInList = inLists.includes(listId);

      if (isInList) {
        await removeFromList(listId, productId);
        setInLists(prev => prev.filter(id => id !== listId));
        toast({
          title: "Aus Favoriten entfernt",
          description: `${productTitle || "Produkt"} wurde aus "${listName}" entfernt.`,
        });
      } else {
        await addToList(listId, productId, productHandle);
        setInLists(prev => [...prev, listId]);
        toast({
          title: "Zu Favoriten hinzugefügt",
          description: `${productTitle || "Produkt"} wurde zu "${listName}" hinzugefügt.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(null);
    }
  };

  // Handle creating a new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreatingList(true);

    try {
      const newList = await createList(newListName.trim());
      if (newList) {
        // Automatically add product to the new list
        await addToList(newList.id, productId, productHandle);
        setInLists(prev => [...prev, newList.id]);
        toast({
          title: "Liste erstellt",
          description: `"${newListName}" wurde erstellt und ${productTitle || "das Produkt"} hinzugefügt.`,
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
      setIsCreatingList(false);
    }
  };

  // Quick add to first list (or open dropdown if no lists)
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Favoriten zu speichern.",
        variant: "destructive",
      });
      return;
    }

    // If already favorited, just open the dropdown
    if (isFavorited) {
      setIsDropdownOpen(true);
      return;
    }

    // If no lists exist, open create dialog
    if (lists.length === 0) {
      setIsCreateDialogOpen(true);
      return;
    }

    // Add to first list
    const firstList = lists[0];
    await handleToggleFavorite(firstList.id, firstList.name);
  };

  // Don't render if user is loading
  if (userLoading) {
    return null;
  }

  // Don't render for non-authenticated users in certain variants
  if (!user && variant === "icon-small") {
    return null;
  }

  const isLoading = checkingStatus || listsLoading;

  // Icon button (for product grid)
  if (variant === "icon" || variant === "icon-small") {
    const iconSize = variant === "icon-small" ? "h-3.5 w-3.5" : "h-4 w-4";
    const buttonSize = variant === "icon-small" ? "h-7 w-7" : "h-8 w-8";

    return (
      <>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                buttonSize,
                "rounded-full bg-white/90 hover:bg-white shadow-sm",
                isFavorited && "text-red-500 hover:text-red-600",
                className
              )}
              onClick={handleQuickAdd}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className={cn(iconSize, "animate-spin")} />
              ) : (
                <Heart
                  className={cn(iconSize, isFavorited && "fill-current")}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {lists.length === 0 ? (
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Liste erstellen
              </DropdownMenuItem>
            ) : (
              <>
                {lists.map((list) => {
                  const isInList = inLists.includes(list.id);
                  const isToggling = isTogglingFavorite === list.id;
                  return (
                    <DropdownMenuItem
                      key={list.id}
                      onClick={() => handleToggleFavorite(list.id, list.name)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isInList ? (
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                      ) : (
                        <Heart className="mr-2 h-4 w-4" />
                      )}
                      <span className="flex-1 truncate">{list.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({list.item_count})
                      </span>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Liste erstellen
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
                disabled={isCreatingList}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingList}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateList}
                disabled={!newListName.trim() || isCreatingList}
                className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
              >
                {isCreatingList ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Erstellen...
                  </>
                ) : (
                  "Erstellen & hinzufügen"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full button variant (for product detail page)
  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isFavorited ? "default" : "outline"}
            className={cn(
              isFavorited && "bg-red-500 hover:bg-red-600 text-white",
              className
            )}
            onClick={handleQuickAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={cn("mr-2 h-4 w-4", isFavorited && "fill-current")}
              />
            )}
            {isFavorited ? "In Favoriten" : "Zu Favoriten"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {lists.length === 0 ? (
            <DropdownMenuItem
              onClick={() => {
                setIsDropdownOpen(false);
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Liste erstellen
            </DropdownMenuItem>
          ) : (
            <>
              {lists.map((list) => {
                const isInList = inLists.includes(list.id);
                const isToggling = isTogglingFavorite === list.id;
                return (
                  <DropdownMenuItem
                    key={list.id}
                    onClick={() => handleToggleFavorite(list.id, list.name)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isInList ? (
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <Heart className="mr-2 h-4 w-4" />
                    )}
                    <span className="flex-1 truncate">{list.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({list.item_count})
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Liste erstellen
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
              disabled={isCreatingList}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreatingList}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateList}
              disabled={!newListName.trim() || isCreatingList}
              className="bg-[#8abfdf] hover:bg-[#8abfdf]/90"
            >
              {isCreatingList ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                "Erstellen & hinzufügen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
