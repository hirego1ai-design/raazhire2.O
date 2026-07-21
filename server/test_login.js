import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    const email = 'hirego1ai@gmail.com';
    const password = 'Momraaz@857430';

    console.log(`Testing login for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("❌ Login failed:", error.message);
    } else {
        console.log("✅ Login successful! Session user id:", data.user.id);
        
        // Check DB users record
        const { data: userRecord, error: dbError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', data.user.id)
            .single();
            
        if (dbError) {
            console.error("❌ Failed to query users table:", dbError.message);
        } else {
            console.log("✅ Database users table role is:", userRecord.role);
        }
    }
}

test();
