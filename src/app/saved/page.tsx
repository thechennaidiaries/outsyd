'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, CalendarPlus } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import EventCard from '@/components/EventCard'
import WalkCard from '@/components/WalkCard'
import type { Activity } from '@/data/activities'
import type { Event } from '@/data/events'
import type { Walk } from '@/data/walks'
import { fetchAllActivities, fetchAllEvents, fetchAllWalks } from '@/lib/supabase-data'
import { useSavedItems } from '@/hooks/useSavedItems'
import type { SavedItem } from '@/lib/saved-items'

export default function SavedPage() {
  const { savedItems } = useSavedItems()
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [allWalks, setAllWalks] = useState<Walk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [activities, events, walks] = await Promise.all([
        fetchAllActivities(),
        fetchAllEvents(),
        fetchAllWalks(),
      ])
      setAllActivities(activities)
      setAllEvents(events)
      setAllWalks(walks)
      setLoading(false)
    }
    loadData()
  }, [])

  const resolvedSavedItems = savedItems
    .map(item => resolveSavedItem(item, allActivities, allEvents, allWalks))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const missingItems = savedItems.filter(
    item =>
      !resolvedSavedItems.some(
        resolvedItem =>
          resolvedItem.savedItem.type === item.type &&
          resolvedItem.savedItem.slug === item.slug &&
          resolvedItem.savedItem.citySlug === item.citySlug
      )
  )

  if (loading) return <main style={{ minHeight: '100vh', paddingTop: 100, background: 'var(--bg)' }} />

  return (
    <main style={{ minHeight: '100vh', paddingTop: 100, background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-3)',
            textDecoration: 'none',
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            My bucketlist
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-3)' }}>
            Your saved activities, walks, and events stay on this device only.
          </p>
        </div>

        {savedItems.length === 0 ? (
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <Bookmark size={28} style={{ margin: '0 auto 14px', color: 'var(--accent)' }} />
            <p style={{ margin: 0, color: 'var(--text)', fontWeight: 700 }}>No saved items yet</p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-3)', fontSize: 14 }}>
              Tap Save on any activity, walk, or event and it will show up here.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
              {savedItems.length} {savedItems.length === 1 ? 'saved item' : 'saved items'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
              {resolvedSavedItems.map(item => (
                <div key={`${item.type}-${item.data.slug}`} style={{ display: 'flex', flexDirection: 'column' }}>
                  {item.type === 'activity' ? (
                    <ActivityCard activity={item.data} citySlug={item.savedItem.citySlug} />
                  ) : item.type === 'walk' ? (
                    <WalkCard walk={item.data} citySlug={item.savedItem.citySlug} />
                  ) : (
                    <EventCard event={item.data} citySlug={item.savedItem.citySlug} />
                  )}
                  <button
                    onClick={() => {
                      const slug = item.data.slug
                      const type = item.type
                      window.location.href = `/${item.savedItem.citySlug}/plan?add=${type}:${slug}`
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '11px 16px', marginTop: 8,
                      background: 'transparent',
                      border: '1.5px solid rgba(255,107,0,0.35)',
                      borderRadius: 12,
                      color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,0,0.55)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,0,0.35)' }}
                  >
                    <CalendarPlus size={14} />
                    Add to Plan
                  </button>
                </div>
              ))}
            </div>

            {missingItems.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                  Saved items without matching cards
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {missingItems.map(item => (
                    <span
                      key={`${item.type}-${item.citySlug}-${item.slug}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-2)',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {item.type}: {item.slug}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function resolveSavedItem(item: SavedItem, activities: Activity[], events: Event[], walks: Walk[]) {
  if (item.type === 'activity') {
    const data = activities.find(activity => activity.slug === item.slug && activity.cityId === item.citySlug)
    if (!data) return null
    return { type: 'activity' as const, data, savedItem: item }
  }

  if (item.type === 'walk') {
    const data = walks.find(walk => walk.slug === item.slug && walk.cityId === item.citySlug)
    if (!data) return null
    return { type: 'walk' as const, data, savedItem: item }
  }

  const data = events.find(event => event.slug === item.slug && event.cityId === item.citySlug)
  if (!data) return null
  return { type: 'event' as const, data, savedItem: item }
}
