const fs = require('fs');
const path = require('path');

// Category mapping from CSV categories to database category slugs
const CATEGORY_MAP = {
  // New CSV categories (1200+ dataset)
  'Accommodation': 'hotels',
  'Business': 'professional-services',
  'Arts': 'entertainment',
  'Sports': 'sports',
  'Automotive': 'auto-services',
  'Transportation': 'transportation',
  'Recreation': 'entertainment',
  'Travel': 'transportation',
  'Computers': 'technology',
  'Agriculture': 'agriculture',
  'Education': 'education',
  'Health': 'health',
  'Employment': 'professional-services',
  'News and Media': 'entertainment',
  'Government': 'professional-services',
  'Shopping': 'shopping',
  // Old CSV categories (100 dataset) - kept for backward compatibility
  'Services': 'professional-services',
  'RealEstate': 'real-estate',
};

// Location to state slug mapping
const LOCATION_MAP = {
  'Lagos': 'lagos',
  'Abuja': 'fct',
  'Port-Harcourt': 'rivers',
  'Port Harcourt': 'rivers',
  'Ibadan': 'oyo'
};

function cleanPhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

function generateSlug(name, index) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${index}`;
}

function escapeSql(text) {
  if (!text) return '';
  return text.replace(/'/g, "''");
}

function extractCity(address) {
  if (!address) return null;
  const addressLower = address.toLowerCase();

  const cities = {
    'ikeja': 'ikeja',
    'lekki': 'lekki',
    'victoria island': 'victoria-island',
    'yaba': 'yaba',
    'surulere': 'surulere',
    'ikoyi': 'ikoyi',
    'maryland': 'maryland',
    'ajah': 'ajah'
  };

  for (const [keyword, slug] of Object.entries(cities)) {
    if (addressLower.includes(keyword)) {
      return slug;
    }
  }
  return null;
}

// Get CSV file from command line args or use default
const csvFile = process.argv[2] || 'nigeria_business_directory_100_with_extra_fields.csv';
const outputFile = process.argv[3] || 'import-all-100-listings.sql';

if (!fs.existsSync(csvFile)) {
  console.error(`❌ Error: CSV file not found: ${csvFile}`);
  console.log('\nUsage: node generate-sql.js <csv-file> [output-file]');
  console.log('Example: node generate-sql.js my-data.csv 3-import-listings.sql\n');
  process.exit(1);
}

console.log(`📄 Reading CSV file: ${csvFile}`);

// Parse CSV manually
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

console.log(`📋 CSV Headers: ${headers.join(', ')}`);

const rows = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  // Handle CSV with quoted fields
  const row = {};
  let currentField = '';
  let inQuotes = false;
  let fieldIndex = 0;

  for (let j = 0; j < lines[i].length; j++) {
    const char = lines[i][j];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row[headers[fieldIndex]] = currentField.trim().replace(/^"|"$/g, '');
      currentField = '';
      fieldIndex++;
    } else {
      currentField += char;
    }
  }

  // Add last field
  row[headers[fieldIndex]] = currentField.trim().replace(/^"|"$/g, '');
  rows.push(row);
}

console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

// Generate SQL
let sql = `-- Import ALL ${rows.length} Listings for 9jaDirectory
-- Generated from CSV
-- Run this in Supabase SQL Editor after running database-schema-enhanced.sql

-- Insert all listings
INSERT INTO listings (
  business_name,
  slug,
  description,
  category_id,
  state_id,
  city_id,
  address,
  phone,
  established_year,
  status,
  verified,
  created_at,
  updated_at
) VALUES
`;

rows.forEach((row, i) => {
  // Handle both CSV formats: old (Name, Description, etc.) and new (business_name, description, etc.)
  const name = escapeSql(row['business_name'] || row['Name'] || '');
  const description = escapeSql(row['description'] || row['Description'] || '');
  const address = escapeSql(row['address'] || row['Address'] || '');
  const phone = cleanPhone(row['phone'] || row['Phone'] || '');

  // Skip empty rows
  if (!name) {
    console.log(`⚠️  Skipping row ${i + 1}: No business name`);
    return;
  }

  // Get category and map to database category
  const csvCategory = row['category'] || row['Category'] || 'Services';
  const categorySlug = CATEGORY_MAP[csvCategory] || 'professional-services';

  // Get location/state
  const location = row['location'] || 'Lagos'; // New CSV has 'location' field
  const stateSlug = LOCATION_MAP[location] || 'lagos';

  // Try to extract city from address (only for Lagos)
  const citySlug = stateSlug === 'lagos' ? extractCity(address) : null;
  const cityClause = citySlug
    ? `(SELECT id FROM cities WHERE slug = '${citySlug}' AND state_id = (SELECT id FROM states WHERE slug = '${stateSlug}') LIMIT 1)`
    : 'NULL';

  // Get established year (only in old CSV)
  let year = 'NULL';
  if (row['Year_Established']) {
    try {
      year = parseInt(parseFloat(row['Year_Established']));
    } catch (e) {}
  }

  const slug = generateSlug(name, i + 1);

  sql += `-- Row ${i + 1}: ${name}\n`;
  sql += `(\n`;
  sql += `  '${name}',\n`;
  sql += `  '${slug}',\n`;
  sql += `  '${description}',\n`;
  sql += `  (SELECT id FROM categories WHERE slug = '${categorySlug}' LIMIT 1),\n`;
  sql += `  (SELECT id FROM states WHERE slug = '${stateSlug}' LIMIT 1),\n`;
  sql += `  ${cityClause},\n`;
  sql += `  '${address}',\n`;
  sql += `  '${phone}',\n`;
  sql += `  ${year},\n`;
  sql += `  'approved',\n`;
  sql += `  false,\n`;
  sql += `  NOW(),\n`;
  sql += `  NOW()\n`;

  if (i < rows.length - 1) {
    sql += `),\n`;
  } else {
    sql += `);\n`;
  }
});

sql += `\n-- Verification queries\n`;
sql += `SELECT COUNT(*) as total_listings FROM listings WHERE status = 'approved';\n\n`;
sql += `SELECT c.name, COUNT(l.id) as count\n`;
sql += `FROM listings l\n`;
sql += `JOIN categories c ON l.category_id = c.id\n`;
sql += `GROUP BY c.name\n`;
sql += `ORDER BY count DESC;\n\n`;
sql += `SELECT business_name, phone, address\n`;
sql += `FROM listings\n`;
sql += `ORDER BY created_at DESC\n`;
sql += `LIMIT 10;\n`;

fs.writeFileSync(outputFile, sql);
console.log(`\n✅ Generated SQL file with ${rows.length} listings!`);
console.log(`📁 File: ${outputFile}`);
console.log('\n📋 Next steps:');
console.log('1. Make sure you ran 1-simple-cleanup.sql');
console.log('2. Make sure you ran 2-create-tables.sql');
console.log(`3. Copy ALL contents of ${outputFile}`);
console.log('4. Paste into Supabase SQL Editor');
console.log('5. Click Run and wait for completion\n');
