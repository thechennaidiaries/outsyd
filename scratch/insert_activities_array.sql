INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'go-karting-mika-chennai', 
    'Race at chennai''s only international go karting track', 
    NULL, 
    'MIKA', 
    'Irungattukottai', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/mikagokarting.jpeg', 
    'https://share.google/EgZeYv8pVFfbV4iqh', 
    'NH4, opposite of Hyundai Motor India Limited, Factory, Irungattukottai, Tamil Nadu 602117', 
    'Friday 11 am–5 pm
Saturday        11 am–5 pm
Sunday        10 am–5 pm
Monday        Closed
Tuesday        10 am–5 pm
Wednesday        10 am–6 pm
Thursday        1–5 pm', 
    ARRAY['outdoor activities', 'group activities', 'adventure activities']::text[], 
    'https://www.instagram.com/mikakartingchennai/', 
    'paid', 
    'Starts from Rs 900 per person (5 mins)', 
    'chennai', 
    'MIKA'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'airborne-trampoline-park-chennai', 
    'Go to a trampoline park for an adventurous day', 
    NULL, 
    'airborne trampoline park ', 
    'KNK Road', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/airboneknk.jpeg', 
    'https://share.google/YnXMDTxgObWFudODm', 
    '10/29, Khader Nawaz Khan Rd, Thousand Lights West, Thousand Lights, Chennai, Tamil Nadu 600006', 
    'Monday	10 am–10 pm
Tuesday	10 am–10 pm
Wednesday	10 am–10 pm
Thursday	10 am–10 pm
Friday	10 am–10 pm
Saturday	10 am–10 pm
Sunday	10 am–10 pm
', 
    ARRAY['indoor activities', 'group activities', 'adventure activities', 'kids activities']::text[], 
    'https://www.instagram.com/airborneparks/', 
    'paid', 
    'Starts from Rs 300 per hour', 
    'chennai', 
    'airborne trampoline park '
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'flydining-chennai-sky-dining', 
    'Enjoy a luxury dining experience while seated in the sky', 
    NULL, 
    'FlyDining Chennai', 
    'ECR', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/skydiningchennai.jpeg', 
    'https://share.google/CFyzh4PPSYwb4kVdq', 
    'SH 49, East Coast Rd, Injambakkam, Chennai, Tamil Nadu 600115', 
    'Monday        10 am–10 pm
Tuesday        10 am–10 pm
Wednesday        10 am–10 pm
Thursday        10 am–10 pm
Friday        10 am–10 pm
Saturday        10 am–10 pm
Sunday        10 am–10 pm', 
    ARRAY['outdoor activities', 'leisure activities']::text[], 
    'https://www.flydining.com/chennai/', 
    'paid', 
    'Starts from Rs 1999 per person', 
    'chennai', 
    'FlyDining Chennai'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'marundheeshwarar-temple-thiruvanmiyur-visit', 
    'Visit a 11th century era temple with rajendra chola inscriptions', 
    NULL, 
    'Marundheeshwarar Temple', 
    'Thiruvanmiyur', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/marudheeswarar.jpeg', 
    'https://share.google/IKVamYPH46YhjTVoS', 
    '8, W Tank St, Ambedkar Nagar, Lalitha Nagar, Thiruvanmiyur, Chennai, Tamil Nadu 600041', 
    'Monday	5:30 am–12 pm, 4–9 pm
Tuesday	5:30 am–12 pm, 4–9 pm
Wednesday 5:30 am–12 pm, 4–9 pm
Thursday	5:30 am–12 pm, 4–9 pm
Friday	5:30 am–12 pm, 4–9 pm
Saturday	5:30 am–12 pm, 4–9 pm
Sunday	5:30 am–12 pm, 4–9 pm', 
    ARRAY['outdoor activities', 'unique cultural experiences', 'leisure activities']::text[], 
    NULL, 
    'free', 
    NULL, 
    'chennai', 
    'Marundheeshwarar Temple'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'mgm-dizzee-world-theme-park', 
    'Enjoy a day of thrilling rides & water park', 
    NULL, 
    'MGM Dizzee World
