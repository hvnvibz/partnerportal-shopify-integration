"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Loader2 } from "lucide-react";
import type { ShopifyOrder } from "@/lib/shopify-admin";
import { type CartItem, CART_UPDATED_EVENT } from "@/components/shop/cart";

interface OrderDetailProps {
  order: ShopifyOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetail({ order, open, onOpenChange }: OrderDetailProps) {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string, currency: string = "EUR") => {
    return `${parseFloat(price).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
  };

  const addOrderItemsToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Get current cart from localStorage
      const storedCart = localStorage.getItem("cart");
      let cartItems: CartItem[] = [];

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart);
        } catch (error) {
          console.error("Error parsing cart data:", error);
          cartItems = [];
        }
      }

      let addedCount = 0;

      // Add each line item to cart
      for (const item of order.line_items) {
        // Convert variant_id to GraphQL format
        const variantId = `gid://shopify/ProductVariant/${item.variant_id}`;
        const productId = `gid://shopify/Product/${item.product_id}`;
        
        // Check if item with same variant already exists in cart
        const existingItemIndex = cartItems.findIndex(
          (cartItem) => cartItem.variantId === variantId
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          cartItems[existingItemIndex].quantity += item.quantity;
          addedCount++;
        } else {
          // Add new item to cart
          cartItems.push({
            id: productId,
            variantId: variantId,
            title: item.title,
            price: parseFloat(item.price),
            quantity: item.quantity,
            sku: item.sku || undefined,
          });
          addedCount++;
        }
      }

      // Save updated cart
      localStorage.setItem("cart", JSON.stringify(cartItems));
      
      // Dispatch cart update event
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));

      // Show success message
      toast({
        title: "Artikel hinzugefügt",
        description: `${addedCount} Artikel${addedCount > 1 ? "" : ""} wurde${addedCount > 1 ? "n" : ""} zum Warenkorb hinzugefügt.`,
      });

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding items to cart:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Artikel zum Warenkorb.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestellung #{order.order_number}</DialogTitle>
          <DialogDescription>
            Bestelldetails und Artikelübersicht
          </DialogDescription>
        </DialogHeader>

        {/* Button zum Warenkorb hinzufügen */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={addOrderItemsToCart}
            disabled={isAddingToCart}
            className="flex items-center gap-2"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Wird hinzugefügt...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Alle Artikel erneut bestellen
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6 mt-4">
          {/* Bestellinformationen */}
          <div>
            <p className="text-sm font-medium text-gray-500">Bestelldatum</p>
            <p className="text-sm text-gray-900">{formatDate(order.created_at)}</p>
          </div>

          <Separator />

          {/* Artikel */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Artikel</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikel</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamtpreis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.variant_title && (
                            <p className="text-sm text-gray-500">
                              {item.variant_title}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.price, order.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(
                          (
                            parseFloat(item.price) * item.quantity -
                            parseFloat(item.total_discount || "0")
                          ).toString(),
                          order.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Preisübersicht */}
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Zwischensumme</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal_price, order.currency)}
                </span>
              </div>
              {parseFloat(order.total_tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt.</span>
                  <span className="text-gray-900">
                    {formatPrice(order.total_tax, order.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Gesamtpreis</span>
                <span>{formatPrice(order.total_price, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

