export interface StartupPitch {
  id: number
  pitch: string
  is_seed: boolean
  created_at?: string
}

export interface SwipeSession {
  id: string
  user_id?: string
  swipes: SwipeDecision[]
  founder_archetype?: FounderArchetype
  startup_pack?: StartupPack
  created_at: string
  completed_at?: string
}

export interface SwipeDecision {
  pitch_id: number
  direction: 'left' | 'right' // left = reject, right = invest
  timestamp: string
}

export interface FounderArchetype {
  title: string
  description: string
  traits: string[]
  emoji: string
  color: string
}

export interface StartupPack {
  company_name: string
  user_persona: string
  tagline: string
  viral_growth_hack: string
  slogan: string
}

export interface SwipeCardProps {
  pitch: StartupPitch
  onSwipe: (direction: 'left' | 'right') => void
  isTopCard: boolean
}

export interface ArchetypeResult {
  archetype: FounderArchetype
  startup_pack: StartupPack
  swipe_summary: {
    total_swipes: number
    invested_count: number
    rejected_count: number
    investment_rate: number
  }
} 