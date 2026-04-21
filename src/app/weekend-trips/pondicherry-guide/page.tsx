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
  {
    name: 'Rock Beach',
    description: "Pondicherry's most iconic waterfront - a rocky coastline, not a sandy beach. Car-free promenade makes evening and early morning walks genuinely peaceful - great for sunrise",
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
    tag: 'Eco'
  },
  {
    name: 'Paradise Beach',
    description: 'Clean beach you reach by boat - the ride is part of the experience. Best on weekdays to avoid crowds and long waits.',
    maps: 'https://maps.app.goo.gl/TganrSjpL29qSkM76',
    tag: 'Beach'
  },
  {
    name: 'Sri Aurobindo Ashram',
    description: 'Very calm and silent space in the middle of the city. Short visit, but worth it if you want a quiet break.',
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
    description: 'Boat through narrow mangrove tunnels — very unique experience. Takes half a day, best done as a short trip from Pondy.',
    maps: 'https://maps.app.goo.gl/eXrnNGMPsVWsdDMJ6',
    tag: 'Adventure'
  },
  {
    name: 'Mason & Co Chocolate Factory',
    description: 'Learn how chocolate is made from bean to bar. Great place to try and buy dark chocolate.',
    maps: 'https://maps.app.goo.gl/FK96zCL9YbXGWLyt9',
    tag: 'Food'
  },
  {
    name: 'Vinayak Temple (Manakula Vinayagar)',
    description: 'Famous Ganesha temple right in White Town. Usually crowded. 40+ forms of Ganesha are sculpted on the walls.',
    maps: 'https://maps.app.goo.gl/SHm87DbnkSPpUxB89',
    tag: 'Temple'
  },
  {
    name: 'French War Memorial',
    description: 'Small but well-kept memorial near the beach. Looks best in the evening when lit up.',
    maps: 'https://maps.app.goo.gl/SgYJRoPj2y4gtJJs9',
    tag: 'History'
  },
  {
    name: 'Chunnambar Boat House',
    description: 'Starting point for Paradise Beach boats and water activities. Go early to avoid long queues.',
    maps: 'https://maps.app.goo.gl/mZLE5E1T6SjAHRWT9',
    tag: 'Boating'
  },
  {
    name: 'Sacred Heart Basilica',
    description: "A stunning Gothic-style Catholic church near the railway station - one of Pondicherry's most photographed buildings. Built during the French colonial era with exquisite stained-glass windows depicting Biblical scenes.",
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
    description: 'The most satisfying thing you can do in Pondicherry - every lane has a cafe worth stopping in. Start with Cafe Des Arts for coffee, hit Baker Street for a croissant, end with Zuka for dessert.',
    icon: <Utensils size={18} />,
    maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9'
  },
  {
    name: 'Pottery Workshops in Auroville',
    description: 'Hands-on pottery sessions with local artists. Calm, slow activity for a few hours.',
    icon: <Compass size={18} />,
    maps: 'https://maps.app.goo.gl/CawmHbNrxPSwXRPP9'
  },
  {
    name: 'Street Shopping near Mission Street',
    description: 'The busiest commercial stretch in Pondicherry. Main shopping street for clothes and souvenirs. Good for cotton kurtas, wooden curios, handmade jewellery, and Auroville-made products at reasonable prices.',
    icon: <ShoppingBag size={18} />,
    maps: 'https://maps.app.goo.gl/TQUXKLb7yYAoHVuH6'
  },
  {
    name: 'Night Walk on Promenade',
    description: "One of the best free things to do in Pondicherry - the car-free promenade comes alive after 7pm. Street food vendors, families out for a stroll, waves crashing against the rocks, and lights along the seafront. End the walk with a late-night coffee or lasagna at Le Cafe — it's open 24 hours, right on the beach.",
    icon: <Clock size={18} />,
    maps: 'https://maps.app.goo.gl/KzjP24Zj21qNsJf6A'
  },
  {
    name: 'Visit Auroville (Full-Day Slow Experience)',
    description: "Auroville deserves a full day, don't try to rush it between other Pondy sightseeing. Start at the Visitors Centre, catch the documentary, view the Matrimandir from the viewing spot, then wander.",
    icon: <Palmtree size={18} />,
    maps: 'https://maps.app.goo.gl/UkEmvVXan4AknDZw8'
  },
  {
    name: 'Kayaking in Backwaters',
    description: 'A quieter, more intimate alternative to the standard Paradise Beach boat ride. Paddle through the backwaters and mangrove channels at your own pace near Chunnambar.',
    icon: <Waves size={18} />,
    maps: 'https://maps.app.goo.gl/yUekyCb1wrUoqQK29'
  },
  {
    name: 'Mangrove Boating in Pichavaram',
    description: "A proper day-trip experience - row boats through narrow mangrove tunnels in Asia's second-largest mangrove. Combine with the Chidambaram Natarajar Temple nearby - the whole loop makes for a brilliant day out of Pondy.",
    icon: <Trees size={18} />,
    maps: 'https://maps.app.goo.gl/aCabNJWBQjGxTiWC7'
  },
  {
    name: 'Sunrise Cycling in White Town',
    description: 'Early morning cycling is peaceful and empty. One of the best ways to explore the area.',
    icon: <Bike size={18} />,
    maps: 'https://maps.app.goo.gl/VPoaNu7DENNGAuWE9'
  },
  {
    name: 'Walk Aimlessly in French Lanes',
    description: 'The best activity in Pondicherry that requires no planning — just walk and look. Every lane in White Town has colour-washed colonial villas, bougainvillea spilling over walls, and quiet courtyards.',
    icon: <Navigation size={18} />,
    maps: 'https://maps.app.goo.gl/kUP9fgKxpxJUsTmh9'
  },
  {
    name: 'Visit Arikamedu Ruins',
    description: 'Quiet historical site with very few visitors. Not much to see, but interesting if you like history.',
    icon: <History size={18} />,
    maps: 'https://maps.app.goo.gl/FiuzgFXWRmAKJKBh9'
  },
  {
    name: 'Try Karaoke at Mel Whisks',
    description: 'Mel Whisks runs karaoke nights in their rooftop gastro bar - one of the livelier evening options in Pondy. Good cocktails, great Piri Piri wings, and a crowd that\'s genuinely into it.',
    icon: <Music size={18} />,
    maps: 'https://maps.app.goo.gl/oUNmV9FjgqxBEZsf6'
  }
]

