import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setAdmin(email: string) {
    if (!email) {
        console.error('Please provide an email address.')
        console.log('Usage: npx tsx scripts/set-admin.ts <email>')
        process.exit(1)
    }

    console.log(`Looking up user with email: ${email}...`)

    // 1. Find the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('Error fetching users:', userError.message)
        process.exit(1)
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
        console.error(`User with email ${email} not found.`)
        console.log('Please sign up first at http://localhost:3000/signup')
        process.exit(1)
    }

    console.log(`Found user: ${user.id}`)

    // 2. Upsert into profiles table with role = 'admin'
    const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'admin',
            updated_at: new Date().toISOString()
        })

    if (updateError) {
        console.error('Error updating profile:', updateError.message)
        process.exit(1)
    }

    console.log(`✅ Success! User ${email} is now an Admin.`)
    console.log('You can now access the admin dashboard at http://localhost:3000/admin/dashboard')
}

// Get email from command line argument
const email = process.argv[2]
setAdmin(email)
