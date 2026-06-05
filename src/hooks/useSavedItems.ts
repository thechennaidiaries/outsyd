'use client'

import { useEffect, useState } from 'react'
import {
  getSavedItems,
  writeSavedItems,
  isItemSaved as checkIsItemSaved,
  removeItem as removeStoredItem,
  saveItem as saveStoredItem,
  SAVED_ITEMS_EVENT,
  type SavedItem,
} from '@/lib/saved-items'

// ── Background DB sync helpers ─────────────────────────────────────────────────
// Fire-and-forget. If user has a session cookie the API saves to DB.
// If not logged in (401), silently ignored — item stays in localStorage.

function syncSaveToDb(item: SavedItem) {
  fetch('/api/account/save-item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).catch(() => {})
}

function syncRemoveFromDb(item: SavedItem) {
  fetch('/api/account/save-item', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).catch(() => {})
}

// ── Module-level fetch deduplication ─────────────────────────────────────────
// Many SaveItemButtons can exist on one page — we only want ONE API call,
// not one per button. This singleton ensures that.

let _fetchPromise:  Promise<SavedItem[]> | null = null
let _lastFetchedAt: number = 0
const FETCH_COOLDOWN_MS = 30_000   // re-fetch at most once every 30 s

function fetchDbItems(): Promise<SavedItem[]> {
  const now = Date.now()
  // Return cached promise if a fetch is already in-flight or recently done
  if (_fetchPromise && now - _lastFetchedAt < FETCH_COOLDOWN_MS) {
    return _fetchPromise
  }
  _lastFetchedAt = now
  _fetchPromise = fetch('/api/account/saves')
    .then(r => {
      if (!r.ok) return []          // 401 / 403 → not logged in, skip silently
      return r.json().then(({ items }: { items: SavedItem[] }) =>
        Array.isArray(items) ? items : []
      )
    })
    .catch(() => [])
    .finally(() => {
      // Allow a fresh fetch after cooldown
      setTimeout(() => { _fetchPromise = null }, FETCH_COOLDOWN_MS)
    })
  return _fetchPromise
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSavedItems() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])

  useEffect(() => {
    // 1. Load localStorage immediately — instant UI on same device
    const localItems = getSavedItems()
    setSavedItems(localItems)

    // 2. Fetch from DB once (deduplicated) — hydrates new devices
    fetchDbItems().then(dbItems => {
      if (dbItems.length === 0) return

      // Merge: DB items are source of truth, keep any local-only items too
      const localSet = new Set(localItems.map(i => `${i.type}:${i.citySlug}:${i.slug}`))
      const merged = [...localItems]

      for (const dbItem of dbItems) {
        const key = `${dbItem.type}:${dbItem.citySlug}:${dbItem.slug}`
        if (!localSet.has(key)) merged.push(dbItem)
      }

      if (merged.length !== localItems.length) {
        writeSavedItems(merged)
        setSavedItems(merged)
      }
    })

    function syncSavedItems() { setSavedItems(getSavedItems()) }
    function handleStorage(event: StorageEvent) {
      if (event.key && event.key !== 'saved-items') return
      syncSavedItems()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(SAVED_ITEMS_EVENT, syncSavedItems)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(SAVED_ITEMS_EVENT, syncSavedItems)
    }
  }, [])

  function saveItem(item: SavedItem) {
    // 1. Optimistic localStorage update — instant UI, no flicker
    const nextSavedItems = saveStoredItem(item)
    setSavedItems(nextSavedItems)
    // 2. Background DB sync — saves to DB if logged in, silently ignored if not
    syncSaveToDb(item)
  }

  function removeItem(item: SavedItem) {
    // 1. Optimistic localStorage update — instant UI, no flicker
    const nextSavedItems = removeStoredItem(item)
    setSavedItems(nextSavedItems)
    // 2. Background DB sync — removes from DB if logged in, silently ignored if not
    syncRemoveFromDb(item)
  }

  function isSaved(item: SavedItem) {
    return savedItems.some(
      savedItem =>
        savedItem.type === item.type &&
        savedItem.slug === item.slug &&
        savedItem.citySlug === item.citySlug
    ) || checkIsItemSaved(item)
  }

  return {
    savedItems,
    saveItem,
    removeItem,
    isSaved,
    getSavedItems,
  }
}
