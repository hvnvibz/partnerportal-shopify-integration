"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
    <div className="flex items-center space-x-2">
      <Switch
        id="price-toggle"
        checked={hidePrices}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-[#8abfdf]"
      />
      <Label 
        htmlFor="price-toggle" 
        className="text-sm font-medium cursor-pointer flex items-center gap-1"
      >
        {hidePrices ? (
          <>
            <EyeOff className="h-4 w-4" />
            Preise ausblenden
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Preise anzeigen
          </>
        )}
      </Label>
    </div>
  )
}
