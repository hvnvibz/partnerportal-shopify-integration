"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  images: Array<{
    url: string
    altText?: string
  }>
  currentImageIndex: number
  onImageChange: (index: number) => void
  productTitle: string
}

export function ImageZoomModal({
  isOpen,
  onClose,
  images,
  currentImageIndex,
  onImageChange,
  productTitle
}: ImageZoomModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !images.length) return null

  const currentImage = images[currentImageIndex]
  const hasMultipleImages = images.length > 1

  const handlePrevious = () => {
    if (hasMultipleImages) {
      const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
      onImageChange(newIndex)
    }
  }

  const handleNext = () => {
    if (hasMultipleImages) {
      const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
      onImageChange(newIndex)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Container - begrenzt auf 60% der Viewport-Größe */}
      <div className="relative w-[60vw] h-[75vh] max-w-[60vw] max-h-[75vh] flex items-center justify-center">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-white/20"
          onClick={onClose}
          aria-label="Bild vergrößerung schließen"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-2 left-2 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-white/20"
              onClick={handlePrevious}
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-white/20"
              onClick={handleNext}
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={currentImage.altText || productTitle}
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
            style={{ objectFit: "contain" }}
            priority
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Lädt...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
