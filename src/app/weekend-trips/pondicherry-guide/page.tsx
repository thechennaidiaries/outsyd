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
  Info
} from 'lucide-react'

// --- Content Data ---

const PLACES = [
  { name: 'Rock Beach', description: "Pondicherry's most iconic waterfront - a rocky coastline. Car-free promenade makes evening/morning walks genuinely peaceful.", maps: 'https://maps.app.goo.gl/VQymYTyQ1hZpKimf9', tag: 'Iconic' },
  { name: 'Botanical Garden', description: 'Quiet green space with lots of old trees and shade. Good for a relaxed walk.', maps: 'https://maps.app.goo.gl/ofViM1bc8zQNc3es7', tag: 'Nature' },
  { name: 'Sadhana Forest', description: 'Peaceful eco-community focused on sustainable living. Visit on Fridays for free tour + vegan meal.', maps: 'https://maps.app.goo.gl/S19r8vpfAN1NSMC36', tag: 'Eco' },
  { name: 'Paradise Beach', description: 'Clean beach reached by boatride. Best on weekdays to avoid crowds.', maps: 'https://maps.app.goo.gl/TganrSjpL29qSkM76', tag: 'Beach' },
  { name: 'Sri Aurobindo Ashram', description: 'Very calm and silent space in the middle of the city. Worth it for a spiritual break.', maps: 'https://maps.app.goo.gl/wnSShXkXbV724qn27', tag: 'Spiritual' },
  { name: 'Serenity Beach', description: 'One of the few beaches where you can surf. Good for sunset or cafes.', maps: 'https://maps.app.goo.gl/AF1i8t5PfLim1fwR7', tag: 'Surf' },
  { name: 'Pichavaram Mangrove Forests', description: 'Boat through narrow mangrove tunnels — very unique experience. Best as a short trip.', maps: 'https://maps.app.goo.gl/eXrnNGMPsVWsdDMJ6', tag: 'Adventure' },
  { name: 'Mason & Co Chocolate Factory', description: 'Learn how chocolate is made from bean to bar. Great place to buy dark chocolate.', maps: 'https://maps.app.goo.gl/FK96zCL9YbXGWLyt9', tag: 'Food' },
  { name: 'Vinayak Temple', description: 'Famous Ganesha temple right in White Town. 40+ forms of Ganesha sculpted on walls.', maps: 'https://maps.app.goo.gl/SHm87DbnkSPpUxB89', tag: 'Temple' },
  { name: 'French War Memorial', description: 'Small, well-kept memorial near the beach. Looks best in the evening when lit up.', maps: 'https://maps.app.goo.gl/SgYJRoPj2y4gtJJs9', tag: 'History' },
  { name: 'Chunnambar Boat House', description: 'Starting point for Paradise Beach boats. Go early to avoid queues.', maps: 'https://maps.app.goo.gl/mZLE5E1T6SjAHRWT9', tag: 'Boating' },
  { name: 'Sacred Heart Basilica', description: 'Stunning Gothic-style church with exquisite stained-glass windows.', maps: 'https://maps.app.goo.gl/Uhk8Mu5JLxfDc4XS6', tag: 'Heritage' }
]

