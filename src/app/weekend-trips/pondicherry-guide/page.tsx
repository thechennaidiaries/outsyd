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

// --- Raw PDF Content Organized ---

const PLACES = [
  {
    name: 'Rock Beach',
    description: "Pondicherry's most iconic waterfront - a rocky coastline. Car-free promenade makes evening/morning walks genuinely peaceful.",
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
    description: 'Peaceful eco-community. Visit on Fridays for free tour + simple vegan meal.',
    maps: 'https://maps.app.goo.gl/S19r8vpfAN1NSMC36',
    tag: 'Eco'
  },
  {
    name: 'Paradise Beach',
    description: 'Clean beach reached by boat. Ride is part of the experience. Best on weekdays.',
    maps: 'https://maps.app.goo.gl/TganrSjpL29qSkM76',
    tag: 'Beach'
  },
  {
    name: 'Sri Aurobindo Ashram',
    description: 'Very calm and silent space in the middle of the city. Worth it for a quiet break.',
    maps: 'https://maps.app.goo.gl/wnSShXkXbV724qn27',
    tag: 'Spiritual'
  },
  {
    name: 'Serenity Beach',
    description: 'One of the few beaches where you can surf. Good for sunset or cafes.',
    maps: 'https://maps.app.goo.gl/AF1i8t5PfLim1fwR7',
    tag: 'Surf'
  },
  {
    name: 'Pichavaram Mangrove Forests',
    description: 'Boat through narrow mangrove tunnels — very unique experience. Half-day trip.',
    maps: 'https://maps.app.goo.gl/eXrnNGMPsVWsdDMJ6',
    tag: 'Eco'
  },
  {
    name: 'Mason & Co Chocolate Factory',
    description: 'Learn how chocolate is made from bean to bar. Great place to try and buy chocolate.',
    maps: 'https://maps.app.goo.gl/FK96zCL9YbXGWLyt9',
    tag: 'Food'
  },
  {
    name: 'Vinayak Temple (Manakula Vinayagar)',
    description: 'Famous Ganesha temple in White Town. 40+ forms of Ganesha sculpted on walls.',
    maps: 'https://maps.app.goo.gl/SHm87DbnkSPpUxB89',
    tag: 'Temple'
  },
  {
    name: 'French War Memorial',
    description: 'Small but well-kept memorial near the beach. Looks best in evening when lit up.',
    maps: 'https://maps.app.goo.gl/SgYJRoPj2y4gtJJs9',
    tag: 'History'
  },
  {
    name: 'Chunnambar Boat House',
    description: 'Starting point for Paradise Beach boats and water activities. Go early.',
    maps: 'https://maps.app.goo.gl/mZLE5E1T6SjAHRWT9',
    tag: 'Boating'
  },
  {
    name: 'Sacred Heart Basilica',
    description: 'Stunning Gothic-style Catholic church. Exquisite stained-glass windows depicting Biblical scenes.',
    maps: 'https://maps.app.goo.gl/Uhk8Mu5JLxfDc4XS6',
    tag: 'Heritage'
  }
]