const FOOD = [
  { name: 'Le Cafe', mustTry: 'Lasagna', description: 'Sea view is the main highlight - food is decent but better vibe. Open 24/7, best for late night coffee or chill.', maps: 'https://maps.app.goo.gl/FC9zQV7cW1e4taDp9' },
  { name: 'Cafe Ole', mustTry: 'Hot Chocolate (Dark & Dense)', description: 'Small cosy spot with really good hot chocolate. Perfect place to sit, relax, and take a break from walking.', maps: 'https://maps.app.goo.gl/3f6hXf75LNSxis1v9' },
  { name: 'Brother\'s Pizzeria', mustTry: 'Chicken Tikka Pizza', description: 'Thin crust pizzas that are simple but really tasty. Budget-friendly and loved by regulars.', maps: 'https://maps.app.goo.gl/7q6jcTPg1xXgZq249' },
  { name: 'Cafe Veloute', mustTry: 'Ratatouille', description: 'Rooftop cafe with a mix of cuisines and good vibe. Great place for trying something different like ratatouille.', maps: 'https://maps.app.goo.gl/q7Wo2KaUKvV8mYuXA' },
  { name: 'Canteen 18', mustTry: 'Burgers (Miami Beef or Cajun Chicken)', description: 'A tiny corner joint with just 2 tables run by an American owner who makes everything from scratch. Small place but burgers are one of the best in Pondy. Go early — it fills up fast.', maps: 'https://maps.app.goo.gl/FXLfi5HkfHSC9daP9' },
  { name: 'Kamatchi', mustTry: 'Biryani (Mutton or Prawn)', description: 'A packed, no-frills non-veg institution serving on banana leaves in South Indian style. Local favourite for biryani served on banana leaf. Always crowded but worth the wait.', maps: 'https://maps.app.goo.gl/r5VHqxcar8r3GaqeA' },
  { name: 'Red Chillies', mustTry: 'Firewood Pizza', description: 'Simple pizza place with good taste and pricing. Not fancy, but reliable.', maps: 'https://share.google/AjFjnwjMjIBhPdUn7' },
  { name: 'Villa Shanti', mustTry: 'Continental dishes (pasta, fish tikka)', description: 'A stunning 19th-century French colonial villa courtyard - one of Pondy\'s most iconic dining spots. Beautiful heritage setting with premium feel. Great for a slow, slightly expensive meal.', maps: 'https://maps.app.goo.gl/gqpQgviB96Nvy2kbA' },
  { name: 'Pasta Bar Veneto', mustTry: 'Pasta (Primavera or classic white sauce)', description: 'Good pasta with rich sauces. Nice place for a relaxed dinner.', maps: 'https://maps.app.goo.gl/uE76XiffdBaFUyjV8' },
  { name: 'Cafe Rendezvous', mustTry: 'Pork Ribs in BBQ Sauce', description: 'Rooftop place with good vibe and live music. Pork ribs are a must try here.', maps: 'https://maps.app.goo.gl/wPKQxPSjpu86xpGp7' },
  { name: 'Mel Whisks', mustTry: 'Chicken Wings (Piri Piri)', description: 'A rooftop gastro bar - newer on the scene but already well-regarded for food and cocktails. Good place for drinks, music, and evening hangouts. Chicken wings are a favourite.', maps: 'https://maps.app.goo.gl/FU7qTkn2j2XfnWS2A' },
  { name: 'Cafe Des Arts', mustTry: 'Coffee + Crepes', description: 'A legendary art-filled Franco-Tamil heritage house on Rue Suffren, a Pondicherry institution. Coffee is excellent, the building and antique interiors are half the experience.', maps: 'https://maps.app.goo.gl/QxEvrPnt5TM133Qq5' },
  { name: 'Marc\'s Cafe', mustTry: 'Pesto Pasta + any specialty coffee', description: 'Auroville\'s most celebrated specialty coffee destination - owner-roasted estate South Indian beans. Known for great coffee and calm Auroville vibe. Good spot for brunch and slow mornings.', maps: 'https://maps.app.goo.gl/Wz92FsYnL5cosxqS6' },
  { name: 'Hope Cafe', mustTry: 'Wood Fired Pizza', description: 'A graffiti-covered 19th-century building in White Town - fully vegetarian and vegan-friendly. Wood-fired pizza is the highlight, thin crust, smoky from the oven, and well-loaded. Great Instagram spot too - colourful walls and neon art make it a unique dining backdrop.', maps: 'https://maps.app.goo.gl/LUuhTPrDdpjREJRK6' },
  { name: 'The Spot', mustTry: 'Malabar Fish Curry', description: 'A beachfront colonial property on Rock Beach, upscale-casual with great seafood and cocktails. Malabar fish curry is rich, coastal, and well-executed, the pizza and pesto pasta also get praise.', maps: 'https://maps.app.goo.gl/QBByRwhdR6fJnJVG6' },
  { name: 'Baker Street', mustTry: 'Almond Croissant', description: 'An authentic French bakery on Bussy Street with 8 generations of baking heritage from France. Almond croissant is the standout - flaky, buttery, melt-in-mouth, nothing like regular Indian bakeries. Sells out fast, prices are on the higher side but worth it.', maps: 'https://maps.app.goo.gl/UraRpnxDZdxVDH9T7' },
  { name: 'Zuka', mustTry: 'Pastries (Tiramisu, Brownies, Pecan Pie Cake)', description: 'The chocolate and dessert sibling of Cafe Ole, a Mission Street must-stop for sweet tooth visitors. Tiramisu, Pecan Nut Pie Cake, and brownies are consistently outstanding - rich and fresh. Small space, mostly takeaway - grab something and walk the French Quarter streets.', maps: 'https://maps.app.goo.gl/9ugsWZ67LTupLzEt8' },
  { name: 'GMT', mustTry: 'Gelato (pistachio, dark chocolate, tiramisu)', description: 'Gelateria Montecatini Terme, an Italian gelato institution right on Promenade Beach. Over 60 flavours, made with organic milk and fresh ingredients - pistachio and dark choc are standouts. Perfect after a beach walk. Lots of flavours, always crowded in evenings.', maps: 'https://maps.app.goo.gl/zfLcupAvkoJ1pX269' },
  { name: 'Frites Corner', mustTry: 'Chicken or Tuna Sandwich', description: 'A family-run garden café in Auroville right next to Tanto. Simple cafe with fresh sandwiches. Good stop if you want something quick.', maps: 'https://maps.app.goo.gl/ybAjfR72cKnnv9mV6' },
  { name: 'Tanto Pizzeria', mustTry: 'Firewood Pizza (Normandy or feta mushroom)', description: 'Very popular pizza place in Auroville. Can get crowded, better to go early.', maps: 'https://maps.app.goo.gl/rBmZg24CfugVQx236' },
  { name: 'Bread & Chocolate', mustTry: 'Almond Croissant', description: 'Great brunch spot with healthy options. Croissants are one of the best here.', maps: 'https://maps.app.goo.gl/y9c45S6hrNjUnPEcA' },
  { name: 'Auroville Bakery & Cafe', mustTry: 'Brownie (walnut or choco-date)', description: 'Simple bakery with fresh items daily. Go early for best options.', maps: 'https://maps.app.goo.gl/T78AR1yHfboyszFk6' }
]

