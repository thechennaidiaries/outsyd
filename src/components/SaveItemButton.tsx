'use client'

import { Bookmark, Check } from 'lucide-react'
import { useSavedItems } from '@/hooks/useSavedItems'
import type { SavedItem, SavedItemType } from '@/lib/saved-items'

interface Props {
  type: SavedItemType
  slug: string
  citySlug: string
  compact?: boolean
  iconOnly?: boolean
  label?: string
  savedLabel?: string
}

export default function SaveItemButton({ type, slug, citySlug, compact = false, iconOnly = false, label = 'Save', savedLabel = 'Saved' }: Props) {
  const { isSaved, saveItem, removeItem } = useSavedItems()

  const item: SavedItem = { type, slug, citySlug }
  const saved = isSaved(item)

  function handleClick() {
    if (saved) {
      removeItem(item)
      return
    }

    saveItem(item)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove saved ${type}` : `Save this ${type} for later`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconOnly ? 0 : 8,
        minWidth: iconOnly ? (compact ? 36 : 48) : compact ? 0 : 120,
        width: iconOnly ? (compact ? 36 : 48) : undefined,
        height: iconOnly ? (compact ? 36 : 48) : undefined,
        padding: iconOnly ? 0 : compact ? '10px 12px' : '18px 24px',
        borderRadius: compact ? 999 : 'var(--radius)',
        border: `1.5px solid ${saved ? 'var(--accent)' : 'var(--border)'}`,
        background: saved ? 'rgba(255,107,0,0.12)' : 'var(--bg-card)',
        color: saved ? 'var(--accent)' : 'var(--text)',
        fontSize: compact ? 13 : 16,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        boxShadow: compact ? '0 8px 24px rgba(0,0,0,0.18)' : 'none',
      }}
      className="hover:scale-[1.02] active:scale-[0.98]"
    >
      {saved ? <Check size={compact ? 14 : 16} strokeWidth={2.5} /> : <Bookmark size={compact ? 14 : 16} />}
      {!iconOnly && (saved ? savedLabel : label)}
    </button>
  )
}
