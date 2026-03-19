
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
        console.error("   Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=<secure_password> node create_admin.js");
        process.exit(1);
    }

    // Validate password strength
    if (password.length < 12) {
        console.error("❌ Password must be at least 12 characters long.");
        process.exit(1);
    }

    console.log(`Attempting to create/update admin user: ${email}`);

    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log("User already exists in Auth. Updating password and metadata...");
            // Find user id
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            const user = users.users.find(u => u.email === email);
            if (user) {
                await supabase.auth.admin.updateUserById(user.id, {
                    password: password,
                    user_metadata: { role: 'admin' }
                });
            }
        } else {
            console.error("Auth Error:", authError.message);
            return;
        }
    }

    const userId = authData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id;

    // 2. Ensure user exists in 'users' table with admin role
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: email,
            name: 'System Administrator',
            role: 'admin',
            status: 'Active'
        });

    if (dbError) {
        console.error("Database Error:", dbError.message);
    } else {
        console.log("------------------------------------------");
        console.log("✅ ADMIN USER CREATED/UPDATED SUCCESSFULLY");
        console.log(`Email: ${email}`);
        console.log("------------------------------------------");
    }
}

createAdmin();
