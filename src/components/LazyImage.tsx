'use client'
import { useState, useEffect, useRef } from 'react'
import { optimizeImageUrl } from '@/utils/image'

interface LazyImageProps {
  src: string | undefined | null
  alt: string
  /** Applied only to the hi-res image (hover scale, etc.) */
  className?: string
  /** Any additional img styles (e.g. transition for transforms). 
   *  Do NOT pass opacity/transition here — those are managed internally. */
  imageStyle?: React.CSSProperties
  eager?: boolean
  highResTr?: string
  onError?: () => void
}

export default function LazyImage({ 
  src, 
  alt, 
  className, 
  imageStyle,
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

  // Fallback: if image was already cached and loaded before React attached
  // the onLoad handler, img.complete is already true — flip isLoaded manually.
  useEffect(() => {
    if (isInView && imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [isInView])

  if (!src) {
    return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
  }

  const blurSrc = optimizeImageUrl(src, 'w-50,q-30,bl-10')
  const highResSrc = optimizeImageUrl(src, highResTr)

  return (
    // isolation: 'isolate' creates a new stacking context, preventing any
    // internal z-index values from leaking out and covering sibling elements
    // like gradient overlays and text captions in the parent card.
    <div
      ref={divRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', isolation: 'isolate' }}
    >
      {/* Blurry Placeholder — fades out once hi-res is loaded */}
      <img
        src={blurSrc}
        alt=""
        aria-hidden="true"
        style={{ 
          position: 'absolute', inset: 0, 
          width: '100%', height: '100%', objectFit: 'cover',
          filter: 'blur(8px)',
          transform: 'scale(1.08)', // slightly over-scale to hide blur edges
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 0.45s ease-out',
          zIndex: 0,
        }}
      />
      
      {/* Hi-res Image — fades in after load */}
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
            transition: imageStyle?.transition
              ? `${imageStyle.transition}, opacity 0.5s ease-out`
              : 'opacity 0.5s ease-out',
            zIndex: 1,
            ...imageStyle,
          }}
          className={className}
        />
      )}
    </div>
  )
}