', 
    'ECR', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/vgp.jpeg', 
    'https://share.google/gAzeBzkdmLUATx4Yq', 
    '1/74, East Coast Rd, Muthukadu, Chennai, Tamil Nadu 603112', 
    ' Monday	10:30 am–6:30 pm
Tuesday	10:30 am–6:30 pm
Wednesday	10:30 am–6:30 pm
Thursday	10:30 am–6:30 pm
Friday	10:30 am–6:30 pm
Saturday	10:30 am–6:30 pm
Sunday	10:30 am–6:30 pm
', 
    ARRAY['outdoor activities', 'adventure activities', 'group activities', 'kids activities']::text[], 
    'https://www.mgmdizzeeworld.com/tickets.html?i8s1a=142_741', 
    'paid', 
    'Starts from Rs 800 for kids & Rs 1100 for adults', 
    'chennai', 
    'MGM Dizzee World
'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'cricket-at-goat360-medavakkam', 
    'Play cricket at chennai''s first 360 degree turf', 
    NULL, 
    'GOAT360', 
    'Medavakkam', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/goat360.jpeg', 
    'https://share.google/rW6vPxy9clcam24uI', 
    '2,5, Vigneshwara Nagar, 43/1, Jalladiampet, Medavakkam, Chennai, Tamil Nadu 600100', 
    'Monday        Open 24 hours
Tuesday        Open 24 hours
Wednesday        Open 24 hours
Thursday        Open 24 hours
Friday        Open 24 hours
Saturday        Open 24 hours
Sunday        Open 24 hours
', 
    ARRAY['outdoor activities', 'group activities', 'sports activities']::text[], 
    'https://turftown.in/chennai/sports-venue/goat-360greatest-of-all-turf-medavakkam-cricket', 
    'paid', 
    'Starts from Rs 1800 per hour', 
    'chennai', 
    'GOAT360'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'neon-badminton-flicker-badminton-madurvoyal', 
    'Smash serves with a fun twist at Neon badminton ', 
    NULL, 
    'flicker badminton', 
    'Madurvoyal', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/neonbadmintonfliker.jpeg', 
    'https://share.google/SYoxAyMpqT4bsvTP5', 
    'No-100, 11th St, Maduravoyal, Adayalampattu, Chennai, Tamil Nadu 600095', 
    NULL, 
    ARRAY['indoor activities', 'group activities', 'sports activities']::text[], 
    'https://turftown.in/chennai/sports-venue/flicker-badminton-neon-maduravoyal-badminton', 
    'paid', 
    'Rs 800 per hour', 
    'chennai', 
    'flicker badminton'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'make-your-own-pizza-indie-frost-chennai', 
    'Make your own Pizza at this garden restaurant', 
    NULL, 
    'The Indie Frost
', 
    'West Mambalam', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/MAKEYOUROWNPIZZA.jpeg', 
    'https://share.google/YwwkBcFlEJi22XWTj', 
    '35, 19, Mahadevan St, Sarvamangala Colony, Kamatchi Puram, West Mambalam, Chennai, Tamil Nadu 600033', 
    'Monday        11 am–10 pm
Tuesday        11 am–10 pm
Wednesday        11 am–10 pm
Thursday        11 am–10 pm
Friday        11 am–10 pm
Saturday        11 am–10 pm
Sunday        11 am–10 pm', 
    ARRAY['unique cultural experiences', 'leisure activities']::text[], 
    NULL, 
    'paid', 
    'Rs 500', 
    'chennai', 
    'The Indie Frost
