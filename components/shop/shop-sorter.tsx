"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShopSorterProps {
  activeSort: string
}

export function ShopSorter({ activeSort }: ShopSorterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.set("page", "1")
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <Select value={activeSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Sortieren nach" />
      </SelectTrigger>
      <SelectContent>
        {[
          { id: "TITLE-asc", name: "Alphabetisch, A-Z" },
          { id: "TITLE-desc", name: "Alphabetisch, Z-A" },
          { id: "PRICE-asc", name: "Preis, niedrig zu hoch" },
          { id: "PRICE-desc", name: "Preis, hoch zu niedrig" },
          { id: "BEST_SELLING-desc", name: "Bestseller" },
        ].map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

