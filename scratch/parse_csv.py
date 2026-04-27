import csv
import json

csv_path = '/Users/karthiktatikonda/Downloads/aprilactivtieslast.csv'

activities = []
next_id = 195

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    # Strip spaces from fieldnames
    reader.fieldnames = [name.strip() for name in reader.fieldnames]
    for row in reader:
        # Map CSV columns to Activity interface
        # id,title,placeId,cityId,slug,description,location,area,image,locationLink,address,timings,tags,bookingLink,pricingType,pricing
        
        tags = [t.strip() for t in row['tags'].split(',')] if row['tags'] else []
        
        # Clean up some common issues like trailing commas or extra quotes
        title = row['title'].strip()
        placeId = row['placeId'].strip()
        cityId = row['cityId'].strip().lower()
        slug = row['slug'].strip()
        description = row['description'].strip()
        location = row['location'].strip()
        area = row['area'].strip()
        image = row['image'].strip()
        locationLink = row['locationLink'].strip()
        address = row['address'].strip().replace('\n', ' ')
        timings = row['timings'].strip().replace('\n', ' ')
        bookingLink = row['bookingLink'].strip()
        pricingType = row['pricingType'].strip().lower()
        pricing = row['pricing'].strip()
        
        activity = {
            "title": title,
            "cityId": cityId,
            "placeId": placeId,
            "id": str(next_id),
            "slug": slug,
            "description": description if description else None,
            "location": location,
            "area": area,
            "image": image,
            "locationLink": locationLink,
            "address": address,
            "timings": timings,
            "tags": tags,
            "bookingLink": bookingLink if bookingLink else None,
            "pricingType": pricingType if pricingType in ['free', 'paid'] else 'paid',
            "pricing": pricing,
            "addedDate": "2026-04-27"
        }
        
        # Remove None values to match TS optional fields
        activity = {k: v for k, v in activity.items() if v is not None}
        
        activities.append(activity)
        next_id += 1

# Generate TypeScript code
ts_code = ""
for act in activities:
    ts_code += "    {\n"
    for key, value in act.items():
        if isinstance(value, list):
            ts_code += f"        {key}: {json.dumps(value)},\n"
        else:
            ts_code += f"        {key}: {json.dumps(value)},\n"
    ts_code += "    },\n"

print(ts_code)
