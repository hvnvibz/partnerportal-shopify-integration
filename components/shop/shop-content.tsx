"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ProductGrid } from "./product-grid"
import { Search, ShoppingBag, Loader2 } from "lucide-react"

interface ShopContentProps {
  products: any[]
  hasNextPage: boolean
  endCursor: string | null
  nextPageUrl: string
  query: string
  sort: string
}

export function ShopContent({ 
  products: initialProducts, 
  hasNextPage: initialHasNextPage, 
  endCursor: initialEndCursor,
  nextPageUrl: initialNextPageUrl,
  query, 
  sort,
}: ShopContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(query)
  
  // Zustand für die Ansammlung von Produkten über mehrere Seiten hinweg
  const [allProducts, setAllProducts] = useState(initialProducts)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [endCursor, setEndCursor] = useState(initialEndCursor)
  const [nextPageUrl, setNextPageUrl] = useState(initialNextPageUrl)
  const [isLoading, setIsLoading] = useState(false)

  // Aktualisiere den Zustand, wenn sich die initialProducts ändern (z.B. nach Filterung)
  useEffect(() => {
    setAllProducts(initialProducts)
    setHasNextPage(initialHasNextPage)
    setEndCursor(initialEndCursor)
    setNextPageUrl(initialNextPageUrl)
  }, [initialProducts, initialHasNextPage, initialEndCursor, initialNextPageUrl])

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value !== "TITLE-asc") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    
    // Reset pagination when sort changes
    params.delete("cursor")
    params.delete("previousCursor")
    
    router.push(`/shop?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchValue) {
      params.set("query", searchValue)
    } else {
      params.delete("query")
    }
    
    // Reset pagination when search changes
    params.delete("cursor")
    params.delete("previousCursor")
    
    router.push(`/shop?${params.toString()}`)
  }

  // Neue Funktion zum Laden weiterer Produkte ohne Seitenneuladen
  async function handleLoadMore() {
    if (!hasNextPage || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Hole die nächste Seite von Produkten
      const response = await fetch(`/shop/api/products?${new URLSearchParams({
        sort,
        ...(query ? { query } : {}),
        ...(searchParams.get('collection') ? { collection: searchParams.get('collection')! } : {}),
        ...(searchParams.get('productType') ? { productType: searchParams.get('productType')! } : {}),
        ...(endCursor ? { cursor: endCursor } : {})
      })}`);
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        // Füge neue Produkte am Ende hinzu
        setAllProducts(prev => [...prev, ...data.products]);
        
        // Aktualisiere Pagination-Status
        setHasNextPage(data.hasNextPage);
        setEndCursor(data.endCursor);
        
        // Erstelle URL für die nächste Seite (für's UI, wir rufen aber direkt die API auf)
        const nextParams = new URLSearchParams(searchParams.toString());
        if (data.endCursor) {
          nextParams.set("cursor", data.endCursor);
        }
        setNextPageUrl(`/shop?${nextParams.toString()}`);
      }
    } catch (error) {
      console.error("Fehler beim Laden weiterer Produkte:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Produkte durchsuchen..."
              className="pl-8 w-full"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" className="shrink-0">Suchen</Button>
        </form>
        <div className="flex items-center shrink-0">
          <span className="text-sm mr-2 text-gray-600">Sortieren:</span>
          <Select defaultValue={sort || "PRICE-desc"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sortieren nach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TITLE-asc">Alphabetisch: A-Z</SelectItem>
              <SelectItem value="TITLE-desc">Alphabetisch: Z-A</SelectItem>
              <SelectItem value="PRICE-asc">Preis: Aufsteigend</SelectItem>
              <SelectItem value="PRICE-desc">Preis: Absteigend</SelectItem>
              <SelectItem value="BEST_SELLING-desc">Bestseller</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {Array.isArray(allProducts) && allProducts.length > 0 ? (
        <div className="relative pb-8">
          <ProductGrid products={allProducts} />
          
          {/* "Weitere Produkte laden" Button */}
          <div className="w-full flex justify-center mt-8">
            {hasNextPage ? (
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoading}
                size="lg"
                className="bg-[#8abfdf] hover:bg-[#8abfdf]/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  "Weitere Produkte laden"
                )}
              </Button>
            ) : (
              <div className="text-sm text-gray-500 py-4">
                Keine weiteren Produkte verfügbar
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">Keine Produkte gefunden</h3>
          <p className="mt-2 text-sm text-gray-500">
            Versuchen Sie es mit einer anderen Suche oder anderen Filtern.
          </p>
          <Link href="/shop">
            <Button className="mt-4">Alle Produkte anzeigen</Button>
          </Link>
        </div>
      )}
    </main>
  )
}

