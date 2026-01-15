"use client"

import * as React from "react"
import { ChevronUp, ChevronDown, Pause, Play } from "lucide-react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi 
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { UpdateCard } from "./update-card"
import { updates } from "@/lib/updates-data"
import { cn } from "@/lib/utils"

interface UpdatesCarouselProps {
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function UpdatesCarousel({ 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: UpdatesCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(autoPlay)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !isPlaying) return

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [api, isPlaying, autoPlayInterval])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const scrollTo = React.useCallback((index: number) => {
    api?.scrollTo(index)
  }, [api])

  const togglePlay = React.useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  return (
    <div className="relative flex items-center gap-6">
      {/* Dots Navigation - Left Side */}
      <div className="hidden md:flex flex-col items-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              current === index 
                ? "bg-blue-600 scale-110" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Carousel */}
      <div className="flex-1 max-w-xl">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {updates.map((update) => (
              <CarouselItem key={update.id}>
                <UpdateCard update={update} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Mobile Dots - Below Carousel */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                current === index 
                  ? "bg-blue-600 w-4" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Gehe zu Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Controls - Right Side */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={scrollPrev}
          aria-label="Vorheriger Slide"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausieren" : "Abspielen"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={scrollNext}
          aria-label="Nächster Slide"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
