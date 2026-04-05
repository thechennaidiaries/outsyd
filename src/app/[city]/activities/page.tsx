'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import ActivityCard from '@/components/ActivityCard'
import WalkCard from '@/components/WalkCard'
import CategoryStrip from '@/components/CategoryStrip'
import { getActivitiesByCity } from '@/data/activities'
import { getWalksByCity } from '@/data/walks'
import { getCityBySlug } from '@/data/cities'

/* ── Reusable horizontal-scroll section ─────────────────────────── */
function HScrollSection({
  emoji,
  heading,
  subheading,
  count,
  viewMoreHref,
  children,
}: {
  emoji: string
  heading: string
  subheading?: string
  count: number
  viewMoreHref: string
  children: React.ReactNode
}) {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 0 0' }}>
      {/* Header row */}
      <div style={{ padding: '0 28px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
              {emoji} {heading}
            </h2>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {count} {count === 1 ? 'place' : 'places'}
            </span>
          </div>
        </div>
        {subheading && (
          <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            {subheading}
          </p>
        )}
      </div>

      {/* Horizontal scroll track */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingLeft: 28,
          paddingRight: 28,
          paddingBottom: 8,
          scrollSnapType: 'x mandatory',
        }}
      >
        {children}

        {/* "View More" inline card */}
        <Link
          href={viewMoreHref}
          style={{
            minWidth: 160,
            flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 10,
            borderRadius: 'var(--radius)',
            border: '1.5px dashed rgba(255,107,0,0.35)',
            background: 'rgba(255,107,0,0.04)',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
            scrollSnapAlign: 'start',
            aspectRatio: '3/4',
          }}
          className="hover:border-[var(--accent)] hover:bg-[rgba(255,107,0,0.08)]"
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '2px solid rgba(255,107,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s ease',
          }}>
            <ArrowRight size={18} color="var(--accent)" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>View More</span>
        </Link>
      </div>
    </div>
  )
}