'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'double-decker-panorama-bus-ttdc-head-office', 
    'Tour the city in a double decker panaroma bus', 
    NULL, 
    'TTDC Head Office', 
    'Wallahjah R', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/doubledeckerbus.jpeg', 
    'https://share.google/jJQtMZA9dckKwVg1d', 
    'No.2, Tourism Complex, Tourism Complex, No.2, Wallajah Road, 2, Wallahjah Rd, Mount Road, Anna Salai, Triplicane, Chennai, Tamil Nadu 600002', 
    'Monday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Tuesday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Wednesday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Thursday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Friday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Saturday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm
Sunday 7 am–10 am, 3 pm–5 pm, 8 pm–10 pm', 
    ARRAY['unique cultural experiences', 'leisure activities', 'low budget fun activities']::text[], 
    'https://ttdconline.com/tour/details/CHENNAI%20DOUBLE%20DECKER%20PANORAMA%20RIDE/Package', 
    'paid', 
    'From Rs 100 for kids, From Rs 150 for adults', 
    'chennai', 
    'TTDC Head Office'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'bali-themed-staycation-ivy-villa-mahabalipuram', 
    'Enjoy a staycation at bali themed villa', 
    NULL, 
    'Ivy Villa', 
    'Mahabalipuram', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/balithemedvilla.jpeg', 
    NULL, 
    'No.163, Mamallapuram Rd, VENPURUSHAM VILLAGE, Mahabalipuram, Tamil Nadu 603104', 
    NULL, 
    ARRAY['outdoor activities', 'unique cultural experiences', 'leisure activities']::text[], 
    'https://www.instagram.com/ivy_villa_ecr/', 
    'paid', 
    NULL, 
    'chennai', 
    'Ivy Villa'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'laser-maze-vgp-cyber-kingdom-chennai', 
    'Try escaping out of a Laser maze', 
    NULL, 
    'VGP Cyber Kingdom', 
    ' CHENNAI CITI CENTRE', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/lazermaze.jpeg', 
    'https://share.google/FpE4AwIFg7QTNUu6l', 
    '10/11, Dr Radha Krishnan Salai, Loganathan Colony, Mylapore, Chennai, Tamil Nadu 600004', 
    ' Monday	11 am–10 pm
Tuesday	11 am–10 pm
Wednesday	11 am–10 pm
Thursday	11 am–10 pm
Friday	11 am–10 pm
Saturday	11 am–12 am
Sunday	11 am–10 pm', 
    ARRAY['indoor activities', 'gaming activities', 'low budget fun activities']::text[], 
    NULL, 
    'paid', 
    'Rs 150 per game', 
    'chennai', 
    'VGP Cyber Kingdom'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'vintage-photo-booth-palazzo-cinemas', 
    'Make memories at this vintage photo booth', 
    NULL, 
    'Palazzo Cinemas', 
    'Nexus Vijaya Mall
', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/jannalforum.jpeg', 
    'https://share.google/owKpFIxRijaQci06C', 
    '183, Great Southern Trunk Rd, Arcot Rd, Vadapalani, Chennai, Tamil Nadu 600026', 
    'Monday	10 am–10 pm
Tuesday	10 am–10 pm
Wednesday	10 am–10 pm
Thursday	10 am–10 pm
Friday	10 am–10 pm
Saturday	10 am–10 pm
Sunday	10 am–10 pm', 
    ARRAY['indoor activities', 'group activities', 'leisure activities']::text[], 
    NULL, 
    'paid', 
    'Rs 299 for 2 photo strips', 
    'chennai', 
    'Palazzo Cinemas'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'super-grid-game-dugout-x-chennai', 
    'Play the super grid game with your friends', 
    NULL, 
    'DugOut X', 
    'Phoenix Market City', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/supergrid.jpeg', 
    'https://share.google/xFuYcsXd3YJIJzaT8', 
    'G 17, Lower Ground Floor, Palladium, Phoenix Market City, Indira Gandhi Nagar, Velachery, Chennai, Tamil Nadu 600042', 
    'Monday	10:30 am–10:30 pm
