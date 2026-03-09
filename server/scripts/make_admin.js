import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const email = process.argv[2];
const password = process.argv[3];

if (!email) {
    console.error('\n❌ Usage: node server/scripts/make_admin.js <email> [password]');
    process.exit(1);
}

async function makeAdmin() {
    console.log(`\n🔍 Searching for user: ${email}...`);

    try {
        let userId;

        // 1. Search for existing user in Auth system
        // Note: listUsers returns { data: { users: [] }, error } in v2
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (listError) {
            console.error('❌ Failed to list users:', listError.message);
            return;
        }

        const existingAuthUser = listData.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (existingAuthUser) {
            userId = existingAuthUser.id;
            console.log(`✅ Found Existing Auth User: ${userId}`);

            // Should we update password? Yes, if provided.
            if (password) {
                console.log('🔐 Updating password...');
                const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, { password: password });
                if (passwordError) console.error('⚠️  Failed to update password:', passwordError.message);
                else console.log('✅ Password updated.');
            }
        } else {
            // User does not exist, create new one
            console.log('✨ User not found in Auth. Creating new user...');

            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password || 'Admin@123456',
                email_confirm: true,
                user_metadata: { name: 'Admin User', role: 'admin' }
            });

            if (createError) {
                throw new Error(`Failed to create user: ${createError.message}`);
            }

            if (!createData.user) throw new Error('User created but user object is null.');
            userId = createData.user.id;
            console.log(`✅ Created NEW Auth User: ${userId}`);
        }

        // 2. Ensure user exists in 'public.users' table
        const { data: publicUser, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!publicUser) {
            console.log('⚠️  User missing from public.users table. Inserting...');
            const { error: insertError } = await supabase.from('users').insert([{
                id: userId,
                email: email,
                name: 'Admin User',
                role: 'admin',
                status: 'Active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

            if (insertError) {
                // If insertion fails (e.g. key constraint), try update?
                console.error(`❌ Failed to insert public user: ${insertError.message}`);
                // Attempt direct update just in case publicError was a false negative? Unlikely.
            } else {
                console.log('✅ Public user record created.');
            }
        } else {
            // 3. Update existing public user role
            if (publicUser.role !== 'admin') {
                console.log(`⚙️  Upgrading role from '${publicUser.role}' to 'admin'...`);
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'admin' })
                    .eq('id', userId);

                if (updateError) throw updateError;
                console.log('✅ User role updated.');
            } else {
                console.log('🎉 Public user is already an Admin.');
            }
        }

        console.log(`\n✅ SUCCESS!`);
        console.log(`👉 Login at: http://localhost:5179/admin/login`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password || '(Unchanged)'}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

makeAdmin();
