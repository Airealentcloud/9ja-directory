const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple .env.local parser
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  .env.local file not found!');
      return {};
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env.local:', error);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking Supabase connection...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please ensure you have the following lines in your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log(`URL: ${supabaseUrl}`);
// Mask key for security
console.log(`Key: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    // Try to select from a common table, or just check health if possible.
    // Since we don't know for sure which tables exist, we'll try a lightweight query.
    // We'll try to fetch 0 rows from 'listings' or just check if we can connect.
    // A simple way is to just try to get the session or config, but client-side auth might not be set up.
    // Let's try to query the 'categories' table as it was in the sql files.
    
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist, it might still be a valid connection but just missing schema.
      // But if it's a connection error, it will be different.
      console.error('❌ Connection failed or table "categories" not found.');
      console.error('Error details:', error.message);
      
      // Try a simpler check?
      console.log('Trying to list all tables (requires specific permissions)...');
    } else {
      console.log('✅ Connection successful!');
      console.log(`Found "categories" table.`);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkConnection();