const STAYS = [
  { name: 'Micasa', type: 'Premium Hostel', description: 'A premium budget hostel on MG Road. Walkable to cafes, Rock Beach, and the French Quarter.', maps: 'https://maps.app.goo.gl/aqFrgojoL7rXMfSJ9' },
  { name: 'Nomad House', type: 'Homely Hostel', description: 'A quiet, homely hostel with a calm atmosphere. Great for solo travellers and first-time hostel-goers.', maps: 'https://maps.app.goo.gl/qi6evKRkfcGjsCFbA' },
  { name: 'Woodpacker', type: 'Auroville Hostel', description: 'A nature-surrounded Auroville hostel - garden setting, shared kitchen, and well-maintained rooms. Popular choice for solo female travellers for its safe, friendly environment.', maps: 'https://maps.app.goo.gl/25ajwe5WqAU3MKni7' },
  { name: 'Ostel.in', type: 'Budget Hostel', description: 'Clean and well-managed hostel. Good mix of comfort + affordability.', maps: 'https://maps.app.goo.gl/6JYatQXJhb54F2u78' },
  { name: 'Zostel', type: 'Social Hostel', description: 'Part of India\'s most trusted hostel chain — reliable quality, clean dorms, and social vibes. Good base on Auroville Road for travellers who want a no-surprises community hostel experience.', maps: 'https://maps.app.goo.gl/1Nis7RnBGrrYSr8W6' },
  { name: 'Unpack Hostel', type: 'Well-Reviewed Hostel', description: 'One of Pondicherry\'s most consistently well-reviewed hostels - popular with both solo and couple travellers. Clean, well-managed, and highly rated across multiple booking platforms.', maps: 'https://maps.app.goo.gl/nhwqKFsNQHkVp7jk6' },
  { name: 'The Last Stop', type: 'Social Hostel', description: 'Fun hostel with social vibe and activities. Good if you want to meet new people.', maps: 'https://maps.app.goo.gl/r3aQb5V6fC1GtgHX9' },
  { name: 'Savana Stay', type: 'Boutique Hotel', description: 'A TripAdvisor Travellers\' Choice boutique hotel near Auroville Beach with a pool and garden. Rooms are super clean and well-designed.', maps: 'https://maps.app.goo.gl/skNUKjG9GS9X2WvPA' },
  { name: 'Le Pondy Beach Resort', type: 'Beachfront Resort', description: 'A large beachfront resort near Paradise Beach with private beach access, pools, spa, and spacious grounds. Location is the main draw here. sea views, well-maintained lawns, and a large inviting pool.', maps: 'https://maps.app.goo.gl/xYMHasYgaaWpeqVm7' },
  { name: 'Accord Puducherry', type: 'Full-Service Hotel', description: 'One of Pondicherry\'s top full-service hotels - consistently ranked #3 on TripAdvisor among 200+ properties. Breakfast and in-house dining (especially the South Indian thali) are highly rated.', maps: 'https://maps.app.goo.gl/oisq44idSFGjbYrs9' },
  { name: 'Palais de Mahe', type: 'Luxury Boutique', description: 'The finest stay in Pondicherry - a CGH Earth boutique property with 18 luxury suites in the French Quarter. Just 50 metres from the beach and walking distance to every great cafe in White Town - the best location in Pondy', maps: 'https://maps.app.goo.gl/Tb5PJ2SLjMzfaEMG6' },
  { name: 'Villa Shanti', type: 'Colonial Boutique', description: 'A colonial boutique hotel and restaurant in White Town - one of Pondy\'s most complete eat-and-stay experiences. Rooms overlook a lush courtyard, the restaurant is as good as any standalone dining spot in the city.', maps: 'https://maps.app.goo.gl/dbsC8mNyJneKMGeq7' }
]

