"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { FavoriteButton } from "@/components/shop/favorite-button"

// Hilfsfunktion zum Formatieren von Preisen
function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return price.toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  });
}

interface ProductGridProps {
  products: any[]
  columns?: number
  showFavorites?: boolean
}

export function ProductGrid({ products, columns = 3, showFavorites = true }: ProductGridProps) {
  const [mode, setMode] = useState<"all" | "list" | "hidden">("all")

  // Lade den gespeicherten Zustand beim Mount
  useEffect(() => {
    // Prefer new tri-state key; fall back to legacy boolean
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

  // Custom Breakpoints: xl = 1350px, 2xl = 1920px (siehe tailwind.config.js)
  // Mobile: 2-spaltig, ab sm: 2-spaltig, ab md: 3-spaltig, ab xl: 4-spaltig, ab 2xl: 5-spaltig
  const gridClass =
    "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"

  // Dedupliziere Produkte anhand ihrer ID
  const uniqueProducts = [...new Map(products.map(product => [product.id, product])).values()]
    .filter(product => product.price && product.price.amount);

  return (
    <div className={`grid ${gridClass} gap-3 md:gap-6`}>
      {uniqueProducts.map((product) => {
        if (!product.price || !product.price.amount) return null;
        return (
          <div
            key={product.id}
            className="group bg-white relative flex flex-col h-full overflow-hidden rounded-md border shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Favorite Button - positioned absolute in top right */}
            {showFavorites && (
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton
                  productId={product.id}
                  productHandle={product.handle}
                  productTitle={product.title}
                  variant="icon-small"
                />
              </div>
            )}
            
            <Link href={`/shop/${product.handle}`} className="flex flex-col h-full">
            {/* Wrapper für Sale-Tag mit fixer Mindesthöhe */}
            <div className="min-h-[1.8rem] md:min-h-[2.2rem] flex items-start bg-transparent">
              {mode === 'all' && product.compareAtPrice && product.compareAtPrice.amount ? (
                <div className="bg-yellow-400 font-semibold rounded mt-2 mx-2 md:mt-3 md:mx-3 mb-1 md:mb-2 self-start text-[0.55rem] md:text-[0.65rem] px-1.5 py-1 md:px-2 md:py-1">
                  {Math.round((1 - Number(product.price.amount) / Number(product.compareAtPrice.amount)) * 100)}% Rabatt
                </div>
              ) : (
                <div className="invisible mt-2 mx-2 md:mt-3 md:mx-3 mb-1 md:mb-2 text-[0.55rem] md:text-[0.65rem] px-1.5 py-1 md:px-2 md:py-1">&nbsp;</div>
              )}
            </div>
            <div className="aspect-square relative overflow-hidden bg-white">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
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
                <h3 className="font-semibold line-clamp-2 text-[0.7rem] md:text-[0.8rem]">{product.title}</h3>
                {product.sku && (
                  <p className="text-[0.6rem] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    Art.-Nr.: {product.sku}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-1 md:pt-2">
                {mode === 'hidden' ? (
                  <div className="h-4 md:h-6"></div>
                ) : (
                  <>
                    {mode === 'list' ? (
                      product.compareAtPrice && product.compareAtPrice.amount ? (
                        <span className="font-semibold text-xs md:text-sm">{formatPrice(product.compareAtPrice.amount ?? "0")}</span>
                      ) : (
                        <div className="h-4 md:h-6"></div>
                      )
                    ) : (
                      product.compareAtPrice && product.compareAtPrice.amount ? (
                        <div className="flex flex-col md:flex-row gap-0.5 md:gap-2 md:items-center">
                          <span className="font-semibold text-xs md:text-sm">{formatPrice(product.price.amount ?? "0")}</span>
                          <span className="text-gray-500 line-through text-[0.6rem] md:text-xs">
                            {formatPrice(product.compareAtPrice.amount ?? "0")}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-xs md:text-sm">{formatPrice(product.price.amount ?? "0")}</span>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
            </Link>
          </div>
        );
      })}
    </div>
  )
}

