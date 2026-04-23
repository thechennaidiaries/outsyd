export type PricingType = 'free' | 'paid'
export type EventStatus = 'active' | 'expired'

export interface Event {
    id: string
    slug: string                // URL-friendly slug, e.g. "stand-up-comedy-night"
    title: string
    description?: string        // 1 line about the event
    cityId: string              // References City.id
    venue?: string               // Venue name
    address?: string            // Address of the venue
    mapsLink?: string           // Google Maps link
    bookingLink?: string        // Booking URL
    image?: string              // Event poster/image
    date: string                // ISO date string (YYYY-MM-DD)
    time?: string               // e.g. "7:00 PM – 10:00 PM"
    categories?: string[]       // Event categories for filtering
    pricingType?: PricingType    // 'free' or 'paid'
    pricing?: string            // Pricing details text, e.g. "₹499 per person"
    status?: EventStatus        // 'active' or 'expired' — defaults to 'active'
}

// ── Events Database ──────────────────────────────────────────────

export const EVENTS: Event[] = [
    {
        id: 'evt-1',
        slug: 'thekkady-stranger-trip-apr-25-2026',
        title: 'Thekkady Stranger Trip',
        description: 'A 2 day strangers trip to thekkady\n\n🚙 Jeep Safari | 🐘 Elephant Camp | 🥋 Kalari Show | 🌿 Spice Garden | 🛶 Boating',
        cityId: 'chennai',
        bookingLink: 'https://www.instagram.com/p/DXJwlvwEQ4S/',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604221911.jpeg?updatedAt=1776865316925',
        date: '2026-04-25',
        categories: ['Stranger Trips'],
        pricingType: 'paid',
        pricing: '₹6500',
        status: 'active',
    },
    {
        id: 'evt-2',
        slug: 'mafia-night-strangers-apr-25-2026',
        title: 'Mafia Night with Strangers',
        description: 'A night of mystery, deception, and high-stakes fun. Perfect for those who love a good game of wits.',
        cityId: 'chennai',
        bookingLink: 'https://www.instagram.com/p/DXZOPlzgS6T/?img_index=2',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Youth_playing_cards_202604222233.jpeg',
        date: '2026-04-25',
        categories: ['Stranger Meetup'],
        status: 'active',
    },
    {
        id: 'evt-3',
        slug: 'strangers-meetup-apr-26-2026',
        title: 'Strangers Meetup',
        description: 'Step out of your comfort zone and into a room full of potential new friends. An evening of conversations, laughs and connections.',
        cityId: 'chennai',
        bookingLink: 'https://www.instagram.com/p/DXZOPlzgS6T/?img_index=4',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222320.jpeg',
        date: '2026-04-26',
        categories: ['Stranger Meetup'],
        status: 'active',
    },
    {
        id: 'evt-4',
        slug: 'zumba-socials-apr-26-2026',
        title: 'Zumba Socials',
        description: 'Have a Energetic vibe with Strangers',
        cityId: 'chennai',
        bookingLink: 'https://www.instagram.com/p/DXZOPlzgS6T/?img_index=5',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_image_into_202604222247.jpeg',
        date: '2026-04-26',
        categories: ['Stranger Meetup'],
        status: 'active',
    },
    {
        id: 'evt-5',
        slug: 'kanthalloor-strangers-trip-apr-25-2026',
        title: 'Strangers Trip to Kanthalloor',
        description: '✨ Kanthalloor — where misty hills, fruit orchards, and quiet roads create the perfect escape from city chaos.\n\nJoin a group of strangers-turned-travel-buddies for a 2-day trip filled with real conversations, stunning views, and zero awkward silences.\n\nWhat\'s in store:\n🍓 Fruit picking at local orchards\n🌄 Scenic viewpoints & nature walks\n🔥 Bonfire nights & group games\n🍽️ Authentic Kerala meals\n📸 Memories you didn\'t plan but won\'t forget',
        cityId: 'chennai',
        bookingLink: 'https://www.instagram.com/p/DXW104vTd2A/',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Men_and_women_202604222242.jpeg',
        date: '2026-04-25',
        categories: ['Stranger Trips'],
        status: 'active',
    },
    {
        id: 'evt-6',
        slug: 'chennai-girls-date-apr-25-2026',
        title: 'Chennai Girls Date',
        cityId: 'chennai',
        address: 'Pondy Bazaar',
        bookingLink: 'https://www.instagram.com/reels/DXaz7ieSeN_/',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Girls_looking_into_202604222252.jpeg',
        date: '2026-04-25',
        time: '5:00 PM',
        categories: ['Stranger Meetup'],
        status: 'active',
    },
    {
        id: 'evt-7',
        slug: 'run-chill-anna-nagar-apr-25-2026',
        title: 'Run & Chill at Anna Nagar',
        description: 'Anna Nagar mornings just got upgraded.\nRun with us at 6AM.\nStay back for the healthy breakfast and chill conversations after.',
        cityId: 'chennai',
        address: 'Anna Nagar',
        bookingLink: 'https://www.cloka.in/events/69e859d56d3ea9b2eb198f26',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222254.jpeg',
        date: '2026-04-25',
        time: '6:00 AM',
        categories: ['Runs'],
        status: 'active',
    },
    {
        id: 'evt-8',
        slug: 'cloka-pickleball-mixer-apr-26-2026',
        title: 'Cloka Pickelball Mixer',
        description: 'This isn\'t your usual tournament.\n\nApril 26 — Pickleball Mixer\n\nNo fixed teams.\nYou show up… we assign your partner…\nand you figure it out.\n\nAdapt fast. Play smart and win.\n\nOne day. Non-stop games. Real competition.',
        cityId: 'chennai',
        bookingLink: 'https://www.cloka.in/events/69d7a16baf3a9d9c63298319',
        image: 'https://ik.imagekit.io/zxnq8x4yz/resize_this_image_202604222300.jpeg',
        date: '2026-04-26',
        time: '7:00 AM',
        categories: ['Stranger Meetup'],
        pricingType: 'paid',
        pricing: '₹799',
        status: 'active',
    },
    {
        id: 'evt-9',
        slug: '3km-community-run-apr-26-2026',
        title: '3KM Community Run',
        description: 'Join the VAMOS Weekend Run, a 3KM community run happening on Sunday, 26th April at 6:00 AM at Besant Nagar Beach, Chennai. This is not a marathon or competitive race, just a fun and relaxed run to start your Sunday with energy by the beach.\n\nOpen to runners, joggers, walkers, and beginners, the focus is simple move, connect, and enjoy the VAMOS community. Badminton is optional after the run for those who want to stay and have more fun.\n\nRegistered participants will receive a WhatsApp message to join the event group for updates and coordination. Come be part of the VAMOS community 🏃‍♂️',
        cityId: 'chennai',
        address: 'Besant Nagar',
        bookingLink: 'https://kynhood.com/event/69e5d3e2f36b3a8ca8f26354',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222302.jpeg',
        date: '2026-04-26',
        time: '6:00 AM',
        categories: ['Runs'],
        pricingType: 'free',
        status: 'active',
    },
    {
        id: 'evt-10',
        slug: 'ink-and-run-apr-25-2026',
        title: 'Ink and run',
        description: 'Join us for The Bat Club\'s week 30 run!\n\nWhy you should vote?\nThis is about the place you live in every day.\nThe roads, safety, opportunities, it all comes from these choices.\n\nBe part of that decision. Namma ooru. Namma future. Namma vote!\n\nEnjoy a refreshing 3K/5K/7K run at your own pace and connect with your fellow runners post run.',
        cityId: 'chennai',
        address: 'Marina Beach',
        bookingLink: 'https://docs.google.com/forms/d/e/1FAIpQLScAqqjZs7WKhDuI5GXOgyVoLdLrhj_9tzXo9PGiIqhv03cQkQ/viewform',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_image_replace_202604222310.jpeg',
        date: '2026-04-25',
        categories: ['Runs'],
        status: 'active',
    },
    {
        id: 'evt-11',
        slug: 'eye-contact-booth-apr-26-2026',
        title: 'Eye Contact Booth',
        description: 'Eye Contact Booth - See, Feel, Connect\nStep into a space where words pause and connection begins with presence. At the Eye Contact Booth, participants engage in 5 minutes of silent, one-on-one eye contact with fellow participants - across genders and within the same gender - creating moments of deep awareness and genuine connection.\n\nWhat to Expect\n5 Minutes of Silent Eye Contact\nNo talking. No distractions. Just you and another human being, fully present. This simple act often opens doors to empathy, vulnerability, and understanding.\n\n1-1 Conversations After\nAfter the silent exchange, participants get dedicated time to talk, share, and reflect — letting words flow naturally after presence has been established.\n\nSocial Time with the Group\nThe experience then opens up into a relaxed social space where everyone can mingle, connect, and continue conversations organically.\n\nA Safe, Inclusive Space\nYou\'ll have eye contact moments with people of the same gender and opposite gender, all within a guided, respectful, and comfortable environment.\n\nWhy Eye Contact?\nSustained eye contact helps us slow down, feel seen, open up emotionally, and connect beyond surface-level interactions. It often leads to honesty, warmth, and surprisingly meaningful conversations.\n\nJoin us for an experience that reminds you how powerful simply being seen can be.',
        cityId: 'chennai',
        venue: 'Wangs Kitchen, Alwarpet',
        address: 'Alwarpet',
        mapsLink: 'https://maps.app.goo.gl/8fNsW7N1dXbPttpB9',
        bookingLink: 'https://in.bookmyshow.com/events/eye-contact-booth/ET00478093',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Boy_and_girl_202604222313.jpeg',
        date: '2026-04-26',
        time: '3:00 PM',
        categories: ['Singles Mixer'],
        pricingType: 'paid',
        pricing: '₹799',
        status: 'active',
    },
    {
        id: 'evt-12',
        slug: 'lunch-with-strangers-apr-25-2026',
        title: 'Lunch with Strangers',
        description: 'Step out of your comfort zone and into a lunch of conversations & culinary delights!\n\n"Lunch with Strangers" is a premium social dining experience where strangers meet, eat, and leave as friends.\n\nIt\'s not just lunch—it\'s networking, bonding, and storytelling rolled into one.\n\nWho Should Attend:\n• Anyone eager to expand their social circle.\n• People who love meeting new personalities over food.\n• Foodies who know stories taste better with meals.\n\n3 Reasons to Attend:\n• Meet strangers who might just become friends.\n• A classy afternoon with food, drinks & fun.\n• Conversations as fulfilling as the menu.',
        cityId: 'chennai',
        venue: 'Madras Food Walk',
        address: 'Porur',
        mapsLink: 'https://maps.app.goo.gl/rsBiE38PLcm3nnWE9',
        bookingLink: 'https://www.district.in/events/lunch-with-strangers-chennai-apr4-2026-buy-tickets',
        image: 'https://ik.imagekit.io/zxnq8x4yz/People_having_lunch_202604222328.jpeg',
        date: '2026-04-25',
        time: '5:00 PM',
        categories: ['Singles Mixer'],
        pricingType: 'paid',
        pricing: '₹199',
        status: 'active',
    },
    {
        id: 'evt-13',
        slug: 'board-games-meetup-apr-26-2026',
        title: 'Board Games Meetup',
        description: 'Tired of screens and small talk? Come join us for an evening of laughter, strategy, and a little friendly competition!\n\nWe\'ve curated this event to bring together fun-loving people who enjoy connecting over classic and modern board games.\n\nWhether you\'re here to win or just roll the dice for fun, our mix of games and ice breakers will help spark conversations and build lasting friendships.',
        cityId: 'chennai',
        venue: 'Madras Food Walk',
        address: 'Porur',
        mapsLink: 'https://maps.app.goo.gl/rsBiE38PLcm3nnWE9',
        bookingLink: 'https://www.district.in/events/board-games-meetup-chennai-apr4-2026-buy-tickets',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Indian_youth_playing_202604222340.jpeg',
        date: '2026-04-26',
        time: '5:00 PM',
        categories: ['Stranger Meetup'],
        pricingType: 'paid',
        pricing: '₹199',
        status: 'active',
    },
    {
        id: 'evt-14',
        slug: 'singles-mixer-apr-25-2026',
        title: 'Singles Meetup',
        description: 'Singles Meetup doesn\'t mean searching—it just means showing up as yourself.\n\nThis is a relaxed, no-pressure space for singles to meet, talk, and spend a good evening around new people. No expectations, no formats to force outcomes—just conversations that go where they naturally do.\n\nWho should attend:\n• Anyone single who enjoys meeting new people\n• People who prefer real, easy conversations\n• Those who value presence over labels\n\nWhy come:\n• Open conversations without pressure\n• A social evening that works regardless of who shows up\n• You might leave with a great conversation, a new perspective, or just a good time',
        cityId: 'chennai',
        venue: 'Madras Food Walk',
        address: 'Porur',
        mapsLink: 'https://maps.app.goo.gl/rsBiE38PLcm3nnWE9',
        bookingLink: 'https://www.district.in/events/singles-meetup-chennai-apr4-2026-buy-tickets',
        image: 'https://ik.imagekit.io/zxnq8x4yz/image.png_202604222239.jpeg',
        date: '2026-04-25',
        time: '5:00 PM',
        categories: ['Singles Mixer'],
        pricingType: 'paid',
        pricing: '₹199',
        status: 'active',
    },
    {
        id: 'evt-15',
        slug: 'salsa-workshop-apr-26-2026',
        title: 'Salsa Workshop',
        description: 'Enjoy your evening with our fun Salsa Workshop for Beginners! Get started with social dancing immediately\n\n"Best of Chennai" - Must Experience! More than 200+ Workshops hosted with amazing feedback from all participants\n\nIn this workshop, you will learn:\n- Basic Foot Movements\n- Basic Turn\n- Partner Connection\n- Cross Body Lead\n- Musical Counts\n- Introduction to Social Dancing\n\nVenue: Zimmer Studios, Velachery\n\nNote:\n- Prior dance experience NOT required\n- Partner NOT required (everyone dances with everyone)\n- Please reach the studio 5 minutes before\n- Dress to impress :)\n- Maintain Personal Hygiene & smell really nice (Perfume, Body Spray, Mouth Freshener, etc.) — this is really important for any partner dance!\n- Bring a pair of clean shoes or heels to change inside the studio (you can also dance with socks; shoes not mandatory)\n\nBring your friends along and have loads of fun grooving to Salsa music',
        cityId: 'chennai',
        venue: 'Zimmer Studios',
        address: 'Velachery',
        mapsLink: 'https://maps.app.goo.gl/vRGYhmGaTNAs2utz7',
        bookingLink: 'https://in.bookmyshow.com/events/salsa-workshop-beginners/ET00392862',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222331.jpeg',
        date: '2026-04-26',
        time: '5:00 PM',
        categories: ['Workshop'],
        pricingType: 'paid',
        pricing: '₹199',
        status: 'active',
    },
    {
        id: 'evt-16',
        slug: 'drink-blabber-strangers-apr-25-2026',
        title: 'Drink & Blabber with Strangers',
        description: 'Step into a night where conversations flow as freely as the drinks\n• Location: Three Layers, Injambakkam\n• Date: April 25\n• Time: 6:30 PM onwards\n\nMeet new people, share wild stories, laugh louder than usual, and maybe walk out with unexpected friendships\n\nEntry Fee: ₹399 (Non-redeemable) | Bill-sharing event\nNo pressure. No judgments. Just pure vibes and real conversations.\nLimited spots — DM now to lock yours',
        cityId: 'chennai',
        venue: '3 LAYERS, Injambakkam',
        address: 'Injambakkam',
        mapsLink: 'https://maps.app.goo.gl/dnLnvagiYCwBiA7D8',
        bookingLink: 'https://www.ticketprix.com/event/drinkblabberwithstrangers',
        image: 'https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222336%20(1).jpeg',
        date: '2026-04-25',
        time: '6:30 PM',
        categories: ['Stranger Meetup'],
        pricingType: 'paid',
        pricing: '₹399',
        status: 'active',
    },
]