const ACTIVITIES = [
  {
    name: 'Surfing at Serenity Beach',
    description: 'Great place to try surfing, even as a beginner. Morning sessions are best.',
    icon: <Waves size={18} />,
    maps: 'https://maps.app.goo.gl/EKw9FCps9xxux9H36'
  },
  {
    name: 'Cafe Hopping in White Town',
    description: 'Most satisfying thing to do. Cafe Des Arts for coffee, Baker Street for croissants, Zuka for dessert.',
    icon: <Utensils size={18} />,
    maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9'
  },
  {
    name: 'Pottery Workshops in Auroville',
    description: 'Hands-on pottery sessions with local artists. Calm, slow activity.',
    icon: <Compass size={18} />,
    maps: 'https://maps.app.goo.gl/CawmHbNrxPSwXRPP9'
  },
  {
    name: 'Street Shopping (Mission St)',
    description: 'Busiest commercial stretch. Good for cotton kurtas, wooden curios, and Auroville products.',
    icon: <ShoppingBag size={18} />,
    maps: 'https://maps.app.goo.gl/TQUXKLb7yYAoHVuH6'
  },
  {
    name: 'Night Walk on Promenade',
    description: 'Comes alive after 7pm. Street food, families, waves crashing against rocks.',
    icon: <Clock size={18} />,
    maps: 'https://maps.app.goo.gl/KzjP24Zj21qNsJf6A'
  },
  {
    name: 'Auroville Full-Day Experience',
    description: 'Deserves a full day. Start at Visitors Centre, catch documentary, view Matrimandir.',
    icon: <Palmtree size={18} />,
    maps: 'https://maps.app.goo.gl/UkEmvVXan4AknDZw8'
  },
  {
    name: 'Kayaking in Backwaters',
    description: 'Quieter alternative to standard Paradise Beach boat ride. near Chunnambar.',
    icon: <Waves size={18} />,
    maps: 'https://maps.app.goo.gl/yUekyCb1wrUoqQK29'
  },
  {
    name: 'Mangrove Boating (Pichavaram)',
    description: "Row boats through narrow tunnels in Asia's second-largest mangrove.",
    icon: <Trees size={18} />,
    maps: 'https://maps.app.goo.gl/aCabNJWBQjGxTiWC7'
  },
  {
    name: 'Sunrise Cycling',
    description: 'Peaceful and empty in the early morning. Best way to explore White Town.',
    icon: <Bike size={18} />,
    maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9'
  },
  {
    name: 'Walk Aimlessly (French Lanes)',
    description: 'Requires no planning. Colour-washed villas, bougainvillea, and quiet courtyards.',
    icon: <Navigation size={18} />,
    maps: 'https://maps.app.goo.gl/kUP9fgKxpxJUsTmh9'
  },
  {
    name: 'Visit Arikamedu Ruins',
    description: 'Quiet historical site with very few visitors. Interesting if you like history.',
    icon: <History size={18} />,
    maps: 'https://maps.app.goo.gl/FiuzgFXWRmAKJKBh9'
  },
  {
    name: 'Karaoke at Mel Whisks',
    description: 'Rooftop gastro bar with active karaoke nights. Good cocktails and piri piri wings.',
    icon: <Music size={18} />,
    maps: 'https://maps.app.goo.gl/oUNmV9FjgqxBEZsf6'
  }
]

