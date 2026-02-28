import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// The user placed the Service Role Key into the SUPABASE_ANON_KEY variable in .env
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