Tuesday	10:30 am–10:30 pm
Wednesday	10:30 am–10:30 pm
Thursday	10:30 am–10:30 pm
Friday	10:30 am–10:30 pm
Saturday	10:30 am–10:30 pm
Sunday	10:30 am–10:30 pm', 
    ARRAY['indoor activities', 'group activities', 'leisure activities', 'gaming activities']::text[], 
    NULL, 
    'paid', 
    'Rs 350 per person', 
    'chennai', 
    'DugOut X'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'trampoline-park-lets-play-chennai', 
    'Unlock your inner kid at a Trampoline Park', 
    NULL, 
    'Let''s Play', 
    'VR Mall', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/letsplaytrampoline.jpeg', 
    'https://share.google/0mKPZoAbh5rbGrURU', 
    '3rd Floor, VR Mall, Thirumangalam, Anna Nagar, Chennai, Tamil Nadu 600040', 
    'Monday        10:30 am–10 pm
Tuesday        10:30 am–10 pm
Wednesday        10:30 am–10 pm
Thursday        10:30 am–10 pm
Friday        10:30 am–10 pm
Saturday        10:30 am–10 pm
Sunday        10:30 am–10 pm', 
    ARRAY['indoor activities', 'group activities', 'leisure activities']::text[], 
    NULL, 
    'paid', 
    'Starts from Rs 599 per person for one hour', 
    'chennai', 
    'Let''s Play'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'laser-tag-skyjumper-amusement-park', 
    'Take out your friends in a Laser Tag Battle', 
    NULL, 
    'SkyJumper Amusement Park', 
    'Grand Square Mall', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/lasertaggrandmall.jpeg', 
    'https://share.google/fLYoqQ5yKOMPJJuoE', 
    'Front Anchor, Grand Square mall, Fourth Floor, Velachery - Tambaram Main Rd, beside Mc Donalds, V.O.C Nagar, Doctor Seetaram Nagar, Velachery, Chennai, Tamil Nadu 600042', 
    'Monday	10:30 am–10 pm
Tuesday	10:30 am–10 pm
Wednesday	10:30 am–10 pm
Thursday	6–10 pm
Friday	10:30 am–10 pm
Saturday	10:30 am–10 pm
Sunday	10:30 am–10 pm', 
    ARRAY['indoor activities', 'group activities', 'gaming activities']::text[], 
    NULL, 
    'paid', 
    'Starts from Rs 300 per person for 15 mins', 
    'chennai', 
    'SkyJumper Amusement Park'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;

INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    'dragon-rider-vr-game-timezone-chennai', 
    'Play the thrilling dragon rider VR Game', 
    NULL, 
    'Timezone', 
    'Express Avenue Mall', 
    'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/expressavenuevrgames.jpeg', 
    'https://share.google/wccgEkObaSn0P39Lw', 
    'Level 3, Express Avenue Mall, Whites Rd, Express Estate, Royapettah, Chennai, Tamil Nadu 600014
Map of Timezone- Express Avenue Mall, Chennai
', 
    'Monday	11 am–10 pm
Tuesday	11 am–10 pm
Wednesday	11 am–10 pm
Thursday	11 am–10 pm
Friday	11 am–10 pm
Saturday	11 am–10 pm
Sunday	11 am–10 pm
', 
    ARRAY['indoor activities', 'gaming activities']::text[], 
    NULL, 
    'paid', 
    NULL, 
    'chennai', 
    'Timezone'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    area = EXCLUDED.area,
    image = EXCLUDED.image,
    location_link = EXCLUDED.location_link,
    address = EXCLUDED.address,
    timings = EXCLUDED.timings,
    tags = EXCLUDED.tags,
    booking_link = EXCLUDED.booking_link,
    pricing_type = EXCLUDED.pricing_type,
    pricing = EXCLUDED.pricing,
    city_id = EXCLUDED.city_id,
    place_id = EXCLUDED.place_id;