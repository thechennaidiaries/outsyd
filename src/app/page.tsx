'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Hero from '@/components/Hero'
import ActivityCard from '@/components/ActivityCard'
import WalkCard from '@/components/WalkCard'
import EventCard from '@/components/EventCard'
import SpotlightCarousel from '@/components/SpotlightCarousel'
import BannerCarousel from '@/components/BannerCarousel'
import BentoGrid from '@/components/BentoGrid'
import HScrollSection from '@/components/HScrollSection'
import { getActivitiesByCity, getNewlyAddedActivities } from '@/data/activities'
import { getWalksByCity } from '@/data/walks'
import { getEventsByCity } from '@/data/events'
import { getCityBySlug } from '@/data/cities'

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
export default function RootPage() {
  const router = useRouter()
  const citySlug = 'chennai'
  const city = getCityBySlug(citySlug)!

  const cityActivities = getActivitiesByCity(city.id)
  const cityWalks = getWalksByCity(city.id)
  const cityEvents = getEventsByCity(city.id)

  // Newly added activities (last 7 days)
  const newlyAdded = getNewlyAddedActivities(city.id, 7).slice(0, 15)

  // Curated sections (those remaining on home page)
  const lowBudget = cityActivities.filter(a => a.tags?.includes('low budget fun activities'))

  // Shuffled state
  const [shuffledWalks, setShuffledWalks] = useState(cityWalks)
  const [shuffledLowBudget, setShuffledLowBudget] = useState(lowBudget)
  const [shuffledEvents, setShuffledEvents] = useState(cityEvents)

  useEffect(() => {
    setShuffledWalks(shuffleArray(cityWalks))
    setShuffledLowBudget(shuffleArray(lowBudget))
    setShuffledEvents(shuffleArray(cityEvents))
  }, [city.id])

  const cardStyle: React.CSSProperties = {
    minWidth: 220,
    maxWidth: 260,
    flexShrink: 0,
    scrollSnapAlign: 'start',
  }

  const walkCardStyle: React.CSSProperties = {
    minWidth: 330,
    maxWidth: 390,
    flexShrink: 0,
    scrollSnapAlign: 'start',
  }

  return (
    <main style={{ paddingBottom: '100px' }}>
      <Hero city={city} />

      {/* ═══ 1.4. Spotlight Carousel ═══════════════════════════════ */}
      {newlyAdded.length > 0 && (
        <div id="spotlight" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 48 }}>
          <SpotlightCarousel
            activities={newlyAdded}
            citySlug={citySlug}
            heading="🔥 Trending in Chennai"
            subheading="Hot activities this week in chennai"
          />
        </div>
      )}

      {/* ═══ 1.7. Events ═══════════════════════════════════════════ */}
      {cityEvents.length > 0 && (
        <div id="upcoming-events">
          <HScrollSection
            emoji="🎪"
            heading="Events this Weekend"
            subheading="Workshops, Mixers, Runs and much more"
            viewMoreHref={`/${citySlug}/events`}
          >
            {shuffledEvents.slice(0, 7).map(e => (
              <div key={e.id} style={cardStyle}>
                <EventCard event={e} citySlug={citySlug} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 1.44. Custom Banner Carousel ════════════════════════ */}
      <BannerCarousel
        heading="Looking for something fun?"
        subheading="Adventure, Gaming, water & night activities in Chennai"
        items={[
          {
            id: 'banner-a-1',
            image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604252228%201.png',
            link: `/${citySlug}/activities/gaming-activities-in-${citySlug}`,
          },
          {
            id: 'banner-a-2',
            image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604261026%201.png',
            link: `/${citySlug}/activities/sports-activities-in-${citySlug}`,
          },
          {
            id: 'banner-a-3',
            image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604252234%201.png',
            link: `/${citySlug}/activities/night-activities-in-${citySlug}`,
          },
          {
            id: 'banner-a-4',
            image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604261027%201.png',
            link: `/${citySlug}/activities/night-activities-in-${citySlug}`,
          },
          {
            id: 'banner-a-5',
            image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604261105%201.png',
            link: `/${citySlug}/activities/adventure-activities-in-${citySlug}`,
          },
        ]}
      />

      {/* ═══ "I'm Bored" CTA Strip ═══════════════════════════════ */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 28px 0' }}>
        <Link
          href={`/${citySlug}/surprise`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 40%, #FF9A3C 70%, #FF6B00 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 24px rgba(255, 107, 0, 0.35), 0 0 0 1px rgba(255, 107, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'hero-shine 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 28 }}>🫠</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"PP Neue Montreal", sans-serif',
                letterSpacing: '-0.01em',
              }}>
                I&apos;m bored Button
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: '"PP Neue Montreal", sans-serif',
              }}>
                Can&apos;t decide where to go? Hit me
              </span>
            </div>
          </div>

          <div className="bounce-arrow" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontSize: 20,
              color: '#ffffff',
              fontWeight: 700,
            }}>→</span>
          </div>
        </Link>
      </div>

      {/* ═══ 2. Low Budget Fun ════════════════════════════════════ */}
      {lowBudget.length > 0 && (
        <div id="pocket-friendly">
          <HScrollSection
            emoji="💰"
            heading="If you're tight on budget"
            subheading="Find activities starting from ₹0"
            viewMoreHref={`/${citySlug}/activities/low-budget-fun-activities-in-${city.id}`}
          >
            {shuffledLowBudget.slice(0, 8).map((a, index) => (
              <div key={a.id} style={cardStyle}>
                <ActivityCard activity={a} citySlug={citySlug} eager={index < 3} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 3. City Crawls ═══════════════════════════════════════ */}
      {cityWalks.length > 0 && (
        <div id="city-walks">
          <HScrollSection
            emoji="🚶"
            heading="City crawls to explore Chennai"
            viewMoreHref={`/${citySlug}/walks`}
          >
            {shuffledWalks.slice(0, 5).map((walk, index) => (
              <div key={walk.id} style={walkCardStyle}>
                <WalkCard walk={walk} citySlug={citySlug} eager={index < 2} />
              </div>
            ))}
          </HScrollSection>
        </div>
      )}

      {/* ═══ 1.45. Bento Grid — Going out with Friends? ═══════════ */}
      <BentoGrid 
        citySlug={citySlug} 
        heading="❤️ Activities based on your vibe"
        subheading="Explore Art, Culture and Chennai's Heritage"
      />



    </main>
  )
}
