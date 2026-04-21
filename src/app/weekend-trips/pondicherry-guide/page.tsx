'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Heart, 
  Share2, 
  Coffee, 
  Palmtree, 
  Bed, 
  Compass,
  ChevronRight,
  ExternalLink,
  MessageSquareQuote
} from 'lucide-react'

// --- Mock Data ---
const SECTIONS = [
  { id: 'overview', title: 'Overview', icon: <Compass size={18} /> },
  { id: 'stay', title: 'Stay', icon: <Bed size={18} /> },
  { id: 'eat', title: 'Eat', icon: <Coffee size={18} /> },
  { id: 'explore', title: 'Explore', icon: <Palmtree size={18} /> },
]

const STAYS = [
  {
    id: '1',
    name: 'Palais de Mahe',
    tags: ['Luxury', 'French Quarter'],
    description: 'A stunning colonial-style boutique hotel in the heart of the French Quarter, featuring a rooftop terrace and a beautiful pool.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    link: '#'
  },
  {
    id: '2',
    name: 'La Villa',
    tags: ['Boutique', 'Minimalist'],
    description: 'An old colonial house transformed into a sleek, contemporary retreat with just six rooms and a secret garden.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
    link: '#'
  }
]

const EATS = [
  {
    id: 'e1',
    name: 'Coromandel Cafe',
    vibe: 'Romantic Garden setting',
    mustTry: 'Eggs Benedict & Pink Pasta',
    description: 'Set in a beautifully restored French villa, this is the most Instagrammable spot in town with incredible food to match.',
    maps: '#'
  },
  {
    id: 'e2',
    name: 'Baker Street',
    vibe: 'Classic Bakery',
    mustTry: 'Almond Croissants',
    description: 'The legendary spot for authentic French pastries. Go early before the croissants sell out!',
    maps: '#'
  },
  {
    id: 'e3',
    name: 'Villa Shanti',
    vibe: 'Elegant Courtyard',
    mustTry: 'Grilled Fish & Cocktails',
    description: 'Perfect for a sophisticated dinner. The courtyard atmosphere is magical especially at night.',
    maps: '#'
  }
]

