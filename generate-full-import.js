// Generate Complete SQL Import from CSV Data
// This script processes all 600+ businesses from the CSV

const fs = require('fs');

// CSV data embedded (from your file)
const csvData = `business_name,phone,address,location,category,description
Saminaka Holiday Resort,"0703 679 8887, 0809 674 7979, 0809 674 7676","Saminaka Holiday Resort, Kaduna South, Kaduna Nigeria",Kaduna,Accommodation,Saminaka Holiday Resort provides lodging accommodation for travelers on transit.
Asaa Pyramid Hotel,"0803 465 7770, 0809 612 3184, 0805 589 0559","No. 13, Lafia Road, Off Independence Way, Kaduna, Kaduna, Nigeria",Kaduna,Accommodation,"Asaa Pyramid Hotel is a hospitality service center offering good lodging accommodation, restaurant, conference halls, indoor and outdoor catering services."`;

// Map cities to states
const cityToState = {
  'Lagos': 'Lagos',
  'Kaduna': 'Kaduna',
  'Calabar': 'Cross River',
  'Gombe': 'Gombe',
  'Enugu': 'Enugu',
  'Ilorin': 'Kwara'
};

// Map categories to slugs
const categoryToSlug = {
  'Accommodation': 'accommodation',
  'Business': 'business-services',
  'Arts': 'arts-culture',
  'Sports': 'sports-recreation',
  'Automotive': 'automotive',
  'Transportation': 'transportation',
  'Recreation': 'recreation',
  'Travel': 'travel-tourism',
  'Computers': 'technology',
  'Agriculture': 'agriculture',
  'Education': 'education',
  'Health': 'health-medical',
  'Employment': 'employment',
  'News and Media': 'news-media',
  'Government': 'government',
  'Shopping': 'shopping'
};

// Parse CSV (simple parser for this specific format)
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const businesses = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line || line === ',,,,,') continue; // Skip empty lines

    // Simple CSV parsing (handles quoted fields)
    const matches = line.match(/("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*)/);

    if (matches && matches.length >= 7) {
      const business = {
        name: cleanField(matches[1]),
        phone: cleanField(matches[2]),
        address: cleanField(matches[3]),
        location: cleanField(matches[4]),
        category: cleanField(matches[5]),
        description: cleanField(matches[6])
      };

      // Only add if we have a name
      if (business.name) {
        businesses.push(business);
      }
    }
  }

  return businesses;
}

function cleanField(field) {
  if (!field) return null;
  // Remove surrounding quotes and trim
  return field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim();
}

function escapeSQL(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

function generateSQL(businesses) {
  let sql = `-- Complete Import: ${businesses.length} Nigerian Business Listings
-- Generated from CSV data
-- Run after 2-create-tables.sql

`;

  let count = 0;
  for (const business of businesses) {
    const state = cityToState[business.location];
    const categorySlug = categoryToSlug[business.category];

    if (!state || !categorySlug) {
      console.warn(`Skipping ${business.name}: Unknown state or category`);
      continue;
    }

    const name = escapeSQL(business.name);
    const description = escapeSQL(business.description);
    const phone = escapeSQL(business.phone);
    const address = escapeSQL(business.address);

    sql += `INSERT INTO listings (name, description, phone, address, state_id, category_id, status, featured) VALUES
('${name}', '${description}', ${phone ? "'" + phone + "'" : 'NULL'}, '${address}', (SELECT id FROM states WHERE name = '${state}'), (SELECT id FROM categories WHERE slug = '${categorySlug}'), 'approved', ${count < 50 ? 'true' : 'false'});\n\n`;

    count++;
  }

  sql += `-- Total imported: ${count} businesses\n`;
  return sql;
}

// Read the full CSV from your file
const fullCSV = fs.readFileSync('data from finlib.csv', 'utf-8');

console.log('Processing CSV data...');
const businesses = parseCSV(fullCSV);
console.log(`Found ${businesses.length} businesses`);

console.log('Generating SQL...');
const sql = generateSQL(businesses);

fs.writeFileSync('import-all-csv-data.sql', sql);
console.log(`✅ Generated import-all-csv-data.sql with ${businesses.length} businesses`);
