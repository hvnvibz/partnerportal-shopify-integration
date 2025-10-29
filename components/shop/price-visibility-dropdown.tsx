"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, EyeOff, BadgePercent } from "lucide-react"

type PriceVisibilityMode = "all" | "list" | "hidden"

function migrateLegacy(): PriceVisibilityMode {
  try {
    const existing = localStorage.getItem("priceVisibility") as PriceVisibilityMode | null
    if (existing === "all" || existing === "list" || existing === "hidden") {
      return existing
    }
    const legacy = localStorage.getItem("hidePrices")
    if (legacy !== null) {
      const parsed = JSON.parse(legacy)
      const mode: PriceVisibilityMode = parsed ? "hidden" : "all"
      localStorage.setItem("priceVisibility", mode)
      // keep legacy key for now; cleanup step will remove it later
      return mode
    }
  } catch {}
  localStorage.setItem("priceVisibility", "all")
  return "all"
}

export function PriceVisibilityDropdown() {
  const [mode, setMode] = useState<PriceVisibilityMode>("all")

  useEffect(() => {
    // initialize from storage (with legacy migration)
    const initial = migrateLegacy()
    setMode(initial)
  }, [])

  const icon = useMemo(() => {
    if (mode === "hidden") return <EyeOff className="h-4 w-4" />
    if (mode === "list") return <BadgePercent className="h-4 w-4" />
    return <Eye className="h-4 w-4" />
  }, [mode])

  const label = useMemo(() => {
    if (mode === "hidden") return "Preise ausblenden"
    if (mode === "list") return "Nur Listenpreise"
    return "Alle Preise"
  }, [mode])

  function setVisibility(next: PriceVisibilityMode) {
    setMode(next)
    try {
      localStorage.setItem("priceVisibility", next)
      // keep boolean for backward compatibility during migration window
      const hidePrices = next === "hidden"
      localStorage.setItem("hidePrices", JSON.stringify(hidePrices))
      window.dispatchEvent(
        new CustomEvent("price-visibility-changed", {
          detail: { mode: next, hidePrices },
        })
      )
    } catch {}
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Preis-Sichtbarkeit: ${label}`} className="h-8 w-8">
                {icon}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Preis-Sichtbarkeit</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setVisibility("all")} className={mode === "all" ? "font-semibold" : undefined}>
            <Eye className="mr-2 h-4 w-4" /> Alle Preise
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setVisibility("list")} className={mode === "list" ? "font-semibold" : undefined}>
            <BadgePercent className="mr-2 h-4 w-4" /> Nur Listenpreise
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setVisibility("hidden")} className={mode === "hidden" ? "font-semibold" : undefined}>
            <EyeOff className="mr-2 h-4 w-4" /> Preise ausblenden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

export default PriceVisibilityDropdown


