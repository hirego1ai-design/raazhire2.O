
import express from 'express';

export function setupPageRoutes(app, supabase, authenticateUser, readLocalDb, writeLocalDb) {
    // Helper to get page from DB or Local
    async function getPage(slug) {
        if (supabase) {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .single();
            if (!error && data) return data;
        }

        // Fallback
        const localDb = await readLocalDb();
        return (localDb.pages || []).find(p => p.slug === slug);
    }

    // GET Page Content (Public)
    app.get('/api/pages/:slug', async (req, res) => {
        try {
            const { slug } = req.params;
            const page = await getPage(slug);

            if (page) {
                res.json({ success: true, page });
            } else {
                res.status(404).json({ error: 'Page not found' });
            }
        } catch (error) {
            console.error('Error fetching page:', error);
            res.status(500).json({ error: 'Failed to fetch page' });
        }
    });

    // UPDATE Page Content (Admin Only)
    // In a real app, check for admin role in authenticateUser
    app.put('/api/pages/:slug', authenticateUser, async (req, res) => {
        try {
            const { slug } = req.params;
            const { title, content } = req.body;

            const updateData = {
                slug,
                title,
                content,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                // Upsert
                const { data: existing } = await supabase
                    .from('pages')
                    .select('id')
                    .eq('slug', slug)
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('pages')
                        .update(updateData)
                        .eq('id', existing.id)
                        .select();
                    result = data ? data[0] : null;
                } else {
                    const { data } = await supabase
                        .from('pages')
                        .insert([updateData])
                        .select();
                    result = data ? data[0] : null;
                }
            }

            // Always save to Local DB
            const localDb = await readLocalDb();
            if (!localDb.pages) localDb.pages = [];

            const existingIndex = localDb.pages.findIndex(p => p.slug === slug);
            if (existingIndex >= 0) {
                localDb.pages[existingIndex] = { ...localDb.pages[existingIndex], ...updateData };
                result = localDb.pages[existingIndex];
            } else {
                const newPage = { id: Date.now(), ...updateData };
                localDb.pages.push(newPage);
                result = newPage;
            }

            await writeLocalDb(localDb);

            res.json({ success: true, page: result });
        } catch (error) {
            console.error('Error updating page:', error);
            res.status(500).json({ error: 'Failed to update page' });
        }
    });
}
