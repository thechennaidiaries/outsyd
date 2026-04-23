'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bookmark } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import { getActivitiesByCity } from '@/data/activities'
import { getCityBySlug } from '@/data/cities'

export default function ActivitiesPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = getCityBySlug(citySlug)

  if (!city) notFound()

  const cityActivities = getActivitiesByCity(city.id)

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', background: 'var(--bg)' }}>
      {/* ── Breadcrumb & Title ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 20px' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
          textDecoration: 'none', marginBottom: 32,
          transition: 'color 0.2s',
        }} className="hover:text-white">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900,
          letterSpacing: '-0.04em', color: 'var(--text)',
          lineHeight: 1.1, marginBottom: 12, maxWidth: 800,
        }}>
          Things to do, activities and sidequests in{' '}
          <span style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {city.name}
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
          Explore the best activities {city.name} has to offer
        </p>

        <div style={{ marginTop: 18 }}>
          <Link
            href="/saved"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Bookmark size={14} /> View saved items
          </Link>
        </div>
      </div>

      {/* Activities Grid */}
      <div id="activities-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700, color: 'var(--text)',
          }}>
            <span>🔥</span>
            All Activities
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
            {cityActivities.length} {cityActivities.length === 1 ? 'activity' : 'activities'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
          {cityActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} citySlug={citySlug} />
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
