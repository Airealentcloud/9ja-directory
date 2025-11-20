// Import script for all 225 businesses (26 existing + 199 new)
const fs = require('fs');
const path = require('path');

// Helper function to clean text
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/â€™/g, "'")
    .replace(/â€"/g, "-")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€ƒ/g, ' ')
    .replace(/ï¿½/g, '')
    .trim();
}

// Helper function to clean phone numbers
function cleanPhone(phone) {
  if (!phone) return '';
  const cleaned = cleanText(phone);

  // If multiple phone numbers (separated by comma), take the first one
  const firstPhone = cleaned.split(',')[0].trim();

  // Limit to 50 characters to fit database constraint
  return firstPhone.substring(0, 50);
}

// Read and parse CSV file
const csvPath = path.join(__dirname, 'data from finlib.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Parse only NEW businesses from rows 102-300 (to preserve existing 26 accommodation businesses)
const allBusinesses = [];

// Parse rows 102-300 (new 199 businesses)
for (let i = 103; i <= 301 && i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        j++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.trim());

  if (fields.length >= 6) {
    allBusinesses.push({
      business_name: cleanText(fields[0]),
      phone: cleanPhone(fields[1]),
      address: cleanText(fields[2]),
      location: cleanText(fields[3]),
      category: cleanText(fields[4]),
      description: cleanText(fields[5])
    });
  }
}

console.log(`Total businesses to import: ${allBusinesses.length}`);

// Count by category
const categoryCounts = {};
allBusinesses.forEach(business => {
  categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
});
console.log('\nCategory breakdown:');
Object.entries(categoryCounts).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});

// Import function
async function importData() {
  console.log(`\n🚀 Starting import of ${allBusinesses.length} businesses...`);

  try {
    const response = await fetch('http://localhost:3006/api/admin/import-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businesses: allBusinesses,
        dryRun: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ API Error Details:', JSON.stringify(data, null, 2));
      throw new Error(data.error || 'Import failed');
    }

    console.log('\n✅ Import successful!');
    console.log(`📊 Categories created: ${data.categoriesCreated}`);
    console.log(`📋 Listings inserted: ${data.listingsInserted}`);
    console.log('\n📝 First few listings:');
    console.log(JSON.stringify(data.preview, null, 2));

    return data;
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    throw error;
  }
}

// Run the import
importData()
  .then(() => {
    console.log('\n🎉 All done! Your database is now populated with business listings.');
    console.log('🔗 Visit http://localhost:3006 to see your listings!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import process failed:', error);
    process.exit(1);
  });
