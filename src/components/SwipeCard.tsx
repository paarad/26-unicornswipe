'use client'

import { useState } from 'react'
import { Heart, X, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SwipeCardProps } from '@/types'
import { cn } from '@/lib/utils'

export function SwipeCard({ pitch, onSwipe, isTopCard }: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [buttonAnimation, setButtonAnimation] = useState<'invest' | 'pass' | null>(null)

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isTopCard || isAnimating) return
    
    setIsAnimating(true)
    
    // Trigger button animation
    setButtonAnimation(direction === 'left' ? 'pass' : 'invest')
    
    // Delay calling parent to show animation
    setTimeout(() => {
      onSwipe(direction)
    }, 600)
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false)
      setButtonAnimation(null)
    }, 800)
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
        buttonAnimation === 'invest' && "scale-105 drop-shadow-2xl",
        buttonAnimation === 'pass' && "scale-105 drop-shadow-2xl"
      )}
    >
      <Card className={cn(
        "h-full w-full border-2 shadow-2xl transition-all duration-300 relative overflow-hidden",
        isTopCard ? "border-border shadow-lg" : "border-muted shadow-md",
        buttonAnimation === 'invest' && "card-glow-green border-green-400",
        buttonAnimation === 'pass' && "card-glow-red border-red-400"
      )}>
        {/* Color overlay during animation */}
        {buttonAnimation && (
          <div className={cn(
            "absolute inset-0 z-10 transition-all duration-300 pointer-events-none",
            buttonAnimation === 'invest' 
              ? "bg-green-500/20 border-green-400/50" 
              : "bg-red-500/20 border-red-400/50"
          )} />
        )}
        
        {/* Button action overlay */}
        {buttonAnimation && (
          <div className={cn(
            "absolute inset-0 z-15 transition-all duration-700 pointer-events-none",
            buttonAnimation === 'invest' 
              ? "bg-green-100" 
              : "bg-red-100"
          )} />
        )}
        <CardContent className="relative z-20 p-8 h-full flex flex-col justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
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
                  handleSwipe('left')
                }}
                className={cn(
                  "flex-1 py-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 group",
                  buttonAnimation === 'pass' 
                    ? "border-red-500 bg-red-500 text-white reject-pulse giggle" 
                    : "border-red-200 bg-red-50 hover:bg-red-100"
                )}
                disabled={!isTopCard || isAnimating}
              >
                <X className={cn(
                  "w-5 h-5 transition-all duration-300",
                  buttonAnimation === 'pass' 
                    ? "text-white scale-125" 
                    : "text-red-600 group-hover:scale-110"
                )} />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  buttonAnimation === 'pass' ? "text-white" : "text-red-700"
                )}>Pass</span>
              </button>
              
              <button
                onClick={() => {
                  handleSwipe('right')
                }}
                className={cn(
                  "flex-1 py-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 group",
                  buttonAnimation === 'invest' 
                    ? "border-green-500 bg-green-500 text-white success-pulse giggle" 
                    : "border-green-200 bg-green-50 hover:bg-green-100"
                )}
                disabled={!isTopCard || isAnimating}
              >
                <Heart className={cn(
                  "w-5 h-5 transition-all duration-300",
                  buttonAnimation === 'invest' 
                    ? "text-white scale-125" 
                    : "text-green-600 group-hover:scale-110"
                )} />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  buttonAnimation === 'invest' ? "text-white" : "text-green-700"
                )}>Invest</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 