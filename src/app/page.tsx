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
import type { Activity } from '@/data/activities'
import type { Walk } from '@/data/walks'
import type { Event } from '@/data/events'
import type { City } from '@/data/cities'
import {
  fetchCityBySlug,
  fetchActivitiesByCity,
  fetchNewlyAddedActivities,
  fetchWalksByCity,
  fetchEventsByCity,
} from '@/lib/supabase-data'

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

  const [activeTab, setActiveTab] = useState<'activities' | 'events' | 'crawls' | 'games'>('activities')
  const [city, setCity] = useState<City | null>(null)
  const [newlyAdded, setNewlyAdded] = useState<Activity[]>([])
  const [shuffledEvents, setShuffledEvents] = useState<Event[]>([])
  const [shuffledLowBudget, setShuffledLowBudget] = useState<Activity[]>([])
  const [shuffledWalks, setShuffledWalks] = useState<Walk[]>([])
  const [cityEvents, setCityEvents] = useState<Event[]>([])
  const [cityWalks, setCityWalks] = useState<Walk[]>([])
  const [cityActivities, setCityActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [cityData, activities, newActivities, walks, events] = await Promise.all([
        fetchCityBySlug(citySlug),
        fetchActivitiesByCity(citySlug),
        fetchNewlyAddedActivities(citySlug, 15),
        fetchWalksByCity(citySlug),
        fetchEventsByCity(citySlug),
      ])
      if (cityData) setCity(cityData)
      setCityActivities(activities)
      setNewlyAdded(newActivities)
      const lowBudget = activities.filter(a => a.tags?.includes('low budget fun activities'))
      setShuffledLowBudget(shuffleArray(lowBudget))
      setShuffledWalks(shuffleArray(walks))
      setShuffledEvents(shuffleArray(events))
      setCityEvents(events)
      setCityWalks(walks)
      setLoading(false)
    }
    loadData()
  }, [citySlug])

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

  const tabButtonStyle = (id: string): React.CSSProperties => ({
    padding: '12px 20px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: activeTab === id ? 700 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: activeTab === id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
    color: activeTab === id ? '#fff' : 'var(--text-3)',
    border: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  })

  return (
    <main style={{ paddingBottom: '100px' }}>
      {loading || !city ? (
        <div style={{ minHeight: '100vh' }} />
      ) : (
      <>
      <Hero city={city} />

      {/* ─── Tab Navigation ─── */}
      <div style={{ 
        position: 'sticky', 
        top: 80, 
        zIndex: 40, 
        background: 'rgba(10,10,14,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        marginTop: -1, // overlap hero bottom
      }}>
        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto', 
          padding: '0 28px',
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          <button onClick={() => setActiveTab('activities')} style={tabButtonStyle('activities')}>Activities</button>
          <button onClick={() => setActiveTab('events')} style={tabButtonStyle('events')}>Events</button>
          <button onClick={() => setActiveTab('crawls')} style={tabButtonStyle('crawls')}>Crawls</button>
          <button onClick={() => setActiveTab('games')} style={tabButtonStyle('games')}>Games</button>
        </div>
      </div>

      <div style={{ minHeight: '60vh', paddingTop: 20 }}>
        {/* ═══ ACTIVITIES TAB ════════════════════════════════════════ */}
        {activeTab === 'activities' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  link: `/${citySlug}/activities/water-activities-in-${citySlug}`,
                },
                {
                  id: 'banner-a-5',
                  image: 'https://ik.imagekit.io/zxnq8x4yz/Design_one_card_202604261105%201.png',
                  link: `/${citySlug}/activities/adventure-activities-in-${citySlug}`,
                },
              ]}
            />

            {shuffledLowBudget.length > 0 && (
              <div id="pocket-friendly">
                <HScrollSection
                  emoji="💰"
                  heading="If you're tight on budget"
                  subheading="Find activities starting from ₹0"
                  viewMoreHref={`/${citySlug}/activities/low-budget-fun-activities-in-${citySlug}`}
                >
                  {shuffledLowBudget.slice(0, 8).map((a, index) => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} eager={index < 3} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            <BentoGrid 
              citySlug={citySlug} 
              heading="❤️ Activities based on your vibe"
              subheading="Explore Art, Culture and Chennai's Heritage"
            />

            {/* Additional Categories from Activities Page */}
            <HScrollSection
              emoji="⚽"
              heading="Burn some calories"
              viewMoreHref={`/${citySlug}/activities/sports-activities-in-${citySlug}`}
            >
              {shuffleArray(cityActivities.filter(a => a.tags?.includes('sports activities'))).slice(0, 8).map(a => (
                <div key={a.id} style={cardStyle}>
                  <ActivityCard activity={a} citySlug={citySlug} />
                </div>
              ))}
            </HScrollSection>

            <HScrollSection
              emoji="🎮"
              heading="Have fun with your Gang"
              viewMoreHref={`/${citySlug}/activities/gaming-activities-in-${citySlug}`}
            >
              {shuffleArray(cityActivities.filter(a => a.tags?.includes('gaming activities'))).slice(0, 8).map(a => (
                <div key={a.id} style={cardStyle}>
                  <ActivityCard activity={a} citySlug={citySlug} />
                </div>
              ))}
            </HScrollSection>

            <HScrollSection
              emoji="🚀"
              heading="Activities for Adrenaline Junkies"
              viewMoreHref={`/${citySlug}/activities/adventure-activities-in-${citySlug}`}
            >
              {shuffleArray(cityActivities.filter(a => a.tags?.includes('adventure activities'))).slice(0, 8).map(a => (
                <div key={a.id} style={cardStyle}>
                  <ActivityCard activity={a} citySlug={citySlug} />
                </div>
              ))}
            </HScrollSection>
          </div>
        )}

        {/* ═══ EVENTS TAB ════════════════════════════════════════════ */}
        {activeTab === 'events' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500">
            {cityEvents.length > 0 ? (
              <div id="upcoming-events" style={{ padding: '20px 0' }}>
                <HScrollSection
                  emoji="🎪"
                  heading="Events this Weekend"
                  subheading="Workshops, Mixers, Runs and much more"
                  viewMoreHref={`/${citySlug}/events`}
                >
                  {shuffledEvents.slice(0, 10).map(e => (
                    <div key={e.id} style={cardStyle}>
                      <EventCard event={e} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
                
                {/* Additional sections for events if needed */}
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center' }}>
                    See all upcoming events in <Link href={`/${citySlug}/events`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{city.name} &rarr;</Link>
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-3)' }}>
                <p>No major events this week. Check back later!</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ CRAWLS TAB ════════════════════════════════════════════ */}
        {activeTab === 'crawls' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500">
            {cityWalks.length > 0 ? (
              <div id="city-walks" style={{ padding: '20px 0' }}>
                <HScrollSection
                  emoji="🚶"
                  heading="City crawls to explore Chennai"
                  subheading="Curated trails and hidden spots"
                  viewMoreHref={`/${citySlug}/walks`}
                >
                  {shuffledWalks.slice(0, 10).map((walk, index) => (
                    <div key={walk.id} style={walkCardStyle}>
                      <WalkCard walk={walk} citySlug={citySlug} eager={index < 2} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-3)' }}>
                <p>No walks available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ GAMES TAB ═════════════════════════════════════════════ */}
        {activeTab === 'games' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ padding: '40px 28px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Daily Challenges</h2>
              <p style={{ color: 'var(--text-3)', marginBottom: 32 }}>Test your city knowledge with our daily games.</p>
              
              <div style={{ maxWidth: 500 }}>
                <Link
                  href={`/${citySlug}/games/routethala`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 40%, #FF9A3C 70%, #FF6B00 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 4s ease infinite',
                    textDecoration: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 8px 32px rgba(255, 107, 0, 0.35)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: 32 }}>📍</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Route Thala</span>
                      <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>Guess today&apos;s mystery spot</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 24, color: '#fff', fontWeight: 800 }}>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      </>
      )}

    </main>
  )
}
