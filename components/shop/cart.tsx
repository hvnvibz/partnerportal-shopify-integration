"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"

// Define cart item type
export interface CartItem {
  id: string
  variantId: string
  title: string
  price: number
  quantity: number
  image?: string
  sku?: string
  compareAtPrice?: number
}

// Create a custom event for cart updates
export const CART_UPDATED_EVENT = "cart-updated"

export function Cart() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { toast } = useToast()
  const [cartNote, setCartNote] = useState("")
  const { user } = useUser()

  // Function to load cart from localStorage
  const loadCart = () => {
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Error loading cart data:", error)
    }
    setIsLoading(false)
  }

  // Load cart items from localStorage on component mount
  useEffect(() => {
    loadCart()

    // Listen for cart update events
    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    }
  }, [])

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Total items count
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // German number formatter for prices
  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))

    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  // Remove item from cart
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    localStorage.setItem("cart", JSON.stringify([]))
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
  }

  // Process checkout
  const proceedToCheckout = async () => {
    if (cartItems.length === 0) return

    setIsCheckingOut(true)

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Starte Checkout mit Artikeln:", cartItems);
      }
      
      // Sende den Warenkorb an die API-Route
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          // Optional: Rabattcodes hinzufügen
          // discounts: ["RABATTCODE"],
          // Notizfeld übergeben
          note: cartNote,
        }),
      })

      // Log response status for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("Checkout API Antwort Status:", response.status);
      }
      
      let data;
      try {
        data = await response.json();
        if (process.env.NODE_ENV === "development") {
          console.log("Checkout API Antwort:", data);
        }
      } catch (jsonError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Fehler beim Parsen der API-Antwort:", jsonError);
        }
        throw new Error("Die Serverantwort konnte nicht verarbeitet werden");
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP-Fehler: ${response.status}`);
      }

      if (data?.url) {
        if (process.env.NODE_ENV === "development") {
          console.log("Leite weiter zur Checkout-URL:", data.url);
        }
        
        // Zeige Bestätigungsnachricht vor der Weiterleitung
        const toastMessage = "Sie werden zur Kasse weitergeleitet. Ihr Warenkorb wird geleert.";
          
        toast({
          title: "Checkout gestartet",
          description: toastMessage,
          duration: 3000,
        });
        
        // Warenkorb leeren nach erfolgreicher Checkout-Weiterleitung
        clearCart();
        
        // Kurze Verzögerung für bessere UX, dann Weiterleitung
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        throw new Error("Keine Checkout-URL erhalten");
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Checkout error:", error);
      }
      toast({
        title: "Checkout-Fehler",
        description: error.message || "Es gab ein Problem beim Checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Schließe das Sheet automatisch nach erfolgreichem Checkout
  useEffect(() => {
    if (cartItems.length === 0 && isOpen) {
      setIsOpen(false);
    }
  }, [cartItems.length, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8abfdf] text-xs text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Warenkorb</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">Ihr Warenkorb ist leer</p>
            <SheetClose asChild>
              <Button className="bg-[#8abfdf] hover:bg-[#8abfdf]/90">Weiter einkaufen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5 overflow-y-auto py-4 max-h-[60vh]">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    {item.image ? (
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-contain bg-white" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    {item.sku && (
                      <span className="text-xs text-muted-foreground mb-0.5">Art.-Nr.: {item.sku}</span>
                    )}
                    <span className="line-clamp-1 font-medium text-base md:text-base" style={{ fontSize: '70%' }}>{item.title}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      {formatPrice(item.price)}
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="line-through text-xs text-gray-400 ml-2">{formatPrice(item.compareAtPrice)}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-4 py-4">
              {/* Notizfeld für den Warenkorb */}
              <div className="flex flex-col gap-2">
                <label htmlFor="cart-note" className="font-medium text-sm">Notiz zur Bestellung</label>
                <textarea
                  id="cart-note"
                  className="border rounded-md p-2 text-sm min-h-[60px]"
                  placeholder="Haben Sie einen Hinweis, Projektnummer oder Kommissionsnamen für uns?"
                  value={cartNote}
                  onChange={e => setCartNote(e.target.value)}
                  maxLength={26}
                />
                <div className="text-xs text-gray-500 text-right">
                  {cartNote.length}/26 Zeichen
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Gesamt netto</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <SheetFooter className="flex flex-row gap-2">
                <Button 
                  className="flex-1 bg-[#8abfdf] hover:bg-[#8abfdf]/90"
                  onClick={proceedToCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Weiterleitung...
                    </>
                  ) : (
                    "Zur Kasse"
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={clearCart}>
                  Warenkorb leeren
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

