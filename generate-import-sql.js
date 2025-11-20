// Script to generate comprehensive SQL import file
// Combines existing 26 accommodation listings + new 199 listings (rows 102-300)

const fs = require('fs');
const path = require('path');

// Helper function to generate clean slugs
function generateSlug(businessName) {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to escape SQL strings
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Helper function to clean phone numbers and descriptions
function cleanText(text) {
  if (!text) return '';
  // Remove special characters that might cause issues
  return text
    .replace(/â€™/g, "'")
    .replace(/â€"/g, "-")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€ƒ/g, ' ')
    .replace(/ï¿½/g, '')
    .trim();
}

// Category icon mapping
const categoryIcons = {
  'Accommodation': '🏨',
  'Automotive': '🚗',
  'Transportation': '🚚',
  'Recreation': '🎉',
  'Travel': '✈️',
  'Computers': '💻',
  'Agriculture': '🌾',
  'Education': '📚',
  'Health': '⚕️',
  'Business': '💼',
  'Arts & Culture': '🎨',
  'Sports & Recreation': '⚽'
};

// Read the existing SQL file to get accommodation listings
const existingSqlPath = path.join(__dirname, 'import-amina-100-listings.sql');
const existingSql = fs.readFileSync(existingSqlPath, 'utf8');

// Read the CSV file
const csvPath = path.join(__dirname, 'data from finlib.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Parse rows 102-300 (lines 103-301, accounting for 0-index and header)
const newListings = [];
for (let i = 103; i <= 301 && i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Parse CSV line (handle quoted fields with commas)
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        j++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  // Add last field
  fields.push(currentField.trim());

  if (fields.length >= 6) {
    newListings.push({
      business_name: cleanText(fields[0]),
      phone: cleanText(fields[1]),
      address: cleanText(fields[2]),
      location: cleanText(fields[3]),
      category: cleanText(fields[4]),
      description: cleanText(fields[5])
    });
  }
}

console.log(`Parsed ${newListings.length} new business listings`);

// Count by category
const categoryCounts = {};
newListings.forEach(listing => {
  categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
});
console.log('Category breakdown:', categoryCounts);

// Generate SQL
let sql = `-- Import 225+ Business Listings (26 existing + 199 new)
-- Run this in Supabase SQL Editor
-- Generated on ${new Date().toISOString().split('T')[0]}

-- Step 1: Add all categories
INSERT INTO categories (name, slug, icon, description) VALUES
('Accommodation', 'accommodation', '🏨', 'Hotels, lodges, guest houses, and accommodation services'),
('Automotive', 'automotive', '🚗', 'Car dealers, auto repairs, spare parts, and vehicle services'),
('Transportation', 'transportation', '🚚', 'Logistics, courier, freight, and transport services'),
('Recreation', 'recreation', '🎉', 'Entertainment, leisure, and recreational facilities'),
('Travel', 'travel', '✈️', 'Travel agencies, tour operators, and travel services'),
('Computers', 'computers', '💻', 'IT services, computer sales, software, and technology'),
('Agriculture', 'agriculture', '🌾', 'Farming, agricultural products, and agro-services'),
('Education', 'education', '📚', 'Schools, training centers, and educational services'),
('Health', 'health', '⚕️', 'Healthcare, medical services, and wellness'),
('Business', 'business', '💼', 'Business services, consulting, and professional services'),
('Arts & Culture', 'arts-culture', '🎨', 'Art galleries, craft centers, cultural centers, and creative services'),
('Sports & Recreation', 'sports-recreation', '⚽', 'Sports clubs, fitness centers, sports management, and recreation')
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Insert all business listings
INSERT INTO listings (
  business_name,
  slug,
  description,
  category_id,
  state_id,
  address,
  phone,
  status,
  verified,
  created_at,
  updated_at
) VALUES
`;

// Add existing accommodation listings from the import-amina-100-listings.sql
// Extract the VALUES section from existing SQL (skip category insert, only get listings)
const listingsMatch = existingSql.match(/-- Accommodation Businesses[\s\S]*?VALUES\s+([\s\S]+?);\s*$/m);
if (listingsMatch) {
  const existingValues = listingsMatch[1].trim();
  sql += existingValues + ',\n';
} else {
  // Fallback: try to extract just the VALUES portion for listings
  const valuesMatch = existingSql.match(/INSERT INTO listings[\s\S]*?VALUES\s+([\s\S]+?);\s*$/m);
  if (valuesMatch) {
    const existingValues = valuesMatch[1].trim();
    sql += existingValues + ',\n';
  }
}

// Add new listings
const newListingsSql = newListings.map((listing, index) => {
  const slug = generateSlug(listing.business_name);
  const categorySlug = generateSlug(listing.category);

  return `(
  '${escapeSql(listing.business_name)}',
  '${escapeSql(slug)}',
  '${escapeSql(listing.description)}',
  (SELECT id FROM categories WHERE slug = '${escapeSql(categorySlug)}' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  '${escapeSql(listing.address)}',
  '${escapeSql(listing.phone)}',
  'approved',
  false,
  NOW(),
  NOW()
)`;
}).join(',\n');

sql += newListingsSql + ';\n';

// Write the SQL file
const outputPath = path.join(__dirname, 'import-all-listings-225.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`\n✅ SQL file generated: ${outputPath}`);
console.log(`\n📊 Summary:`);
console.log(`   - Total listings: ${26 + newListings.length}`);
console.log(`   - Existing accommodation: 26`);
console.log(`   - New listings: ${newListings.length}`);
console.log(`\n🚀 Ready to import into Supabase!`);
