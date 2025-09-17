import { createClient } from '@supabase/supabase-js'
import type { StartupPitch, SwipeSession } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export async function getRandomPitches(count: number = 10): Promise<StartupPitch[]> {
  const { data, error } = await supabase
    .from('startup_pitches')
    .select('*')
    .order('id', { ascending: false })
    .limit(count)

  if (error) {
    console.error('Error fetching pitches:', error)
    return []
  }

  // Shuffle the pitches
  return data.sort(() => Math.random() - 0.5)
}

export async function createSwipeSession(): Promise<string | null> {
  const sessionId = crypto.randomUUID()
  
  const { error } = await supabase
    .from('swipe_sessions')
    .insert({
      id: sessionId,
      swipes: [],
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  return sessionId
}

export async function updateSwipeSession(
  sessionId: string, 
  session: Partial<SwipeSession>
): Promise<boolean> {
  const { error } = await supabase
    .from('swipe_sessions')
    .update(session)
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session:', error)
    return false
  }

  return true
}

export async function getSwipeSession(sessionId: string): Promise<SwipeSession | null> {
  const { data, error } = await supabase
    .from('swipe_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
} 