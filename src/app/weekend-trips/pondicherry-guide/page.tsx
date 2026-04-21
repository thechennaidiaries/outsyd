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
  Navigation
} from 'lucide-react'

// --- Content Data ---

const PLACES = [
  {
    name: 'Rock Beach',
    description: "Pondicherry's most iconic waterfront - a rocky coastline, not a sandy beach. Car-free promenade makes evening and early morning walks genuinely peaceful.",
    maps: 'https://maps.app.goo.gl/VQymYTyQ1hZpKimf9',
    tag: 'Iconic'
  },
  {
    name: 'Botanical Garden',
    description: 'Quiet green space with lots of old trees and shade. Good for a relaxed walk.',
    maps: 'https://maps.app.goo.gl/ofViM1bc8zQNc3es7',
    tag: 'Nature'
  },
  {
    name: 'Sadhana Forest',
    description: 'A peaceful eco-community focused on sustainable living. Visit on Fridays for free tour + simple vegan meal.',
    maps: 'https://maps.app.goo.gl/S19r8vpfAN1NSMC36',
    tag: 'Eco-Living'
  },
  {
    name: 'Paradise Beach',
    description: 'Clean beach you reach by boat - the ride is part of the experience. Best on weekdays to avoid crowds.',
    maps: 'https://maps.app.goo.gl/TganrSjpL29qSkM76',
    tag: 'Beach'
  },
  {
    name: 'Sri Aurobindo Ashram',
    description: 'Very calm and silent space in the middle of the city. Short visit, but worth it for a quiet break.',
    maps: 'https://maps.app.goo.gl/wnSShXkXbV724qn27',
    tag: 'Spiritual'
  },
  {
    name: 'Serenity Beach',
    description: 'One of the few beaches where you can actually surf. Good for sunset or a chill café session nearby.',
    maps: 'https://maps.app.goo.gl/AF1i8t5PfLim1fwR7',
    tag: 'Surf'
  },
  {
    name: 'Pichavaram Mangrove Forests',
    description: 'Boat through narrow mangrove tunnels — very unique experience. Takes half a day, best done as a short trip.',
    maps: 'https://maps.app.goo.gl/eXrnNGMPsVWsdDMJ6',
    tag: 'Adventure'
  },
  {
    name: 'Mason & Co Chocolate Factory',
    description: 'Learn how chocolate is made from bean to bar. Great place to try and buy dark chocolate.',
    maps: 'https://maps.app.goo.gl/FK96zCL9YbXGWLyt9',
    tag: 'Culinary'
  },
  {
    name: 'Vinayak Temple',
    description: 'Famous Ganesha temple right in White Town. 40+ forms of Ganesha are sculpted on the walls.',
    maps: 'https://maps.app.goo.gl/SHm87DbnkSPpUxB89',
    tag: 'Heritage'
  }
]

const ACTIVITIES = [
  {
    name: 'Surfing at Serenity Beach',
    description: 'Great place to try surfing, even as a beginner. Morning sessions are best.',
    icon: <Waves size={20} />,
    maps: 'https://maps.app.goo.gl/EKw9FCps9xxux9H36'
  },
  {
    name: 'Pottery Workshops in Auroville',
    description: 'Hands-on pottery sessions with local artists. Calm, slow activity for a few hours.',
    icon: <Camera size={20} />,
    maps: 'https://maps.app.goo.gl/CawmHbNrxPSwXRPP9'
  },
  {
    name: 'Night Walk on Promenade',
    description: "The car-free promenade comes alive after 7pm. Street food, families, and waves crashing.",
    icon: <Clock size={20} />,
    maps: 'https://maps.app.goo.gl/KzjP24Zj21qNsJf6A'
  },
  {
    name: 'Sunrise Cycling in White Town',
    description: 'Early morning cycling is peaceful and empty. One of the best ways to explore the area.',
    icon: <Bike size={20} />,
    maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9'
  },
  {
    name: 'Walk Aimlessly in French Lanes',
    description: 'The best activity that requires no planning. Every lane has colour-washed colonial villas and bougainvillea.',
    icon: <Navigation size={20} />,
    maps: 'https://maps.app.goo.gl/kUP9fgKxpxJUsTmh9'
  },
  {
    name: 'Karaoke at Mel Whisks',
    description: 'Rooftop gastro bar with lively karaoke nights. Great piri piri wings and cocktails.',
    icon: <Music size={20} />,
    maps: 'https://maps.app.goo.gl/oUNmV9FjgqxBEZsf6'
  }
]

