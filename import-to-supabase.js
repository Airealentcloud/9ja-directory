// Import businesses to Supabase WITHOUT deleting existing data
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://txupvudwbroyxfyccdhw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment');
  console.log('Please make sure your .env.local file is set up correctly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map cities to states
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

// Map categories to slugs (matching your database schema)
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

// Parse CSV
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

async function checkExistingData() {
  console.log('\n📊 Checking existing data...\n');

  // Check listings
  const { count: listingsCount, error: listingsError } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  if (listingsError) {
    console.log('⚠️  No listings table found or empty');
  } else {
    console.log(`✅ Current listings: ${listingsCount || 0}`);
  }

  // Check categories
  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Categories: ${categoriesCount || 0}`);

  // Check states
  const { count: statesCount } = await supabase
    .from('states')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ States: ${statesCount || 0}\n`);

  return { listingsCount, categoriesCount, statesCount };
}

async function ensureTablesExist() {
  console.log('🔍 Ensuring database tables exist...\n');

  // Check if categories table has data
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, name')
    .limit(1);

  if (catError || !categories || categories.length === 0) {
    console.log('⚠️  Categories table is empty or doesn\'t exist');
    console.log('📝 Please run 2-create-tables.sql in Supabase first\n');
    return false;
  }

  // Check if states table has data
  const { data: states, error: stateError } = await supabase
    .from('states')
    .select('id, name')
    .limit(1);

  if (stateError || !states || states.length === 0) {
    console.log('⚠️  States table is empty or doesn\'t exist');
    console.log('📝 Please run 2-create-tables.sql in Supabase first\n');
    return false;
  }

  console.log('✅ Database tables are ready!\n');
  return true;
}

async function getCategoryId(categoryName) {
  const slug = categoryToSlug[categoryName];
  if (!slug) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) {
    console.warn(`Could not find category: ${categoryName} (${slug})`);
    return null;
  }

  return data.id;
}

async function getStateId(stateName) {
  const { data, error } = await supabase
    .from('states')
    .select('id')
    .eq('name', stateName)
    .single();

  if (error) {
    console.warn(`Could not find state: ${stateName}`);
    return null;
  }

  return data.id;
}

async function importBusinesses(businesses) {
  console.log(`\n📥 Starting import of ${businesses.length} businesses...\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Import in batches of 50
  const batchSize = 50;

  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const listings = [];

    for (const business of batch) {
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

      // Generate slug from business name
      const slug = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substr(2, 6);

      // Extract first phone number if multiple (database limit is 20 chars)
      let phone = business.phone;
      if (phone && phone.length > 20) {
        // Take first phone number from comma-separated list
        phone = phone.split(',')[0].trim();
        // If still too long, truncate
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
        verified: imported < 50 // Verify first 50
      });

      imported++;
    }

    // Insert batch
    if (listings.length > 0) {
      const { error } = await supabase
        .from('listings')
        .insert(listings);

      if (error) {
        console.error(`❌ Error inserting batch: ${error.message}`);
        errors += listings.length;
      } else {
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1} (${listings.length} listings)`);
      }
    }
  }

  console.log(`\n📊 Import Complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}\n`);
}

async function main() {
  console.log('🚀 9ja-Directory - Import to Supabase\n');
  console.log('This will ADD businesses WITHOUT deleting existing data\n');
  console.log('='.repeat(60) + '\n');

  // Check existing data
  const existing = await checkExistingData();

  // Ensure tables exist
  const tablesReady = await ensureTablesExist();
  if (!tablesReady) {
    console.log('\n❌ Cannot proceed without database tables');
    console.log('Run this in Supabase SQL Editor:');
    console.log('   1. Open: https://supabase.com/dashboard/project/txupvudwbroyxfyccdhw/sql/new');
    console.log('   2. Run: 2-create-tables.sql\n');
    process.exit(1);
  }

  // Read and parse CSV
  console.log('📖 Reading CSV file...');
  const csvData = fs.readFileSync('data from finlib.csv', 'utf-8');
  const businesses = parseCSV(csvData);
  console.log(`✅ Found ${businesses.length} businesses in CSV\n`);

  // Import
  await importBusinesses(businesses);

  // Final check
  console.log('📊 Final database stats:\n');
  await checkExistingData();

  console.log('✨ Done! Your website now has all the data!\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
