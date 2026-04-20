'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import WalkCard from '@/components/WalkCard'
import { getWalksByCity } from '@/data/walks'
import { getCityBySlug } from '@/data/cities'

export default function WalksPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = getCityBySlug(citySlug)

  if (!city) notFound()

  const cityWalks = getWalksByCity(city.id)

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      {/* ── Simple Hero Section ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 20px' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
          textDecoration: 'none', marginBottom: 32,
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900,
          letterSpacing: '-0.04em', color: 'var(--text)',
          lineHeight: 1.1, marginBottom: 12, maxWidth: 800,
        }}>
          City walks to discover food, culture and vibe in{' '}
          <span style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {city.name}
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
          Explore the city's vibe with these walks
        </p>
      </div>

      {/* Walks Grid */}
      <div id="activities-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700, color: 'var(--text)',
          }}>
            <span>🚶</span>
            City Crawls
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
            {cityWalks.length} {cityWalks.length === 1 ? 'walk' : 'walks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
          {cityWalks.map((walk, index) => (
            <WalkCard key={walk.id} walk={walk} citySlug={citySlug} eager={index < 8} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 24px',
        textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
      }}>
        ⚡ <strong style={{ color: 'var(--text-2)' }}>TBOC</strong> — Things To Do {city.name} · Never be bored again · Made with ❤️ in {city.name}
      </footer>
    </main>
  )
}
