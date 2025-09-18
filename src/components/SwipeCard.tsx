'use client'

import { useState } from 'react'
import { Heart, X, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SwipeCardProps } from '@/types'
import { cn } from '@/lib/utils'

export function SwipeCard({ pitch, onSwipe, isTopCard }: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isTopCard || isAnimating) return
    
    console.log('🎯 SwipeCard handleSwipe called:', direction, 'isTopCard:', isTopCard)
    
    setIsAnimating(true)
    
    // Call parent immediately
    onSwipe(direction)
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // Smart category detection based on pitch content
  const getCategory = (pitchText: string): string => {
    const lowerPitch = pitchText.toLowerCase()
    if (lowerPitch.includes('ai') || lowerPitch.includes('gpt')) return 'AI'
    if (lowerPitch.includes('saas') || lowerPitch.includes('platform')) return 'SaaS'
    if (lowerPitch.includes('app') || lowerPitch.includes('mobile')) return 'Mobile'
    if (lowerPitch.includes('cursed') || lowerPitch.includes('weird')) return 'Cursed'
    return 'Startup'
  }

  return (
    <div
      className={cn(
        "absolute inset-4 transition-all duration-300",
        isTopCard ? "z-10" : "z-0 opacity-80 scale-95",
        isAnimating && "opacity-50"
      )}
    >
      <Card className={cn(
        "h-full w-full border-2 shadow-2xl transition-all duration-300",
        isTopCard ? "border-border shadow-lg" : "border-muted shadow-md"
      )}>
        <CardContent className="p-8 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium"
              >
                {getCategory(pitch.pitch)}
              </Badge>
              <div className="flex space-x-1">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            
            {/* Pitch Text */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold leading-tight text-foreground">
                {pitch.pitch}
              </h2>
              
              {/* Visual separator */}
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-6">
            {/* Swipe Hints */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4" />
                <span>Click to reject</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Click to invest</span>
                <Heart className="w-4 h-4" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  console.log('❌ REJECT BUTTON CLICKED - isTopCard:', isTopCard)
                  handleSwipe('left')
                }}
                className="flex-1 py-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center space-x-2 group"
                disabled={!isTopCard || isAnimating}
              >
                <X className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-red-700">Pass</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('✅ INVEST BUTTON CLICKED - isTopCard:', isTopCard)
                  handleSwipe('right')
                }}
                className="flex-1 py-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center space-x-2 group"
                disabled={!isTopCard || isAnimating}
              >
                <Heart className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-green-700">Invest</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 