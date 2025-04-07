"use client"

import { useEffect, useRef } from "react"

interface TallyFormProps {
  formId: string
  options?: {
    alignLeft?: boolean
    hideTitle?: boolean
    transparentBackground?: boolean
    dynamicHeight?: boolean
  }
}

export function TallyForm({ formId, options = {} }: TallyFormProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create the script element
    const script = document.createElement("script")
    script.src = "https://tally.so/widgets/embed.js"
    script.async = true
    script.onload = () => {
      // When script is loaded, initialize Tally
      if (typeof window.Tally !== "undefined") {
        window.Tally.loadEmbeds()
      } else {
        // If Tally is not available, manually set the iframe src
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.dataset.tallySrc || ""
        }
      }
    }

    // Add the script to the document
    document.body.appendChild(script)

    // Clean up
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Build query parameters for the iframe
  const queryParams = new URLSearchParams()
  if (options.alignLeft) queryParams.append("alignLeft", "1")
  if (options.hideTitle) queryParams.append("hideTitle", "1")
  if (options.transparentBackground) queryParams.append("transparentBackground", "1")
  if (options.dynamicHeight) queryParams.append("dynamicHeight", "1")

  const iframeSrc = `https://tally.so/embed/${formId}?${queryParams.toString()}`

  return (
    <div ref={containerRef} className="tally-form-container">
      <iframe
        ref={iframeRef}
        data-tally-src={iframeSrc}
        width="100%"
        height="500"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title={`Tally Form ${formId}`}
      ></iframe>
    </div>
  )
}

// Add Tally to the Window interface
declare global {
  interface Window {
    Tally: {
      loadEmbeds: () => void
    }
  }
} 