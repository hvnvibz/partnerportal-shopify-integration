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

interface ProductUpsellItemProps {
  product: Product
}

export function ProductUpsellItem({ product }: ProductUpsellItemProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { toast } = useToast()

  // Get price
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount)
  
  // German number formatter for prices
  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  // Function to add item to cart
  const addToCart = () => {
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

      // Check if product is already in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.id === product.id
      )

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity += 1
      } else {
        // Add new item to cart
        cartItems.push({
          id: product.id,
          variantId: product.variants.edges[0]?.node.id || product.id,
          title: product.title,
          price: minPrice,
          quantity: 1,
          image: product.featuredImage?.url,
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
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ergänzen Sie Ihre Bestellung mit diesem Produkt
            </p>
            <p className="text-xs text-gray-400 mt-1">ID: {product.id.substring(0, 15)}...</p>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatPrice(minPrice)}</div>
            <Button 
              size="sm" 
              variant={isSelected ? "default" : "outline"} 
              className={isSelected ? "mt-2 bg-green-600 hover:bg-green-700" : "mt-2 border-blue-500 text-blue-600 hover:bg-blue-50"}
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