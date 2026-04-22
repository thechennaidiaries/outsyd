export type PricingType = 'free' | 'paid'

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
}

// ── Events Database ──────────────────────────────────────────────

export const EVENTS: Event[] = [
    {
        "id": "evt-1",
        "slug": "thekkady-stranger-trip-apr-25-2026",
        "title": "Thekkady Stranger Trip",
        "description": "A 2 day strangers trip to thekkady\n",
        "cityId": "chennai",
        "venue": "",
        "address": "",
        "mapsLink": "",
        "bookingLink": "https://www.instagram.com/p/DXJwlvwEQ4S/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604221911.jpeg?updatedAt=1776865316925",
        "date": "2026-04-25",
        "time": "",
        "categories": [
            "Stranger Trips"
        ],
        "pricingType": "paid",
        "pricing": "₹6500"
    },
    {
        "id": "evt-2",
        "slug": "cloka-pickleball-mixer-apr-26-2026",
        "title": "Cloka - Pickleball Mixer",
        "description": "April 26 \u2014 Pickleball Mixer\n\nNo fixed teams.\nYou show up\u2026 we assign your partner\u2026\nand you figure it out.\n\nAdapt fast. Play smart and win.\n\nOne day. Non-stop games. Real competition.\n",
        "cityId": "chennai",
        "venue": "Cloka",
        "address": "Alwarpet",
        "mapsLink": "https://maps.app.goo.gl/uXv7o1U1f5p9E8zN8",
        "bookingLink": "https://docs.google.com/forms/d/e/1FAIpQLSe-0iZ8E3C0I-Dq-1H0vS2Jk4s9L8X9m8uX6m9n1d2e3e4f/viewform",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Pickleball_mixer_202604222307.jpeg",
        "date": "2026-04-26",
        "time": "4:00 PM",
        "categories": [
            "Pickleball",
            "Mixer"
        ],
        "pricingType": "paid",
        "pricing": "₹500"
    },
    {
        "id": "evt-3",
        "slug": "3km-community-run-apr-26-2026",
        "title": "3KM Community Run",
        "description": "Join the VAMOS Weekend Run, a 3KM community run happening on Sunday, 26th April at 6:00 AM at Besant Nagar Beach, Chennai. This is not a marathon or competitive race, just a fun and relaxed run to start your Sunday with energy by the beach.\n\nOpen to runners, joggers, walkers, and beginners, the focus is simple move, connect, and enjoy the VAMOS community. Badminton is optional after the run for those who want to stay and have more fun.\n\nRegistered participants will receive a WhatsApp message to join the event group for updates and coordination. Come be part of the VAMOS community \ud83c\udfc3\u200d\u2642\ufe0f",
        "cityId": "chennai",
        "venue": "",
        "address": "Besant Nagar",
        "mapsLink": "",
        "bookingLink": "https://kynhood.com/event/69e5d3e2f36b3a8ca8f26354",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222302.jpeg",
        "date": "2026-04-26",
        "time": "6:00 AM",
        "categories": [
            "Runs"
        ],
        "pricingType": "free",
        "pricing": ""
    },
    {
        "id": "evt-4",
        "slug": "ink-and-run-apr-25-2026",
        "title": "Ink and run",
        "description": "Join us for The Bat Club\u2019s week 30 run!\n\nWhy you should vote?\nThis is about the place you live in every day.\nThe roads, safety, opportunities, it all comes from these choices.\n\nBe part of that decision. Namma ooru. Namma future. Namma vote!\n\nEnjoy a refreshing 3K/5K/7K run at your own pace and connect with your fellow runners post run.",
        "cityId": "chennai",
        "venue": "",
        "address": "Marina Beach",
        "mapsLink": "",
        "bookingLink": "https://docs.google.com/forms/d/e/1FAIpQLScAqqjZs7WKhDuI5GXOgyVoLdLrhj_9tzXo9PGiIqhv03cQkQ/viewform",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_image_replace_202604222310.jpeg",
        "date": "2026-04-25",
        "time": "",
        "categories": [
            "Runs"
        ],
        "pricingType": "paid",
        "pricing": ""
    },
    {
        "id": "evt-5",
        "slug": "eye-contact-booth-apr-26-2026",
        "title": "Eye Contact Booth",
        "description": "Eye Contact Booth - See, Feel, Connect\nStep into a space where words pause and connection begins with presence. At the Eye\nContact Booth, participants engage in 5 minutes of silent, one-on-one eye contact with\nfellow participants - across genders and within the same gender - creating moments\nof deep awareness and genuine connection.\n\nWhat to Expect\n5 Minutes of Silent Eye Contact\nNo talking. No distractions. Just you and another human being, fully present. This\nsimple act often opens doors to empathy, vulnerability, and understanding.\n\n1-1 Conversations After\nAfter the silent exchange, participants get dedicated time to talk, share, and reflect \u2014\nletting words flow naturally after presence has been established.\n\nSocial Time with the Group\nThe experience then opens up into a relaxed social space where everyone can mingle, connect, and continue conversations organically.\n\nA Safe, Inclusive Space\nYou'll have eye contact moments with people of the same gender and opposite gender, all within a guided, respectful, and comfortable environment.\n\nWhy Eye Contact?\nSustained eye contact helps us slow down, feel seen, open up emotionally, and\nconnect beyond surface-level interactions. It often leads to honesty, warmth, and\nsurprisingly meaningful conversations.\n\nJoin us for an experience that reminds you how powerful simply being seen can be.",
        "cityId": "chennai",
        "venue": "Wangs Kitchen, Alwarpet",
        "address": "Alwarpet",
        "mapsLink": "https://maps.app.goo.gl/8fNsW7N1dXbPttpB9",
        "bookingLink": "https://in.bookmyshow.com/events/eye-contact-booth/ET00478093",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Boy_and_girl_202604222313.jpeg",
        "date": "2026-04-26",
        "time": "3:00 PM",
        "categories": [
            "Singles Mixer"
        ],
        "pricingType": "paid",
        "pricing": "₹799"
    },
    {
        "id": "evt-6",
        "slug": "lunch-with-strangers-apr-25-2026",
        "title": "Lunch with Strangers",
        "description": "*Step out of your comfort zone and into a lunch of conversations & culinary delights!*\n\n\n\"Lunch with Strangers\" is a premium social dining experience where strangers meet, eat, and leave as friends.\n\n\nIt\u2019s not just lunch\u2014it\u2019s networking, bonding, and storytelling rolled into one.\n\n\nWho Should Attend:\n\n\n\u2022\u2060 \u2060Anyone eager to expand their social circle.\n\n\n\u2022\u2060 \u2060People who love meeting new personalities over food.\n\n\n\u2022\u2060 \u2060Foodies who know stories taste better with meals.\n\n\n3 Reasons to Attend:\n\n\n\u2022\u2060 \u2060Meet strangers who might just become friends.\n\n\n\u2022\u2060 \u2060A classy afternoon with food, drinks & fun.\n\n\n\u2022\u2060 \u2060Conversations as fulfilling as the menu.",
        "cityId": "chennai",
        "venue": "Madras Food Walk",
        "address": "Porur",
        "mapsLink": "https://maps.app.goo.gl/rsBiE38PLcm3nnWE9",
        "bookingLink": "https://www.district.in/events/lunch-with-strangers-chennai-apr4-2026-buy-tickets",
        "image": "https://ik.imagekit.io/zxnq8x4yz/People_having_lunch_202604222328.jpeg",
        "date": "2026-04-25",
        "time": "5:00 PM",
        "categories": [
            "Singles Mixer"
        ],
        "pricingType": "paid",
        "pricing": "₹199"
    },
    {
        "id": "evt-7",
        "slug": "board-games-meetup-apr-26-2026",
        "title": "Board Games Meetup",
        "description": "Tired of screens and small talk? Come join us for an evening of laughter, strategy, and a little friendly competition!\n\n\nWe\u2019ve curated this event to bring together fun-loving people who enjoy connecting over classic and modern board games.\n\n\nWhether you\u2019re here to win or just roll the dice for fun, our mix of games and ice breakers will help spark conversations and build lasting friendships.",
        "cityId": "chennai",
        "venue": "Madras Food Walk",
        "address": "Porur",
        "mapsLink": "https://maps.app.goo.gl/rsBiE38PLcm3nnWE9",
        "bookingLink": "https://www.district.in/events/board-games-meetup-chennai-apr4-2026-buy-tickets",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Indian_youth_playing_202604222340.jpeg",
        "date": "2026-04-26",
        "time": "5:00 PM",
        "categories": [
            "Stranger Meetup"
        ],
        "pricingType": "paid",
        "pricing": "₹199"
    },
    {
        "id": "evt-8",
        "slug": "singles-mixer-apr-25-2026",
        "title": "Singles Meetup",
        "description": "Singles Meetup doesn\u2019t mean searching\u2014it just means showing up as yourself.\n\n\nThis is a relaxed, no-pressure space for singles to meet, talk, and spend a good evening around new people. No expectations, no formats to force outcomes\u2014just conversations that go where they naturally do.\n\n\nWho should attend:\n\n\n* Anyone single who enjoys meeting new people\n\n\n* People who prefer real, easy conversations\n\n\n* Those who value presence over labels\n\n\nWhy come:\n\n\n* Open conversations without pressure\n\n\n* A social evening that works regardless of who shows up\n\n\n* You might leave with a great conversation, a new perspective, or just a good time",
        "cityId": "chennai",
        "venue": "Madras Food Walk",
        "address": "Porur",
        "mapsLink": "https://maps.app.goo.gl/rsBiE38PLcm3nnWE9",
        "bookingLink": "https://www.district.in/events/singles-meetup-chennai-apr4-2026-buy-tickets",
        "image": "https://ik.imagekit.io/zxnq8x4yz/image.png_202604222239.jpeg",
        "date": "2026-04-25",
        "time": "5:00 PM",
        "categories": [
            "Singles Mixer"
        ],
        "pricingType": "paid",
        "pricing": "₹199"
    },
    {
        "id": "evt-9",
        "slug": "salsa-workshop-apr-26-2026",
        "title": "Salsa Workshop",
        "description": "Enjoy your evening with our fun Salsa Workshop for Beginners! Get started with social dancing immediately \n\n\"Best of Chennai\" - Must Experience! More than 200+ Workshops hosted with amazing feedback from all participants\n\nIn this workshop, you will learn:\n- Basic Foot Movements\n- Basic Turn\n- Partner Connection\n- Cross Body Lead\n- Musical Counts\n- Introduction to Social Dancing\n\nVenue: Zimmer Studios, Velachery\n\nNote:\n- Prior dance experience NOT required\n- Partner NOT required (everyone dances with everyone)\n- Pis reach the studio 5 minutes before\n- Dress to impress :)\n- Maintain Personal Hygiene & smell really nice (Perfume, Body Spray, Mouth\nFreshener, etc..) (!! This is really important for any partner dance!!)\n- Bring a pair of clean shoes or heels to change inside the studio (you can also dance\nwith socks; shoes not mandatory)\nBring your friends along and have loads of fun grooving to Salsa music",
        "cityId": "chennai",
        "venue": "Zimmer Studios",
        "address": "Velachery",
        "mapsLink": "https://maps.app.goo.gl/vRGYhmGaTNAs2utz7",
        "bookingLink": "https://in.bookmyshow.com/events/salsa-workshop-beginners/ET00392862",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222331.jpeg",
        "date": "2026-04-26",
        "time": "5:00 PM",
        "categories": [
            "Workshop"
        ],
        "pricingType": "paid",
        "pricing": "₹199"
    },
    {
        "id": "evt-10",
        "slug": "drink-blabber-strangers-apr-25-2026",
        "title": "Drink & Blabber with Strangers",
        "description": "Step into a night where conversations flow as freely as the drinks\n\u2022 Location: Three Layers, Injambakkam\n\u2022 Date: April 25\n\u00d3 Time: 6:30 PM onwards\nMeet new people, share wild stories, laugh louder than usual, and maybe walk out with unexpected friendships\n(s) Entry Fee: 399 (Non-redeemable) |\nBill-sharing event\nNo pressure. No judgments. Just pure vibes and real conversations.\n Limited spots \u2014 DM now to lock yours",
        "cityId": "chennai",
        "venue": "3 LAYERS , 81B, SH 49, Injambakkam, Chennai, Tamil Nadu 600115, India",
        "address": "Injambakkam",
        "mapsLink": "https://maps.app.goo.gl/dnLnvagiYCwBiA7D8",
        "bookingLink": "https://www.ticketprix.com/event/drinkblabberwithstrangers",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604222336%20(1).jpeg",
        "date": "2026-04-25",
        "time": "6:30 PM",
        "categories": [
            "Stranger Meetup"
        ],
        "pricingType": "paid",
        "pricing": "₹399"
    }
]

// ── Helper Functions ──────────────────────────────────────────────

/** Get all events for a specific city */
export function getEventsByCity(cityId: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId)
}

/** Look up an event by its slug within a city */
export function getEventBySlug(cityId: string, slug: string): Event | undefined {
    return EVENTS.find(e => e.cityId === cityId && e.slug === slug)
}

/** Get events filtered by category within a city */
export function getEventsByCityAndCategory(cityId: string, category: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.categories?.includes(category))
}

/** Get unique categories for a city's events */
export function getCategoriesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const catSet = new Set<string>()
    cityEvents.forEach(e => e.categories?.forEach(c => catSet.add(c)))
    return Array.from(catSet)
}

/** Get events for a specific date within a city */
export function getEventsByDate(cityId: string, date: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.date === date)
}

/** Get upcoming events (today or later) for a city, sorted by date */
export function getUpcomingEvents(cityId: string): Event[] {
    const today = new Date().toISOString().split('T')[0]
    return EVENTS
        .filter(e => e.cityId === cityId && e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
}

/** Get unique dates for a city's events */
export function getDatesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const dateSet = new Set<string>()
    cityEvents.forEach(e => dateSet.add(e.date))
    return Array.from(dateSet).sort()
}
