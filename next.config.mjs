import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/:city/game',
        destination: '/:city/games/routethala',
        permanent: true,
      },
      {
        source: '/:city/game/play',
        destination: '/:city/games/routethala/play',
        permanent: true,
      },
    ]
  },
}

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default analyze(nextConfig)

