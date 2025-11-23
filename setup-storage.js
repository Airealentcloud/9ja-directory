const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load .env.local manually since we can't rely on process.env in this context
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.log('❌ .env.local file not found.');
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Error loading .env.local:', e);
        return {};
    }
}

async function setupStorage() {
    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing credentials in .env.local');
        console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
        console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Found' : '❌ Missing (Required for creating buckets)');
        console.log('\n⚠️  Please run the SQL script "create_storage_buckets_safe.sql" in your Supabase SQL Editor instead.');
        return;
    }

    console.log('🔄 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const buckets = [
        { id: 'avatars', public: true },
        { id: 'documents', public: false }
    ];

    for (const bucket of buckets) {
        console.log(`\n📦 Checking bucket: ${bucket.id}...`);
        const { data, error } = await supabase.storage.getBucket(bucket.id);

        if (error && error.message.includes('not found')) {
            console.log(`   Bucket '${bucket.id}' not found. Creating...`);
            const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket.id, {
                public: bucket.public
            });

            if (createError) {
                console.error(`   ❌ Failed to create bucket '${bucket.id}':`, createError.message);
            } else {
                console.log(`   ✅ Bucket '${bucket.id}' created successfully!`);
            }
        } else if (data) {
            console.log(`   ✅ Bucket '${bucket.id}' already exists.`);
            // Update public status if needed
            if (data.public !== bucket.public) {
                console.log(`   Updating public status to ${bucket.public}...`);
                await supabase.storage.updateBucket(bucket.id, { public: bucket.public });
            }
        } else {
            console.error(`   ❌ Error checking bucket '${bucket.id}':`, error?.message);
        }
    }

    console.log('\n✨ Storage setup check complete.');
}

setupStorage();
