'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Users, Zap, TrendingUp, Twitter, Share } from 'lucide-react'
import type { StartupPack } from '@/types'

interface StartupPackProps {
  startupPack: StartupPack
}

export function StartupPackComponent({ startupPack }: StartupPackProps) {
  const handleTweet = () => {
    const tweetText = `I just discovered my founder archetype on UnicornSwipe! 🦄\n\n🏢 ${startupPack.company_name}\n💡 "${startupPack.tagline}"\n\n${startupPack.slogan}\n\nFind your founder DNA:`
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.origin)}`
    window.open(tweetUrl, '_blank')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UnicornSwipe - My Founder Archetype',
          text: `Check out my startup: ${startupPack.company_name} - ${startupPack.tagline}`,
          url: window.location.origin,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      const shareText = `Check out my startup: ${startupPack.company_name} - ${startupPack.tagline}\n\nDiscover your founder archetype: ${window.location.origin}`
      navigator.clipboard.writeText(shareText)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="space-y-6"
    >
      {/* Startup Pack Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
        >
          Your Startup Pack 📦
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-neutral-600 dark:text-neutral-400"
        >
          A complete business package tailored to your archetype
        </motion.p>
      </div>

      {/* Company Name Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>Company Name</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              {startupPack.company_name}
            </h3>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tagline Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Tagline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl italic text-neutral-700 dark:text-neutral-300">
              "{startupPack.tagline}"
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Persona Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="w-5 h-5 text-green-500" />
              <span>Target Persona</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300">
              {startupPack.user_persona}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Hack Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span>Viral Growth Hack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300">
              {startupPack.viral_growth_hack}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Slogan Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        className="text-center"
      >
        <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          {startupPack.slogan}
        </Badge>
      </motion.div>

      {/* Share Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="flex flex-col sm:flex-row gap-4 pt-6"
      >
        <Button
          onClick={handleTweet}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Tweet Your Founder Vibe
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1"
        >
          <Share className="w-4 h-4 mr-2" />
          Share Startup Pack
        </Button>
      </motion.div>
    </motion.div>
  )
} 