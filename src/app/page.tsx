'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, X } from 'lucide-react'
import Hero from '@/components/Hero'
import ActivityCard from '@/components/ActivityCard'
import WalkCard from '@/components/WalkCard'
import EventCard from '@/components/EventCard'
import CategoryStrip from '@/components/CategoryStrip'
import HScrollSection from '@/components/HScrollSection'
import SpotlightCarousel from '@/components/SpotlightCarousel'
import BannerCarousel from '@/components/BannerCarousel'
import BentoGrid from '@/components/BentoGrid'
import { TAG_META } from '@/data/tags'
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
  const [loading, setLoading] = useState(true)

  // ── Data states ────────────────────────────────────────────────
  const [cityActivities, setCityActivities] = useState<Activity[]>([])
  const [cityEvents, setCityEvents] = useState<Event[]>([])
  const [cityWalks, setCityWalks] = useState<Walk[]>([])

  const [shuffledEvents, setShuffledEvents] = useState<Event[]>([])
  const [shuffledWalks, setShuffledWalks] = useState<Walk[]>([])

  // ── Shuffled Activity sections ───────────────────────────────
  const [shuffledNewlyAdded, setShuffledNewlyAdded] = useState<Activity[]>([])
  const [shuffledSports, setShuffledSports] = useState<Activity[]>([])
  const [shuffledGaming, setShuffledGaming] = useState<Activity[]>([])
  const [shuffledAdventure, setShuffledAdventure] = useState<Activity[]>([])
  const [shuffledArt, setShuffledArt] = useState<Activity[]>([])
  const [shuffledWater, setShuffledWater] = useState<Activity[]>([])
  const [shuffledCultural, setShuffledCultural] = useState<Activity[]>([])
  const [shuffledLeisure, setShuffledLeisure] = useState<Activity[]>([])
  const [shuffledGroup, setShuffledGroup] = useState<Activity[]>([])
  const [shuffledNight, setShuffledNight] = useState<Activity[]>([])

  // ── Search state ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchResults = searchQuery.trim().length >= 2
    ? cityActivities.filter(a => {
        const q = searchQuery.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          (a.location?.toLowerCase().includes(q)) ||
          (a.area?.toLowerCase().includes(q))
        )
      }).slice(0, 8)
    : []

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
      setCityEvents(events)
      setCityWalks(walks)
      setShuffledEvents(shuffleArray(events))
      setShuffledWalks(shuffleArray(walks))

      setShuffledNewlyAdded(shuffleArray(newActivities))
      setShuffledSports(shuffleArray(activities.filter(a => a.tags?.includes('sports activities'))))
      setShuffledGaming(shuffleArray(activities.filter(a => a.tags?.includes('gaming activities'))))
      setShuffledAdventure(shuffleArray(activities.filter(a => a.tags?.includes('adventure activities'))))
      setShuffledArt(shuffleArray(activities.filter(a => a.tags?.includes('art activities'))))
      setShuffledWater(shuffleArray(activities.filter(a => a.tags?.includes('water activities'))))
      setShuffledCultural(shuffleArray(activities.filter(a => a.tags?.includes('unique cultural experiences'))))
      setShuffledLeisure(shuffleArray(activities.filter(a => a.tags?.includes('leisure activities'))))
      setShuffledGroup(shuffleArray(activities.filter(a => a.tags?.includes('group activities'))))
      setShuffledNight(shuffleArray(activities.filter(a => a.tags?.includes('night activities'))))

      setLoading(false)
    }
    loadData()
  }, [citySlug])

  function handleTagChange(tagName: string | null) {
    if (!tagName || !city) return
    const idMap: Record<string, string> = {
      'sports activities': 'sports',
      'gaming activities': 'gaming',
      'adventure activities': 'adventure',
      'art activities': 'art',
      'water activities': 'water',
      'unique cultural experiences': 'cultural',
      'leisure activities': 'leisure',
      'group activities': 'group',
      'night activities': 'night'
    }

    const sectionId = idMap[tagName]
    if (sectionId) {
      const el = document.getElementById(sectionId)
      if (el) {
        window.scrollTo({ top: el.offsetTop - 140, behavior: 'smooth' })
      }
      return
    }

    const tagMeta = TAG_META.find(t => t.name === tagName)
    if (tagMeta) {
      const tagSlug = tagMeta.slug.includes('activities') ? tagMeta.slug : `${tagMeta.slug}-activities`
      router.push(`/${citySlug}/activities/${tagSlug}-in-${city.id}`)
    }
  }

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
    padding: '12px 0',
    fontSize: '15px',
    fontWeight: activeTab === id ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'none',
    color: activeTab === id ? 'var(--text)' : 'var(--text-3)',
    border: 'none',
    borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center',
    marginBottom: '-1px', 
  })

  return (
    <main style={{ paddingBottom: '100px' }}>
      {loading || !city ? (
        <div style={{ minHeight: '100vh' }} />
      ) : (
      <>
      <Hero city={city} />

      {/* ─── Tab Navigation (Justified Style) ─── */}
      <div style={{ 
        position: 'sticky', 
        top: 80, 
        zIndex: 40, 
        background: 'var(--bg)',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        marginTop: 0,
      }}>
        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto', 
          display: 'flex',
          width: '100%',
        }}>
          <button onClick={() => setActiveTab('activities')} style={tabButtonStyle('activities')}>Activities</button>
          <button onClick={() => setActiveTab('events')} style={tabButtonStyle('events')}>Events</button>
          <button onClick={() => setActiveTab('crawls')} style={tabButtonStyle('crawls')}>Walks</button>
          <button onClick={() => setActiveTab('games')} style={tabButtonStyle('games')}>Games</button>
        </div>
      </div>

      <div style={{ minHeight: '60vh', paddingTop: 0 }}>
        {/* ═══ ACTIVITIES TAB ════════════════════════════════════════ */}
        {activeTab === 'activities' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ═══ Mood Navigator & Search ═════════════════════════════ */}
            <div id="mood-navigator" style={{ borderBottom: '1px solid var(--border)', padding: '40px 0 60px' }}>
              <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', marginBottom: 24 }}>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  fontFamily: '"PP Neue Montreal", sans-serif'
                }}>
                  What&apos;s your Mood?
                </h3>
              </div>
              <CategoryStrip activeTag={null} onTagChange={handleTagChange} cityId={city.id} featuredOnly={true} tags={Array.from(new Set(cityActivities.flatMap(a => a.tags ?? [])))} />

              <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
                <div ref={searchRef} style={{ position: 'relative', margin: '0 auto', paddingTop: 24 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg-card)',
                    border: `1.5px solid ${isSearchFocused ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 14,
                    padding: '14px 18px',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(255,107,0,0.12)' : 'none',
                  }}>
                    <Search size={18} color={isSearchFocused ? 'var(--accent)' : 'var(--text-3)'} />
                    <input
                      type="text"
                      placeholder="Search boardgames, surfing, bowling..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', fontSize: 15 }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={14} color="var(--text-3)" />
                      </button>
                    )}
                  </div>

                  {isSearchFocused && searchQuery.trim().length >= 2 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 50,
                      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxHeight: 400, overflowY: 'auto'
                    }}>
                      {searchResults.length > 0 ? (
                        searchResults.map(a => (
                          <Link key={a.id} href={`/${citySlug}/activities/${a.slug}`} onClick={() => setIsSearchFocused(false)} style={{ display: 'flex', gap: 14, padding: '14px 18px', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <MapPin size={15} color="var(--accent)" />
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{a.title}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{a.location || a.area}</p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>No results found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ 2. Newly Added ═════════════════════════════════════════ */}
            {shuffledNewlyAdded.length > 0 && (
              <HScrollSection emoji="🆕" heading="Newly Added" viewMoreHref={`/${citySlug}/activities`} hideViewMore={true}>
                {shuffledNewlyAdded.map(a => (
                  <div key={a.id} style={cardStyle}>
                    <ActivityCard activity={a} citySlug={citySlug} />
                  </div>
                ))}
              </HScrollSection>
            )}

            {/* ═══ 3. Burn some calories ══════════════════════════════════ */}
            {shuffledSports.length > 0 && (
              <div id="sports">
                <HScrollSection emoji="⚽" heading="Burn some calories" viewMoreHref={`/${citySlug}/activities/sports-activities-in-${city.id}`}>
                  {shuffledSports.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 4. Have fun with your Gang ═════════════════════════════ */}
            {shuffledGaming.length > 0 && (
              <div id="gaming">
                <HScrollSection emoji="🎮" heading="Have fun with your Gang" viewMoreHref={`/${citySlug}/activities/gaming-activities-in-${city.id}`}>
                  {shuffledGaming.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 5. Activities for Adrenaline Junkies ═══════════════════ */}
            {shuffledAdventure.length > 0 && (
              <div id="adventure">
                <HScrollSection emoji="🚀" heading="Activities for Adrenaline Junkies" viewMoreHref={`/${citySlug}/activities/adventure-activities-in-${city.id}`}>
                  {shuffledAdventure.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 6. Activities for Art lovers ═══════════════════════════ */}
            {shuffledArt.length > 0 && (
              <div id="art">
                <HScrollSection emoji="🎨" heading="Activities for Art lovers" viewMoreHref={`/${citySlug}/activities/art-activities-in-${city.id}`}>
                  {shuffledArt.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 7. Water Activities ════════════════════════════════════ */}
            {shuffledWater.length > 0 && (
              <div id="water">
                <HScrollSection emoji="🌊" heading="Water activities" viewMoreHref={`/${citySlug}/activities/water-activities-in-${city.id}`}>
                  {shuffledWater.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 8. Cultural Experiences ════════════════════════════════ */}
            {shuffledCultural.length > 0 && (
              <div id="cultural">
                <HScrollSection emoji="🏛️" heading="Cultural Experiences" viewMoreHref={`/${citySlug}/activities/cultural-experiences-in-${city.id}`}>
                  {shuffledCultural.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 8. Leisure & Relaxation ════════════════════════════════ */}
            {shuffledLeisure.length > 0 && (
              <div id="leisure">
                <HScrollSection emoji="🏖️" heading="Leisure & Relaxation" viewMoreHref={`/${citySlug}/activities/leisure-activities-in-${city.id}`}>
                  {shuffledLeisure.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 9. Fun with your Gang ══════════════════════════════════ */}
            {shuffledGroup.length > 0 && (
              <div id="group">
                <HScrollSection emoji="👥" heading="Fun with your Gang" viewMoreHref={`/${citySlug}/activities/group-activities-in-${city.id}`}>
                  {shuffledGroup.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}

            {/* ═══ 10. Night activities ═══════════════════════════════════ */}
            {shuffledNight.length > 0 && (
              <div id="night">
                <HScrollSection emoji="🌙" heading="Night activities" viewMoreHref={`/${citySlug}/activities/night-activities-in-${city.id}`}>
                  {shuffledNight.slice(0, 8).map(a => (
                    <div key={a.id} style={cardStyle}>
                      <ActivityCard activity={a} citySlug={citySlug} />
                    </div>
                  ))}
                </HScrollSection>
              </div>
            )}
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
