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
import { getRandomPitches, createSwipeSession, recordSwipeDecision, analytics } from '@/lib/supabase'
// import { generateFounderArchetype } from '@/lib/openai' // Temporarily disabled

export default function HomePage() {
  const router = useRouter()
  const [pitches, setPitches] = useState<StartupPitch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipes, setSwipes] = useState<SwipeDecision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Initialize the game with Supabase data
    const initGame = async () => {
      try {
        // Create a session in the database
        const newSessionId = await createSwipeSession()
        if (!newSessionId) {
          // If session creation fails, just use a local UUID and disable DB operations
          console.warn('Failed to create database session, running in offline mode')
          setSessionId('') // Empty string means no DB operations
        } else {
          setSessionId(newSessionId)
        }
        
        // Fetch random pitches from Supabase (this works - only reads data)
        const randomPitches = await getRandomPitches(10)
        if (randomPitches.length === 0) {
          throw new Error('No pitches found in database')
        }
        
        setPitches(randomPitches)
        setIsLoading(false)
        
      } catch (error) {
        console.error('❌ Error initializing game with Supabase:', error)
        setIsLoading(false)
        // Show error to user instead of falling back to demo data
        alert('Failed to connect to database. Please check your internet connection and try again.')
      }
    }

    initGame()
  }, [])

  const handleSwipe = async (direction: 'left' | 'right') => {
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

    // Record the swipe in Supabase (fail silently in production)
    if (sessionId) {
      try {
        await recordSwipeDecision(
          sessionId,
          currentPitch.id,
          direction,
          newSwipes.length
        )
        
        // Track analytics
        await analytics.swipe(sessionId, currentPitch.id, direction)
        await analytics.pitchView(sessionId, currentPitch.id)
      } catch (error) {
        // Silently fail in production
      }
    }

    // After 10 swipes, generate archetype and navigate to results
    if (newSwipes.length >= 10) {
      try {
        // Store results without AI-generated data
        sessionStorage.setItem('swipeResults', JSON.stringify({
          swipes: newSwipes,
          pitches: pitches.slice(0, 10),
          sessionId
        }))
        
      } catch (error) {
        console.error('❌ Error generating founder archetype:', error)
        
        // Store results without AI data (fallback will be used)
        sessionStorage.setItem('swipeResults', JSON.stringify({
          swipes: newSwipes,
          pitches: pitches.slice(0, 10),
          sessionId
        }))
      }
      
      // Track session completion (fail silently)
      if (sessionId) {
        try {
          await analytics.sessionComplete(sessionId, {
            total_swipes: newSwipes.length,
            investment_rate: (newSwipes.filter(s => s.direction === 'right').length / newSwipes.length) * 100
          })
        } catch (error) {
          // Silently fail in production
        }
      }
      
      setTimeout(() => {
        router.push('/results')
      }, 1000)
    }
  }

  const resetGame = async () => {
    setCurrentIndex(0)
    setSwipes([])
    
    // Create a new session in the database
    const newSessionId = await createSwipeSession()
    if (!newSessionId) {
      console.warn('Failed to create new database session, running in offline mode')
      setSessionId('') // Empty string means no DB operations
    } else {
      setSessionId(newSessionId)
    }
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