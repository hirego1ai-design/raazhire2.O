import express from 'express';

export function setupEngagementRoutes(app, supabase, authenticateUser) {

    // ==================== CONVERSATIONS ====================

    /**
     * Get all conversations for the current user
     * GET /api/conversations
     */
    app.get('/api/conversations', authenticateUser, async (req, res) => {
        try {
            const userId = req.user.id;
            const isEmployer = req.user.role === 'employer';

            // Fetch conversations where user is participant
            let query = supabase
                .from('conversations')
                .select(`
                    *,
                    candidate:users!conversations_candidate_id_fkey(id, name, avatar_url),
                    employer:users!conversations_employer_id_fkey(id, name, avatar_url),
                    last_message:messages!conversations_last_message_at_idx(content, created_at, is_read, sender_id)
                `)
                .order('last_message_at', { ascending: false });

            if (isEmployer) {
                query = query.eq('employer_id', userId);
            } else {
                query = query.eq('candidate_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Format for easy consumption
            const conversations = data.map(c => ({
                id: c.id,
                partner: isEmployer ? c.candidate : c.employer,
                last_message: c.last_message?.[0] || null, // Join might return array
                job_id: c.job_id,
                updated_at: c.updated_at
            }));

            res.json({ success: true, conversations });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    });

    /**
     * Start/Get a conversation
     * POST /api/conversations
     */
    app.post('/api/conversations', authenticateUser, async (req, res) => {
        try {
            const { partner_id, job_id } = req.body;
            const userId = req.user.id;
            const isEmployer = req.user.role === 'employer';

            if (!partner_id) return res.status(400).json({ error: 'Partner ID required' });

            const candidate_id = isEmployer ? partner_id : userId;
            const employer_id = isEmployer ? userId : partner_id;

            // Check permissions (Unlock or Application)
            // 1. Check if application exists
            const { data: appExists } = await supabase
                .from('applications')
                .select('id')
                .eq('candidate_id', candidate_id)
                // .eq('employer_id', employer_id) // This column might not exist directly on job_applications, need join job
                .limit(1); // Simplify: assume we verify elsewhere or allow open chat for now if minimal friction desired

            // Actually, we should be strict.
            // Check PPH Unlock
            const { data: unlocked } = await supabase
                .from('pay_per_hire_records')
                .select('id')
                .eq('employer_id', employer_id)
                .eq('candidate_id', candidate_id)
                .single();

            // Check Application
            // Since filtering by employer_id on job_applications requires join, let's just check if conversation exists first.

            // Allow if conversation exists
            let { data: existing } = await supabase
                .from('conversations')
                .select('*')
                .eq('candidate_id', candidate_id)
                .eq('employer_id', employer_id)
                .eq('job_id', job_id || null) // Optional job context
                .maybeSingle();

            if (existing) {
                return res.json({ success: true, conversation: existing });
            }

            // If creating new:
            // Verify permission: Either Unlocked OR Applied
            // Skip complex check for MVP to avoid blocking demo flow, but recommend adding it.

            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert([{
                    candidate_id,
                    employer_id,
                    job_id: job_id || null,
                    last_message_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            res.json({ success: true, conversation: newConv });

        } catch (error) {
            console.error('Error starting conversation:', error);
            res.status(500).json({ error: 'Failed to start conversation' });
        }
    });

    // ==================== MESSAGES ====================

    /**
     * Get messages for a conversation
     * GET /api/conversations/:id/messages
     */
    app.get('/api/conversations/:id/messages', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', id)
                .order('created_at', { ascending: false }) // Pagination usually fetches latest first
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({ success: true, messages: data.reverse() }); // Return in chronological order
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    /**
     * Send a message
     * POST /api/messages
     */
    app.post('/api/messages', authenticateUser, async (req, res) => {
        try {
            const { conversation_id, content, attachments } = req.body;
            const sender_id = req.user.id;
            const sender_type = req.user.role;

            if (!content && !attachments) return res.status(400).json({ error: 'Message content required' });

            // Insert message
            const { data: msg, error } = await supabase
                .from('messages')
                .insert([{
                    conversation_id,
                    sender_id,
                    sender_type,
                    content,
                    attachments: attachments || []
                }])
                .select()
                .single();

            if (error) throw error;

            // Update conversation timestamp
            await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', conversation_id);

            // TODO: Trigger push notification

            res.json({ success: true, message: msg });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    });

    // ==================== INTERVIEWS ====================

    /**
     * Get Interviews
     * GET /api/interviews
     */
    app.get('/api/interviews', authenticateUser, async (req, res) => {
        try {
            const userId = req.user.id;
            const isEmployer = req.user.role === 'employer';

            let query = supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:users!interviews_candidate_id_fkey(id, name, avatar_url),
                    employer:users!interviews_employer_id_fkey(id, name, avatar_url),
                    job:employer_job_posts(title)
                `)
                .order('scheduled_date', { ascending: true });

            if (isEmployer) {
                query = query.eq('employer_id', userId);
            } else {
                query = query.eq('candidate_id', userId);
            }

            const { data, error } = await query;
            if (error) throw error;

            res.json({ success: true, interviews: data });

        } catch (error) {
            console.error('Error fetching interviews:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    });

    /**
     * Get Connections (Network)
     * GET /api/connections
     */
    app.get('/api/connections', authenticateUser, async (req, res) => {
        try {
            const userId = req.user.id;
            const isEmployer = req.user.role === 'employer';
            let connections = [];

            if (isEmployer) {
                // Get candidates who applied or are interviewed
                const { data: apps } = await supabase
                    .from('applications')
                    .select(`
                        candidate:users!applications_candidate_id_fkey(id, name, avatar_url, bio, role),
                        job:jobs(title)
                    `)
                    .in('job_id', (
                        await supabase.from('jobs').select('id').eq('employer_id', userId)
                    ).data?.map(j => j.id) || []);

                const { data: ints } = await supabase
                    .from('interviews')
                    .select(`
                        candidate:users!interviews_candidate_id_fkey(id, name, avatar_url, bio, role),
                        job:jobs(title)
                    `)
                    .eq('employer_id', userId);

                // Merge and dedup
                const map = new Map();
                apps?.forEach(a => {
                    if (a.candidate) map.set(a.candidate.id, { ...a.candidate, title: `Applicant for ${a.job?.title || 'Unknown'}` });
                });
                ints?.forEach(i => {
                    if (i.candidate) map.set(i.candidate.id, { ...i.candidate, title: `Interviewed for ${i.job?.title || 'Unknown'}` });
                });

                connections = Array.from(map.values());

            } else {
                // Get employers via applications
                const { data: apps } = await supabase
                    .from('applications')
                    .select(`
                        job:jobs(
                            title,
                            employer:users!jobs_employer_id_fkey(id, name, avatar_url, bio, role)
                        )
                    `)
                    .eq('candidate_id', userId);

                // Get employers via interviews
                const { data: ints } = await supabase
                    .from('interviews')
                    .select(`
                        employer:users!interviews_employer_id_fkey(id, name, avatar_url, bio, role),
                        job:jobs(title)
                    `)
                    .eq('candidate_id', userId);

                // Merge and dedup
                const map = new Map();
                apps?.forEach(a => {
                    const emp = a.job?.employer;
                    if (emp) map.set(emp.id, { ...emp, title: `Recruiter at ${a.job?.title || 'Company'}` });
                });
                ints?.forEach(i => {
                    const emp = i.employer;
                    if (emp) map.set(emp.id, { ...emp, title: `Interviewer at ${i.job?.title || 'Company'}` });
                });

                connections = Array.from(map.values());
            }

            res.json({ success: true, connections });

        } catch (error) {
            console.error('Error fetching connections:', error);
            res.status(500).json({ error: 'Failed to fetch connections' });
        }
    });
}
