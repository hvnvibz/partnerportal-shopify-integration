"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Update } from "@/lib/updates-data"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface UpdateCardProps {
  update: Update
  className?: string
}

export function UpdateCard({ update, className }: UpdateCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const tagVariant = update.tag === "Neu" 
    ? "default" 
    : update.tag === "Verbessert" 
      ? "secondary" 
      : "outline"

  return (
    <Card className={cn(
      "overflow-hidden border-0 shadow-lg bg-white rounded-2xl",
      className
    )}>
      {/* Image Container */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        <div className="absolute inset-4 rounded-xl overflow-hidden shadow-md border border-gray-200/50 bg-white">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <Sparkles className="h-12 w-12 text-blue-400 mb-2" />
              <span className="text-sm text-blue-600 font-medium">{update.title}</span>
            </div>
          ) : (
            <Image
              src={update.image}
              alt={update.title}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 600px"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {update.title}
          </h3>
          {update.tag && (
            <Badge variant={tagVariant} className="shrink-0">
              {update.tag}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {update.description}
        </p>
        <p className="text-xs text-gray-400 mt-3">
          {update.date}
        </p>
      </CardContent>
    </Card>
  )
}