const FOOD = [
  { name: 'Le Cafe', details: 'Sea view highlight, open 24/7. Must try: Lasagna', maps: 'https://maps.app.goo.gl/FC9zQV7cW1e4taDp9' },
  { name: 'Cafe Ole', details: 'Cosy spot, great break. Must try: Hot Chocolate (Dark & Dense)', maps: 'https://maps.app.goo.gl/3f6hXf75LNSxis1v9' },
  { name: 'Brother\'s Pizzeria', details: 'Thin crust, simple and tasty. Must try: Chicken Tikka Pizza', maps: 'https://maps.app.goo.gl/7q6jcTPg1xXgZq249' },
  { name: 'Cafe Veloute', details: 'Rooftop, good vibe. Must try: Ratatouille', maps: 'https://maps.app.goo.gl/q7Wo2KaUKvV8mYuXA' },
  { name: 'Canteen 18', details: 'Tiny joint, American owner. Must try: Burgers', maps: 'https://maps.app.goo.gl/FXLfi5HkfHSC9daP9' },
  { name: 'Kamatchi', details: 'South Indian institution, banana leaf. Must try: Biryani (Mutton/Prawn)', maps: 'https://maps.app.goo.gl/r5VHqxcar8r3GaqeA' },
  { name: 'Red Chillies', details: 'Simple, reliable pizza place. Must try: Firewood Pizza', maps: 'https://share.google/AjFjnwjMjIBhPdUn7' },
  { name: 'Villa Shanti', details: '19th-century courtyard, premium feel. Must try: Continental (Pasta, Fish Tikka)', maps: 'https://maps.app.goo.gl/gqpQgviB96Nvy2kbA' },
  { name: 'Pasta Bar Veneto', details: 'Relaxed dinner, rich sauces. Must try: Pasta (Primavera/White Sauce)', maps: 'https://maps.app.goo.gl/uE76XiffdBaFUyjV8' },
  { name: 'Cafe Rendezvous', details: 'Rooftop with live music. Must try: Pork Ribs in BBQ Sauce', maps: 'https://maps.app.goo.gl/wPKQxPSjpu86xpGp7' },
  { name: 'Mel Whisks', details: 'Rooftop gastro bar, newer scene. Must try: Chicken Wings (Piri Piri)', maps: 'https://maps.app.goo.gl/FU7qTkn2j2XfnWS2A' },
  { name: 'Cafe Des Arts', details: 'Legendary art-filled heritage house. Must try: Coffee + Crepes', maps: 'https://maps.app.goo.gl/QxEvrPnt5TM133Qq5' },
  { name: 'Marc\'s Cafe', details: 'Celebrated specialty coffee in Auroville. Must try: Pesto Pasta', maps: 'https://maps.app.goo.gl/Wz92FsYnL5cosxqS6' },
  { name: 'Hope Cafe', details: 'Graffiti building, neon art. Must try: Wood Fired Pizza', maps: 'https://maps.app.goo.gl/LUuhTPrDdpjREJRK6' },
  { name: 'The Spot', details: 'Beachfront colonial property. Must try: Malabar Fish Curry', maps: 'https://maps.app.goo.gl/QBByRwhdR6fJnJVG6' },
  { name: 'Baker Street', details: '8 generations of heritage. Must try: Almond Croissant', maps: 'https://maps.app.goo.gl/UraRpnxDZdxVDH9T7' },
  { name: 'Zuka', details: 'The chocolate sibling of Cafe Ole. Must try: Pastries (Tiramisu, Brownies)', maps: 'https://maps.app.goo.gl/9ugsWZ67LTupLzEt8' },
  { name: 'GMT', details: ' Gelato institution on Promenade. Must try: Gelato (Pistachio, Dark Chocolate)', maps: 'https://maps.app.goo.gl/zfLcupAvkoJ1pX269' },
  { name: 'Frites Corner', details: 'Family-run garden café in Auroville. Must try: Sandwiches', maps: 'https://maps.app.goo.gl/ybAjfR72cKnnv9mV6' },
  { name: 'Tanto Pizzeria', details: 'Very popular firewood pizza in Auroville. Must try: Normandy/Feta Mushroom', maps: 'https://maps.app.goo.gl/rBmZg24CfugVQx236' },
  { name: 'Bread & Chocolate', details: 'Great brunch spot, healthy options. Must try: Almond Croissant', maps: 'https://maps.app.goo.gl/y9c45S6hrNjUnPEcA' },
  { name: 'Auroville Bakery & Cafe', details: 'Simple bakery, fresh items daily. Must try: Brownie (Walnut/Choco-date)', maps: 'https://maps.app.goo.gl/T78AR1yHfboyszFk6' }
]

