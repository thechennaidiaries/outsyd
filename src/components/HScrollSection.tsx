'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface HScrollSectionProps {
  emoji: string
  heading: string
  subheading?: string
  viewMoreHref: string
  children: React.ReactNode
  hideViewMore?: boolean
}

export default function HScrollSection({
  emoji,
  heading,
  subheading,
  viewMoreHref,
  children,
  hideViewMore = false,
}: HScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeft(scrollLeft > 20)
      setShowRight(scrollLeft < scrollWidth - clientWidth - 20)
    }
  }, [])

  useEffect(() => {
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      checkScroll()
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      ref?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '62px 28px 0', position: 'relative' }}>
      {/* Header row */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: '#ffffff',
          fontFamily: '"PP Neue Montreal", sans-serif'
        }}>
          {emoji} {heading}
        </h2>
        {subheading && (
          <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            {subheading}
          </p>
        )}
      </div>

      {/* Track Container */}
      <div style={{ position: 'relative' }}>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute', left: -20, top: '45%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            display: showLeft ? undefined : 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          className="hidden md:flex hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={20} color="var(--text)" />
        </button>

        {/* Horizontal scroll track */}
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollSnapType: 'x mandatory',
          }}
        >
          {children}
          {!hideViewMore && (
            <Link
              href={viewMoreHref}
              style={{
                minWidth: 160,
                flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10,
                borderRadius: 'var(--radius)',
                border: '1.5px dashed rgba(255,107,0,0.35)',
                background: 'rgba(255,107,0,0.04)',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                scrollSnapAlign: 'start',
                aspectRatio: '3/4',
              }}
              className="hover:border-[var(--accent)] hover:bg-[rgba(255,107,0,0.08)]"
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '2px solid rgba(255,107,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}>
                <ArrowRight size={18} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>View More</span>
            </Link>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute', right: -20, top: '45%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            display: showRight ? undefined : 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          className="hidden md:flex hover:scale-110 active:scale-95"
        >
          <ChevronRight size={20} color="var(--text)" />
        </button>
      </div>
    </div>
  )
}