export default function PondicherryGuide() {
  const [activeSection, setActiveSection] = useState('overview')
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

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: '"Inter", sans-serif' }}>
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
          <h1 style={{ fontSize: 'clamp(44px, 10vw, 92px)', fontWeight: 900, lineHeight: 0.9, marginBottom: 16, letterSpacing: '-0.04em' }}>PONDY FULL <br/><span style={{ color: 'var(--accent)' }}>TRIP GUIDE</span></h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontSize: 18, lineHeight: 1.6, fontWeight: 500 }}>Real experiences, honest picks, and places that are truly worth your time.</p>
        </div>
      </section>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 6, overflowX: 'auto', padding: '0 20px' }} className="no-scrollbar">
          {['explore', 'do', 'eat', 'stay'].map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: 'pointer', border: '1px solid transparent',
              background: activeSection === s ? 'var(--accent-dim)' : 'transparent',
              color: activeSection === s ? 'var(--accent)' : 'var(--text-3)',
              borderColor: activeSection === s ? 'var(--accent-border)' : 'transparent',
              transition: 'all 0.2s'
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px' }}>
        
        {/* Explore */}
        <section id="explore" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 24, marginBottom: 48 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>Places to Visit</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 500 }}>Must-see spots and hidden gems</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {PLACES.map(p => (
              <div key={p.name} className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)', transition: 'all 0.3s ease' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'block' }}>{p.tag}</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.01em' }}>{p.name}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24, fontWeight: 400 }}>{p.description}</p>
                <a href={p.maps} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: 'var(--text)', textDecoration: 'none', background: 'var(--bg-elevated)', width: 'fit-content', padding: '10px 18px', borderRadius: 12, border: '1px solid var(--border)' }}><Navigation size={14} /> VIEW ON MAPS</a>
              </div>
            ))}
          </div>
        </section>

        {/* Do */}
        <section id="do" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 24, marginBottom: 48 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>Activities</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 500 }}>Things you should actually do</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {ACTIVITIES.map(a => (
              <div key={a.name} style={{ display: 'flex', gap: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 28, borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: 52, height: 52, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--accent-border)' }}>{a.icon}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{a.name}</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>{a.description}</p>
                  <a href={a.maps} target="_blank" style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 600 }}>LOCATE <ExternalLink size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eat */}
        <section id="eat" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 24, marginBottom: 48 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>Must Try Food</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 500 }}>Curated cafes and iconic eateries</p>
          </div>
          <div style={{ display: 'grid', gap: 32 }}>
            {FOOD.map(f => (
              <div key={f.name} className="glass-panel" style={{ padding: 40, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.02em' }}>{f.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--accent-dim)', width: 'fit-content', padding: '6px 14px', borderRadius: 100, border: '1px solid var(--accent-border)' }}>
                      <Coffee size={14} color="var(--accent)" />
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>Must Try: {f.mustTry}</span>
                    </div>
                  </div>
                  <a href={f.maps} target="_blank" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)' }}><ExternalLink size={20} /></a>
                </div>
                <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 400, margin: 0 }}>{f.description}</p>
                <div style={{ height: 1, background: 'var(--border)', width: '100%', margin: '10px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 14, fontWeight: 600 }}>
                  <Info size={16} /> Honest Review Content Included
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stay */}
        <section id="stay" style={{ marginBottom: 120 }}>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 24, marginBottom: 48 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>Stays</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 16, fontWeight: 500 }}>Hostels and boutique hotels</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {STAYS.map(s => (
              <div key={s.name} className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'block' }}>{s.type}</span>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.01em' }}>{s.name}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.7, marginBottom: 32, flex: 1 }}>{s.description}</p>
                <a href={s.maps} target="_blank" style={{ textAlign: 'center', padding: '14px 0', background: 'var(--accent)', color: 'white', fontWeight: 900, borderRadius: 14, textDecoration: 'none', fontSize: 14, letterSpacing: '0.02em', transition: 'all 0.2s' }}>EXPLORE LOCATION</a>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'linear-gradient(to bottom, transparent, rgba(255,107,0,0.02))' }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em' }}>PONDICHERRY <span style={{ color: 'var(--accent)' }}>GUIDE</span></h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 12, fontWeight: 500 }}>Curated with love by Team Outsyd.</p>
      </footer>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </main>
  )
}
