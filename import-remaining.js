// Import ONLY remaining businesses (avoid duplicates)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://txupvudwbroyxfyccdhw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map cities to states (NOW INCLUDING ALL CITIES!)
const cityToState = {
  'Lagos': 'Lagos',
  'Kaduna': 'Kaduna',
  'Calabar': 'Cross River',
  'Gombe': 'Gombe',
  'Enugu': 'Enugu',
  'Ilorin': 'Kwara',
  'Abuja': 'FCT',
  'Ibadan': 'Oyo',
  'Port-Harcourt': 'Rivers'
};

// Map categories to slugs
const categoryToSlug = {
  'Accommodation': 'hotels',
  'Business': 'professional-services',
  'Arts': 'entertainment',
  'Sports': 'sports',
  'Automotive': 'auto-services',
  'Transportation': 'transportation',
  'Recreation': 'entertainment',
  'Travel': 'hotels',
  'Computers': 'technology',
  'Agriculture': 'agriculture',
  'Education': 'education',
  'Health': 'health',
  'Employment': 'professional-services',
  'News and Media': 'entertainment',
  'Government': 'professional-services',
  'Shopping': 'shopping'
};

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const businesses = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ',,,,,') continue;

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

      if (business.name) {
        businesses.push(business);
      }
    }
  }

  return businesses;
}

function cleanField(field) {
  if (!field) return null;
  return field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim();
}

async function getCategoryId(categoryName) {
  const slug = categoryToSlug[categoryName];
  if (!slug) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data.id;
}

async function getStateId(stateName) {
  const { data, error } = await supabase
    .from('states')
    .select('id')
    .eq('name', stateName)
    .single();

  if (error) return null;
  return data.id;
}

async function getExistingBusinessNames() {
  console.log('📋 Loading existing business names...');

  const { data, error } = await supabase
    .from('listings')
    .select('business_name');

  if (error) {
    console.error('Error fetching existing businesses:', error);
    return new Set();
  }

  const names = new Set(data.map(b => b.business_name.toLowerCase().trim()));
  console.log(`✅ Found ${names.size} existing businesses\n`);
  return names;
}

async function importRemainingBusinesses(businesses, existingNames) {
  console.log(`\n📥 Importing remaining businesses...\n`);

  let imported = 0;
  let skipped = 0;
  let duplicates = 0;
  let errors = 0;

  const batchSize = 50;

  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const listings = [];

    for (const business of batch) {
      // Check if already imported
      if (existingNames.has(business.name.toLowerCase().trim())) {
        duplicates++;
        continue;
      }

      const state = cityToState[business.location];
      if (!state) {
        skipped++;
        continue;
      }

      const categoryId = await getCategoryId(business.category);
      const stateId = await getStateId(state);

      if (!categoryId || !stateId) {
        skipped++;
        continue;
      }

      const slug = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substr(2, 6);

      let phone = business.phone;
      if (phone && phone.length > 20) {
        phone = phone.split(',')[0].trim();
        if (phone.length > 20) {
          phone = phone.substring(0, 20);
        }
      }

      listings.push({
        business_name: business.name,
        slug: slug,
        description: business.description,
        phone: phone,
        address: business.address,
        state_id: stateId,
        category_id: categoryId,
        status: 'approved',
        verified: false
      });

      imported++;
    }

    if (listings.length > 0) {
      const { error } = await supabase
        .from('listings')
        .insert(listings);

      if (error) {
        console.error(`❌ Error inserting batch: ${error.message}`);
        errors += listings.length;
      } else {
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1} (${listings.length} new listings)`);
      }
    } else {
      console.log(`⏭️  Batch ${Math.floor(i / batchSize) + 1} - all duplicates, skipping`);
    }
  }

  console.log(`\n📊 Import Complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   🔄 Duplicates: ${duplicates}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}\n`);
}

async function main() {
  console.log('🚀 9ja-Directory - Import Remaining Businesses\n');
  console.log('This will import ONLY new businesses (no duplicates)\n');
  console.log('='.repeat(60) + '\n');

  // Get existing business names to avoid duplicates
  const existingNames = await getExistingBusinessNames();

  // Read and parse CSV
  console.log('📖 Reading CSV file...');
  const csvData = fs.readFileSync('data from finlib.csv', 'utf-8');
  const businesses = parseCSV(csvData);
  console.log(`✅ Found ${businesses.length} businesses in CSV\n`);

  // Import only new ones
  await importRemainingBusinesses(businesses, existingNames);

  // Final stats
  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  console.log('📊 Final Total Listings:', count || 0);
  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
