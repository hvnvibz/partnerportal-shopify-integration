import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Versuche initial vom User-Agent zu erkennen (für SSR und ersten Render)
  const getInitialMobile = () => {
    if (typeof window === 'undefined') return undefined
    // Prüfe erst die Bildschirmbreite
    if (window.innerWidth < MOBILE_BREAKPOINT) return true
    // Fallback: User-Agent für ältere Browser die matchMedia nicht korrekt unterstützen
    const ua = navigator.userAgent || ''
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  }

  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initiale Erkennung
    const checkMobile = () => {
      const widthBased = window.innerWidth < MOBILE_BREAKPOINT
      // Zusätzliche Touch-Erkennung als Fallback
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const ua = navigator.userAgent || ''
      const uaBased = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      
      // Nutze Breite als Hauptkriterium, aber berücksichtige auch Touch-Geräte
      // die möglicherweise falsche Viewport-Werte melden
      return widthBased || (hasTouch && uaBased && window.innerWidth < 1024)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(checkMobile())
    }
    
    // Legacy-Support für ältere Browser ohne addEventListener bei matchMedia
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else if (mql.addListener) {
      // Deprecated aber für ältere Browser nötig
      mql.addListener(onChange)
    }
    
    // Auch auf resize hören als Fallback
    window.addEventListener('resize', onChange)
    
    // Initiale Prüfung
    setIsMobile(checkMobile())
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else if (mql.removeListener) {
        mql.removeListener(onChange)
      }
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return !!isMobile
}
