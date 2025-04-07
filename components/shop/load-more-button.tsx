"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface LoadMoreButtonProps {
  currentPage: number
  hasNextPage: boolean
}

export function LoadMoreButton({ currentPage, hasNextPage }: LoadMoreButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLoadMore = () => {
    setIsLoading(true)

    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString())

    // Update the page parameter
    params.set("page", (currentPage + 1).toString())

    // Navigate to the new URL
    router.push(`/shop?${params.toString()}`)
  }

  if (!hasNextPage) return null

  return (
    <div className="flex justify-center mt-8">
      <Button onClick={handleLoadMore} disabled={isLoading} className="bg-[#8abfdf] hover:bg-[#8abfdf]/90">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Laden...
          </>
        ) : (
          "Mehr Produkte laden"
        )}
      </Button>
    </div>
  )
}

