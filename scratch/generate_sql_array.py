import csv
import json

input_file = '/Users/karthiktatikonda/Downloads/maythings.csv'
output_file = '/Users/karthiktatikonda/Downloads/tboc/tbocapp/scratch/insert_activities_array.sql'

def clean_tags_to_array(tags_str):
    if not tags_str or tags_str == '[]':
        return 'ARRAY[]::text[]'
    try:
        # The tags are in format '["tag1"," tag2"]'
        tags_list = json.loads(tags_str)
        # Clean each tag: trim spaces and escape single quotes
        cleaned = [t.strip().replace("'", "''") for t in tags_list]
        if not cleaned:
            return 'ARRAY[]::text[]'
        return "ARRAY[" + ", ".join([f"'{t}'" for t in cleaned]) + "]::text[]"
    except:
        return 'ARRAY[]::text[]'

def escape_sql(val):
    if val is None or val == '':
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    sql_statements = []
    
    for row in reader:
        # Mapping columns
        slug = row.get('slug', '')
        title = row.get('title', '')
        description = row.get('description', '')
        location = row.get('location', '')
        area = row.get('area', '')
        image = row.get('image', '')
        location_link = row.get('location_link', '')
        address = row.get('address', '')
        timings = row.get('timings', '')
        tags_array = clean_tags_to_array(row.get('tags', '[]'))
        booking_link = row.get('booking_link', '')
        pricing_type = row.get('pricing_type', '')
        pricing = row.get('pricing', '')
        city_id = row.get('city_id', '')
        place_id = row.get('place_id', '')
        
        # We use UPSERT (on conflict do update)
        sql = f"""INSERT INTO activities (
    slug, title, description, location, area, image, location_link, address, timings, tags, booking_link, pricing_type, pricing, city_id, place_id
) VALUES (
    {escape_sql(slug)}, 
    {escape_sql(title)}, 
    {escape_sql(description)}, 
    {escape_sql(location)}, 
    {escape_sql(area)}, 
    {escape_sql(image)}, 
    {escape_sql(location_link)}, 
    {escape_sql(address)}, 
    {escape_sql(timings)}, 
    {tags_array}, 
    {escape_sql(booking_link)}, 
    {escape_sql(pricing_type)}, 
    {escape_sql(pricing)}, 
    {escape_sql(city_id)}, 
    {escape_sql(place_id)}
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
    place_id = EXCLUDED.place_id;"""
        sql_statements.append(sql)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("\n\n".join(sql_statements))

print(f"✅ Generated SQL script with {len(sql_statements)} activities at {output_file}")
