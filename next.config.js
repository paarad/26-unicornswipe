/** @type {import('next').NextConfig} */
const nextConfig = {
  // App router is enabled by default in Next.js 13+
  webpack: (config, { dev, isServer }) => {
    // Suppress specific warnings from @supabase/realtime-js
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },
  // Suppress Next.js build warnings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 