const FOOD = [
  {
    name: 'Le Cafe',
    mustTry: 'Lasagna',
    description: 'Sea view is the main highlight. Open 24/7, best for late night coffee or chill.',
    maps: 'https://maps.app.goo.gl/FC9zQV7cW1e4taDp9'
  },
  {
    name: 'Cafe Ole',
    mustTry: 'Hot Chocolate (Dark & Dense)',
    description: 'Small cosy spot with really good hot chocolate. Perfect place to sit and relax.',
    maps: 'https://maps.app.goo.gl/3f6hXf75LNSxis1v9'
  },
  {
    name: 'Canteen 18',
    mustTry: 'Burgers (Miami Beef or Cajun Chicken)',
    description: 'A tiny corner joint run by an American owner. Burgers are some of the best in Pondy.',
    maps: 'https://maps.app.goo.gl/FXLfi5HkfHSC9daP9'
  },
  {
    name: 'Kamatchi',
    mustTry: 'Biryani (Mutton or Prawn)',
    description: 'A packed, no-frills institution serving on banana leaves in South Indian style.',
    maps: 'https://maps.app.goo.gl/r5VHqxcar8r3GaqeA'
  },
  {
    name: 'Villa Shanti',
    mustTry: 'Continental dishes (pasta, fish tikka)',
    description: 'A stunning 19th-century French colonial villa courtyard. Premium feel, great for slow meals.',
    maps: 'https://maps.app.goo.gl/gqpQgviB96Nvy2kbA'
  },
  {
    name: 'Cafe Des Arts',
    mustTry: 'Coffee + Crepes',
    description: 'Legendary art-filled Franco-Tamil heritage house. The building is half the experience.',
    maps: 'https://maps.app.goo.gl/QxEvrPnt5TM133Qq5'
  },
  {
    name: 'Marc\'s Cafe',
    mustTry: 'Pesto Pasta + Specialty Coffee',
    description: 'Auroville\'s celebrated specialty coffee destination. Owner-roasted South Indian beans.',
    maps: 'https://maps.app.goo.gl/Wz92FsYnL5cosxqS6'
  },
  {
    name: 'Zuka',
    mustTry: 'Pastries (Tiramisu, Brownies)',
    description: 'The chocolate sibling of Cafe Ole. Tiramisu and Pecan Nut Pie Cake are outstanding.',
    maps: 'https://maps.app.goo.gl/9ugsWZ67LTupLzEt8'
  },
  {
    name: 'GMT',
    mustTry: 'Gelato (Pistachio, Dark Chocolate)',
    description: 'Italian gelato institution right on Promenade Beach. Over 60 flavours with organic milk.',
    maps: 'https://maps.app.goo.gl/zfLcupAvkoJ1pX269'
  }
]

const STAYS = [
  {
    name: 'Palais de Mahe',
    type: 'Luxury Boutique',
    description: 'The finest stay in Pondicherry. A CGH Earth property with 18 luxury suites in the French Quarter.',
    maps: 'https://maps.app.goo.gl/Tb5PJ2SLjMzfaEMG6'
  },
  {
    name: 'Villa Shanti',
    type: 'Colonial Boutique',
    description: 'Colonial boutique hotel and restaurant in White Town. Rooms overlook a lush courtyard.',
    maps: 'https://maps.app.goo.gl/dbsC8mNyJneKMGeq7'
  },
  {
    name: 'Micasa',
    type: 'Premium Hostel',
    description: 'A premium budget hostel on MG Road. Walkable to cafes, Rock Beach, and French Quarter.',
    maps: 'https://maps.app.goo.gl/aqFrgojoL7rXMfSJ9'
  },
  {
    name: 'Zostel',
    type: 'Social Hostel',
    description: 'Part of India\'s most trusted chain. Good base on Auroville Road for a no-surprises experience.',
    maps: 'https://maps.app.goo.gl/1Nis7RnBGrrYSr8W6'
  },
  {
    name: 'Savana Stay',
    type: 'Boutique Hotel',
    description: 'TripAdvisor Travellers\' Choice near Auroville Beach with a pool and garden. Very clean.',
    maps: 'https://maps.app.goo.gl/skNUKjG9GS9X2WvPA'
  }
]

