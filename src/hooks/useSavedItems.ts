'use client'

import { useEffect, useState } from 'react'
import {
  getSavedItems,
  isItemSaved as checkIsItemSaved,
  removeItem as removeStoredItem,
  saveItem as saveStoredItem,
  SAVED_ITEMS_EVENT,
  type SavedItem,
} from '@/lib/saved-items'

export function useSavedItems() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])

  useEffect(() => {
    setSavedItems(getSavedItems())

    function syncSavedItems() {
      setSavedItems(getSavedItems())
    }

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
    const nextSavedItems = saveStoredItem(item)
    setSavedItems(nextSavedItems)
  }

  function removeItem(item: SavedItem) {
    const nextSavedItems = removeStoredItem(item)
    setSavedItems(nextSavedItems)
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
