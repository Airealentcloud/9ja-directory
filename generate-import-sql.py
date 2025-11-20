#!/usr/bin/env python3
"""
Generate SQL import script from CSV file for 9jaDirectory
"""

import csv
import re

# Category mapping
CATEGORY_MAP = {
    'Agriculture': 'agriculture',
    'Travel': 'transportation',
    'Services': 'professional-services',
    'RealEstate': 'real-estate',
    'Education': 'education',
}

def clean_phone(phone):
    """Clean phone number"""
    if not phone:
        return ''
    # Remove all non-numeric except +
    cleaned = re.sub(r'[^0-9+]', '', phone)
    return cleaned if cleaned else ''

def generate_slug(name, index):
    """Generate URL-friendly slug"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-{index}"

def escape_sql(text):
    """Escape single quotes for SQL"""
    if not text:
        return ''
    return text.replace("'", "''")

def extract_city(address):
    """Extract city from address"""
    if not address:
        return None

    address_lower = address.lower()

    # Lagos areas
    cities = {
        'ikeja': 'ikeja',
        'lekki': 'lekki',
        'victoria island': 'victoria-island',
        'yaba': 'yaba',
        'surulere': 'surulere',
        'ikoyi': 'ikoyi',
        'maryland': 'maryland',
        'ajah': 'ajah'
    }

    for keyword, city_slug in cities.items():
        if keyword in address_lower:
            return city_slug

    return None

# Read CSV and generate SQL
print("-- Import ALL 100 Listings for 9jaDirectory")
print("-- Generated from CSV")
print("-- Run this in Supabase SQL Editor after running database-schema-enhanced.sql\n")

print("-- Insert all listings")
print("INSERT INTO listings (")
print("  business_name,")
print("  slug,")
print("  description,")
print("  category_id,")
print("  state_id,")
print("  city_id,")
print("  address,")
print("  phone,")
print("  established_year,")
print("  status,")
print("  verified,")
print("  created_at,")
print("  updated_at")
print(") VALUES")

with open('nigeria_business_directory_100_with_extra_fields.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

    for i, row in enumerate(rows, start=1):
        name = escape_sql(row['Name'])
        description = escape_sql(row['Description'])
        address = escape_sql(row['Address'])
        phone = clean_phone(row['Phone'])

        # Map category
        csv_category = row['Category'] if row['Category'] else 'Services'
        category_slug = CATEGORY_MAP.get(csv_category, 'professional-services')

        # Extract city
        city_slug = extract_city(row['Address'])
        city_clause = f"(SELECT id FROM cities WHERE slug = '{city_slug}' AND state_id = (SELECT id FROM states WHERE slug = 'lagos') LIMIT 1)" if city_slug else "NULL"

        # Parse year
        year_str = row.get('Year_Established', '')
        try:
            year = int(float(year_str)) if year_str else 'NULL'
        except:
            year = 'NULL'

        # Generate slug
        slug = generate_slug(row['Name'], i)

        # Build SQL row
        print(f"-- Row {i}: {row['Name']}")
        print("(")
        print(f"  '{name}',")
        print(f"  '{slug}',")
        print(f"  '{description}',")
        print(f"  (SELECT id FROM categories WHERE slug = '{category_slug}' LIMIT 1),")
        print(f"  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),")
        print(f"  {city_clause},")
        print(f"  '{address}',")
        print(f"  '{phone}',")
        print(f"  {year},")
        print(f"  'approved',")
        print(f"  false,")
        print(f"  NOW(),")
        print(f"  NOW()")

        # Add comma if not last row
        if i < len(rows):
            print("),")
        else:
            print(");")

print("\n-- Verification queries")
print("SELECT COUNT(*) as total_listings FROM listings WHERE status = 'approved';")
print("\nSELECT c.name, COUNT(l.id) as count")
print("FROM listings l")
print("JOIN categories c ON l.category_id = c.id")
print("GROUP BY c.name")
print("ORDER BY count DESC;")
print("\nSELECT business_name, phone, address")
print("FROM listings")
print("ORDER BY created_at DESC")
print("LIMIT 10;")
