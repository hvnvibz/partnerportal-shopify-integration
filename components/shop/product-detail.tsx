"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ShoppingCart, Plus, Minus, ChevronDown, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/shop/product-grid"
import ProductUpsell from "@/components/shop/product-upsell"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductCrossSell from "@/components/shop/product-cross-sell"
import RelatedProducts from "@/components/shop/related-products"
import { ImageZoomModal } from "@/components/shop/image-zoom-modal"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
  upsell1aProducts?: Product[]
  upsell2aProducts?: Product[]
  singleUpsellProduct?: Product | null
  crossSellProducts?: Product[]
}

export function ProductDetail({ product, relatedProducts, upsell1aProducts, upsell2aProducts, singleUpsellProduct, crossSellProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.edges[0]?.node.id || ""
  )
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [imageRatios, setImageRatios] = useState<number[]>([])
  const [maxRatio, setMaxRatio] = useState<number>(1)
  const [mode, setMode] = useState<"all" | "list" | "hidden">("all")
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)
  const { toast } = useToast()

  // Lade den gespeicherten Zustand beim Mount
  useEffect(() => {
    const savedMode = localStorage.getItem("priceVisibility") as "all" | "list" | "hidden" | null
    if (savedMode === "all" || savedMode === "list" || savedMode === "hidden") {
      setMode(savedMode)
    } else {
      const legacy = localStorage.getItem("hidePrices")
      if (legacy !== null) {
        setMode(JSON.parse(legacy) ? "hidden" : "all")
      }
    }
  }, [])

  // Höre auf Preis-Sichtbarkeits-Änderungen
  useEffect(() => {
    const handlePriceVisibilityChange = (event: CustomEvent) => {
      if (event.detail && (event.detail.mode === "all" || event.detail.mode === "list" || event.detail.mode === "hidden")) {
        setMode(event.detail.mode)
      } else if (typeof event.detail?.hidePrices === 'boolean') {
        setMode(event.detail.hidePrices ? "hidden" : "all")
      }
    }

    window.addEventListener("price-visibility-changed", handlePriceVisibilityChange as EventListener)
    
    return () => {
      window.removeEventListener("price-visibility-changed", handlePriceVisibilityChange as EventListener)
    }
  }, [])

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
  const isHidden = mode === 'hidden'
  const isListOnly = mode === 'list'


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

  // Handle variant selection
  const handleVariantChange = (value: string) => {
    setSelectedVariantId(value)
    // Reset gallery selection when variant changes
    setSelectedImageIdx(0)
  }

  // Handle zoom modal
  const openZoomModal = () => {
    setIsZoomModalOpen(true)
  }

  const closeZoomModal = () => {
    setIsZoomModalOpen(false)
  }

  const handleZoomImageChange = (index: number) => {
    setSelectedImageIdx(index)
  }

  // Upsell-Module anzeigen, wenn mindestens eines befüllt ist
  const showUpsells = (
    (Array.isArray(upsell1aProducts) && upsell1aProducts.length > 0) ||
    (Array.isArray(upsell2aProducts) && upsell2aProducts.length > 0) ||
    !!singleUpsellProduct
  );

  // Cross-Sell-Produkte: aus Prop oder leer
  const crossSell = Array.isArray(crossSellProducts) ? crossSellProducts : [];

  // Dynamisch Bildverhältnisse berechnen, wenn Bilder vorhanden
  useEffect(() => {
    if (product.images?.length && product.images.length > 0) {
      let loaded = 0;
      const ratios: number[] = [];
      product.images?.forEach((img, idx) => {
        const i = new window.Image();
        i.onload = function () {
          ratios[idx] = i.width / i.height;
          loaded++;
          if (loaded === product.images?.length) {
            setImageRatios(ratios);
            setMaxRatio(Math.max(...ratios));
          }
        };
        i.onerror = function () {
          ratios[idx] = 1; // fallback
          loaded++;
          if (loaded === product.images?.length) {
            setImageRatios(ratios);
            setMaxRatio(Math.max(...ratios));
          }
        };
        i.src = img.url;
      });
    } else {
      setImageRatios([1]);
      setMaxRatio(1);
    }
  }, [product.images]);

  // Bildlogik für Variante
  const variantImage = selectedVariant?.image?.url;
  // Galerie-Auswahl hat Vorrang vor Varianten-Bildern
  const mainImage = product.images?.[selectedImageIdx]?.url || variantImage || product.featuredImage?.url || "/placeholder.svg";

  // Function to add item to cart
  const addToCart = () => {
    try {
      setIsAddingToCart(true)
      if (process.env.NODE_ENV === "development") {
        console.log("Produkt hinzufügen:", { 
          productId: product.id, 
          variantId: selectedVariantId,
          variantInfo: selectedVariant
        });
      }

      // Get current cart from localStorage
      const storedCart = localStorage.getItem("cart")
      let cartItems: CartItem[] = []

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart)
          if (process.env.NODE_ENV === "development") {
            console.log("Bestehende Warenkorb-Artikel:", cartItems);
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error parsing cart data:", error)
          }
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
        if (process.env.NODE_ENV === "development") {
          console.log("Artikel bereits im Warenkorb, Menge aktualisiert:", cartItems[existingItemIndex]);
        }
      } else {
        // Add new item to cart
        // Nur Variantentitel hinzufügen, wenn er nicht "Default Title" ist
        const variantTitle = selectedVariant?.title && selectedVariant.title !== "Default Title" 
          ? ` - ${selectedVariant.title}` 
          : "";
        
        cartItems.push({
          id: product.id,
          variantId: selectedVariantId,
          title: `${product.title}${variantTitle}`,
          price: variantPrice,
          quantity: quantity,
          image: product.featuredImage?.url,
          sku: selectedVariant?.sku || product.variants.edges[0]?.node.sku || "",
          compareAtPrice: selectedVariant?.compareAtPrice ? Number.parseFloat(selectedVariant.compareAtPrice.amount) : undefined,
        })
        if (process.env.NODE_ENV === "development") {
          console.log("Neuer Artikel zum Warenkorb hinzugefügt");
        }
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems))
      if (process.env.NODE_ENV === "development") {
        console.log("Warenkorb gespeichert:", cartItems);
      }

      // Dispatch custom event to notify cart component
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))

      // Show success toast
      const variantName = selectedVariant?.title && selectedVariant.title !== "Default Title" ? `(${selectedVariant.title})` : "";
      toast({
        title: "Produkt hinzugefügt",
        description: `${quantity}x ${product.title} ${variantName} wurde zum Warenkorb hinzugefügt.`,
      })

      // Reset quantity
      setQuantity(1)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error adding to cart:", error)
      }
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
      <div className="mb-4 md:mb-8">
        <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Zurück zum Shop
        </Link>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-[45%_55%]">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-8">
          {/* Galerie-Logik */}
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-col items-center w-full max-w-[400px] mx-auto">
              <div
                className="relative flex items-center justify-center cursor-pointer group w-full aspect-square max-w-[320px]"
                onClick={openZoomModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openZoomModal()
                  }
                }}
                aria-label="Bild vergrößern"
              >
                <Image
                  src={mainImage}
                  alt={selectedVariant?.image?.altText || product.images?.[selectedImageIdx]?.altText || product.title}
                  style={{ objectFit: "contain", width: '100%', height: '100%', borderRadius: 8 }}
                  width={320}
                  height={320}
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 md:h-8 md:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
              
              {/* Zoom Button */}
              <div className="flex justify-center mt-3 md:mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openZoomModal}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-xs md:text-sm"
                  aria-label="Bild vergrößern"
                >
                  <ZoomIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Bild vergrößern
                </Button>
              </div>
              
              <div className="flex gap-1.5 md:gap-2 justify-center mt-4 md:mt-6 w-full overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.url}
                    className={`border rounded-md p-0.5 md:p-1 bg-white flex-shrink-0 ${selectedImageIdx === idx ? 'border-blue-500' : 'border-gray-200'} transition-all`}
                    style={{ width: 52, height: 52 }}
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`Bild ${idx + 1} anzeigen`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
                      width={48}
                      height={48}
                      style={{ objectFit: "contain", width: '100%', height: '100%' }}
                      className="rounded"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : product.featuredImage ? (
            <div className="relative cursor-pointer group w-full aspect-square max-w-[480px] mx-auto">
              <Image
                src={product.featuredImage.url || "/placeholder.svg"}
                alt={product.featuredImage.altText || product.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onClick={openZoomModal}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <ZoomIn className="h-6 w-6 md:h-8 md:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center text-sm md:text-base">Kein Bild verfügbar</div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{product.title}</h1>
            {product.id && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                Artikelnummer: {selectedVariant?.sku || product.id.replace("gid://shopify/Product/", "")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            {isHidden ? (
              <span className="text-xl md:text-2xl font-bold text-gray-500 italic">Preis auf Anfrage</span>
            ) : isListOnly ? (
              comparePrice ? (
                <span className="text-xl md:text-2xl font-bold">{formatPrice(comparePrice)}</span>
              ) : (
                <span className="text-xl md:text-2xl font-bold text-gray-500 italic">Listenpreis nicht verfügbar</span>
              )
            ) : (
              <>
                <span className="text-xl md:text-2xl font-bold">{formatPrice(variantPrice)}</span>
                {comparePrice && (
                  <span className="text-base md:text-lg text-muted-foreground line-through">{formatPrice(comparePrice)}</span>
                )}
                {onSale && (
                  <span className="bg-yellow-100 text-yellow-800 text-[0.65rem] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    {discountPercentage}% Rabatt ({formatPrice(discountAmount)})
                  </span>
                )}
              </>
            )}
          </div>

          {/* Accordion für Produktbeschreibung */}
          {cleanDescriptionHtml && (
            <Accordion type="single" collapsible>
              <AccordionItem value="desc">
                <AccordionTrigger>Produktbeschreibung</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm max-w-none product-description">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: cleanDescriptionHtml
                      }} 
                      className="leading-[1.1] text-[0.85rem] [&>p]:mb-[0.3rem]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Upsell Section - direkt unter der Beschreibung, nur wenn Produkte vorhanden */}
          {showUpsells && (
            <div className="mt-4 md:mt-8">
              <ProductUpsell 
                upsell1aProducts={upsell1aProducts || []}
                upsell2aProducts={upsell2aProducts || []}
                singleUpsellProduct={singleUpsellProduct}
                mainProductId={product.id} 
              />
            </div>
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="flex items-center border rounded-md self-start">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isAddingToCart || isHidden || isListOnly}
              >
                <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <span className="w-9 md:w-10 text-center text-sm md:text-base">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-none"
                onClick={() => setQuantity(quantity + 1)}
                disabled={isAddingToCart || isHidden || isListOnly}
              >
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>

            <Button
              className="flex-1 bg-[#8abfdf] hover:bg-[#8abfdf]/90 text-white text-sm md:text-base"
              size="lg"
              onClick={addToCart}
              disabled={isAddingToCart || !selectedVariant?.availableForSale || isHidden || isListOnly}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isHidden || isListOnly
                ? (isListOnly ? "Nur Listenpreise" : "Preis auf Anfrage") 
                : isAddingToCart 
                  ? "Wird hinzugefügt..." 
                  : selectedVariant?.availableForSale 
                    ? "Zum Warenkorb" 
                    : "Nicht verfügbar"
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Cross-Selling Bereich als eigene Section vor Related Products */}
      {crossSell.length > 0 && (
        <section className="mt-8 md:mt-16 mb-6 md:mb-8">
          <ProductCrossSell products={crossSell} />
        </section>
      )}

      {/* Related Products Section - immer anzeigen */}
      <RelatedProducts products={relatedProducts} columns={4} />
      
      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomModalOpen}
        onClose={closeZoomModal}
        images={product.images || []}
        currentImageIndex={selectedImageIdx}
        onImageChange={handleZoomImageChange}
        productTitle={product.title}
      />
    </div>
  )
}

