# 🦄 UnicornSwipe

**Find Hot Startups Nearby** - A swipe-based mobile web app where AI throws you startup pitches!

## 🚀 Features

- 🔁 Tinder-style swipe experience (mobile-first)
- 🤖 AI-generated startup pitches from a hybrid pool
- 🧠 GPT-generated Founder Archetype + Startup Pack
- 📦 Supabase: Tracks swipe decisions
- 🐦 "Tweet Your Founder Vibe" feature

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: OpenAI GPT-4o, Supabase
- **Animations**: Framer Motion, react-swipeable
- **Icons**: Lucide React

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:paarad/26-unicornswipe.git
   cd 26-unicornswipe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file with:
   ```
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase Configuration  
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Setup Supabase Database**
   - Create tables for startup pitches and swipe sessions
   - Import the 200 startup pitches from `200_Seed_Startup_Pitches.csv`

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🎮 How It Works

1. **Swipe Interface**: Users swipe left (reject) or right (invest) on startup pitches
2. **AI Pitch Generation**: Mix of curated pitches + real-time GPT generation
3. **Founder Archetype**: After 10 swipes, AI analyzes choices and reveals your founder personality
4. **Startup Pack**: Complete business package with name, persona, tagline, and growth hack
5. **Social Sharing**: Tweet your founder vibe with one click

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main swipe interface
│   ├── results/
│   │   └── page.tsx      # Founder archetype results
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn components
│   ├── SwipeCard.tsx     # Main swipe card component
│   ├── FounderArchetype.tsx
│   └── StartupPack.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── openai.ts         # OpenAI client
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript definitions
```

## 🔮 Stretch Features

- 🗓 Daily pitch streaks
- 🎭 Multiplayer: compare founder vibes with friends
- 🔁 "Remix this startup" → pivot generator
- 🎯 Filters: swipe only on AI, SaaS, or cursed categories
- 🧬 Archetype leaderboard

## 📄 License

ISC 