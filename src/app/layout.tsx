import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000'),
  title: '🦄 UnicornSwipe - Find Hot Startups Nearby',
  description: 'A swipe-based mobile web app where AI throws you startup pitches. Discover your founder archetype!',
  keywords: 'startup, swipe, tinder, founder, archetype, AI, GPT, pitches',
  authors: [{ name: 'UnicornSwipe' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#000000',
  openGraph: {
    title: '🦄 UnicornSwipe - Find Hot Startups Nearby',
    description: 'Swipe on startup pitches and discover your founder archetype!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🦄 UnicornSwipe',
    description: 'Find Hot Startups Nearby',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
} 