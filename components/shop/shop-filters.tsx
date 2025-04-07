"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"

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
  const searchParams = useSearchParams()

  function handleCollectionChange(collectionHandle: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (collectionHandle) {
      params.set("collection", collectionHandle)
    } else {
      params.delete("collection")
    }
    // Reset pagination when filter changes
    params.delete("cursor")
    params.delete("page")
    params.delete("previousCursor")
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
        {isAnyFilterActive && (
          <Button 
            onClick={handleResetFilters} 
            variant="ghost" 
            size="sm" 
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Zurücksetzen
          </Button>
        )}
      </div>

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
        <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
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
    </div>
  )
}

