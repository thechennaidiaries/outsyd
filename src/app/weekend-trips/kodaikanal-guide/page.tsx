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
  MessageSquareQuote,
  Camera,
  Bike,
  Waves,
  ShoppingBag,
  Music,
  Trees,
  Navigation,
  Utensils,
  History,
  Info,
  Mountain,
  Flower2,
  Ship,
  Wind
} from 'lucide-react'

// --- Content Data ---

const PLACES = [
  { name: 'Kodaikanal Lake', description: 'Cycle / Boating around Kodaikanal Lake', maps: 'https://maps.app.goo.gl/Hs8ScSvMvyTcmFhg7', tag: 'Iconic' },
  { name: "Dolphin's Nose", description: "Trek to Dolphin's Nose & Echo Point", maps: 'https://maps.app.goo.gl/fViZFtoF6f1X77oDA', tag: 'Trek' },
  { name: 'Vattakanal Falls', description: 'Hike to Vattakanal Falls', maps: 'https://maps.app.goo.gl/jJQ3i7aYUx3tHqPA9', tag: 'Nature' },
  { name: 'Green Valley View', description: 'Checkout foggy valley views at Green Valley Viewpoint', maps: 'https://maps.app.goo.gl/guQxSmJhnFTR87AK8', tag: 'Viewpoint' },
  { name: 'Bear Shola Falls', description: 'Explore hidden trails around Bear Shola Falls', maps: 'https://maps.app.goo.gl/LQ8NUGgBDNRid2wVA', tag: 'Falls' },
  { name: 'Berijam Lake', description: 'Enjoy a dense forest drive to Berijam Lake', maps: 'https://maps.app.goo.gl/zT5TTty7sfNUT2dK7', tag: 'Forest' },
  { name: 'Poombarai Village', description: 'Explore village life in Poombarai', maps: 'https://maps.app.goo.gl/z6SL45keZcAGjrSq9', tag: 'Cultural' },
  { name: 'Mannavanur', description: 'Spot wildlife & butterflies in Mannavanur', maps: 'https://maps.app.goo.gl/MH1HdrC2S9N5vnW19', tag: 'Wildlife' },
  { name: 'Guna Caves', description: 'Experience the mysterious vibes of Guna Caves', maps: 'https://maps.app.goo.gl/LWMhQgbMKYw66ZMb6', tag: 'Mysterious' },
  { name: 'Rose Garden', description: 'Walk through colorful flowers at Rose Garden', maps: 'https://maps.app.goo.gl/RmeLQB8Amsos1tsU9', tag: 'Garden' },
  { name: 'Pine Forest Falls', description: 'Hike to a hidden pine forest waterfall & Neptune’s Pools', maps: 'https://maps.app.goo.gl/o1Q2kT1wmYM4aSyV6', tag: 'Adventure' }
]

const ACTIVITIES = [
  { name: 'Cycling at Lake', description: 'Best way to explore the lake circumference early morning.', icon: <Bike size={18} />, maps: 'https://maps.app.goo.gl/Hs8ScSvMvyTcmFhg7' },
  { name: 'Boating', description: 'Classic Kodaikanal experience with serene water views.', icon: <Ship size={18} />, maps: 'https://maps.app.goo.gl/Hs8ScSvMvyTcmFhg7' },
  { name: 'Trekking', description: 'Trek to Dolphin\'s Nose for spectacular valley views.', icon: <Mountain size={18} />, maps: 'https://maps.app.goo.gl/fViZFtoF6f1X77oDA' },
  { name: 'Forest Drive', description: 'A dense forest drive to the beautiful Berijam Lake.', icon: <Trees size={18} />, maps: 'https://maps.app.goo.gl/zT5TTty7sfNUT2dK7' },
  { name: 'Village Walk', description: 'Explore the terrace farming and village life in Poombarai.', icon: <Compass size={18} />, maps: 'https://maps.app.goo.gl/z6SL45keZcAGjrSq9' },
  { name: 'Flower Walk', description: 'Walk through thousands of roses at the Rose Garden.', icon: <Flower2 size={18} />, maps: 'https://maps.app.goo.gl/RmeLQB8Amsos1tsU9' }
]

