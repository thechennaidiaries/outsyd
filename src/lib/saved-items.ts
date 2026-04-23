import { ACTIVITIES } from '@/data/activities'

export type SavedItemType = 'activity' | 'walk' | 'event'

export interface SavedItem {
  type: SavedItemType
  slug: string
  citySlug: string
}

const SAVED_ITEMS_KEY = 'saved-items'
const LEGACY_SAVED_ACTIVITY_SLUGS_KEY = 'saved-place-slugs'
const SAVED_ITEMS_EVENT = 'saved-items-changed'

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isSavedItem(value: unknown): value is SavedItem {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'type' in value &&
      'slug' in value &&
      'citySlug' in value &&
      (value as SavedItem).type &&
      typeof (value as SavedItem).slug === 'string' &&
      typeof (value as SavedItem).citySlug === 'string'
  )
}

function normalizeSavedItems(value: unknown): SavedItem[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const normalized: SavedItem[] = []

  for (const item of value) {
    if (!isSavedItem(item)) continue

    const slug = item.slug.trim()
    const citySlug = item.citySlug.trim()
    if (!slug || !citySlug) continue

    const normalizedItem: SavedItem = {
      type: item.type,
      slug,
      citySlug,
    }

    const key = `${normalizedItem.type}:${normalizedItem.citySlug}:${normalizedItem.slug}`
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push(normalizedItem)
  }

  return normalized
}

function migrateLegacySavedActivities(): SavedItem[] {
  if (!canUseLocalStorage()) return []

  try {
    const raw = window.localStorage.getItem(LEGACY_SAVED_ACTIVITY_SLUGS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const legacyItems = parsed
      .filter((value): value is string => typeof value === 'string')
      .map(slug => slug.trim())
      .filter(Boolean)
      .map(slug => {
        const activity = ACTIVITIES.find(item => item.slug === slug)
        return {
          type: 'activity' as const,
          slug,
          citySlug: activity?.cityId ?? 'chennai',
        }
      })

    window.localStorage.removeItem(LEGACY_SAVED_ACTIVITY_SLUGS_KEY)
    return normalizeSavedItems(legacyItems)
  } catch {
    return []
  }
}

function notifySavedItemsChange(savedItems: SavedItem[]) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<SavedItem[]>(SAVED_ITEMS_EVENT, {
      detail: savedItems,
    })
  )
}

function writeSavedItems(savedItems: SavedItem[]) {
  if (!canUseLocalStorage()) return

  const normalized = normalizeSavedItems(savedItems)
  window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(normalized))
  notifySavedItemsChange(normalized)
}

export function getSavedItems(): SavedItem[] {
  if (!canUseLocalStorage()) return []

  try {
    const raw = window.localStorage.getItem(SAVED_ITEMS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const migratedLegacyItems = migrateLegacySavedActivities()
    const normalized = normalizeSavedItems([...normalizeSavedItems(parsed), ...migratedLegacyItems])

    if (!raw || JSON.stringify(parsed) !== JSON.stringify(normalized) || migratedLegacyItems.length > 0) {
      window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(normalized))
    }

    return normalized
  } catch {
    return migrateLegacySavedActivities()
  }
}

export function saveItem(item: SavedItem): SavedItem[] {
  const savedItems = getSavedItems()
  if (savedItems.some(savedItem => matchesSavedItem(savedItem, item))) return savedItems

  const nextSavedItems = [...savedItems, item]
  writeSavedItems(nextSavedItems)
  return nextSavedItems
}

export function removeItem(item: SavedItem): SavedItem[] {
  const nextSavedItems = getSavedItems().filter(savedItem => !matchesSavedItem(savedItem, item))
  writeSavedItems(nextSavedItems)
  return nextSavedItems
}

export function isItemSaved(item: SavedItem): boolean {
  return getSavedItems().some(savedItem => matchesSavedItem(savedItem, item))
}

export function matchesSavedItem(a: SavedItem, b: SavedItem) {
  return a.type === b.type && a.slug === b.slug && a.citySlug === b.citySlug
}

export { SAVED_ITEMS_EVENT, SAVED_ITEMS_KEY }