export default function PondicherryGuide() {
  const [activeSection, setActiveSection] = useState('overview')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      const scrollPos = window.scrollY + 100
      const sections = ['overview', 'explore', 'do', 'eat', 'stay']
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

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
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
        <button style={{ color: 'var(--text)', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Share2 size={16} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{ height: '70vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10,10,14,0.3), var(--bg))', zIndex: -1 }} />
        
        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent-dim)', borderRadius: 100, color: 'var(--accent)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Pondicherry Guide</div>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 80px)', fontFamily: '"Bodoni Moda", serif', fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>Real Picks by <br/><span style={{ fontFamily: '"Caveat", cursive', color: 'var(--accent)' }}>Locals & Travelers</span></h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>Curated from insights shared by Redditors and solo travellers who actually explored the city. Honesty over hype.</p>
        </div>
      </section>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 12, overflowX: 'auto', padding: '0 20px' }} className="no-scrollbar">
          {['overview', 'explore', 'do', 'eat', 'stay'].map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent',
              background: activeSection === s ? 'var(--accent-dim)' : 'transparent',
              color: activeSection === s ? 'var(--accent)' : 'var(--text-3)',
              borderColor: activeSection === s ? 'var(--accent-border)' : 'transparent'
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 24px' }}>
        
        {/* Overview */}
        <section id="overview" style={{ marginBottom: 100 }}>
          <div className="glass-panel" style={{ padding: 40, borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <MessageSquareQuote size={40} color="var(--accent)" style={{ marginBottom: 20 }} />
            <p style={{ fontSize: 20, lineHeight: 1.8, color: 'var(--text-2)', fontStyle: 'italic' }}>
              "Pondicherry is more than just a destination; it's a feeling. This guide focuses on real experiences, honest picks, and places that are truly worth your time."
            </p>
          </div>
        </section>

        {/* Explore */}
        <section id="explore" style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif', marginBottom: 40, color: 'var(--accent)' }}>Places to Visit</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {PLACES.map(p => (
              <div key={p.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius)', position: 'relative' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>{p.tag}</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>
                <a href={p.maps} target="_blank" style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}><MapPin size={14} /> Open Maps</a>
              </div>
            ))}
          </div>
        </section>

        {/* Do */}
        <section id="do" style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif', marginBottom: 40, color: 'var(--accent)' }}>Things to Do</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {ACTIVITIES.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius)' }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{a.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eat */}
        <section id="eat" style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif', marginBottom: 40, color: 'var(--accent)' }}>Must Try Food</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {FOOD.map(f => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px 24px', borderRadius: 'var(--radius)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{f.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '4px 0' }}>{f.description}</p>
                  <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Must try: {f.mustTry}</div>
                </div>
                <a href={f.maps} target="_blank" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}><ExternalLink size={18} /></a>
              </div>
            ))}
          </div>
        </section>

        {/* Stay */}
        <section id="stay">
          <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif', marginBottom: 40, color: 'var(--accent)' }}>Stays We Recommend</h2>
          <div style={{ display: 'grid', gap: 24 }}>
            {STAYS.map(s => (
              <div key={s.name} className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>{s.type}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{s.name}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 500 }}>{s.description}</p>
                </div>
                <a href={s.maps} target="_blank" style={{ padding: '12px 24px', background: 'var(--accent)', color: 'white', fontWeight: 800, borderRadius: 100, textDecoration: 'none', fontSize: 14 }}>View Deals</a>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer style={{ padding: '100px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Follow for more weekend guides</p>
        <h2 style={{ fontFamily: '"Bodoni Moda", serif', fontSize: 24, marginTop: 12 }}>Stay Outsyd.</h2>
      </footer>
    </main>
  )
}
