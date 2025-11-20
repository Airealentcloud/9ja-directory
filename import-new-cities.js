// Import script for new businesses from multiple cities (Lagos, Abuja, Port Harcourt)
// Handles duplicate detection and multi-state imports

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
    .replace(/Ã¢â¬â¢/g, "'")
    .replace(/ÃÂ©/g, 'é')
    .replace(/ÃÂ°/g, '°')
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

// Helper function to generate slugs
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse function to import new listings
async function importNewListings() {
  console.log('🚀 Starting import of new business listings...');
  console.log('📖 Reading from: data from finlib.csv');
  console.log('⏭️  Skipping already imported rows:');
  console.log('   - Rows 2-27 (26 accommodation businesses)');
  console.log('   - Rows 102-301 (199 businesses from previous import)');
  console.log('✨ Importing NEW rows:');
  console.log('   - Rows 28-101 (~74 businesses)');
  console.log('   - Rows 302-end (~933+ businesses)');

  try {
    // Check if CSV file exists
    const csvPath = path.join(__dirname, 'data from finlib.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Error: data from finlib.csv not found.');
      process.exit(1);
    }

    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');

    console.log(`\n📄 Total lines in CSV: ${lines.length}`);

    // Parse businesses - skip header (line 0) and already imported rows
    const businesses = [];
    const stateSet = new Set();
    const skippedRanges = new Set();

    // Add already imported row numbers to skip set
    // Rows 2-27 (line index 1-26)
    for (let i = 1; i <= 26; i++) {
      skippedRanges.add(i);
    }
    // Rows 102-301 (line index 101-300)
    for (let i = 101; i <= 300; i++) {
      skippedRanges.add(i);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header row
      if (i === 0) continue;

      // Skip already imported rows
      if (skippedRanges.has(i)) {
        continue;
      }

      // Parse CSV line (handle quoted fields with commas)
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
        const business = {
          business_name: cleanText(fields[0]),
          phone: cleanPhone(fields[1]),
          address: cleanText(fields[2]),
          location: cleanText(fields[3]),
          category: cleanText(fields[4]),
          description: cleanText(fields[5])
        };

        businesses.push(business);
        stateSet.add(business.location);
      }
    }

    console.log(`\n📊 Parsed ${businesses.length} businesses`);
    console.log(`📍 States found: ${Array.from(stateSet).join(', ')}`);

    // Remove duplicates within the batch itself (same business appearing multiple times)
    const uniqueBusinesses = [];
    const seenSlugs = new Set();
    let batchDuplicates = 0;

    for (const business of businesses) {
      const slug = generateSlug(business.business_name);
      if (seenSlugs.has(slug)) {
        batchDuplicates++;
        console.log(`Skipping duplicate in batch: ${business.business_name} (${slug})`);
        continue;
      }
      seenSlugs.add(slug);
      uniqueBusinesses.push(business);
    }

    if (batchDuplicates > 0) {
      console.log(`\n⚠️  Found ${batchDuplicates} duplicates within the batch itself`);
      console.log(`📊 Unique businesses to import: ${uniqueBusinesses.length}`);
    }

    // Count by category (use uniqueBusinesses)
    const categoryCounts = {};
    uniqueBusinesses.forEach(business => {
      categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
    });

    console.log('\n📂 Category breakdown:');
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    // Count by state (use uniqueBusinesses)
    const stateCounts = {};
    uniqueBusinesses.forEach(business => {
      stateCounts[business.location] = (stateCounts[business.location] || 0) + 1;
    });

    console.log('\n🏙️ State breakdown:');
    Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });

    // Import via API (use uniqueBusinesses)
    console.log(`\n🚀 Importing ${uniqueBusinesses.length} unique businesses...`);

    const response = await fetch('http://localhost:3006/api/admin/import-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businesses: uniqueBusinesses,
        dryRun: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ API Error Details:', JSON.stringify(data, null, 2));
      throw new Error(data.error || 'Import failed');
    }

    console.log('\n✅ Import successful!');
    console.log(`📊 Categories processed: ${data.categoriesCreated}`);
    console.log(`📋 Total processed: ${data.totalProcessed}`);
    console.log(`✨ Unique listings inserted: ${data.listingsInserted}`);
    if (data.duplicatesSkipped > 0) {
      console.log(`⏭️  Duplicates skipped: ${data.duplicatesSkipped}`);
    }
    console.log('\n📝 Sample imported listings:');
    console.log(JSON.stringify(data.preview, null, 2));

    return data;
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    throw error;
  }
}

// Check if we should run the import
if (require.main === module) {
  importNewListings()
    .then(() => {
      console.log('\n🎉 Import completed successfully!');
      console.log('🔗 Visit http://localhost:3006 to see your listings!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import process failed:', error);
      process.exit(1);
    });
}
