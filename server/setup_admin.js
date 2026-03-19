import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const ADMIN_EMAIL = 'myadmin2026@gmail.com';
const ADMIN_PASSWORD = 'HireGo@Admin2026!';

async function go() {
    console.log('Creating admin:', ADMIN_EMAIL);
    
    // Sign up
    const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: { data: { full_name: 'Admin', role: 'admin' } }
    });

    console.log('Signup result:');
    console.log('  user id:', data?.user?.id || 'none');
    console.log('  identities:', data?.user?.identities?.length);
    console.log('  confirmed:', data?.user?.email_confirmed_at || 'not confirmed');
    console.log('  error:', error ? JSON.stringify(error) : 'none');

    if (data?.user?.id) {
        // Sign in to verify it works
        const { data: sid, error: sie } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        
        console.log('\nSign-in test:', sie ? `FAILED: ${sie.message}` : 'SUCCESS');
        
        const userId = sid?.user?.id || data.user.id;
        
        // Set admin role in DB
        const { error: dbErr } = await supabase.from('users').upsert({
            id: userId,
            email: ADMIN_EMAIL,
            name: 'System Admin',
            role: 'admin',
            status: 'Active'
        }, { onConflict: 'id' });

        console.log('DB upsert:', dbErr ? `ERROR: ${dbErr.message}` : 'SUCCESS');

        console.log('\n==========================================');
        console.log('  ✅ ADMIN CREDENTIALS');
        console.log('==========================================');
        console.log(`  📧 Email:    ${ADMIN_EMAIL}`);
        console.log(`  🔑 Password: ${ADMIN_PASSWORD}`);
        console.log(`  🌐 Login:    http://localhost:5179/admin/login`);
        console.log('==========================================');
        
        await supabase.auth.signOut();
    } else {
        console.log('\n❌ Signup failed. Detailed error:', JSON.stringify(error, null, 2));
        console.log('\nChecking if user exists already...');
        
        // Maybe user already existed from before — try sign in
        const { data: sid2, error: sie2 } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        
        if (sid2?.user) {
            console.log('  User exists! ID:', sid2.user.id);
            const { error: dbErr2 } = await supabase.from('users').upsert({
                id: sid2.user.id,
                email: ADMIN_EMAIL,
                name: 'System Admin',
                role: 'admin',
                status: 'Active'
            }, { onConflict: 'id' });
            console.log('  DB:', dbErr2 ? `ERROR: ${dbErr2.message}` : 'Role set to admin');
            console.log('\n  ✅ Use these credentials:');
            console.log(`  📧 ${ADMIN_EMAIL}`);
            console.log(`  🔑 ${ADMIN_PASSWORD}`);
        } else {
            console.log('  Sign-in also failed:', sie2?.message);
        }
    }
}

go();
