import { createClient } from '@supabase/supabase-js'
import type { StartupPitch, SwipeSession, SwipeDecision, FounderArchetype, StartupPack } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =====================================================
// STARTUP PITCHES
// =====================================================

export async function getRandomPitches(count: number = 10): Promise<StartupPitch[]> {
  console.log('🔍 Fetching random pitches, count:', count)
  console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
  console.log('🔧 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  // Fetch ALL pitches first, then randomly select
  console.log('📊 Fetching all pitches for proper randomization...')
  const { data: allPitches, error: fetchError } = await supabase
    .from('unicornswipe_startup_pitches')
    .select('id, pitch, is_seed, category')
    .eq('is_active', true)

  if (fetchError) {
    console.error('❌ Failed to fetch all pitches:', fetchError)
    return []
  }

  if (!allPitches || allPitches.length === 0) {
    console.error('❌ No pitches found in database')
    return []
  }

  console.log('✅ Found', allPitches.length, 'total pitches in database')
  
  // Properly shuffle ALL pitches and take the requested count
  const shuffled = allPitches.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)
  
  console.log('✅ Selected', selected.length, 'random pitches from', allPitches.length, 'total')
  return selected
}

export async function getMostPopularPitches(limit: number = 20): Promise<StartupPitch[]> {
  const { data, error } = await supabase
    .from('unicornswipe_popular_pitches')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching popular pitches:', error)
    return []
  }

  return data || []
}

// =====================================================
// SWIPE SESSIONS
// =====================================================

export async function createSwipeSession(sessionToken?: string): Promise<string | null> {
  const sessionId = crypto.randomUUID()
  const token = sessionToken || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  console.log('🔧 Creating session with ID:', sessionId)

  // Get user agent and basic analytics
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  const deviceType = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'

  try {
    const { error } = await supabase
      .from('unicornswipe_swipe_sessions')
      .insert({
        id: sessionId,
        session_token: token,
        user_agent: userAgent,
        device_type: deviceType,
        swipes: [],
        total_swipes: 0,
        total_likes: 0,
        total_rejects: 0
      })

    if (error) {
      console.error('❌ Database error creating session:', error)
      console.log('📝 Attempting to create session without optional fields...')
      
      // Try with minimal required fields only
      const { error: minimalError } = await supabase
        .from('unicornswipe_swipe_sessions')
        .insert({
          id: sessionId,
          session_token: token
        })
      
      if (minimalError) {
        console.error('❌ Minimal session creation also failed:', minimalError)
        return null
      }
      
      console.log('✅ Session created with minimal fields')
    } else {
      console.log('✅ Session created successfully with all fields')
    }

    // Store session token in localStorage for anonymous users
    if (typeof window !== 'undefined') {
      localStorage.setItem('unicornswipe_session_token', token)
    }

    return sessionId
  } catch (err) {
    console.error('❌ Unexpected error creating session:', err)
    return null
  }
}

export async function getSwipeSession(sessionId: string): Promise<SwipeSession | null> {
  const { data, error } = await supabase
    .from('unicornswipe_swipe_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
}

export async function updateSwipeSession(
  sessionId: string, 
  updates: Partial<SwipeSession>
): Promise<boolean> {
  const { error } = await supabase
    .from('unicornswipe_swipe_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session:', error)
    return false
  }

  return true
}

export async function completeSwipeSession(
  sessionId: string,
  founderArchetype: FounderArchetype,
  startupPack: StartupPack
): Promise<boolean> {
  const { error } = await supabase
    .from('unicornswipe_swipe_sessions')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      founder_archetype: founderArchetype,
      startup_pack: startupPack,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error completing session:', error)
    return false
  }

  return true
}

// =====================================================
// SWIPE DECISIONS
// =====================================================