const FOOD = [
  { name: 'Meltiez', mustTry: 'Melted Chocolate', description: 'Try melted chocolate at Meltiez', maps: 'https://maps.app.goo.gl/i7jBe7GYGQidHVT77' },
  { name: 'Altaf Café', mustTry: 'Israeli Cuisine', description: 'Explore Isreali cuisine at Altaf Café', maps: 'https://maps.app.goo.gl/i7uL3upfFvaUdG1d7' },
  { name: 'Pastry Corner', mustTry: 'Brownies & Pastries', description: 'Grab Brownies & Pastries from Pastry Corner', maps: 'https://maps.app.goo.gl/HxejwWLguXPNh44XA' }
]

export default function KodaikanalGuide() {
  const [activeSection, setActiveSection] = useState('explore')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      const scrollPos = window.scrollY + 100
      const sections = ['explore', 'do', 'eat']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
           setActiveSection(id)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kodaikanal Trip Guide',
          text: 'Kodaikanal Weekend Trip: Real experiences and honest picks.',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))',
    gap: 20
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: '"Inter", sans-serif', overflowX: 'hidden' }}>
      {/* Header */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: 16,
        background: isScrolled ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border)' : 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Link href="/" style={{ color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <button 
          onClick={handleShare}
          style={{ 
            color: 'var(--text)', 
            background: 'rgba(0,0,0,0.4)', 
            padding: '8px 16px', 
            borderRadius: 100, 
            border: '1px solid rgba(255,255,255,0.1)', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
          <Share2 size={16} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{ height: '60vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1622321447038-7a5223e71d37?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10,10,14,0.3), var(--bg))', zIndex: -1 }} />
        
        <div style={{ padding: 24, width: '100%' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent-dim)', borderRadius: 100, color: 'var(--accent)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Weekend Trip</div>
          <h1 style={{ fontSize: 'clamp(36px, 10vw, 84px)', fontWeight: 900, lineHeight: 1, marginBottom: 16, letterSpacing: '-0.04em' }}>KODAIKANAL <br/><span style={{ color: 'var(--accent)' }}>TRIP GUIDE</span></h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>The Princess of Hill Stations - Mist, Lakes, and Hidden Trails.</p>
        </div>
      </section>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 4, overflowX: 'auto', padding: '0 10px' }} className="no-scrollbar">
          {['explore', 'do', 'eat'].map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: 'pointer', border: '1px solid transparent',
              background: activeSection === s ? 'var(--accent-dim)' : 'transparent',
              color: activeSection === s ? 'var(--accent)' : 'var(--text-3)',
              borderColor: activeSection === s ? 'var(--accent-border)' : 'transparent',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Explore */}
        <section id="explore" style={{ marginBottom: 100 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Places to Visit</h2>
          </div>
          <div style={gridStyle}>
            {PLACES.map(p => (
              <div key={p.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, display: 'block' }}>{p.tag}</span>
                <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>
                <a href={p.maps} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--bg-elevated)', width: 'fit-content', padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)' }}><Navigation size={12} /> MAPS</a>
              </div>
            ))}
          </div>
        </section>

        {/* Do */}
        <section id="do" style={{ marginBottom: 100 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Activities</h2>
          </div>
          <div style={gridStyle}>
            {ACTIVITIES.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 20, borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--accent-border)' }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12 }}>{a.description}</p>
                  <a href={a.maps} target="_blank" style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}>MAPS <ExternalLink size={12} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eat */}
        <section id="eat" style={{ marginBottom: 100 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Must Try Food</h2>
          </div>
          <div style={gridStyle}>
            {FOOD.map(f => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: 14 }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</p>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>Must try: {f.mustTry}</div>
                </div>
                <a href={f.maps} target="_blank" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', border: '1px solid var(--border)', flexShrink: 0 }}><ExternalLink size={16} /></a>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Made with ❤️ for Kodaikanal travelers.</p>
      </footer>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-x: hidden; width: 100%; position: relative; }
      `}</style>
    </main>
  )
}
