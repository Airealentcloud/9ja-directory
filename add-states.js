// Script to add missing states to the database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const supabaseAdmin = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function addStates() {
  console.log('🚀 Adding missing states to database...');

  const statesToAdd = [
    { name: 'Abuja', slug: 'abuja' },
    { name: 'Port Harcourt', slug: 'port-harcourt' },
    { name: 'Ibadan', slug: 'ibadan' }
  ];

  for (const state of statesToAdd) {
    // Check if state already exists
    const { data: existing } = await supabaseAdmin
      .from('states')
      .select('id, name')
      .eq('slug', state.slug)
      .single();

    if (existing) {
      console.log(`✓ State already exists: ${state.name}`);
      continue;
    }

    // Insert new state
    const { data, error } = await supabaseAdmin
      .from('states')
      .insert(state)
      .select('id, name, slug')
      .single();

    if (error) {
      console.error(`✗ Error adding ${state.name}:`, error.message);
    } else {
      console.log(`✓ Added state: ${state.name} (${state.slug})`);
    }
  }

  console.log('\n✅ Done! All states are now in the database.');
}

addStates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
