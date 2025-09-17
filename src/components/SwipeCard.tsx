'use client'

import { useState, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SwipeCardProps } from '@/types'
import { cn } from '@/lib/utils'

export function SwipeCard({ pitch, onSwipe, isTopCard }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-30, 30])
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0])
  
  const backgroundColor = useTransform(
    x,
    [-300, -50, 0, 50, 300],
    ['#ef4444', '#ffffff', '#ffffff', '#ffffff', '#22c55e']
  )

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isTopCard) return
    onSwipe(direction)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    onSwiping: (eventData) => {
      if (!isTopCard) return
      const deltaX = eventData.deltaX
      x.set(deltaX)
      setIsDragging(true)
    },
    onSwiped: () => {
      setIsDragging(false)
      x.set(0)
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  const getPitchIcon = () => {
    const lowerPitch = pitch.pitch.toLowerCase()
    if (lowerPitch.includes('ai') || lowerPitch.includes('gpt') || lowerPitch.includes('machine learning')) {
      return <TrendingUp className="w-5 h-5" />
    }
    return <Lightbulb className="w-5 h-5" />
  }

  const getPitchCategory = () => {
    const lowerPitch = pitch.pitch.toLowerCase()
    if (lowerPitch.includes('ai') || lowerPitch.includes('gpt')) return 'AI'
    if (lowerPitch.includes('saas') || lowerPitch.includes('platform')) return 'SaaS'
    if (lowerPitch.includes('app') || lowerPitch.includes('mobile')) return 'Mobile'
    if (lowerPitch.includes('cursed') || lowerPitch.includes('weird')) return 'Cursed'
    return 'Startup'
  }

  return (
    <motion.div
      {...swipeHandlers}
      className={cn(
        "absolute inset-4 cursor-grab active:cursor-grabbing",
        !isTopCard && "pointer-events-none"
      )}
      style={{
        x,
        rotate,
        opacity: isTopCard ? opacity : 0.8,
        zIndex: isTopCard ? 10 : 1,
        scale: isTopCard ? 1 : 0.95,
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.1}
      onDrag={(_, info) => {
        if (!isTopCard) return
        x.set(info.offset.x)
        setIsDragging(true)
      }}
      onDragEnd={(_, info) => {
        if (!isTopCard) return
        setIsDragging(false)
        
        const swipeThreshold = 150
        if (Math.abs(info.offset.x) > swipeThreshold) {
          handleSwipe(info.offset.x > 0 ? 'right' : 'left')
        } else {
          x.set(0)
        }
      }}
      whileHover={isTopCard ? { scale: 1.02 } : {}}
      whileTap={isTopCard ? { scale: 0.98 } : {}}
    >
      <Card 
        className="h-full shadow-2xl border-2 border-neutral-200 dark:border-neutral-800 overflow-hidden relative"
        style={{ backgroundColor: isDragging ? backgroundColor.get() : undefined }}
      >
        {/* Swipe Indicators */}
        {isDragging && (
          <>
            <motion.div
              className="absolute top-8 left-8 z-20"
              style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
            >
              <Badge variant="destructive" className="text-lg px-4 py-2 font-bold">
                <X className="w-5 h-5 mr-2" />
                REJECT
              </Badge>
            </motion.div>
            
            <motion.div
              className="absolute top-8 right-8 z-20"
              style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
            >
                           <Badge className="text-lg px-4 py-2 font-bold bg-green-500 hover:bg-green-600 text-white">
                 <Heart className="w-5 h-5 mr-2" />
                 INVEST
               </Badge>
            </motion.div>
          </>
        )}

        <CardContent className="p-8 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {getPitchIcon()}
              <Badge variant="secondary" className="text-sm">
                {getPitchCategory()}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              #{pitch.id}
            </Badge>
          </div>

          {/* Main Pitch */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed text-neutral-800 dark:text-neutral-200">
              {pitch.pitch}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 flex items-center justify-center transition-colors duration-200"
              >
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Swipe or click to decide
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 