const ACTIVITIES = [
  { name: 'Surfing at Serenity Beach', description: 'Great place to try surfing, even as a beginner. Morning sessions are best.', icon: <Waves size={18} />, maps: 'https://maps.app.goo.gl/EKw9FCps9xxux9H36' },
  { name: 'Cafe Hopping (White Town)', description: 'Every lane has a cafe worth stopping in. Start with Cafe Des Arts, hit Baker St, end with Zuka.', icon: <Utensils size={18} />, maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9' },
  { name: 'Pottery Workshops', description: 'Hands-on pottery with local artists in Auroville. Calm, slow activity.', icon: <Compass size={18} />, maps: 'https://maps.app.goo.gl/CawmHbNrxPSwXRPP9' },
  { name: 'Street Shopping', description: 'Busiest stretch for clothes and souvenirs near Mission Street.', icon: <ShoppingBag size={18} />, maps: 'https://maps.app.goo.gl/TQUXKLb7yYAoHVuH6' },
  { name: 'Night Walk (Promenade)', description: 'Comes alive after 7pm with street food and ocean vibes.', icon: <Clock size={18} />, maps: 'https://maps.app.goo.gl/KzjP24Zj21qNsJf6A' },
  { name: 'Auroville Experience', description: 'Deserves a full day. Matrimandir viewing and Visitors Centre.', icon: <Palmtree size={18} />, maps: 'https://maps.app.goo.gl/UkEmvVXan4AknDZw8' },
  { name: 'Kayaking (Backwaters)', description: 'Quieter alternative to Paradise Beach. Near Chunnambar.', icon: <Waves size={18} />, maps: 'https://maps.app.goo.gl/yUekyCb1wrUoqQK29' },
  { name: 'Mangrove Boating', description: "Row through narrow tunnels in Asia's second-largest mangrove.", icon: <Trees size={18} />, maps: 'https://maps.app.goo.gl/aCabNJWBQjGxTiWC7' },
  { name: 'Sunrise Cycling', description: 'Peaceful and empty early morning. Best way to explore.', icon: <Bike size={18} />, maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9' },
  { name: 'Walk Aimlessly', description: 'Requires no planning. Every lane has colonial villas and bougainvillea.', icon: <Navigation size={18} />, maps: 'https://maps.app.goo.gl/kUP9fgKxpxJUsTmh9' },
  { name: 'Arikamedu Ruins', description: 'Quiet historical site with few visitors. Great for history buffs.', icon: <History size={18} />, maps: 'https://maps.app.goo.gl/FiuzgFXWRmAKJKBh9' },
  { name: 'Karaoke (Mel Whisks)', description: 'Rooftop gastro bar with lively karaoke nights and cocktails.', icon: <Music size={18} />, maps: 'https://maps.app.goo.gl/oUNmV9FjgqxBEZsf6' }
]

const FOOD = [
  { name: 'Le Cafe', mustTry: 'Lasagna', description: 'Sea view highlight, open 24/7. Best for late night vibes.', maps: 'https://maps.app.goo.gl/FC9zQV7cW1e4taDp9' },
  { name: 'Cafe Ole', mustTry: 'Hot Chocolate', description: 'Cosy spot, great for a break from walking.', maps: 'https://maps.app.goo.gl/3f6hXf75LNSxis1v9' },
  { name: 'Brother\'s Pizzeria', mustTry: 'Chicken Tikka Pizza', description: 'Thin crust pizzas, simple and budget-friendly.', maps: 'https://maps.app.goo.gl/7q6jcTPg1xXgZq249' },
  { name: 'Cafe Veloute', mustTry: 'Ratatouille', description: 'Rooftop cafe with a diverse mix of cuisines.', maps: 'https://maps.app.goo.gl/q7Wo2KaUKvV8mYuXA' },
  { name: 'Canteen 18', mustTry: 'Burgers', description: 'Tiny joint with some of the best burgers in Pondy.', maps: 'https://maps.app.goo.gl/FXLfi5HkfHSC9daP9' },
  { name: 'Kamatchi', mustTry: 'Biryani', description: 'Packed South Indian institution serving on banana leaves.', maps: 'https://maps.app.goo.gl/r5VHqxcar8r3GaqeA' },
  { name: 'Red Chillies', mustTry: 'Firewood Pizza', description: 'Simple pizza place, reliable and tasty.', maps: 'https://share.google/AjFjnwjMjIBhPdUn7' },
  { name: 'Villa Shanti', mustTry: 'Continental dishes', description: 'Iconic villa courtyard with a beautiful heritage setting.', maps: 'https://maps.app.goo.gl/gqpQgviB96Nvy2kbA' },
  { name: 'Pasta Bar Veneto', mustTry: 'Pasta Primavera', description: 'Relaxed dinner spot with rich authentic sauces.', maps: 'https://maps.app.goo.gl/uE76XiffdBaFUyjV8' },
  { name: 'Cafe Rendezvous', mustTry: 'Pork Ribs', description: 'Rooftop place with good vibe and live music.', maps: 'https://maps.app.goo.gl/wPKQxPSjpu86xpGp7' },
  { name: 'Mel Whisks', mustTry: 'Chicken Wings', description: 'Rooftop gastro bar, great for drinks/hangouts.', maps: 'https://maps.app.goo.gl/FU7qTkn2j2XfnWS2A' },
  { name: 'Cafe Des Arts', mustTry: 'Coffee + Crepes', description: 'Legendary art-filled heritage house on Rue Suffren.', maps: 'https://maps.app.goo.gl/QxEvrPnt5TM133Qq5' },
  { name: 'Marc\'s Cafe', mustTry: 'Specialty Coffee', description: 'Auroville\'s celebrated owner-roasted destination.', maps: 'https://maps.app.goo.gl/Wz92FsYnL5cosxqS6' },
  { name: 'Hope Cafe', mustTry: 'Wood Fired Pizza', description: 'Graffiti-covered building with unique neon art.', maps: 'https://maps.app.goo.gl/LUuhTPrDdpjREJRK6' },
  { name: 'The Spot', mustTry: 'Malabar Fish Curry', description: 'Beachfront colonial property on Rock Beach.', maps: 'https://maps.app.goo.gl/QBByRwhdR6fJnJVG6' },
  { name: 'Baker Street', mustTry: 'Almond Croissant', description: 'Heritage French bakery with authentic pastries.', maps: 'https://maps.app.goo.gl/UraRpnxDZdxVDH9T7' },
  { name: 'Zuka', mustTry: 'Pastries', description: 'Chocolate sibling of Cafe Ole. Tiramisu is outstanding.', maps: 'https://maps.app.goo.gl/9ugsWZ67LTupLzEt8' },
  { name: 'GMT', mustTry: 'Gelato', description: 'Italian gelato institution on Promenade Beach.', maps: 'https://maps.app.goo.gl/zfLcupAvkoJ1pX269' },
  { name: 'Frites Corner', mustTry: 'Sandwiches', description: 'Family-run garden café in Auroville.', maps: 'https://maps.app.goo.gl/ybAjfR72cKnnv9mV6' },
  { name: 'Tanto Pizzeria', mustTry: 'Firewood Pizza', description: 'Very popular pizza spot in Auroville.', maps: 'https://maps.app.goo.gl/rBmZg24CfugVQx236' },
  { name: 'Bread & Chocolate', mustTry: 'Almond Croissant', description: 'Brunch spot with healthy options and great croissants.', maps: 'https://maps.app.goo.gl/y9c45S6hrNjUnPEcA' },
  { name: 'Auroville Bakery', mustTry: 'Brownies', description: 'Simple bakery with fresh items daily.', maps: 'https://maps.app.goo.gl/T78AR1yHfboyszFk6' }
]

const STAYS = [
  { name: 'Micasa', type: 'Premium Hostel', description: 'Premium budget hostel on MG Road. Walkable to cafes and French Quarter.', maps: 'https://maps.app.goo.gl/aqFrgojoL7rXMfSJ9' },
  { name: 'Nomad House', type: 'Homely Hostel', description: 'Quiet, homely hostel with a calm atmosphere. Great for solo travellers.', maps: 'https://maps.app.goo.gl/qi6evKRkfcGjsCFbA' },
  { name: 'Woodpacker', type: 'Social Hostel', description: 'Nature-surrounded Auroville hostel with garden setting.', maps: 'https://maps.app.goo.gl/25ajwe5WqAU3MKni7' },
  { name: 'Ostel.in', type: 'Budget Hostel', description: 'Clean and well-managed hostel. Good comfort + affordability.', maps: 'https://maps.app.goo.gl/6JYatQXJhb54F2u78' },
  { name: 'Zostel', type: 'Social Hostel', description: 'Trusted chain, good base on Auroville Road.', maps: 'https://maps.app.goo.gl/1Nis7RnBGrrYSr8W6' },
  { name: 'Unpack Hostel', type: 'Well-Reviewed', description: 'Consistently well-reviewed hostel. Popular with both solo and couples.', maps: 'https://maps.app.goo.gl/nhwqKFsNQHkVp7jk6' },
  { name: 'The Last Stop', type: 'Social Hostel', description: 'Fun hostel with social vibe and activities. Great for meeting people.', maps: 'https://maps.app.goo.gl/r3aQb5V6fC1GtgHX9' },
  { name: 'Savana Stay', type: 'Boutique Hotel', description: 'TripAdvisor Choice boutique near Auroville Beach with pool.', maps: 'https://maps.app.goo.gl/skNUKjG9GS9X2WvPA' },
  { name: 'Le Pondy', type: 'Beach Resort', description: 'Large beachfront resort near Paradise Beach. Sea views and pools.', maps: 'https://maps.app.goo.gl/xYMHasYgaaWpeqVm7' },
  { name: 'Accord Puducherry', type: 'Full-Service', description: 'Top full-service hotel. South Indian thali is highly rated.', maps: 'https://maps.app.goo.gl/oisq44idSFGjbYrs9' },
  { name: 'Palais de Mahe', type: 'Luxury Boutique', description: 'Finest stay in French Quarter. Iconic CGH Earth property.', maps: 'https://maps.app.goo.gl/Tb5PJ2SLjMzfaEMG6' },
  { name: 'Villa Shanti', type: 'Colonial Boutique', description: 'Colonial boutique hotel, great eat-and-stay experience.', maps: 'https://maps.app.goo.gl/dbsC8mNyJneKMGeq7' }
]

export default function PondicherryGuide() {
  const [activeSection, setActiveSection] = useState('explore')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      const scrollPos = window.scrollY + 100
      const sections = ['explore', 'do', 'eat', 'stay']
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
          title: 'Pondicherry Trip Guide',
          text: 'Pondicherry Slow Living Guide: Real experiences and honest picks.',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: Copy to clipboard
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
            transition: 'all 0.2s active:scale-95'
          }}>
          <Share2 size={16} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{ height: '60vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(10,10,14,0.3), var(--bg))', zIndex: -1 }} />
        
        <div style={{ padding: 24, width: '100%' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent-dim)', borderRadius: 100, color: 'var(--accent)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Pondicherry Guide</div>
          <h1 style={{ fontSize: 'clamp(36px, 10vw, 84px)', fontWeight: 900, lineHeight: 1, marginBottom: 16, letterSpacing: '-0.04em' }}>PONDY FULL <br/><span style={{ color: 'var(--accent)' }}>TRIP GUIDE</span></h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>Real experiences, honest picks, and places truly worth your time.</p>
        </div>
      </section>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 4, overflowX: 'auto', padding: '0 10px' }} className="no-scrollbar">
          {['explore', 'do', 'eat', 'stay'].map(s => (
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

        {/* Stay */}
        <section id="stay" style={{ marginBottom: 60 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Stays</h2>
          </div>
          <div style={gridStyle}>
            {STAYS.map(s => (
              <div key={s.name} className="glass-panel" style={{ padding: 28, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, display: 'block' }}>{s.type}</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{s.name}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>{s.description}</p>
                <a href={s.maps} target="_blank" style={{ textAlign: 'center', padding: '12px 0', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 800, borderRadius: 10, textDecoration: 'none', fontSize: 13, border: '1px solid var(--accent-border)' }}>MAPS</a>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)' }}>
      </footer>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { overflow-x: hidden; width: 100%; position: relative; }
      `}</style>
    </main>
  )
}