/* ── Shuffle utility (Fisher-Yates) ──────────────────────────────── */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/* ── Tag-diversity reorder ──────────────────────────────────────── */
// Reorders activities so no two adjacent items share ANY common tag.
// Uses a greedy approach: pick the next item that has the least tag
// overlap with the previously placed item.
function spreadByTags<T extends { tags?: string[] }>(items: T[]): T[] {
  if (items.length <= 1) return items

  const remaining = [...items]
  const result: T[] = []

  // Start with a random item
  const startIdx = Math.floor(Math.random() * remaining.length)
  result.push(remaining.splice(startIdx, 1)[0])

  while (remaining.length > 0) {
    const prevTags = new Set(result[result.length - 1].tags ?? [])

    // Score each remaining item: lower overlap = better
    let bestIdx = 0
    let bestOverlap = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const candidateTags = remaining[i].tags ?? []
      const overlap = candidateTags.filter(t => prevTags.has(t)).length
      if (overlap < bestOverlap) {
        bestOverlap = overlap
        bestIdx = i
        if (overlap === 0) break // Can't do better than zero overlap
      }
    }

    result.push(remaining.splice(bestIdx, 1)[0])
  }

  return result
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function ThingsToDoPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = getCityBySlug(citySlug)

  if (!city) notFound()

  const cityActivities = getActivitiesByCity(city.id)
  const cityWalks = getWalksByCity(city.id)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Curated sections (base lists)
  const lowBudget = cityActivities.filter(a => a.tags?.includes('low budget fun activities'))
  const sports = cityActivities.filter(a => a.tags?.includes('sports activities'))
  const gaming = cityActivities.filter(a => a.tags?.includes('gaming activities'))
  const adventure = cityActivities.filter(a => a.tags?.includes('adventure activities'))

  // Shuffled state for curated sections (randomised on every mount)
  const [shuffledWalks, setShuffledWalks] = useState(cityWalks)
  const [shuffledLowBudget, setShuffledLowBudget] = useState(lowBudget)
  const [shuffledSports, setShuffledSports] = useState(sports)
  const [shuffledGaming, setShuffledGaming] = useState(gaming)
  const [shuffledAdventure, setShuffledAdventure] = useState(adventure)
  const [isShuffled, setIsShuffled] = useState(false)

  // Shuffle once on client mount to avoid SSR hydration mismatch
  useEffect(() => {
    setShuffledWalks(shuffleArray(cityWalks))
    setShuffledLowBudget(shuffleArray(lowBudget))
    setShuffledSports(shuffleArray(sports))
    setShuffledGaming(shuffleArray(gaming))
    setShuffledAdventure(shuffleArray(adventure))
    setIsShuffled(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.id])

  // Filtered for the "All Activities" grid
  const filtered = cityActivities.filter(a => {
    const matchesTag = !activeTag || (a.tags?.includes(activeTag) ?? false)
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      (a.location?.toLowerCase().includes(q) ?? false) ||
      (a.area?.toLowerCase().includes(q) ?? false) ||
      (a.tags?.some(t => t.toLowerCase().includes(q)) ?? false)
    return matchesTag && matchesSearch
  })

  // Randomised + tag-spread version of filtered list
  const [spreadFiltered, setSpreadFiltered] = useState(filtered)

  useEffect(() => {
    // First shuffle, then apply tag diversity
    setSpreadFiltered(spreadByTags(shuffleArray(filtered)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, searchQuery, isShuffled])

  function handleSearch(query: string) {
    setSearchQuery(query)
    setActiveTag(null)
  }

  function handleTagChange(tag: string | null) {
    setActiveTag(tag)
    setSearchQuery('')
  }

  const getCleanTagName = (t: string) => {
    let name = t.replace(/\s*activities\s*/gi, '').trim()
    if (name === 'unique cultural experiences') return 'Cultural'
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const heading = searchQuery.trim()
    ? `Results for "${searchQuery}"`
    : activeTag ? getCleanTagName(activeTag) : 'All Activities'

  /* card width for horizontal scroll items */
  const cardStyle: React.CSSProperties = {
    minWidth: 220,
    maxWidth: 260,
    flexShrink: 0,
    scrollSnapAlign: 'start',
  }

  /* walk cards are 4:3 landscape, so they need a wider container */
  const walkCardStyle: React.CSSProperties = {
    minWidth: 330,
    maxWidth: 390,
    flexShrink: 0,
    scrollSnapAlign: 'start',
  }

  return (
    <main>
      <Hero city={city} onSearch={handleSearch} />

      {/* ═══ 1. City Crawls ═══════════════════════════════════════ */}
      {cityWalks.length > 0 && (
        <HScrollSection
          emoji="🚶"
          heading="City Crawls"
          count={cityWalks.length}
          viewMoreHref={`/${citySlug}/walks`}
        >
          {shuffledWalks.slice(0, 5).map(walk => (
            <div key={walk.id} style={walkCardStyle}>
              <WalkCard walk={walk} citySlug={citySlug} />
            </div>
          ))}
        </HScrollSection>
      )}

      {/* ═══ 2. Low Budget Fun ════════════════════════════════════ */}
      {lowBudget.length > 0 && (
        <HScrollSection
          emoji="💰"
          heading="Activities that don't burn your pockets"
          subheading="Find activities starting from ₹0"
          count={lowBudget.length}
          viewMoreHref={`/${citySlug}/activities/low-budget-fun-activities-in-${city.id}`}
        >
          {shuffledLowBudget.slice(0, 8).map(a => (
            <div key={a.id} style={cardStyle}>
              <ActivityCard activity={a} citySlug={citySlug} />
            </div>
          ))}
        </HScrollSection>
      )}

      {/* ═══ 3. Sports ════════════════════════════════════════════ */}
      {sports.length > 0 && (
        <HScrollSection
          emoji="⚽"
          heading="Burn some calories"
          subheading="Football, Cricket, Tennis, Pickleball, Swimming and many more"
          count={sports.length}
          viewMoreHref={`/${citySlug}/activities/sports-activities-in-${city.id}`}
        >
          {shuffledSports.slice(0, 8).map(a => (
            <div key={a.id} style={cardStyle}>
              <ActivityCard activity={a} citySlug={citySlug} />
            </div>
          ))}
        </HScrollSection>
      )}

      {/* ═══ 4. Gaming Activities ══════════════════════════════════ */}
      {gaming.length > 0 && (
        <HScrollSection
          emoji="🎮"
          heading="Have fun with your Gang"
          subheading="Laser tag, bowling, board games, RC gaming and many more"
          count={gaming.length}
          viewMoreHref={`/${citySlug}/activities/gaming-activities-in-${city.id}`}
        >
          {shuffledGaming.slice(0, 8).map(a => (
            <div key={a.id} style={cardStyle}>
              <ActivityCard activity={a} citySlug={citySlug} />
            </div>
          ))}
        </HScrollSection>
      )}

      {/* ═══ 5. Adventure Activities ═══════════════════════════════ */}
      {adventure.length > 0 && (
        <HScrollSection
          emoji="🚀"
          heading="Activities for more Adrenaline Rush"
          count={adventure.length}
          viewMoreHref={`/${citySlug}/activities/adventure-activities-in-${city.id}`}
        >
          {shuffledAdventure.slice(0, 8).map(a => (
            <div key={a.id} style={cardStyle}>
              <ActivityCard activity={a} citySlug={citySlug} />
            </div>
          ))}
        </HScrollSection>
      )}



      {/* ═══ 5. Filter Strip + All Activities Grid ═══════════════ */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 56, padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', marginBottom: 20 }}>
          <h3 style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ width: 12, height: 1.5, background: 'var(--accent)', borderRadius: 2 }} />
            Filter by Activities
          </h3>
        </div>
        <CategoryStrip activeTag={activeTag} onTagChange={handleTagChange} cityId={city.id} />
      </div>

      <div id="activities-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 80px' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            {heading}
          </h2>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1.5px dashed var(--border)',
          }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.025em' }}>
              No activities found
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
              Try a different search term or browse all categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
            {spreadFiltered.map(activity => (
              <ActivityCard key={activity.id} activity={activity} citySlug={citySlug} />
            ))}
          </div>
        )}
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
