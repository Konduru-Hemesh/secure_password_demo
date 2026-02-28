// test-supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in server/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase at', supabaseUrl);
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) {
            console.error('Supabase query error:', error.message);
        } else {
            console.log('✅ Supabase connected successfully! Result:', data);
        }
    } catch (err) {
        console.error('Fetch exception:', err.message);
    }
}

testConnection();
