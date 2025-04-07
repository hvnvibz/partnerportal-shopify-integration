"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ShoppingCart, Plus, Minus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/shop/product-grid"
import { ProductUpsell } from "@/components/shop/product-upsell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { type CartItem, CART_UPDATED_EVENT } from "@/components/shop/cart"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.edges[0]?.node.id || ""
  )
  const [showFullDescription, setShowFullDescription] = useState(false)
  const { toast } = useToast()

  // Get the variants from the product
  const variants = product.variants.edges.map(edge => edge.node)
  
  // Find the selected variant
  const selectedVariant = variants.find(variant => variant.id === selectedVariantId) || variants[0]
  
  // Get price from selected variant or default to min price
  const variantPrice = selectedVariant 
    ? Number.parseFloat(selectedVariant.price.amount) 
    : Number.parseFloat(product.priceRange.minVariantPrice.amount)
    
  const comparePrice = selectedVariant?.compareAtPrice 
    ? Number.parseFloat(selectedVariant.compareAtPrice.amount)
    : (product.highestCompareAtPrice ||
      (product.compareAtPriceRange ? Number.parseFloat(product.compareAtPriceRange.minVariantPrice.amount) : null))

  const onSale = comparePrice && comparePrice > variantPrice

  // Calculate discount percentage and absolute amount
  let discountPercentage = 0
  let discountAmount = 0

  if (onSale && comparePrice) {
    discountAmount = comparePrice - variantPrice
    discountPercentage = Math.round((discountAmount / comparePrice) * 100)
  }

  // German number formatter for prices
  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  // Function to clean up description HTML
  const cleanDescription = (html: string) => {
    if (!html) return ""

    // Remove CSS class definitions and other problematic elements
    return html
      .replace(/{[^}]*}/g, "") // Remove CSS blocks
      .replace(/class="[^"]*"/g, "") // Remove class attributes
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags
      .replace(/\.cs[A-Z0-9]{8}\{[^}]*\}/g, "") // Remove specific CSS class definitions
  }

  // Get the clean description
  const cleanDescriptionHtml = product.descriptionHtml ? cleanDescription(product.descriptionHtml) : product.description

  // Truncate description for display (first 4 lines)
  const truncateText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const firstFourLines = lines.slice(0, 4).join('\n');
    return firstFourLines;
  }

  // Get plain text version of the description
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  // Create truncated text version (client-side only)
  const getDescription = () => {
    if (typeof window === 'undefined' || !cleanDescriptionHtml) return { short: '', full: '' };
    
    const fullText = cleanDescriptionHtml;
    // Simple approach - split by paragraph tags
    const paragraphs = fullText.split(/<\/?p[^>]*>/g).filter(p => p.trim());
    const shortText = paragraphs.slice(0, 2).join(' ');
    
    return {
      short: shortText,
      full: fullText,
      hasMore: paragraphs.length > 2
    };
  }

  // Handle variant selection
  const handleVariantChange = (value: string) => {
    setSelectedVariantId(value)
  }

  // For debugging: Always show upsells regardless of product type
  const isKawkProduct = true; // product.title.includes("KAWK") || product.handle.includes("kawk")

  // Function to add item to cart
  const addToCart = () => {
    try {
      setIsAddingToCart(true)
      
      console.log("Produkt hinzufügen:", { 
        productId: product.id, 
        variantId: selectedVariantId,
        variantInfo: selectedVariant
      });

      // Get current cart from localStorage
      const storedCart = localStorage.getItem("cart")
      let cartItems: CartItem[] = []

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart)
          console.log("Bestehende Warenkorb-Artikel:", cartItems);
        } catch (error) {
          console.error("Error parsing cart data:", error)
          cartItems = []
        }
      }

      // Check if product with the same variant is already in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.id === product.id && item.variantId === selectedVariantId
      )

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity += quantity
        console.log("Artikel bereits im Warenkorb, Menge aktualisiert:", cartItems[existingItemIndex]);
      } else {
        // Add new item to cart
        cartItems.push({
          id: product.id,
          variantId: selectedVariantId,
          title: `${product.title} - ${selectedVariant?.title || ""}`,
          price: variantPrice,
          quantity: quantity,
          image: product.featuredImage?.url,
        })
        console.log("Neuer Artikel zum Warenkorb hinzugefügt");
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems))
      console.log("Warenkorb gespeichert:", cartItems);

      // Dispatch custom event to notify cart component
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))

      // Show success toast
      toast({
        title: "Produkt hinzugefügt",
        description: `${quantity}x ${product.title} ${selectedVariant?.title ? `(${selectedVariant.title})` : ''} wurde zum Warenkorb hinzugefügt.`,
      })

      // Reset quantity
      setQuantity(1)
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
    <div>
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Zurück zum Shop
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {product.featuredImage ? (
            <div className="relative aspect-square">
              <Image
                src={product.featuredImage.url || "/placeholder.svg"}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">No image available</div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            {product.id && (
              <p className="text-sm text-muted-foreground mt-2">
                Artikelnummer: {product.id.replace("gid://shopify/Product/", "")}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatPrice(variantPrice)}</span>
            {comparePrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(comparePrice)}</span>
            )}
            {onSale && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                {discountPercentage}% Wiederverkaufsrabatt ({formatPrice(discountAmount)})
              </span>
            )}
          </div>

          {/* Truncated Product Description with "mehr anzeigen" button */}
          {cleanDescriptionHtml && (
            <div className="border rounded-md p-4">
              <div className="prose prose-sm max-w-none product-description">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: showFullDescription 
                      ? cleanDescriptionHtml 
                      : cleanDescriptionHtml.split('</p>').slice(0, 4).join('</p>') + '</p>' 
                  }} 
                  className="leading-[1.1] text-[0.85rem] [&>p]:mb-[0.3rem]"
                />
                {!showFullDescription && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-blue-600 p-0 h-auto hover:bg-transparent hover:underline"
                    onClick={() => setShowFullDescription(true)}
                  >
                    Mehr anzeigen
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Upsell Section - directly below the description */}
          {isKawkProduct && (
            <ProductUpsell products={relatedProducts} mainProductId={product.id} />
          )}

          {/* Variant Selection Dropdown */}
          {variants.length > 1 && (
            <div>
              <label htmlFor="variant-select" className="block text-sm font-medium mb-2">
                Größe auswählen
              </label>
              <Select value={selectedVariantId} onValueChange={handleVariantChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Größe auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem 
                      key={variant.id} 
                      value={variant.id}
                      disabled={!variant.availableForSale}
                    >
                      {variant.title} 
                      {!variant.availableForSale && " (Nicht verfügbar)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isAddingToCart}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(quantity + 1)}
                disabled={isAddingToCart}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1 bg-[#8abfdf] hover:bg-[#8abfdf]/90 text-white"
              size="lg"
              onClick={addToCart}
              disabled={isAddingToCart || !selectedVariant?.availableForSale}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAddingToCart ? "Wird hinzugefügt..." : selectedVariant?.availableForSale ? "Zum Warenkorb" : "Nicht verfügbar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Section - immer anzeigen */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-8">Weitere Produkte entdecken</h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </div>
      )}
    </div>
  )
}