const STAYS = [
  { name: 'Micasa', details: 'Premium budget hostel on MG Road. Walkable to everything.', maps: 'https://maps.app.goo.gl/aqFrgojoL7rXMfSJ9' },
  { name: 'Nomad House', details: 'Quiet, homely hostel with a calm atmosphere.', maps: 'https://maps.app.goo.gl/qi6evKRkfcGjsCFbA' },
  { name: 'Woodpacker', details: 'Nature-surrounded Auroville hostel, popular with solo females.', maps: 'https://maps.app.goo.gl/25ajwe5WqAU3MKni7' },
  { name: 'Ostel.in', details: 'Clean and well-managed hostel, good comfort + affordability.', maps: 'https://maps.app.goo.gl/6JYatQXJhb54F2u78' },
  { name: 'Zostel', details: 'Trusted chain, good base on Auroville Road.', maps: 'https://maps.app.goo.gl/1Nis7RnBGrrYSr8W6' },
  { name: 'Unpack Hostel', details: 'Consistently well-reviewed, popular with solo and couples alike.', maps: 'https://maps.app.goo.gl/nhwqKFsNQHkVp7jk6' },
  { name: 'The Last Stop', details: 'Fun hostel with social vibe and activities.', maps: 'https://maps.app.goo.gl/r3aQb5V6fC1GtgHX9' },
  { name: 'Savana Stay', details: 'Boutique hotel near Auroville Beach with pool.', maps: 'https://maps.app.goo.gl/skNUKjG9GS9X2WvPA' },
  { name: 'Le Pondy', details: 'Large beachfront resort near Paradise Beach.', maps: 'https://maps.app.goo.gl/xYMHasYgaaWpeqVm7' },
  { name: 'Accord Puducherry', details: 'Top full-service hotel, South Indian thali is highly rated.', maps: 'https://maps.app.goo.gl/oisq44idSFGjbYrs9' },
  { name: 'Palais de Mahe', details: 'Finest stay in French Quarter. Iconic CGH Earth property.', maps: 'https://maps.app.goo.gl/Tb5PJ2SLjMzfaEMG6' },
  { name: 'Villa Shanti', details: 'Colonial boutique hotel, great eat-and-stay experience.', maps: 'https://maps.app.goo.gl/dbsC8mNyJneKMGeq7' }
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
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 80px)', fontFamily: '"Bodoni Moda", serif', fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>Pondy Full <br/><span style={{ fontFamily: '"Caveat", cursive', color: 'var(--accent)' }}>Trip Guide</span></h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>Curated from insights shared by Redditors, locals, and solo travellers who’ve actually explored the city.</p>
        </div>
      </section>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 6, overflowX: 'auto', padding: '0 20px' }} className="no-scrollbar">
          {['overview', 'explore', 'do', 'eat', 'stay'].map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent',
              background: activeSection === s ? 'var(--accent-dim)' : 'transparent',
              color: activeSection === s ? 'var(--accent)' : 'var(--text-3)',
              borderColor: activeSection === s ? 'var(--accent-border)' : 'transparent'
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px' }}>
        
        {/* Overview */}
        <section id="overview" style={{ marginBottom: 100 }}>
          <div className="glass-panel" style={{ padding: 40, borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <MessageSquareQuote size={40} color="var(--accent)" style={{ marginBottom: 20, margin: '0 auto 20px' }} />
            <p style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--text-2)', margin: 0 }}>
              "This guide focuses on real experiences, honest picks, and places that are truly worth your time. No fluff, just the best of Pondicherry."
            </p>
          </div>
        </section>

        {/* Explore */}
        <section id="explore" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif' }}>Places to Visit</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Must-see spots and hidden gems</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {PLACES.map(p => (
              <div key={p.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius)', transition: 'all 0.3s ease' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, display: 'block' }}>{p.tag}</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>
                <a href={p.maps} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--bg-elevated)', width: 'fit-content', padding: '6px 12px', borderRadius: 8 }}><Navigation size={12} /> View on Maps</a>
              </div>
            ))}
          </div>
        </section>

        {/* Do */}
        <section id="do" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif' }}>Activities</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Things you should actually do</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {ACTIVITIES.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 20, borderRadius: 'var(--radius)' }}>
                <div style={{ width: 44, height: 44, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{a.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12 }}>{a.description}</p>
                  <a href={a.maps} target="_blank" style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>Location <ExternalLink size={12} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eat */}
        <section id="eat" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif' }}>Must Try Food</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>20+ curated cafes and restaurants</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12 }}>
            {FOOD.map(f => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: 14 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800 }}>{f.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '2px 0' }}>{f.details}</p>
                </div>
                <a href={f.maps} target="_blank" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', marginLeft: 16 }}><ExternalLink size={16} /></a>
              </div>
            ))}
          </div>
        </section>

        {/* Stay */}
        <section id="stay" style={{ marginBottom: 60 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 20, marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontFamily: '"Bodoni Moda", serif' }}>Stays</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>From hostels to luxury boutiques</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {STAYS.map(s => (
              <div key={s.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>{s.name}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{s.details}</p>
                <a href={s.maps} target="_blank" style={{ textAlign: 'center', padding: '10px 0', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 800, borderRadius: 10, textDecoration: 'none', fontSize: 13, border: '1px solid var(--accent-border)' }}>View Location</a>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: '"Bodoni Moda", serif', fontSize: 24 }}>Pondicherry Guide</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>All information curated from traveler reviews and local insights.</p>
      </footer>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
