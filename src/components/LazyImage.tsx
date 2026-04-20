'use client'
import { useState, useEffect, useRef } from 'react'
import { optimizeImageUrl } from '@/utils/image'

interface LazyImageProps {
  src: string | undefined | null
  alt: string
  className?: string
  style?: React.CSSProperties
  eager?: boolean
  highResTr?: string
  onError?: () => void
}

export default function LazyImage({ 
  src, 
  alt, 
  className, 
  style, 
  eager = false,
  highResTr = 'w-400,q-60,f-auto',
  onError
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(eager)
  const [isLoaded, setIsLoaded] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer — only for non-eager images
  useEffect(() => {
    if (eager) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )

    if (divRef.current) {
      observer.observe(divRef.current)
    }

    return () => observer.disconnect()
  }, [eager])

  // ── Fallback for eager images: if the browser loaded the image from
  // cache before React could attach the onLoad handler, img.complete
  // is already true. We detect this after mount and flip isLoaded.
  useEffect(() => {
    if (isInView && imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [isInView])

  if (!src) {
    return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
  }

  // Generate both URLs via the helper utility
  const blurSrc = optimizeImageUrl(src, 'w-50,q-30,bl-10')
  const highResSrc = optimizeImageUrl(src, highResTr)

  return (
    <div ref={divRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* Blurry Background Placeholder — hidden once hi-res is loaded */}
      <img
        src={blurSrc}
        alt={alt}
        style={{ 
          position: 'absolute', inset: 0, 
          width: '100%', height: '100%', objectFit: 'cover',
          filter: 'blur(5px)',
          transform: 'scale(1.05)',
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 0.4s ease-out',
          ...style
        }}
        className={className}
      />
      
      {/* High-res Image (renders when in view) */}
      {isInView && (
        <img
          ref={imgRef}
          src={highResSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={onError}
          style={{
            position: 'absolute', inset: 0, 
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: style?.transition
              ? `${style.transition}, opacity 0.5s ease-out`
              : 'opacity 0.5s ease-out',
            zIndex: 1,
            ...style
          }}
          className={className}
        />
      )}
    </div>
  )
}
