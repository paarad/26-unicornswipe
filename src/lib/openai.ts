import OpenAI from 'openai'
import type { FounderArchetype, StartupPack, SwipeDecision, StartupPitch } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateFounderArchetype(
  swipes: SwipeDecision[], 
  pitches: StartupPitch[]
): Promise<{ archetype: FounderArchetype; startup_pack: StartupPack }> {
  
  // Create context from swipe decisions
  const investedPitches = swipes
    .filter(s => s.direction === 'right')
    .map(s => pitches.find(p => p.id === s.pitch_id)?.pitch)
    .filter(Boolean)
  
  const rejectedPitches = swipes
    .filter(s => s.direction === 'left')
    .map(s => pitches.find(p => p.id === s.pitch_id)?.pitch)
    .filter(Boolean)

  const investmentRate = (investedPitches.length / swipes.length) * 100

  const prompt = `
You are an expert startup psychologist. Based on a user's swipe decisions on startup pitches, analyze their founder archetype and generate a complete startup pack.

SWIPE DATA:
- Total swipes: ${swipes.length}
- Investment rate: ${investmentRate.toFixed(1)}%
- Invested in: ${investedPitches.join('; ')}
- Rejected: ${rejectedPitches.slice(0, 5).join('; ')}${rejectedPitches.length > 5 ? '...' : ''}

Create a founder archetype that captures their investment pattern and preferences. Be creative, insightful, and slightly humorous.

FOUNDER ARCHETYPES to choose from (or create similar):
- The Spreadsheet Freak: Lives for metrics, ROI calculations, and growth hacks
- The Hype Founder: Attracted to buzzwords, viral potential, and shiny objects  
- The Visionary LARPer: Dreams big but often impractical, loves "disruption"
- The Chaos Goblin: Drawn to weird, cursed, or absurd business ideas
- The Safe Player: Prefers proven models and incremental improvements
- The Social Fixer: Wants to solve humanity's problems through apps
- The AI Maximalist: Everything must have AI, even if unnecessary

Return ONLY a valid JSON object with this exact structure:
{
  "archetype": {
    "title": "The [Archetype Name]",
    "description": "2-3 sentence personality description",
    "traits": ["trait1", "trait2", "trait3", "trait4"],
    "emoji": "🔥",
    "color": "bg-gradient-to-br from-orange-400 to-red-600"
  },
  "startup_pack": {
    "company_name": "Creative startup name",
    "user_persona": "Target customer description",
    "tagline": "Catchy 5-7 word tagline", 
    "viral_growth_hack": "Creative growth strategy",
    "slogan": "🔥 Find Hot Startups Nearby."
  }
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    const result = JSON.parse(response)
    return result
  } catch (error) {
    console.error('Error generating archetype:', error)
    
    // Fallback archetype
    return {
      archetype: {
        title: "The Mystery Founder",
        description: "Your swipe pattern is as enigmatic as your startup ideas. You march to the beat of your own drum.",
        traits: ["Unpredictable", "Creative", "Independent", "Mysterious"],
        emoji: "🎭",
        color: "bg-gradient-to-br from-purple-400 to-pink-600"
      },
      startup_pack: {
        company_name: "QuirkyVenture",
        user_persona: "Creative professionals seeking unique solutions",
        tagline: "Where Innovation Meets Imagination",
        viral_growth_hack: "Create mystery boxes with hints about your product",
        slogan: "🔥 Find Hot Startups Nearby."
      }
    }
  }
}

export async function generateRandomPitch(): Promise<string> {
  const prompt = `
Generate a single, creative startup pitch in one sentence. Make it either:
1. Brilliant and actually viable
2. Absurd but entertaining 
3. Cursed and weird

Examples:
- "AI that drafts cold emails based on LinkedIn profiles."
- "Uber for blood donations, matching hospitals to nearby donors in real-time."
- "A Chrome extension that replaces LinkedIn buzzwords with insults."

Return ONLY the pitch sentence, no quotes or extra text.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 100
    })

    return completion.choices[0]?.message?.content?.trim() || "An AI that generates startup ideas for lazy founders."
  } catch (error) {
    console.error('Error generating pitch:', error)
    return "An AI that generates startup ideas for lazy founders."
  }
} 