export async function recordSwipeDecision(
  sessionId: string,
  pitchId: number,
  direction: 'left' | 'right',
  swipeOrder: number,
  decisionTimeMs?: number
): Promise<boolean> {
  console.log('📊 Recording swipe:', { sessionId, pitchId, direction, swipeOrder })
  
  try {
    const { error } = await supabase
      .from('unicornswipe_swipe_decisions')
      .insert({
        session_id: sessionId,
        pitch_id: pitchId,
        direction,
        swipe_order: swipeOrder,
        decision_time_ms: decisionTimeMs
      })

    if (error) {
      console.error('❌ Error recording swipe decision:', error)
      
      // Try with minimal required fields
      const { error: minimalError } = await supabase
        .from('unicornswipe_swipe_decisions')
        .insert({
          session_id: sessionId,
          pitch_id: pitchId,
          direction
        })
      
      if (minimalError) {
        console.error('❌ Minimal swipe recording also failed:', minimalError)
        return false
      }
      
      console.log('✅ Swipe recorded with minimal fields')
      return true
    }

    console.log('✅ Swipe recorded successfully')
    return true
  } catch (err) {
    console.error('❌ Unexpected error recording swipe:', err)
    return false
  }
}

export async function getSessionDecisions(sessionId: string): Promise<SwipeDecision[]> {
  const { data, error } = await supabase
    .from('unicornswipe_swipe_decisions')
    .select('*')
    .eq('session_id', sessionId)
    .order('swipe_order', { ascending: true })

  if (error) {
    console.error('Error fetching session decisions:', error)
    return []
  }

  return data || []
}

// =====================================================
// FOUNDER ARCHETYPES
// =====================================================

export async function getFounderArchetypes(): Promise<FounderArchetype[]> {
  const { data, error } = await supabase
    .from('unicornswipe_founder_archetypes')
    .select('*')
    .eq('is_active', true)
    .order('min_investment_rate', { ascending: true })

  if (error) {
    console.error('Error fetching founder archetypes:', error)
    return []
  }

  return data || []
}

export async function determineFounderArchetype(investmentRate: number): Promise<FounderArchetype | null> {
  const { data, error } = await supabase
    .rpc('determine_founder_archetype', { investment_rate: investmentRate })

  if (error) {
    console.error('Error determining founder archetype:', error)
    return null
  }

  return data?.[0] || null
}

// =====================================================
// ANALYTICS
// =====================================================

export async function trackEvent(
  eventType: string,
  sessionId: string,
  eventData?: any
): Promise<void> {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  const referrer = typeof window !== 'undefined' ? window.document.referrer : ''

  const { error } = await supabase
    .from('unicornswipe_analytics')
    .insert({
      event_type: eventType,
      session_id: sessionId,
      event_data: eventData,
      user_agent: userAgent,
      referrer: referrer
    })

  if (error) {
    console.error('Error tracking event:', error)
  }
}

// Convenience functions for common events
export const analytics = {
  sessionStart: (sessionId: string) => trackEvent('session_start', sessionId),
  sessionComplete: (sessionId: string, data?: any) => trackEvent('session_complete', sessionId, data),
  pitchView: (sessionId: string, pitchId: number) => trackEvent('pitch_view', sessionId, { pitch_id: pitchId }),
  swipe: (sessionId: string, pitchId: number, direction: string) => 
    trackEvent('swipe', sessionId, { pitch_id: pitchId, direction }),
  share: (sessionId: string, platform: string) => trackEvent('share', sessionId, { platform }),
  archetypeRevealed: (sessionId: string, archetype: string) => 
    trackEvent('archetype_revealed', sessionId, { archetype })
}

// =====================================================
// STARTUP PACK GENERATION
// =====================================================

export async function saveStartupPack(
  sessionId: string,
  startupPack: StartupPack,
  generatedBy: string = 'openai',
  prompt?: string,
  generationTimeMs?: number
): Promise<boolean> {
  const { error } = await supabase
    .from('unicornswipe_startup_packs')
    .insert({
      session_id: sessionId,
      company_name: startupPack.company_name,
      user_persona: startupPack.user_persona,
      tagline: startupPack.tagline,
      viral_growth_hack: startupPack.viral_growth_hack,
      slogan: startupPack.slogan,
      generated_by: generatedBy,
      generation_prompt: prompt,
      generation_time_ms: generationTimeMs
    })

  if (error) {
    console.error('Error saving startup pack:', error)
    return false
  }

  return true
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export async function getSessionStats() {
  const { data, error } = await supabase
    .from('unicornswipe_daily_stats')
    .select('*')
    .limit(30)

  if (error) {
    console.error('Error fetching session stats:', error)
    return []
  }

  return data || []
} 