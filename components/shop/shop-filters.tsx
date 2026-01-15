"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Filter, Heart, ArrowRight, Loader2 } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useUser } from "@/lib/useUser"

// Define the INDUWA blue color
const INDUWA_BLUE = "#8abfdf"

interface ShopFiltersProps {
  collections: Array<{ id: string; title: string; handle: string }>
  productTypes: string[]
  activeCollection: string
  activeProductType: string
  activeSort: string
}

export function ShopFilters({
  collections,
  productTypes,
  activeCollection,
  activeProductType,
  activeSort,
}: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams() || { toString: () => "", get: () => undefined };
  const { user } = useUser();
  const { lists, loading: listsLoading } = useFavorites();

  function handleCollectionChange(collectionHandle: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (collectionHandle !== undefined && collectionHandle !== null) {
      params.set("collection", collectionHandle)
    }
    // Reset pagination when filter changes
    params.delete("cursor")
    params.delete("page")
    params.delete("previousCursor")
    // Entferne Such-Query, wenn ein Filter gesetzt wird
    params.delete("query")
    router.push(`/shop?${params.toString()}`)
  }

  function handleProductTypeChange(productType: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (productType) {
      params.set("productType", productType)
    } else {
      params.delete("productType")
    }
    // Reset pagination when filter changes
    params.delete("cursor")
    params.delete("page")
    params.delete("previousCursor")
    // Entferne Such-Query, wenn ein Filter gesetzt wird
    params.delete("query")
    router.push(`/shop?${params.toString()}`)
  }

  function handleResetFilters() {
    const params = new URLSearchParams()
    if (activeSort !== "TITLE-asc") {
      params.set("sort", activeSort)
    }
    // Reset pagination when filters are reset
    params.delete("cursor")
    params.delete("page")
    params.delete("previousCursor")
    router.push(`/shop?${params.toString()}`)
  }

  const isAnyFilterActive = activeCollection || activeProductType;

  return (
    <div className="space-y-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Produktanlagen & Zubehör</h2>
      </div>

      {/* Favoriten Section - nur für eingeloggte Benutzer */}
      {user && (
        <>
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              Meine Favoriten
            </h3>
            {listsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : lists.length === 0 ? (
              <p className="text-xs text-gray-500 mb-2">
                Noch keine Favoriten-Listen erstellt.
              </p>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                {lists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/favoriten?list=${list.id}`}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs rounded-md border hover:bg-gray-50 transition-colors"
                  >
                    <span className="truncate">{list.name}</span>
                    <span className="text-gray-400 ml-2">({list.item_count})</span>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/favoriten">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs"
              >
                <Heart className="h-3 w-3 mr-2" />
                Alle Favoriten anzeigen
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
            </Link>
          </div>
          <Separator />
        </>
      )}

      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Kollektionen
        </h3>
        <div className="space-y-1">
          <Button
            variant={!activeCollection ? "default" : "outline"}
            size="sm"
            className={`w-full justify-start text-xs ${!activeCollection ? `bg-[${INDUWA_BLUE}] hover:bg-[${INDUWA_BLUE}]/90 text-white` : ""}`}
            onClick={() => handleCollectionChange("")}
          >
            Alle Produkte
          </Button>
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={activeCollection === collection.handle ? "default" : "outline"}
              size="sm"
              className={`w-full justify-start text-xs ${activeCollection === collection.handle ? `bg-[${INDUWA_BLUE}] hover:bg-[${INDUWA_BLUE}]/90 text-white` : ""}`}
              onClick={() => handleCollectionChange(collection.handle)}
            >
              {collection.title}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Produkt Typ
        </h3>
        <div className="space-y-1 overflow-y-auto pr-2">
          <Button
            variant={!activeProductType ? "default" : "outline"}
            size="sm"
            className={`w-full justify-start text-xs ${!activeProductType ? `bg-[${INDUWA_BLUE}] hover:bg-[${INDUWA_BLUE}]/90 text-white` : ""}`}
            onClick={() => handleProductTypeChange("")}
          >
            Alle Typen
          </Button>
          {productTypes.map((type) => (
            <Button
              key={type}
              variant={activeProductType === type ? "default" : "outline"}
              size="sm"
              className={`w-full justify-start text-xs ${activeProductType === type ? `bg-[${INDUWA_BLUE}] hover:bg-[${INDUWA_BLUE}]/90 text-white` : ""}`}
              onClick={() => handleProductTypeChange(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Filter zurücksetzen Button unterhalb aller Filter */}
      {isAnyFilterActive && (
        <div className="pt-4">
          <Button 
            onClick={handleResetFilters} 
            variant="outline" 
            size="sm" 
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  )
}

