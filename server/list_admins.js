
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://wngmbfmobxydmuuikjyp.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ21iZm1vYnh5ZG11dWlranlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzAxNDksImV4cCI6MjA4NDkwNjE0OX0.8fe-sev563aD7UZdxdRHKEd12A32DGBqVp7obHLj9t4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAdmins() {
    console.log("Fetching admin users via anon key (RLS Public Access)...");
    const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('role', 'admin');

    if (error) {
        console.error("Error fetching users:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("Admin Users Found:");
        data.forEach(user => {
            console.log(`- Name: ${user.name}, Email: ${user.email}, ID: ${user.id}`);
        });
    } else {
        console.log("No users with role 'admin' found in the database.");
    }
}

listAdmins();
