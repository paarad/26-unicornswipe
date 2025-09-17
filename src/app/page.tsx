'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeCard } from '@/components/SwipeCard'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RotateCcw, Heart, X } from 'lucide-react'
import type { StartupPitch, SwipeDecision } from '@/types'

// Sample pitches from the CSV data for demo purposes
const SAMPLE_PITCHES: StartupPitch[] = [
  { id: 1, pitch: "An AI that drafts cold emails based on LinkedIn profiles.", is_seed: true },
  { id: 2, pitch: "Uber for blood donations, matching hospitals to nearby donors in real-time.", is_seed: true },
  { id: 3, pitch: "A Chrome extension that replaces LinkedIn buzzwords with insults.", is_seed: true },
  { id: 4, pitch: "Subscription service for pre-cooked, bodybuilder-approved meals by top fitness influencers.", is_seed: true },
  { id: 5, pitch: "A tool that reverse-engineers viral tweets and suggests edits to your posts.", is_seed: true },
  { id: 6, pitch: "SaaS that generates pitch decks based on your Notion doc.", is_seed: true },
  { id: 7, pitch: "A co-founder matching platform based on MBTI and founder trauma.", is_seed: true },
  { id: 8, pitch: "Zoom plugin that adds 'boredom detection' to your face during calls.", is_seed: true },
  { id: 9, pitch: "An app that lets friends invest in your personal goals like a mini-VC.", is_seed: true },
  { id: 10, pitch: "Generative AI for YouTube thumbnails that guarantee clicks or your money back.", is_seed: true },
]

export default function HomePage() {
  const router = useRouter()
  const [pitches, setPitches] = useState<StartupPitch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipes, setSwipes] = useState<SwipeDecision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Initialize the game
    const initGame = async () => {
      try {
        // For demo, use sample pitches. In production, fetch from Supabase
        setPitches(SAMPLE_PITCHES)
        setSessionId(crypto.randomUUID())
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing game:', error)
        setPitches(SAMPLE_PITCHES)
        setSessionId(crypto.randomUUID())
        setIsLoading(false)
      }
    }

    initGame()
  }, [])

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= pitches.length) return

    const currentPitch = pitches[currentIndex]
    const newSwipe: SwipeDecision = {
      pitch_id: currentPitch.id,
      direction,
      timestamp: new Date().toISOString()
    }

    const newSwipes = [...swipes, newSwipe]
    setSwipes(newSwipes)
    setCurrentIndex(prev => prev + 1)

    // After 10 swipes, navigate to results
    if (newSwipes.length >= 10) {
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('swipeResults', JSON.stringify({
        swipes: newSwipes,
        pitches: pitches.slice(0, 10),
        sessionId
      }))
      
      setTimeout(() => {
        router.push('/results')
      }, 500)
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setSwipes([])
    setSessionId(crypto.randomUUID())
  }

  const progress = (swipes.length / 10) * 100
  const remainingSwipes = 10 - swipes.length
  const investmentCount = swipes.filter(s => s.direction === 'right').length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 mx-auto animate-spin text-neutral-600" />
          <p className="text-lg text-neutral-600">Loading hot startups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              🦄 UnicornSwipe
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Find Hot Startups Nearby
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Progress
              </span>
              <span className="font-medium">
                {swipes.length}/10 swipes
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-green-500" />
                <span>{investmentCount}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <X className="w-3 h-3 text-red-500" />
                <span>{swipes.length - investmentCount}</span>
              </Badge>
            </div>
            
            {remainingSwipes > 0 && (
              <Badge variant="secondary">
                {remainingSwipes} left
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="flex-1 relative max-w-md mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {currentIndex < pitches.length && remainingSwipes > 0 ? (
            <>
              {/* Show current and next card */}
              {pitches.slice(currentIndex, currentIndex + 2).map((pitch, index) => (
                <SwipeCard
                  key={`${pitch.id}-${currentIndex + index}`}
                  pitch={pitch}
                  onSwipe={handleSwipe}
                  isTopCard={index === 0}
                />
              ))}
            </>
          ) : remainingSwipes === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-4 flex items-center justify-center"
            >
              <div className="text-center space-y-4 p-8">
                <Sparkles className="w-16 h-16 mx-auto text-yellow-500" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Amazing Work! 🎉
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Analyzing your founder DNA...
                </p>
                <div className="animate-pulse">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-4 flex items-center justify-center"
            >
              <div className="text-center space-y-6 p-8">
                <div className="text-6xl">🦄</div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Ready to find your next unicorn?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Swipe through 10 startup pitches to discover your founder archetype
                </p>
                <Button onClick={resetGame} className="mt-4">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Swiping
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 pt-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Swipe left to reject, right to invest
          </p>
          {remainingSwipes === 0 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
              Redirecting to your founder archetype...
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 