"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ShopSearchProps {
  initialQuery: string
}

export function ShopSearch({ initialQuery }: ShopSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)

    const params = new URLSearchParams(searchParams.toString())

    if (event.target.value) {
      params.set("query", event.target.value)
    } else {
      params.delete("query")
    }

    params.set("page", "1")
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="relative">
      <Input type="search" placeholder="Produkte suchen..." value={query} onChange={handleSearch} className="pr-10" />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
}

