'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FounderArchetypeComponent } from '@/components/FounderArchetype'
import { StartupPackComponent } from '@/components/StartupPack'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react'
import type { SwipeDecision, StartupPitch, FounderArchetype, StartupPack } from '@/types'

interface SwipeResults {
  swipes: SwipeDecision[]
  pitches: StartupPitch[]
  sessionId: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<SwipeResults | null>(null)
  const [archetype, setArchetype] = useState<FounderArchetype | null>(null)
  const [startupPack, setStartupPack] = useState<StartupPack | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('swipeResults')
    if (!storedResults) {
      router.push('/')
      return
    }

    const parsedResults: SwipeResults = JSON.parse(storedResults)
    setResults(parsedResults)

    // Generate founder archetype (demo version without OpenAI)
    generateDemoArchetype(parsedResults)
  }, [router])

  const generateDemoArchetype = (results: SwipeResults) => {
    const { swipes, pitches } = results
    const investedCount = swipes.filter(s => s.direction === 'right').length
    const investmentRate = (investedCount / swipes.length) * 100

    // Demo archetype based on investment patterns
    let demoArchetype: FounderArchetype
    let demoStartupPack: StartupPack

    if (investmentRate >= 70) {
      demoArchetype = {
        title: "The Hype Founder",
        description: "You're drawn to shiny objects and viral potential. Every startup sounds like the next big thing to you, and you're not afraid to take risks on bold ideas.",
        traits: ["Risk-Taker", "Optimistic", "Trend-Spotter", "Ambitious"],
        emoji: "🚀",
        color: "bg-gradient-to-br from-orange-400 to-red-600"
      }
      demoStartupPack = {
        company_name: "TrendFlow",
        user_persona: "Early adopters and tech enthusiasts seeking the latest innovations",
        tagline: "Catch Tomorrow's Trends Today",
        viral_growth_hack: "Create FOMO with limited beta access and countdown timers",
        slogan: "🔥 Find Hot Startups Nearby."
      }
    } else if (investmentRate >= 40) {
      demoArchetype = {
        title: "The Balanced Visionary",
        description: "You have a keen eye for practical innovation. You can spot real potential while avoiding the obvious traps, making you a thoughtful investor.",
        traits: ["Strategic", "Analytical", "Visionary", "Prudent"],
        emoji: "🎯",
        color: "bg-gradient-to-br from-blue-400 to-purple-600"
      }
      demoStartupPack = {
        company_name: "SmartBridge",
        user_persona: "Business professionals looking for efficient, proven solutions",
        tagline: "Smart Solutions, Real Results",
        viral_growth_hack: "Partner with industry leaders for credible endorsements",
        slogan: "🔥 Find Hot Startups Nearby."
      }
    } else {
      demoArchetype = {
        title: "The Skeptical Sage",
        description: "You're incredibly selective and see through the hype. Most ideas don't impress you, but when you invest, it's usually gold. Your standards are sky-high.",
        traits: ["Discerning", "Realistic", "Critical", "Perfectionist"],
        emoji: "🧙‍♂️",
        color: "bg-gradient-to-br from-gray-400 to-gray-700"
      }
      demoStartupPack = {
        company_name: "CoreLogic",
        user_persona: "Conservative investors and established business owners",
        tagline: "Proven. Reliable. Essential.",
        viral_growth_hack: "Focus on word-of-mouth from satisfied enterprise clients",
        slogan: "🔥 Find Hot Startups Nearby."
      }
    }

    // Simulate generation delay
    setTimeout(() => {
      setArchetype(demoArchetype)
      setStartupPack(demoStartupPack)
      setIsGenerating(false)
    }, 2000)
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 mx-auto animate-spin text-neutral-600" />
          <p className="text-lg text-neutral-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-16 h-16 mx-auto text-yellow-500" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Analyzing Your Founder DNA... 🧬
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Our AI is studying your investment patterns to reveal your founder archetype
            </p>
          </div>

          <div className="space-y-2">
            <motion.div
              className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
              initial={{ width: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </motion.div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Processing investment decisions...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const investmentRate = (results.swipes.filter(s => s.direction === 'right').length / results.swipes.length) * 100

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Your Founder DNA Revealed! 🧬
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Based on your {results.swipes.length} swipes
          </p>
        </motion.div>

        {/* Founder Archetype */}
        {archetype && (
          <FounderArchetypeComponent
            archetype={archetype}
            investmentRate={investmentRate}
            totalSwipes={results.swipes.length}
          />
        )}

        {/* Startup Pack */}
        {startupPack && (
          <StartupPackComponent startupPack={startupPack} />
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-8"
        >
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Button
            onClick={() => {
              sessionStorage.removeItem('swipeResults')
              router.push('/')
            }}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Swipe Again
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 