import OpenAI from 'openai'
import type { SwipeDecision, FounderArchetype, StartupPack } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateFounderArchetype(
  swipeDecisions: SwipeDecision[],
  pitches: string[]
): Promise<{ archetype: FounderArchetype; startup_pack: StartupPack }> {
  const likedPitches = swipeDecisions
    .filter(swipe => swipe.direction === 'right')
    .map((swipe, index) => pitches[swipe.pitch_id - 1])
    .filter(Boolean)

  const rejectedPitches = swipeDecisions
    .filter(swipe => swipe.direction === 'left')
    .map((swipe, index) => pitches[swipe.pitch_id - 1])
    .filter(Boolean)

  const investmentRate = (likedPitches.length / swipeDecisions.length) * 100

  const prompt = `You are a startup founder personality analyzer. Based on the following swipe decisions on startup pitches, generate a founder archetype and startup pack.

LIKED PITCHES (${likedPitches.length}):
${likedPitches.map((pitch, i) => `${i + 1}. ${pitch}`).join('\n')}

REJECTED PITCHES (${rejectedPitches.length}):
${rejectedPitches.map((pitch, i) => `${i + 1}. ${pitch}`).join('\n')}

INVESTMENT RATE: ${investmentRate.toFixed(1)}%

Generate a JSON response with:
1. A founder archetype with personality analysis
2. A personalized startup pack based on their preferences

Be creative, insightful, and slightly humorous. Make the archetype feel personal and accurate based on their choices.

Response format:
{
  "archetype": {
    "title": "The [Archetype Name]",
    "description": "2-3 sentence personality description",
    "traits": ["trait1", "trait2", "trait3", "trait4"],
    "emoji": "🚀",
    "color": "#3B82F6"
  },
  "startup_pack": {
    "company_name": "Company Name",
    "user_persona": "Target user description",
    "tagline": "Catchy tagline",
    "viral_growth_hack": "Growth strategy",
    "slogan": "Memorable slogan"
  }
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative startup analyst who generates insightful founder archetypes and business ideas based on investment patterns. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(response)
    return result

  } catch (error) {
    console.error('Error generating founder archetype:', error)
    
    // Fallback archetype based on investment rate
    const fallbackArchetype = getFallbackArchetype(investmentRate, likedPitches.length)
    return fallbackArchetype
  }
}

function getFallbackArchetype(investmentRate: number, likedCount: number): { archetype: FounderArchetype; startup_pack: StartupPack } {
  if (investmentRate >= 70) {
    return {
      archetype: {
        title: "The Optimistic Visionary",
        description: "You see potential everywhere and believe in the power of innovation. Your enthusiasm is infectious, but you might need to be more selective.",
        traits: ["Optimistic", "Risk-taking", "Innovative", "Collaborative"],
        emoji: "🚀",
        color: "#10B981"
      },
      startup_pack: {
        company_name: "NextWave Solutions",
        user_persona: "Forward-thinking professionals seeking cutting-edge solutions",
        tagline: "Innovation Without Limits",
        viral_growth_hack: "Partner with influencers to showcase real transformation stories",
        slogan: "Dream Big, Build Bigger"
      }
    }
  } else if (investmentRate >= 40) {
    return {
      archetype: {
        title: "The Balanced Strategist",
        description: "You carefully weigh opportunities and make calculated decisions. Your measured approach leads to sustainable growth and smart investments.",
        traits: ["Analytical", "Strategic", "Cautious", "Practical"],
        emoji: "⚖️",
        color: "#3B82F6"
      },
      startup_pack: {
        company_name: "Equilibrium Ventures",
        user_persona: "Professionals seeking reliable, proven solutions",
        tagline: "Smart Choices, Steady Growth",
        viral_growth_hack: "Create detailed ROI calculators and case studies",
        slogan: "Progress Through Precision"
      }
    }
  } else {
    return {
      archetype: {
        title: "The Discerning Perfectionist",
        description: "You have incredibly high standards and only invest in truly exceptional ideas. When you say yes, it means something special.",
        traits: ["Selective", "High-standards", "Detail-oriented", "Quality-focused"],
        emoji: "💎",
        color: "#8B5CF6"
      },
      startup_pack: {
        company_name: "Elite Standards Co",
        user_persona: "Discerning customers who value premium quality",
        tagline: "Excellence is the Standard",
        viral_growth_hack: "Create exclusive, invite-only beta program",
        slogan: "Few, But Exceptional"
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