// ── Helper Functions ──────────────────────────────────────────────

/** Get all events for a specific city (active only) */
export function getEventsByCity(cityId: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.status !== 'expired')
}

/** Look up an event by its slug within a city */
export function getEventBySlug(cityId: string, slug: string): Event | undefined {
    return EVENTS.find(e => e.cityId === cityId && e.slug === slug)
}

/** Get events filtered by category within a city (active only) */
export function getEventsByCityAndCategory(cityId: string, category: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.categories?.includes(category) && e.status !== 'expired')
}

/** Get unique categories for a city's events */
export function getCategoriesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const catSet = new Set<string>()
    cityEvents.forEach(e => e.categories?.forEach(c => catSet.add(c)))
    return Array.from(catSet)
}

/** Get events for a specific date within a city (active only) */
export function getEventsByDate(cityId: string, date: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.date === date && e.status !== 'expired')
}

/** Get upcoming events (today or later) for a city, sorted by date (active only) */
export function getUpcomingEvents(cityId: string): Event[] {
    const today = new Date().toISOString().split('T')[0]
    return EVENTS
        .filter(e => e.cityId === cityId && e.date >= today && e.status !== 'expired')
        .sort((a, b) => a.date.localeCompare(b.date))
}

/** Get unique dates for a city's events */
export function getDatesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const dateSet = new Set<string>()
    cityEvents.forEach(e => dateSet.add(e.date))
    return Array.from(dateSet).sort()
}
