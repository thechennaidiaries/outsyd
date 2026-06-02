'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MapPin, Music } from 'lucide-react'

const GAMES = [
  {
    slug: 'routethala',
    name: 'Route Thala',
    description: 'Guess today\'s mystery Chennai spot in 3 tries.',
    badge: '📍 Daily',
    accent: '#ff6b00',
    icon: 'map',
  },
  {
    slug: 'paatify',
    name: 'Paatify',
    description: 'Guess today\'s mystery Tamil song in 5 chances',
    badge: '🎵 Daily',
    accent: '#1DB954',
    icon: 'music',
  },
]

export default function GamesHubPage() {
  const params = useParams()
  const city = params?.city ?? 'chennai'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px' }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 8 }}>
            Chennai Games
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)', fontWeight: 500 }}>
            Daily puzzles and quizzes about the city you love.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {GAMES.map(game => (
            <Link
              key={game.slug}
              href={`/${city}/games/${game.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                borderRadius: 16, padding: '20px 24px',
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${game.accent}20`,
                    border: `1px solid ${game.accent}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {game.icon === 'music'
                      ? <Music size={18} color={game.accent} />
                      : <MapPin size={18} color={game.accent} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                      {game.name}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: game.accent,
                      background: `${game.accent}18`, borderRadius: 20,
                      padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                      {game.badge}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  {game.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
