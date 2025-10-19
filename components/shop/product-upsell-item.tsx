"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Check, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { type CartItem, CART_UPDATED_EVENT } from "@/components/shop/cart"
import type { Product } from "@/types"
import { getProductByHandle } from "@/lib/shopify-storefront"

interface ProductUpsellItemProps {
  product: Product
  hidePrice?: boolean
  hideImage?: boolean
  hideTitle?: boolean
}

export function ProductUpsellItem({ product, hidePrice, hideImage, hideTitle }: ProductUpsellItemProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  // Preisermittlung ohne INDUWA Connect-Sonderfall
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount)
  
  // German number formatter for prices
  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  // Function to add item to cart
  const addToCart = async () => {
    try {
      setIsAddingToCart(true)

      // Get current cart from localStorage
      const storedCart = localStorage.getItem("cart")
      let cartItems: CartItem[] = []

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart)
        } catch (error) {
          console.error("Error parsing cart data:", error)
          cartItems = []
        }
      }

      // IMMER die erste Variant-ID verwenden, ggf. dynamisch nachladen
      let firstVariant: {
        id: string;
        title: string;
        sku?: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
        compareAtPrice: { amount: string; currencyCode: string } | null;
      } | undefined = product.variants.edges[0]?.node;
      if (!firstVariant?.id) {
        // Versuche, die Variant-ID per API zu holen (z.B. bei Upsell-Produkt mit nur Produkt-ID)
        let variantIdFromApi: string | undefined = undefined;
        try {
          let handle = product.handle;
          if (handle) {
            const apiProduct = await getProductByHandle(handle);
            const variantNode = apiProduct?.variants?.edges[0]?.node;
            firstVariant = variantNode && variantNode.id ? variantNode : undefined;
            variantIdFromApi = firstVariant?.id;
          }
        } catch (err) {
          // Fehler ignorieren, es wird unten ein Fehler-Toast gezeigt
        }
        if (!variantIdFromApi || !firstVariant) {
          toast({
            title: "Fehler",
            description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
            variant: "destructive",
          });
          setIsAddingToCart(false);
          return;
        }
      }

      // Check if product is already in cart (per variantId!)
      if (!firstVariant || !firstVariant.id) {
        // Sollte eigentlich nie passieren, aber als Fallback
        toast({
          title: "Fehler",
          description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
          variant: "destructive",
        });
        setIsAddingToCart(false);
        return;
      }
      const existingItemIndex = cartItems.findIndex(
        (item) => item.variantId === firstVariant.id
      )

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity += 1
      } else {
        // Add new item to cart
        cartItems.push({
          id: product.id,
          variantId: firstVariant.id,
          title: product.title,
          price: minPrice,
          quantity: 1,
          image: product.featuredImage?.url,
          sku: firstVariant.sku || product.sku || undefined,
        })
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems))

      // Dispatch custom event to notify cart component
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))

      // Show success toast
      toast({
        title: "Produkt hinzugefügt",
        description: `${product.title} wurde zum Warenkorb hinzugefügt.`,
      })
      
      // Show as selected
      setIsSelected(true)
      
      // After a delay, reset the selection
      setTimeout(() => {
        setIsSelected(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Fehler",
        description: "Das Produkt konnte nicht zum Warenkorb hinzugefügt werden.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="overflow-hidden border-gray-200 hover:border-gray-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {!hideImage && (
            <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-[#f8f9fa]">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url || "/placeholder.svg"}
                  alt={product.featuredImage.altText || product.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            {!hideTitle && <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>}
          </div>
          <div className="text-right">
            {!hidePrice && <div className="font-medium">{formatPrice(minPrice)}</div>}
            <Button 
              size="sm" 
              variant={isSelected ? "default" : "outline"} 
              className={
                isSelected
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-[#8abfdf] text-[#8abfdf] hover:bg-[#8abfdf]/10 focus:ring-[#8abfdf] focus:border-[#8abfdf]"
              }
              onClick={addToCart}
              disabled={isAddingToCart}
            >
              {isSelected ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Hinzugefügt
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Hinzufügen
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductUpsellAddButton({ product, onAdd, buttonTextClassName, disabled }: { product: Product, onAdd?: (product: Product) => void, buttonTextClassName?: string, disabled?: boolean }) {
  const [isSelected, setIsSelected] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  // Preisermittlung ohne INDUWA Connect-Sonderfall
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount)

  // Function to add item to cart
  const addToCart = async () => {
    if (disabled) return;
    try {
      setIsAddingToCart(true)
      const storedCart = localStorage.getItem("cart")
      let cartItems: CartItem[] = []
      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart)
        } catch (error) {
          cartItems = []
        }
      }
      let firstVariant: {
        id: string;
        title: string;
        sku?: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
        compareAtPrice: { amount: string; currencyCode: string } | null;
      } | undefined = product.variants.edges[0]?.node;
      if (!firstVariant?.id) {
        let variantIdFromApi: string | undefined = undefined;
        try {
          let handle = product.handle;
          if (handle) {
            const apiProduct = await getProductByHandle(handle);
            const variantNode = apiProduct?.variants?.edges[0]?.node;
            firstVariant = variantNode && variantNode.id ? variantNode : undefined;
            variantIdFromApi = firstVariant?.id;
          }
        } catch (err) {}
        if (!variantIdFromApi || !firstVariant) {
          toast({
            title: "Fehler",
            description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
            variant: "destructive",
          });
          setIsAddingToCart(false);
          return;
        }
      }
      if (!firstVariant || !firstVariant.id) {
        toast({
          title: "Fehler",
          description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
          variant: "destructive",
        });
        setIsAddingToCart(false);
        return;
      }
      const existingItemIndex = cartItems.findIndex(
        (item) => item.variantId === firstVariant.id
      )
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += 1
      } else {
        cartItems.push({
          id: product.id,
          variantId: firstVariant.id,
          title: product.title,
          price: minPrice,
          quantity: 1,
          image: product.featuredImage?.url,
          sku: firstVariant.sku || product.sku || undefined,
        })
      }
      localStorage.setItem("cart", JSON.stringify(cartItems))
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      toast({
        title: "Produkt hinzugefügt",
        description: `${product.title} wurde zum Warenkorb hinzugefügt.`,
      })
      if (onAdd) {
        onAdd(product)
      }
      setIsSelected(true)
      setTimeout(() => {
        setIsSelected(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Produkt konnte nicht zum Warenkorb hinzugefügt werden.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }
  return (
    <Button 
      size="sm" 
      variant={isSelected ? "default" : "outline"} 
      className={
        isSelected
          ? "bg-green-600 hover:bg-green-700"
          : "border-[#8abfdf] text-[#8abfdf] hover:bg-[#8abfdf]/10 focus:ring-[#8abfdf] focus:border-[#8abfdf]"
      }
      onClick={addToCart}
      disabled={isAddingToCart || !!disabled}
    >
      {isSelected ? (
        <span className={`flex flex-row items-center gap-1 ${buttonTextClassName || ''}`}>
          <Check className="mr-1 text-[1em]" />
          Hinzugefügt
        </span>
      ) : (
        <span className={`flex flex-row items-center gap-1 ${buttonTextClassName || ''}`}>
          <Plus className="mr-1 text-[1em]" />
          Hinzufügen
        </span>
      )}
    </Button>
  )
}

// Hilfsfunktion für Add-to-Cart mit Menge
export async function addProductToCart(product: Product, quantity: number = 1, toast?: ReturnType<typeof useToast>["toast"], variantId?: string) {
  // Preisermittlung ohne INDUWA Connect-Sonderfall
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount)
  // Get current cart from localStorage
  const storedCart = localStorage.getItem("cart")
  let cartItems: CartItem[] = []
  if (storedCart) {
    try {
      cartItems = JSON.parse(storedCart)
    } catch (error) {
      cartItems = []
    }
  }
  
  // Variante bestimmen: entweder übergebene variantId oder erste verfügbare Variante
  let selectedVariant: {
    id: string;
    title: string;
    sku?: string;
    availableForSale: boolean;
    price: { amount: string; currencyCode: string };
    compareAtPrice: { amount: string; currencyCode: string } | null;
  } | undefined;
  
  if (variantId) {
    // Spezifische Variante verwenden
    selectedVariant = product.variants.edges.find(edge => edge.node.id === variantId)?.node;
  } else {
    // Fallback: erste verfügbare Variante
    selectedVariant = product.variants.edges.find(edge => edge.node.availableForSale)?.node;
  }
  
  if (!selectedVariant?.id) {
    // Versuche, die Variant-ID per API zu holen (z.B. bei Upsell-Produkt mit nur Produkt-ID)
    let variantIdFromApi: string | undefined = undefined;
    try {
      let handle = product.handle;
      if (handle) {
        const apiProduct = await getProductByHandle(handle);
        const variantNode = apiProduct?.variants?.edges[0]?.node;
        selectedVariant = variantNode && variantNode.id ? variantNode : undefined;
        variantIdFromApi = selectedVariant?.id;
      }
    } catch (err) {}
    if (!variantIdFromApi || !selectedVariant) {
      toast?.({
        title: "Fehler",
        description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
        variant: "destructive",
      });
      return false;
    }
  }
  
  if (!selectedVariant || !selectedVariant.id) {
    toast?.({
      title: "Fehler",
      description: "Dieses Produkt kann nicht in den Warenkorb gelegt werden (keine Variante gefunden).",
      variant: "destructive",
    });
    return false;
  }
  
  // Preis der ausgewählten Variante verwenden
  const variantPrice = Number.parseFloat(selectedVariant.price.amount);
  
  const existingItemIndex = cartItems.findIndex(
    (item) => item.variantId === selectedVariant.id
  )
  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex].quantity += quantity
  } else {
    cartItems.push({
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      price: variantPrice,
      quantity,
      image: product.featuredImage?.url,
      sku: selectedVariant.sku || product.sku || undefined,
    })
  }
  localStorage.setItem("cart", JSON.stringify(cartItems))
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  toast?.({
    title: "Produkt hinzugefügt",
    description: `${quantity}x ${product.title} wurde zum Warenkorb hinzugefügt.`,
  })
  return true;
} 