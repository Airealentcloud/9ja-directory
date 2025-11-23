const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    // Check for DATABASE_URL
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL or POSTGRES_URL not found in environment.');
        console.log('Available env vars:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const schemaPath = path.join(__dirname, 'dashboard_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📖 Applying schema...');
        await client.query(schemaSql);
        console.log('✅ Schema applied successfully!');

    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await client.end();
    }
}

applySchema();
