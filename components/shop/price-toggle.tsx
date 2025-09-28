"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, EyeOff } from "lucide-react"

export function PriceToggle() {
  const [hidePrices, setHidePrices] = useState(false)

  // Lade den gespeicherten Zustand beim Mount
  useEffect(() => {
    const savedState = localStorage.getItem("hidePrices")
    if (savedState !== null) {
      setHidePrices(JSON.parse(savedState))
    }
  }, [])

  // Speichere den Zustand bei Änderungen
  const handleToggle = (checked: boolean) => {
    setHidePrices(checked)
    localStorage.setItem("hidePrices", JSON.stringify(checked))
    
    // Dispatch Event für andere Komponenten
    window.dispatchEvent(new CustomEvent("price-visibility-changed", { 
      detail: { hidePrices: checked } 
    }))
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {hidePrices ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hidePrices ? "Preise anzeigen" : "Preise ausblenden"}</p>
          </TooltipContent>
        </Tooltip>
        <Switch
          id="price-toggle"
          checked={hidePrices}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-[#8abfdf] scale-75"
        />
      </div>
    </TooltipProvider>
  )
}
