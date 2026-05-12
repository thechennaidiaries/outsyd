import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default analyze(nextConfig)

