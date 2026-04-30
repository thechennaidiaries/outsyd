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
    {
        "id": "evt-17",
        "slug": "open-mic-art-fest-may-3-2026",
        "title": "Open Mic Art Fest",
        "cityId": "chennai",
        "date": "2026-05-03",
        "status": "active",
        "address": "Sir Mutha Venkatasubba Rao Concert Hall\n\n7, Shenstone Park, # 13, 1, Harrington Rd, Chetpet, Chennai, Tamil Nadu 600031, India",
        "venue": "Chetpet",
        "mapsLink": "https://maps.app.goo.gl/D3pZqdV6cHqzy4o98",
        "bookingLink": "https://allevents.in/chennai/uncalled-knacks-open-mic-art-festival-audience-pass-tickets/80001725919777",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_imahe_202604280951.jpeg",
        "time": "9 AM – 9 PM",
        "categories": [
            "Standup"
        ],
        "pricingType": "paid",
        "pricing": "₹200"
    },
    {
        "id": "evt-18",
        "slug": "strangers-trip-to-mankulam-may-2-2026",
        "title": "STRANGERS TRIP TO MANKULAM",
        "cityId": "chennai",
        "date": "2026-05-02",
        "status": "expired",
        "description": "Mankulam Escape with The Strangers Escape 🍃\nYour weekends deserve better than malls 😌\n\nThink waterfalls, off-road rides & jungle chills 🌿\nThis is Mankulam — raw, untouched, unreal",
        "bookingLink": "https://www.instagram.com/p/DXZaZCwkzv-/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604280955.jpeg",
        "categories": [
            "Stranger Trips"
        ],
        "pricingType": "paid"
    },
    {
        "id": "evt-19",
        "slug": "strangers-trip-wayanad-may-1-2026",
        "title": "STRANGERS TRIP TO WAYANAD",
        "cityId": "chennai",
        "date": "2026-05-01",
        "status": "active",
        "description": "✨ Wayanad — where misty forests, hidden waterfalls, and cool hill air bring strangers together.\nJeep rides, trekking trails, scenic viewpoints, and conversations that feel raw, real, and unfiltered 🌫️🌲💛\n\nWith Rafiky, it’s never just about the destination — it’s about the people.\nStrangers turning into travel buddies, laughter echoing through the hills, and memories you didn’t know you needed ✨\n\nA perfect weekend escape filled with nature, connection, and adventure 🌿\n\n🎶 Nature Vibes • 😀 Laughter • 🥾 Trekking Trails • 💦 Waterfalls • 📸 Memories\n\nThis isn’t just a trip — it’s the Rafiky strangers experience 🌍\nCome solo, return with a whole new fam 👥💫",
        "bookingLink": "https://www.instagram.com/p/DXJzmMvAeG6/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_imahe_202604280953.jpeg",
        "categories": [
            "Stranger Trips"
        ],
        "pricingType": "paid"
    },
    {
        "id": "evt-20",
        "slug": "strangers-mafia-night-may-2-2026",
        "title": "Strangers Mafia Night",
        "cityId": "chennai",
        "date": "2026-05-02",
        "status": "active",
        "address": "Eatalica, Alwarpet",
        "venue": "Alwarpet",
        "mapsLink": "https://share.google/1zWC6XgsZbYz2GVfU",
        "bookingLink": "https://www.instagram.com/p/DXb6x0FgJme/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Indian_youth_playing_202604222340.jpeg?updatedAt=1776881446473",
        "time": "7:00 PM",
        "categories": [
            "Stranger Meetup"
        ]
    },
    {
        "id": "evt-21",
        "slug": "girls-stranger-trip-kolikkumalai-may-9-2026",
        "title": "Girls Stranger Trip To Kolikkumalai",
        "cityId": "chennai",
        "date": "2026-05-09",
        "status": "active",
        "description": "📅 May 9 & 10\n📍 From Chennai\n⚠️ Limited slots only\n✨ Trip Highlights\n🌄 Sunrise at Jaguar Rock\n⛺ Tent stay under stars\n🍽️ Food included\n🚙 Jeep safari\n🌿 Tea plantation views\n🔥 Campfire & fun vibes\n💰 ₹5500 / person\n📲 DM or WhatsApp to book now\n📞 6383431283",
        "bookingLink": "https://www.instagram.com/p/DXiYyrwEbRk/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Add_girls_in_202604280958.jpeg",
        "categories": [
            "Stranger Trips"
        ],
        "pricingType": "paid",
        "pricing": "₹5500"
    },
    {
        "id": "evt-22",
        "slug": "strangers-trip-to-rishikesh-may-13-2026",
        "title": "STRANGERS TRIP TO RISHIKESH",
        "cityId": "chennai",
        "date": "2026-05-13",
        "status": "active",
        "description": "✨ From the calm flow of the Ganga to the misty mountain roads of Mussoorie — this journey is where nature, peace, and people come together.\nRiverfront mornings, hilltop sunsets, cozy cafés, soulful conversations, and moments that slow you down 🌊🌄☕\n\nWith Rafiky, it’s never just about the places — it’s about the people you meet.\nStrangers turn into friends, friends into family, and every shared experience becomes a story worth remembering 💛\n\n🎶 Vibes • 😀 Laughter • 🧘 Calm Moments • 🌌 Night Talks • 📸 Memories\n\nThis isn’t just a trip — it’s the Rafiky vibe experience ✨\nCome solo, return with a whole new fam 👥💫",
        "bookingLink": "https://www.instagram.com/p/DW_dC46gSdI/",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_202604281000.jpeg",
        "categories": [
            "Stranger Trips"
        ],
        "pricingType": "paid"
    },
    {
        "id": "evt-23",
        "slug": "fake-sangeet-may-17-2026",
        "title": "FAKE SANGEET",
        "cityId": "chennai",
        "date": "2026-05-17",
        "status": "active",
        "address": "no 128, New no 22, Old, Chamiers Rd, Nandanam Extension, Nandanam, Chennai, Tamil Nadu 600035",
        "venue": "Nandanam",
        "mapsLink": "https://share.google/fBoFbix4k3Gj9Axlg",
        "bookingLink": "https://www.instagram.com/p/DWoZICYlETQ/?img_index=1",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Indian_youth_sangeeth_202604281003.jpeg",
        "time": "6:00 PM",
        "categories": [
            "Stranger Meetup"
        ],
        "pricingType": "paid"
    },
    {
        "id": "evt-24",
        "slug": "women-only-brunch-event-may-9-2026",
        "title": "A women only brunch event",
        "description": "",
        "cityId": "chennai",
        "date": "2026-05-09",
        "image": "https://ik.imagekit.io/zxnq8x4yz/image.png_202604301216.jpeg",
        "bookingLink": "https://www.instagram.com/reels/DV0VIj3CYcj/",
        "categories": ["Stranger Meetup"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-25",
        "slug": "sip-paint-strangers-may-3-2026",
        "title": "Sip & Paint with Strangers",
        "description": "✨ An evening where colours, conversations, and creativity come together\n\nSip your drink, pick up a brush, and connect with strangers in the most fun, relaxed way possible 💛\n\nNo rules\nno pressure\njust painting, laughter, and good vibes\n\nA cozy space to unwind, express yourself, and enjoy meaningful moments with new people 🌿\n\n🎶 Chill vibes\n😄 Laughter\n🎨 Painting\n🍷 Sip & relax\n📸 Memories\n\nCome solo\nleave with your artwork, new friends, and a heart full of good energy 🫂✨",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Women_aged_20-30_202604301219.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXrOwVigQ_X/",
        "categories": ["Stranger Meetup"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-26",
        "slug": "strangers-meetup-rafiky-may-3-2026",
        "title": "Strangers Meetup by Rafiky",
        "description": "✨ Looking to meet new people in Chennai this Sunday?\nJoin us for a relaxed evening filled with fun conversations, light games, shared laughter, and genuine connections with strangers 💛\n\nWith Rafiky, it’s never awkward\nit’s always comfortable\n\nA welcoming space to be yourself, talk freely, and enjoy the simple joy of meeting new people 🌿\n\n🎶 Good Vibes • 😀 Laughter • 💬 Conversations\n🎲 Fun Games • 📸 Memories\n\nCome solo, leave with new friends and moments worth remembering 🫂✨",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/image.png_202604301233.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXt0QWBD7fG/",
        "categories": ["Stranger Meetup"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-27",
        "slug": "wonderla-strangers-trip-may-3-2026",
        "title": "Wonderla Strangers Trip",
        "description": "✨ A day packed with adrenaline, water rides, laughter, and unforgettable moments with strangers who might just become your new favorite people 💛\n\nScream through roller coasters, splash into water rides, share crazy moments, and make memories that feel straight out of a movie 🎢💦😄\n\nWith Rafiky, it’s never just about the outing — it’s about the people you experience it with.\nStrangers becoming friends through chaos, laughter, and pure fun ✨\n\n🎶 Fun Vibes • 😂 Endless Laughter • 🎢 Thrill Rides • 🌊 Water Splash • 📸 Memories\n\nThis isn’t just a trip — it’s the Rafiky strangers experience 🎡\nCome solo, return with a whole new fam 👥💫",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_into_3_4_202604301230.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXrJKzuARRf/",
        "area": "Thiruporur",
        "venue": "Wonderla",
        "categories": ["Stranger Meetup", "Stranger Trips"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-28",
        "slug": "strangers-trip-kumarakom-athirapilly-may-9-2026",
        "title": "STRANGERS TRIP KUMARAKOM & ATHIRAPILLY",
        "description": "✨ From the majestic thunder of Athirappilly falls to the golden sunsets of the Kumarakom backwaters—this is where the chaos ends and the magic begins. 🌿🌊\n​Think morning mists over the river, slow boat rides through emerald greens, the spray of the waterfall on your face, and nights filled with stories that make strangers feel like soul sisters. 🛶🌅💛\n With Rafiky, every mile is a memory.\n\n​🎶 Backwater Bliss • 😄 Unlimited Laughter • 🌊 Mist & Magic • 🛶 Sunset Vibes • 📸 Golden Hour Snaps\n​Forget the solo-travel jitters. Come as you are, find your tribe, and leave with a heart full of \"remember whens.\" 👭💫",
        "cityId": "chennai",
        "date": "2026-05-09",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_into_3_4_202604301239.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXosnvFAeJp/",
        "categories": ["Stranger Trips"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-29",
        "slug": "strangers-vagamon-trip-may-16-2026",
        "title": "Strangers Vagamon Trip",
        "description": "We don’t just plan trips…\nwe create stories you’ll talk about later 🌿\n\nMisty mornings.\nLoud laughter.\nSilent hill views.",
        "cityId": "chennai",
        "date": "2026-05-16",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_image_replace_people_202604301256.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXty-ePE1fo/",
        "pricing": "6499",
        "categories": ["Stranger Trips"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-30",
        "slug": "strangers-games-night-may-3-2026",
        "title": "Strangers games night",
        "description": "",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_into_3_4_202604301258.jpeg",
        "bookingLink": "https://www.instagram.com/reels/DXrFKhpxbWj/",
        "categories": ["Stranger Meetup"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-31",
        "slug": "zumba-with-strangers-may-3-2026",
        "title": "Zumba with Strangers",
        "description": "Start your morning with:\n⚡ High-energy Zumba\n🎯 Fun games & cricket\n🤝 Meet new people\n🥤 Refreshments included\n\nNo awkwardness. No overthinking. Just show up and vibe.",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/image.png_202604301300.jpeg",
        "bookingLink": "https://www.instagram.com/p/DXtGWzEFEvm/",
        "address": "Semancheri",
        "time": "7:30 AM",
        "categories": ["Stranger Meetup"],
        "pricingType": "paid",
        "status": "active"
    },
    {
        "id": "evt-32",
        "slug": "beach-interval-run-may-2-2026",
        "title": "Beach Interval Run",
        "description": "",
        "cityId": "chennai",
        "date": "2026-05-02",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Chennai_youth_running_at_beach_202604301330.jpeg",
        "bookingLink": "https://www.cloka.in/events/69f200f209907cb765a40287/",
        "time": "6:00 AM",
        "categories": ["Runs"],
        "pricingType": "free",
        "status": "active"
    },
    {
        "id": "evt-33",
        "slug": "3-km-vamos-run-may-3-2026",
        "title": "3 KM Vamos Run",
        "description": "Kickstart your morning with a high energy 3KM community run at Porur, bringing people together for movement, fun, and connection. It is not just about running, expect warmups, good vibes, and engaging activities with a lively crowd. Whether you are a beginner or a regular runner, this is all about enjoying the experience and meeting new people. Run first, refuel after, breakfast on us.",
        "cityId": "chennai",
        "date": "2026-05-03",
        "image": "https://ik.imagekit.io/zxnq8x4yz/Resize_this_image_into_3_4_202604301332%20(1).jpeg",
        "bookingLink": "https://kynhood.com/event/69f082de975495e33d26b872",
        "address": "Porur",
        "time": "6:00 AM",
        "categories": ["Runs"],
        "pricingType": "free",
        "status": "active"
    },
]

// ── Helper Functions ──────────────────────────────────────────────

function getTodayIsoInChennai() {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

    const parts = formatter.formatToParts(new Date())
    const year = parts.find(part => part.type === 'year')?.value
    const month = parts.find(part => part.type === 'month')?.value
    const day = parts.find(part => part.type === 'day')?.value

    return `${year}-${month}-${day}`
}

function isCurrentOrUpcomingEvent(event: Event) {
    return event.status !== 'expired' && event.date >= getTodayIsoInChennai()
}

/** Get all events for a specific city (active only) */
export function getEventsByCity(cityId: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && isCurrentOrUpcomingEvent(e))
}

/** Look up an event by its slug within a city */
export function getEventBySlug(cityId: string, slug: string): Event | undefined {
    return EVENTS.find(e => e.cityId === cityId && e.slug === slug)
}

/** Get events filtered by category within a city (active only) */
export function getEventsByCityAndCategory(cityId: string, category: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.categories?.includes(category) && isCurrentOrUpcomingEvent(e))
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
    return EVENTS.filter(e => e.cityId === cityId && e.date === date && isCurrentOrUpcomingEvent(e))
}

/** Get upcoming events (today or later) for a city, sorted by date (active only) */
export function getUpcomingEvents(cityId: string): Event[] {
    return EVENTS
        .filter(e => e.cityId === cityId && isCurrentOrUpcomingEvent(e))
        .sort((a, b) => a.date.localeCompare(b.date))
}

/** Get unique dates for a city's events */
export function getDatesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const dateSet = new Set<string>()
    cityEvents.forEach(e => dateSet.add(e.date))
    return Array.from(dateSet).sort()
}
