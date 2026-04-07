'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import ActivityCard from '@/components/ActivityCard'
import WalkCard from '@/components/WalkCard'
import CategoryStrip from '@/components/CategoryStrip'
import { getActivitiesByCity, TAG_META } from '@/data/activities'
import { getWalksByCity } from '@/data/walks'
import { getCityBySlug } from '@/data/cities'

/* ── Reusable horizontal-scroll section ─────────────────────────── */
function HScrollSection({
  emoji,
  heading,
  subheading,
  viewMoreHref,
  children,
}: {
  emoji: string
  heading: string
  subheading?: string
  viewMoreHref: string
  children: React.ReactNode
}) {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '62px 28px 0' }}>
      {/* Header row */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text)' }}>
          {emoji} {heading}
        </h2>
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

/* ── Page ────────────────────────────────────────────────────────── */
export default function ThingsToDoPage() {
  const router = useRouter()
  const params = useParams()
  const citySlug = params.city as string
  const city = getCityBySlug(citySlug)

  if (!city) notFound()

  const cityActivities = getActivitiesByCity(city.id)
  const cityWalks = getWalksByCity(city.id)

  // Curated sections (base lists)
  const lowBudget = cityActivities.filter(a => a.tags?.includes('low budget fun activities'))
  const sports = cityActivities.filter(a => a.tags?.includes('sports activities'))
  const gaming = cityActivities.filter(a => a.tags?.includes('gaming activities'))
  const adventure = cityActivities.filter(a => a.tags?.includes('adventure activities'))
  const art = cityActivities.filter(a => a.tags?.includes('art activities'))
  const water = cityActivities.filter(a => a.tags?.includes('water activities'))
  const night = cityActivities.filter(a => a.tags?.includes('night activities'))
  const kids = cityActivities.filter(a => a.tags?.includes('kids activities'))
  const cultural = cityActivities.filter(a => a.tags?.includes('unique cultural experiences'))
  const leisure = cityActivities.filter(a => a.tags?.includes('leisure activities'))
  const group = cityActivities.filter(a => a.tags?.includes('group activities'))

  // Shuffled state for curated sections (randomised on every mount)
  const [shuffledWalks, setShuffledWalks] = useState(cityWalks)
  const [shuffledLowBudget, setShuffledLowBudget] = useState(lowBudget)
  const [shuffledSports, setShuffledSports] = useState(sports)
  const [shuffledGaming, setShuffledGaming] = useState(gaming)
  const [shuffledAdventure, setShuffledAdventure] = useState(adventure)
  const [shuffledArt, setShuffledArt] = useState(art)
  const [shuffledWater, setShuffledWater] = useState(water)
  const [shuffledNight, setShuffledNight] = useState(night)
  const [shuffledKids, setShuffledKids] = useState(kids)
  const [shuffledCultural, setShuffledCultural] = useState(cultural)
  const [shuffledLeisure, setShuffledLeisure] = useState(leisure)
  const [shuffledGroup, setShuffledGroup] = useState(group)

  // Shuffle once on client mount to avoid SSR hydration mismatch
  useEffect(() => {
    setShuffledWalks(shuffleArray(cityWalks))
    setShuffledLowBudget(shuffleArray(lowBudget))
    setShuffledSports(shuffleArray(sports))
    setShuffledGaming(shuffleArray(gaming))
    setShuffledAdventure(shuffleArray(adventure))
    setShuffledArt(shuffleArray(art))
    setShuffledWater(shuffleArray(water))
    setShuffledNight(shuffleArray(night))
    setShuffledKids(shuffleArray(kids))
    setShuffledCultural(shuffleArray(cultural))
    setShuffledLeisure(shuffleArray(leisure))
    setShuffledGroup(shuffleArray(group))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.id])

  function handleTagChange(tagName: string | null) {
    if (!tagName || !city) return
    const idMap: Record<string, string> = {
      'low budget fun activities': 'pocket-friendly',
      'sports activities': 'sports',
      'walks': 'city-walks',
      'gaming activities': 'gaming',
      'adventure activities': 'adventure',
      'art activities': 'art',
      'water activities': 'water',
      'night activities': 'night',
      'kids activities': 'kids',
      'unique cultural experiences': 'cultural',
      'leisure activities': 'leisure',
      'group activities': 'group'
    }

    const sectionId = idMap[tagName]
    if (sectionId) {
      const el = document.getElementById(sectionId)
      if (el) {
        const offset = 80 // offset for fixed header if any
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = el.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
      return
    }

    const tagMeta = TAG_META.find(t => t.name === tagName)
    if (tagMeta) {
      const tagSlug = tagMeta.slug.includes('activities') ? tagMeta.slug : `${tagMeta.slug}-activities`
      router.push(`/${citySlug}/activities/${tagSlug}-in-${city.id}`)
    }
  }

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
      <Hero city={city} />

      {/* ═══ 1. Mood Navigator ═════════════════════════════════════ */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '40px 0 60px' }}>
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
            What's your Mood?
          </h3>
        </div>
        <CategoryStrip activeTag={null} onTagChange={handleTagChange} cityId={city.id} featuredOnly={true} />
      </div>

      {/* ═══ 2. Low Budget Fun ════════════════════════════════════ */}
      {lowBudget.length > 0 && (
        <div id="pocket-friendly">
          <HScrollSection
            emoji="💰"
            heading="Pocket Friendly Activities"
            subheading="Find activities starting from ₹0"
            viewMoreHref={`/${citySlug}/activities/low-budget-fun-activities-in-${city.id}`}
          >
            {shuffledLowBudget.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 3. Sports ════════════════════════════════════════════ */}
      {sports.length > 0 && (
        <div id="sports">
          <HScrollSection
            emoji="⚽"
            heading="Burn some calories"
            subheading="Football, Cricket, Tennis, Pickleball, Swimming and many more"
            viewMoreHref={`/${citySlug}/activities/sports-activities-in-${city.id}`}
          >
            {shuffledSports.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 4. City Crawls ═══════════════════════════════════════ */}
      {cityWalks.length > 0 && (
        <div id="city-walks">
          <HScrollSection
            emoji="🚶"
            heading="City Crawls"
            viewMoreHref={`/${citySlug}/walks`}
          >
            {shuffledWalks.slice(0, 5).map(walk => (
              <div key={walk.id} style={walkCardStyle}>
                <WalkCard walk={walk} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 5. Gaming Activities ══════════════════════════════════ */}
      {gaming.length > 0 && (
        <div id="gaming">
          <HScrollSection
            emoji="🎮"
            heading="Have fun with your Gang"
            subheading="Laser tag, bowling, board games, RC gaming and many more"
            viewMoreHref={`/${citySlug}/activities/gaming-activities-in-${city.id}`}
          >
            {shuffledGaming.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 6. Adventure Activities ═══════════════════════════════ */}
      {adventure.length > 0 && (
        <div id="adventure">
          <HScrollSection
            emoji="🚀"
            heading="Activities for Adrenaline Junkies"
            viewMoreHref={`/${citySlug}/activities/adventure-activities-in-${city.id}`}
          >
            {shuffledAdventure.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 7. Art Activities ════════════════════════════════════ */}
      {art.length > 0 && (
        <div id="art">
          <HScrollSection
            emoji="🎨"
            heading="Activities for Art lovers"
            subheading="Pottery, Painting, DIY Workshops and more"
            viewMoreHref={`/${citySlug}/activities/art-activities-in-${city.id}`}
          >
            {shuffledArt.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 8. Water Activities ════════════════════════════════════ */}
      {water.length > 0 && (
        <div id="water">
          <HScrollSection
            emoji="🌊"
            heading="Water activities"
            subheading="Boating, Kayaking, Surfing and many more"
            viewMoreHref={`/${citySlug}/activities/water-activities-in-${city.id}`}
          >
            {shuffledWater.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 9. Night Activities ═══════════════════════════════════ */}
      {night.length > 0 && (
        <div id="night">
          <HScrollSection
            emoji="🌙"
            heading="Night activities"
            subheading="Dinner dates, Night-time sports and more"
            viewMoreHref={`/${citySlug}/activities/night-activities-in-${city.id}`}
          >
            {shuffledNight.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 10. Kids Activities ═══════════════════════════════════ */}
      {kids.length > 0 && (
        <div id="kids">
          <HScrollSection
            emoji="🎈"
            heading="Fun for Kids"
            subheading="Play zones, Parks and Educational Fun"
            viewMoreHref={`/${citySlug}/activities/kids-activities-in-${city.id}`}
          >
            {shuffledKids.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 11. Cultural Experiences ══════════════════════════════ */}
      {cultural.length > 0 && (
        <div id="cultural">
          <HScrollSection
            emoji="🏛️"
            heading="Cultural Experiences"
            subheading="Museums, Heritage sites and local culture"
            viewMoreHref={`/${citySlug}/activities/unique-cultural-experiences-in-${city.id}`}
          >
            {shuffledCultural.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 12. Leisure Activities ════════════════════════════════ */}
      {leisure.length > 0 && (
        <div id="leisure">
          <HScrollSection
            emoji="🏖️"
            heading="Leisure & Relaxation"
            subheading="Unwind with peaceful walks and scenic views"
            viewMoreHref={`/${citySlug}/activities/leisure-activities-in-${city.id}`}
          >
            {shuffledLeisure.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 13. Group Activities ══════════════════════════════════ */}
      {group.length > 0 && (
        <div id="group">
          <HScrollSection
            emoji="👥"
            heading="Fun with your Gang"
            subheading="Activities best enjoyed with friends"
            viewMoreHref={`/${citySlug}/activities/group-activities-in-${city.id}`}
          >
            {shuffledGroup.slice(0, 8).map(a => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 24px', marginTop: 80,
        textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
      }}>
        ⚡ <strong style={{ color: 'var(--text-2)' }}>TBOC</strong> — Things To Do {city.name} · Never be bored again · Made with ❤️ in {city.name}
      </footer>
    </main>
  )
}
