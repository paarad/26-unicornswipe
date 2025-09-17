'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { FounderArchetype } from '@/types'

interface FounderArchetypeProps {
  archetype: FounderArchetype
  investmentRate: number
  totalSwipes: number
}

export function FounderArchetypeComponent({ 
  archetype, 
  investmentRate, 
  totalSwipes 
}: FounderArchetypeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Main Archetype Card */}
      <Card className="overflow-hidden">
        <div className={`${archetype.color} p-8 text-white text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-6xl mb-4"
          >
            {archetype.emoji}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-bold mb-2"
          >
            {archetype.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg opacity-90"
          >
            {archetype.description}
          </motion.p>
        </div>

        <CardContent className="p-8">
          {/* Traits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
              Your Founder Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {archetype.traits.map((trait, index) => (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {trait}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Investment Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {investmentRate.toFixed(0)}%
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Investment Rate
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              className="text-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalSwipes}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Swipes
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 