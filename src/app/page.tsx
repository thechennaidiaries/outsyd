'use client'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, X, Calendar, Filter as FilterIcon } from 'lucide-react'
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
  fetchCategoriesByCity,
} from '@/lib/supabase-data'

/* ── IST date helpers ─────────────────────────────────────────────── */
function getTodayIST(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
  return f.format(new Date()) // returns YYYY-MM-DD
}

function addDaysIST(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00+05:30')
  d.setDate(d.getDate() + days)
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
  return f.format(d)
}

function getDayOfWeekIST(): number {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' })
  const day = f.format(new Date())
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
}

function getDateRangeForFilter(filter: string): string[] | null {
  if (filter === 'all') return null
  const today = getTodayIST()
  const dow = getDayOfWeekIST()

  if (filter === 'today') return [today]
  if (filter === 'tomorrow') return [addDaysIST(today, 1)]

  if (filter === 'this-weekend') {
      const daysToFri = (5 - dow + 7) % 7
      const fri = addDaysIST(today, daysToFri)
      const sat = addDaysIST(fri, 1)
      const sun = addDaysIST(fri, 2)
      return [fri, sat, sun]
  }

  if (filter === 'next-weekend') {
      let daysToThisFri = (5 - dow + 7) % 7
      const daysToNextFri = daysToThisFri + 7
      const fri = addDaysIST(today, daysToNextFri)
      const sat = addDaysIST(fri, 1)
      const sun = addDaysIST(fri, 2)
      return [fri, sat, sun]
  }
  return null
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
  const [allCategories, setAllCategories] = useState<string[]>([])

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

  // ── Search & Filter state ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [selectedPricing, setSelectedPricing] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return []
    const q = searchQuery.toLowerCase()

    const pool = [
      ...cityActivities.map(a => ({ ...a, type: 'activity' as const })),
      ...cityEvents.map(e => ({ ...e, type: 'event' as const })),
      ...cityWalks.map(w => ({ ...w, type: 'walk' as const })),
    ]

    return pool.filter(item => 
      item.title.toLowerCase().includes(q) ||
      (item.location?.toLowerCase().includes(q)) ||
      (item.area?.toLowerCase().includes(q))
    ).slice(0, 10)
  }, [searchQuery, cityActivities, cityEvents, cityWalks])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function loadData() {
      const [cityData, activities, newActivities, walks, events, categories] = await Promise.all([
        fetchCityBySlug(citySlug),
        fetchActivitiesByCity(citySlug),
        fetchNewlyAddedActivities(citySlug, 15),
        fetchWalksByCity(citySlug),
        fetchEventsByCity(citySlug),
        fetchCategoriesByCity(citySlug),
      ])
      if (cityData) setCity(cityData)
      setCityActivities(activities)
      setCityEvents(events)
      setCityWalks(walks)
      setAllCategories(categories)
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

  const filteredEvents = useMemo(() => {
    const dateRange = getDateRangeForFilter(selectedDate)
    return shuffledEvents.filter(e => {
        if (dateRange && !dateRange.includes(e.date)) return false
        if (selectedPricing !== 'all' && e.pricingType !== selectedPricing) return false
        if (selectedCategory !== 'all' && !e.categories?.includes(selectedCategory)) return false
        return true
    })
  }, [shuffledEvents, selectedDate, selectedPricing, selectedCategory])

  const hasActiveFilters = selectedDate !== 'all' || selectedPricing !== 'all' || selectedCategory !== 'all'
  const clearFilters = () => {
      setSelectedDate('all')
      setSelectedPricing('all')
      setSelectedCategory('all')
  }

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

      {/* ─── Global Sticky Header (Search + Tabs) ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Search Bar */}
        <div style={{ padding: '20px 28px 12px' }}>
          <div ref={searchRef} style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-card)',
              border: `1.5px solid ${isSearchFocused ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '12px 18px',
              transition: 'all 0.25s ease',
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(255,107,0,0.12)' : 'none',
            }}>
              <Search size={18} color={isSearchFocused ? 'var(--accent)' : 'var(--text-3)'} />
              <input
                type="text"
                placeholder="Search activities, events or city crawls..."
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
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 60,
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)', maxHeight: 400, overflowY: 'auto'
              }}>
                {searchResults.length > 0 ? (
                  searchResults.map(item => {
                    const href = item.type === 'activity' 
                      ? `/${citySlug}/activities/${item.slug}`
                      : item.type === 'event'
                        ? `/${citySlug}/events/${item.slug}`
                        : `/${citySlug}/walks/${item.slug}`

                    const typeLabel = item.type === 'activity' ? 'Activity' : item.type === 'event' ? 'Event' : 'Walk'

                    return (
                      <Link key={item.id} href={href} onClick={() => setIsSearchFocused(false)} style={{ display: 'flex', gap: 14, padding: '14px 18px', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={15} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.title}</p>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: 4 }}>{typeLabel}</span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{item.location || item.area}</p>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto', 
          display: 'flex',
          width: '100%',
          padding: '0 16px',
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
            
            {/* ═══ Mood Navigator ═══════════════════════════════════════ */}
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
            {/* ── Filter Bar ── */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 0' }}>
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '24px',
                }}>
                    {/* Date Filter Dropdown */}
                    <div style={{ flex: '1 1 200px', minWidth: 200 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <Calendar size={11} style={{ marginRight: 6 }} /> When
                        </label>
                        <select 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                            }}
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="this-weekend">This Weekend</option>
                            <option value="next-weekend">Next Weekend</option>
                        </select>
                    </div>

                    {/* Pricing Dropdown */}
                    <div style={{ flex: '1 1 180px', minWidth: 150 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <span style={{ marginRight: 6 }}>💰</span> Pricing
                        </label>
                        <select 
                            value={selectedPricing}
                            onChange={(e) => setSelectedPricing(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                            }}
                        >
                            <option value="all">All Pricing</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    {/* Category Dropdown */}
                    <div style={{ flex: '1 1 180px', minWidth: 150 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <span style={{ marginRight: 6 }}>🏷️</span> Category
                        </label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                                textTransform: 'capitalize'
                            }}
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div style={{ flexShrink: 0, paddingBottom: 2 }}>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '12px 20px', borderRadius: 100,
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                                color: '#f87171', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }} className="hover:bg-[rgba(248,113,113,0.15)]">
                                <X size={14} /> Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Events Grid ── */}
            <div id="events-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: 'var(--text)',
                    }}>
                        <span>🎪</span>
                        {hasActiveFilters ? 'Filtered Events' : 'All Events'}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </span>
                </div>

                {filteredEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '64px 24px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius)',
                        border: '1.5px dashed var(--border)',
                    }}>
                        <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                            No events found
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
                            {hasActiveFilters
                                ? 'Try adjusting your filters to see more events.'
                                : `We're still curating events for ${city.name}. Check back soon!`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} citySlug={citySlug} />
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}

        {/* ═══ WALKS TAB ════════════════════════════════════════════ */}
        {activeTab === 'crawls' && (
          <div className="tab-content animate-in fade-in slide-in-from-bottom-4 duration-500">
            {cityWalks.length > 0 ? (
              <div id="city-walks" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 24 }}>
                  {shuffledWalks.map((walk, index) => (
                    <WalkCard key={walk.id} walk={walk} citySlug={citySlug} eager={index < 3} />
                  ))}
                </div>
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
