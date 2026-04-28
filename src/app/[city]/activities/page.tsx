'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, X } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import CategoryStrip from '@/components/CategoryStrip'
import HScrollSection from '@/components/HScrollSection'
import { getActivitiesByCity, getNewlyAddedActivities, TAG_META } from '@/data/activities'
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

export default function ActivitiesPage() {
  const params = useParams()
  const router = useRouter()
  const citySlug = params.city as string
  const city = getCityBySlug(citySlug)!

  const cityActivities = getActivitiesByCity(city.id)

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

  // Newly added activities (last 7 days)
  const newlyAdded = getNewlyAddedActivities(city.id, 7).slice(0, 15)
  const [shuffledNewlyAdded, setShuffledNewlyAdded] = useState(newlyAdded)

  // Curated sections (base lists)
  const sports = cityActivities.filter(a => a.tags?.includes('sports activities'))
  const gaming = cityActivities.filter(a => a.tags?.includes('gaming activities'))
  const adventure = cityActivities.filter(a => a.tags?.includes('adventure activities'))
  const art = cityActivities.filter(a => a.tags?.includes('art activities'))
  const water = cityActivities.filter(a => a.tags?.includes('water activities'))
  const cultural = cityActivities.filter(a => a.tags?.includes('unique cultural experiences'))
  const leisure = cityActivities.filter(a => a.tags?.includes('leisure activities'))
  const group = cityActivities.filter(a => a.tags?.includes('group activities'))
  const night = cityActivities.filter(a => a.tags?.includes('night activities'))

  // Shuffled state
  const [shuffledSports, setShuffledSports] = useState(sports)
  const [shuffledGaming, setShuffledGaming] = useState(gaming)
  const [shuffledAdventure, setShuffledAdventure] = useState(adventure)
  const [shuffledArt, setShuffledArt] = useState(art)
  const [shuffledWater, setShuffledWater] = useState(water)
  const [shuffledCultural, setShuffledCultural] = useState(cultural)
  const [shuffledLeisure, setShuffledLeisure] = useState(leisure)
  const [shuffledGroup, setShuffledGroup] = useState(group)
  const [shuffledNight, setShuffledNight] = useState(night)

  useEffect(() => {
    setShuffledNewlyAdded(shuffleArray(newlyAdded))
    setShuffledSports(shuffleArray(sports))
    setShuffledGaming(shuffleArray(gaming))
    setShuffledAdventure(shuffleArray(adventure))
    setShuffledArt(shuffleArray(art))
    setShuffledWater(shuffleArray(water))
    setShuffledCultural(shuffleArray(cultural))
    setShuffledLeisure(shuffleArray(leisure))
    setShuffledGroup(shuffleArray(group))
    setShuffledNight(shuffleArray(night))
  }, [city.id])

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
        window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
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

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '100px', background: 'var(--bg)' }}>
      {/* ─── 1. Header (Spacer) ─── */}
      <div style={{ height: 80 }} />

      {/* ═══ 1. Mood Navigator & Search ═════════════════════════════ */}
      <div id="mood-navigator" style={{ borderBottom: '1px solid var(--border)', padding: '40px 0 60px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', marginBottom: 24 }}>
          <h3 style={{
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            fontFamily: '"PP Neue Montreal", sans-serif'
          }}>
            What's your Mood?
          </h3>
        </div>
        <CategoryStrip activeTag={null} onTagChange={handleTagChange} cityId={city.id} featuredOnly={true} />

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
      {newlyAdded.length > 0 && (
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
          <HScrollSection emoji="🏛️" heading="Cultural Experiences" viewMoreHref={`/${citySlug}/activities/unique-cultural-experiences-in-${city.id}`}>
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

    </main>
  )
}