export default function PondicherryGuide() {
  const [activeSection, setActiveSection] = useState('overview')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      
      // Update active section based on scroll position
      const scrollPos = window.scrollY + 100
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id)
        if (element) {
          const top = element.offsetTop
          const height = element.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id)
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      })
    }
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Floating Header */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        background: isScrolled ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border)' : 'none',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text)',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
          background: 'rgba(0,0,0,0.3)',
          padding: '8px 16px',
          borderRadius: 100,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <ArrowLeft size={16} />
          Back
        </Link>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              color: isLiked ? '#ff4757' : 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
            <Heart size={18} fill={isLiked ? '#ff4757' : 'none'} />
          </button>
          <button style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer'
          }}>
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        height: '80vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 24px 80px',
        overflow: 'hidden'
      }}>
        {/* Background Image with Ken Burns */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'kenBurns 20s infinite alternate linear',
          zIndex: -1
        }} />
        
        {/* Gradients */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,14,0.2) 0%, rgba(10,10,14,0.6) 50%, rgba(10,10,14,1) 100%)',
          zIndex: -1
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '6px 12px', 
            background: 'rgba(255,107,0,0.15)', 
            borderRadius: 100,
            border: '1px solid var(--accent-border)',
            marginBottom: 24,
            animation: 'fade-up 0.8s ease'
          }}>
            <MapPin size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Weekend Trips</span>
          </div>
          
          <h1 style={{
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontFamily: '"Bodoni Moda", serif',
            fontWeight: 800,
            lineHeight: 0.9,
            marginBottom: 20,
            animation: 'fade-up 1s ease'
          }}>
            Pondicherry <br />
            <span style={{ fontFamily: '"Caveat", cursive', color: 'var(--accent)', fontSize: '0.6em', marginLeft: '0.2em' }}>Slow Living Guide</span>
          </h1>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 24,
            color: 'var(--text-2)',
            fontSize: 14,
            animation: 'fade-up 1.2s ease'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> 2 Nights / 3 Days
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
            <span>By Team Outsyd</span>
          </div>
        </div>
      </section>

      {/* Sticky Sub-nav */}
      <div style={{
        position: 'sticky',
        top: 72,
        zIndex: 90,
        background: 'rgba(10,10,14,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 0'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 8,
          padding: '0 20px'
        }}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 100,
                border: '1px solid transparent',
                background: activeSection === section.id ? 'var(--accent-dim)' : 'transparent',
                color: activeSection === section.id ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: activeSection === section.id ? 'var(--accent-border)' : 'transparent'
              }}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ maxWidth: 800, margin: '80px auto', padding: '0 24px' }}>
        
        {/* Overview Section */}
        <section id="overview" style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 32, marginBottom: 32, fontFamily: '"Bodoni Moda", serif', color: 'var(--accent)' }}>Vibe Check</h2>
          <div style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--text-2)' }}>
            <p style={{ marginBottom: 24 }}>
              Pondicherry (or Puducherry) is more than just a destination; it's a feeling. It's the smell of fresh baguettes in the morning, the vibrant colors of bougainvillea against mustard yellow walls, and the sound of waves hitting the Promenade.
            </p>
            <p>
              Whether you're looking to meditate at the Matrimandir, explore the quaint streets of the French Quarter, or just café-hop through the weekend, we've curated the perfect guide to help you do it in style.
            </p>
          </div>
        </section>

        {/* Stay Section */}
        <section id="stay" style={{ marginBottom: 120 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif', color: 'var(--accent)' }}>Le Stay</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Curated boutique gems</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: 32 }}>
            {STAYS.map((stay) => (
              <div key={stay.id} className="glass-panel" style={{ 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ position: 'relative', height: 400 }}>
                  <img src={stay.image} alt={stay.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8 }}>
                    {stay.tags.map(tag => (
                      <span key={tag} style={{ 
                        padding: '6px 12px', 
                        background: 'rgba(0,0,0,0.6)', 
                        backdropFilter: 'blur(10px)', 
                        borderRadius: 100, 
                        fontSize: 12, 
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 32 }}>
                  <h3 style={{ fontSize: 24, marginBottom: 12 }}>{stay.name}</h3>
                  <p style={{ color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>{stay.description}</p>
                  <Link href={stay.link} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background: 'var(--accent)',
                    color: 'white',
                    borderRadius: 100,
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 14
                  }}>
                    Check Availability <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eat Section */}
        <section id="eat" style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 32, marginBottom: 32, fontFamily: '"Bodoni Moda", serif', color: 'var(--accent)' }}>Café Culture</h2>
          <div style={{ display: 'grid', gap: 24 }}>
            {EATS.map((eat) => (
              <div key={eat.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 24,
                display: 'flex',
                gap: 20,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: 60, height: 60, borderRadius: 'var(--radius-sm)', 
                  background: 'var(--accent-dim)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0
                }}>
                  <Coffee size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>{eat.name}</h3>
                    <a href={eat.maps} style={{ color: 'var(--text-3)' }}><ExternalLink size={18} /></a>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>{eat.vibe}</div>
                  <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{eat.description}</p>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: 12, 
                    background: 'rgba(255,107,0,0.05)', 
                    border: '1px dashed var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <MessageSquareQuote size={18} color="var(--accent)" />
                    <span style={{ fontSize: 14 }}>Must try: <strong style={{color: 'var(--text)'}}>{eat.mustTry}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explore Section */}
        <section id="explore">
          <h2 style={{ fontSize: 32, marginBottom: 32, fontFamily: '"Bodoni Moda", serif', color: 'var(--accent)' }}>The Itinerary</h2>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 32, marginLeft: 8 }}>
            <div style={{ position: 'relative', marginBottom: 48 }}>
              <div style={{ 
                position: 'absolute', left: -41, top: 0, 
                width: 16, height: 16, borderRadius: '50%', 
                background: 'var(--accent)',
                boxShadow: '0 0 0 4px var(--bg), 0 0 0 6px var(--accent-dim)'
               }} />
              <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Day 1: French Flair</h4>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Promenade & White Town</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Start with a sunrise walk at the Promenade Beach. Spend your afternoon wandering through the mustard-yellow lanes of the French Quarter, capturing every corner.</p>
            </div>
            
            <div style={{ position: 'relative', marginBottom: 48 }}>
              <div style={{ 
                position: 'absolute', left: -41, top: 0, 
                width: 16, height: 16, borderRadius: '50%', 
                background: 'var(--border)'
               }} />
              <h4 style={{ color: 'var(--text-3)', fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Day 2: Spirituality & Surfing</h4>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Auroville & Serenity Beach</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>A morning trip to Auroville to witness the Matrimandir. Later, head to Serenity Beach for a surfing lesson or just some sunset vibes.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer / CTA */}
      <footer style={{ 
        padding: '100px 24px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(to bottom, transparent, var(--bg-card))'
      }}>
        <h2 style={{ fontFamily: '"Bodoni Moda", serif', fontSize: 32, marginBottom: 16 }}>Ready for your escape?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>Share this guide with your travel partner</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button style={{
            padding: '16px 32px',
            borderRadius: 100,
            background: 'var(--accent)',
            color: 'white',
            fontWeight: 800,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer'
          }}>
            <Share2 size={20} /> Share Guide
          </button>
        </div>
      </footer>

      {/* Custom Styles for animations if not already in globals */}
      <style jsx global>{`
        @keyframes kenBurns {
          0% { transform: scale(1); background-position: center; }
          100% { transform: scale(1.1); background-position: center; }
        }
      `}</style>
    </main>
  )
}
