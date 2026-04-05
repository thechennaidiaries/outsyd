export interface WalkPlace {
    title: string       // Name of the place/stop
    image: string       // Image URL
}

export interface Walk {
    id: string          // unique identifier
    slug: string        // URL-friendly slug, e.g. "biriyani-hopping-anna-nagar"
    title: string       // Title of the walk
    cityId: string      // References City.id
    area: string        // Area within the city
    image: string       // Cover image for the walk
    mapsLink: string    // Google Maps link
    places: WalkPlace[] // Ordered list of stops (4+ places)
}

export const WALKS: Walk[] = [
    {
        id: '1',
        slug: 'biryani-hopping-anna-nagar',
        title: 'Biriyani Hopping in Anna nagar',
        cityId: 'chennai',
        area: 'Anna Nagar',
        image: 'https://ik.imagekit.io/zxnq8x4yz/BiriyaniHopping.png?updatedAt=1775386484238',
        mapsLink: 'https://maps.app.goo.gl/daVQRG6F1ybVzArw6',
        places: [
            { title: 'Hyderabadi Biryani &  chicken 65 at the Ramaas The Hyderabadi', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ramaashyderabadi.png' },
            { title: 'Seeraga Samba Mutton biriyani at the Ambur Star Briyani', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/amburbiriyani.png' },
            { title: 'Chennai Style biriyani & Chicken Kebab at Pottalam Biriyani: Not sure of location & if it\'s open', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/pottalom%20biryani.png' },
            { title: 'Chicken Kebab Biriyani at the Mani\'s Dum Biryani', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/manisdumanna%20nagar.png' },
            { title: 'Seeraga Samba Mutton Biriyani & Chicken 65 at Thavusukutti Biriyani', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/thavasukuttibiryani.png' },
            { title: 'Mutton biryani with double masala & Guntur Kodi Kebab at The Old Mirchi Biryani', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/oldmirchiannanagar.webp' }
        ],
    },
    {
        id: '2',
        slug: 'sowcarpet-street-food-hopping',
        title: 'Sowcarpet Street food hopping',
        cityId: 'chennai',
        area: 'Sowcarpet',
        image: 'https://ik.imagekit.io/zxnq8x4yz/sowcarpetstreetfoodhopping.jpeg?updatedAt=1775386484565',
        mapsLink: 'https://maps.app.goo.gl/5WPTsaAu36XE3TRF9',
        places: [
            { title: 'Try the pyaaz kachori at Maya Chats', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/amburbiriyani.png' },
            { title: 'Grab a classic vada pav at the famous shree vada pav', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/vadapav.png' },
            { title: 'Try the legendary Jalebi and Aloo Tikki at Kakada Ramprasad', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kakadaramprasad.png?updatedAt=1775124805468' },
            { title: 'Try the Basundi & Kesari Lassi at AGARWAL BHAVAN', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/agarwalbhavan.png?updatedAt=1775124802555' },
            { title: 'Try the Bhujia puff and muruku sandwich at Chinnappa Sandwich Centre', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sandwichshopmurukkusandwich.png?updatedAt=1775124807054' }
        ],
    },
    {
        id: '3',
        slug: 'seafood-hopping-chennai',
        title: 'Seafood hopping in Marina',
        cityId: 'chennai',
        area: 'Marina',
        image: 'https://ik.imagekit.io/zxnq8x4yz/marinaseafoodhopping.jpeg?updatedAt=1775386484507',
        mapsLink: 'https://maps.app.goo.gl/3q3dMe4MDp416E2K7',
        places: [
            { title: 'Chicken fried rice and prawns at Titanic Fast Food', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/titanic.png?updatedAt=1775124807159' },
            { title: 'Fish meals & prawns 65 at Sundari Akka Kadai, Marina Beach', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sundariakkakadai.png?updatedAt=1775124807627' },
            { title: 'Neththili fry & Meen saapdu at Govindammal Live Food', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/govindammal.png?updatedAt=1775124807659' },
            { title: 'Crab curry & Nethili fish fry at Naga\'s Mess', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/nagasmess.png?updatedAt=1775124807677' },
            { title: 'Prawn Noodles And Dragon Prawn at Sandy\'s kitchen', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sandys.png?updatedAt=1775124807817' }
        ],
    },
    {
        id: '4',
        slug: 'chennai-heritage-walk-history',
        title: 'Go a Heritage walk to Discover Chennai\'s History',
        cityId: 'chennai',
        area: 'George Town',
        image: 'https://ik.imagekit.io/zxnq8x4yz/heritagehopping.jpeg?updatedAt=1775386484493',
        mapsLink: 'https://maps.app.goo.gl/yH83YApyNSJNHEMc7',
        places: [
            { title: 'Visit the century old Ripon Building', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ripponbuilding_processed.png' },
            { title: 'Visit the first ever English fortress in India built in 1644 at Fort St. George Museum', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/stgeorgemuseum.png?updatedAt=1775124807506' },
            { title: 'Visit one of the oldest high courts in India built in the year 1862 at Madras High Court', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/highcourtchennai.png?updatedAt=1775124807494' },
            { title: 'Explore the as the first town hall of Madras built in the 1800\'s at Victoria Public Hall to to commemorate the Golden Jubilee of Queen Victoria', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/victoriapublichall_processed.png' },
            { title: 'Tour the second oldest museum of the country with centuries-old artefacts at Egmore Museum', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/egmorelibrary_processed.png' }
        ],
    },
    {
        id: '5',
        slug: 'late-night-food-hopping-mount-road',
        title: 'Late Night food hopping in Mount Road',
        cityId: 'chennai',
        area: 'Mount Road',
        image: 'https://ik.imagekit.io/zxnq8x4yz/latenightfoodhopping.jpeg?updatedAt=1775386484501',
        mapsLink: 'https://maps.app.goo.gl/hp5zFtYpkmJrVbTk6',
        places: [
            { title: 'Bun Butter Jam at Mount Road Bilal', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/bilalmountroad.png?updatedAt=1775124806733' },
            { title: 'Mutton Samosa at Buhari', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/buhari.png?updatedAt=1775124807025' },
            { title: 'Ghee Roast Dosa at Geetham Veg Restaurant', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/geethamveg.png' },
            { title: 'Beef Burger and Chicken Loaded fries at Crave', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/cravemountroad.png?updatedAt=1775124805999' },
            { title: 'Butter Milk at Chetta Buttermilk, Thousand Lights', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/chettabuttermilk.png?updatedAt=1775124805164' },
            { title: 'pepper barbeque chicken & shawarma at Zaitoon', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/pepperbarbque_processed.png' }
        ],
    },
    {
        id: '6',
        slug: 'ice-cream-dessert-hopping-knk',
        title: 'Ice Cream & Dessert Hopping in KNK',
        cityId: 'chennai',
        area: 'KNK',
        image: 'https://ik.imagekit.io/zxnq8x4yz/icecreamhoppingkgk.jpeg?updatedAt=1775386484472',
        mapsLink: 'https://maps.app.goo.gl/KKKe5KxQJugazSRRA',
        places: [
            { title: 'Coconut ice cream at Naturals Ice Cream', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/naturalsicecream.png?updatedAt=1775124806669' },
            { title: 'Dark Chocolate Sorbet at Amadora Artisan Ice Cream', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/amadoraknk.png?updatedAt=1775124806530' },
            { title: 'Rose Milk Ice Cream at Glacee', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/glaceerosemilkicecream.png?updatedAt=1775124807134' },
            { title: 'Half Baked Brownie Batter at Batter', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/batter.png?updatedAt=1775124806600' },
            { title: 'Straberry & Mango Softy at Some Softy', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/somesofty.png?updatedAt=1775124807042' }
        ],
    },
    {
        id: '7',
        slug: 'parotta-hopping-tnagar',
        title: 'Parotta Hopping in T nagar',
        cityId: 'chennai',
        area: 'T Nagar',
        image: 'https://ik.imagekit.io/zxnq8x4yz/parottahoppingtnanar.jpeg?updatedAt=1775386484470',
        mapsLink: 'https://maps.app.goo.gl/ieRRSdi43wuXVqXu6',
        places: [
            { title: 'Border Parotta & Chicken Pichi Potta fry at Courtallam Border Rahmath Kadai', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/borderparottakadai.png?updatedAt=1775124807562' },
            { title: 'Parotta & Nattu Kozhi Chicken at Nellai Vairamaligai, T Nagar', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/nellaivairamaligai.png?updatedAt=1775124807683' },
            { title: 'Kothu Parotta at T Nagar Bhai Kadai', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/tnagarbhaikadai.png?updatedAt=1775124807617' },
            { title: 'Parotta with chicken gravy at Erode Amman Mess', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/erodeammanmessparotta.png?updatedAt=1775124805916' },
            { title: 'Poricha parotta at Kasim chettinadu hotel', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Kasim%20chettinadu%20hotel.png' }
        ],
    },
    {
        id: '8',
        slug: 'burger-hopping-nungambakkam',
        title: 'Burger Hopping in Nungambakkam',
        cityId: 'chennai',
        area: 'Nungambakkam',
        image: 'https://ik.imagekit.io/zxnq8x4yz/burgerhopping.jpeg?updatedAt=1775386484556',
        mapsLink: 'https://maps.app.goo.gl/2ALa8L7xEFVJMqn58',
        places: [
            { title: 'Nashville beef burger & Smashed Beef Burger at Soul, KNK Road', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/soulburger.png?updatedAt=1775124807706' },
            { title: 'Zinger Crunch Spicy Burger at Burgafe', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/burgafe.png?updatedAt=1775124802960' },
            { title: 'double Patty beef burger at Goldman\'s Steakhouse', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/goldmanssteakhouse.png?updatedAt=1775124807186' },
            { title: 'Dirty Burger & Loaded fries At Le Smash, Nungambakkam', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/lesmash.png?updatedAt=1775124807515' },
            { title: 'Original chicken burger at Temp Fried Chicken', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/tempfriedchicken.jpeg?updatedAt=1775124803998' }
        ],
    },
    {
        id: '9',
        slug: 'food-truck-hopping-besant-nagar',
        title: 'Food Truck Hopping in Besant Nagar',
        cityId: 'chennai',
        area: 'Besant Nagar',
        image: 'https://ik.imagekit.io/zxnq8x4yz/foodtruckhopping.jpeg?updatedAt=1775386484502',
        mapsLink: 'https://maps.app.goo.gl/Y41LAoK9vQUMFEEe6',
        places: [
            { title: 'Fruit Popsicles at The Tickle Truck, Besant Nagar', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ticketruck.png?updatedAt=1775124806756' },
            { title: 'Mexican chicken poppers at Pepino Food truck', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/peppinofoodtruck.png?updatedAt=1775124807383' },
            { title: 'spicy chicken pita at Pita Poc', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/pitapoc.png?updatedAt=1775124806260' },
            { title: 'White Sauce Pasta at The Madras Food Truck', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/madrasfoodtruck_processed.png' },
            { title: 'Spicy Peri Fries at Fries with Benefits', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/frieswithbenefits.png?updatedAt=1775124805939' }
        ],
    },
    {
        id: '10',
        slug: 'temple-hopping-mylapore',
        title: 'Temple Hopping in Mylapore',
        cityId: 'chennai',
        area: 'Mylapore',
        image: 'https://ik.imagekit.io/zxnq8x4yz/templehopping.jpeg?updatedAt=1775386484520',
        mapsLink: 'https://maps.app.goo.gl/kEWGCQvHEd69vqm3A',
        places: [
            { title: 'Pray at the Historic Kapaleeshwarar Temple in Mylapore', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kapalesswar%20temple_processed.png?updatedAt=1774535379541' },
            { title: 'Visit the famous Arulmigu Velleeswarar Thirukovil', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Arulmiqu%20Velleeswarar%20Thirukovil.png' },
            { title: 'Sri Adikesava Perumal Peyalwar Temple', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Sri%20Adikesava%20Perumal%20Peyalwar%20Temple.png' },
            { title: 'Visit the famous Mariamman temple, Arulmigu Mundagakanni Amman Temple', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Arulmigu%20Mundagakanni%20Amman%20Temple.png' },
            { title: 'Visit this calming Sai Baba Temple built in 1952', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/saibabatemple.png' },
            { title: 'Explore this iconic shivan temple that\'s 450 years old at Sri Karaneeshwarar Kovil', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Sri%20Karaneeshwarar%20Kovil.png' }
        ],
    },
    {
        id: '11',
        slug: 'filter-coffee-hopping-mylapore',
        title: 'Filter Coffee Hopping in Mylapore',
        cityId: 'chennai',
        area: 'Mylapore',
        image: 'https://ik.imagekit.io/zxnq8x4yz/coffeecrawlmylapore.jpeg?updatedAt=1775386484443',
        mapsLink: 'https://maps.app.goo.gl/Y8JZWmhtTacscPko6',
        places: [
            { title: 'Mylapore filter coffee at Rayar\'s mess', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/rayarmesscoffee.png' },
            { title: 'Fresh filter coffee at Kayalir Canteen, Mylapore', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kayalircanteencoffee.png' },
            { title: 'Mylapore filter coffee', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/mylaporefiltercoffee.png' },
            { title: 'Mini Coffee at Mylai Coffee', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/mylaicoffee.png' },
            { title: 'Cotha\'s coffee', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/Cotha\'s%20coffee.png' },
            { title: 'Ratna Cafe', image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ratnacafemylapore.png' }
        ],
    }
]

// ── Helper functions ──────────────────────────────────────────────

/** Get all walks for a specific city */
export function getWalksByCity(cityId: string): Walk[] {
    return WALKS.filter(w => w.cityId === cityId)
}

/** Look up a walk by its slug within a city */
export function getWalkBySlug(cityId: string, slug: string): Walk | undefined {
    return WALKS.find(w => w.cityId === cityId && w.slug === slug)
}

/** Get all walks for a specific area within a city */
export function getWalksByCityAndArea(cityId: string, area: string): Walk[] {
    return WALKS.filter(w => w.cityId === cityId && w.area === area)
}

/** Get unique areas that have walks for a city */
export function getWalkAreasByCity(cityId: string): string[] {
    const cityWalks = getWalksByCity(cityId)
    const areaSet = new Set<string>()
    cityWalks.forEach(w => areaSet.add(w.area))
    return Array.from(areaSet)
}
