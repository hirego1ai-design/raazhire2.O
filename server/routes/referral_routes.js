import express from 'express';

// ==================== REFERRAL & PAYOUT ROUTES ====================

export function setupReferralRoutes(app, supabase, authenticateUser) {

    /**
     * Get or Generate Referral Link for the logged-in user
     * GET /api/referrals/link
     */
    app.get('/api/referrals/link', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;

            // Check if user already has a link
            let { data: existingLink } = await supabase
                .from('referral_links')
                .select('*')
                .eq('user_id', user_id)
                .single();

            if (!existingLink) {
                // Generate a unique 8-character string based on timestamp and user ID
                const rawString = `${user_id}-${Date.now()}`;
                const uniqueCode = Buffer.from(rawString).toString('base64').substring(0, 8).toUpperCase();
                
                const { data: newLink, error: createError } = await supabase
                    .from('referral_links')
                    .insert([{
                        user_id: user_id,
                        referral_code: uniqueCode
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                existingLink = newLink;
            }

            res.json({
                success: true,
                referral_code: existingLink.referral_code,
                link: `${process.env.FRONTEND_URL || 'http://localhost:5179'}/signup?ref=${existingLink.referral_code}`
            });

        } catch (error) {
            console.error('Error fetching referral link:', error);
            res.status(500).json({ error: 'Failed to generate referral link' });
        }
    });

    /**
     * Get Dashboard Stats (Total Referrals, Signups, Hires, Pending Earnings)
     * GET /api/referrals/dashboard
     */
    app.get('/api/referrals/dashboard', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;

            // 1. Get total clicks from the link
            const { data: linkInfo } = await supabase
                .from('referral_links')
                .select('total_clicks')
                .eq('user_id', user_id)
                .single();

            // 2. Get breakdown from referrals_tracking
            const { data: signups } = await supabase
                .from('referrals_tracking')
                .select('status')
                .eq('referrer_id', user_id);

            const totalSignups = signups ? signups.length : 0;
            const totalHires = signups ? signups.filter(s => s.status === 'hired').length : 0;

            // 3. Earnings from payouts ledger
            const { data: payouts } = await supabase
                .from('referral_payouts')
                .select('amount, status')
                .eq('referrer_id', user_id);

            let pending = 0, approved = 0, paid = 0;
            
            payouts?.forEach(p => {
                if (p.status === 'pending_lock_in') pending += Number(p.amount);
                if (p.status === 'approved' || p.status === 'lock_in_completed') approved += Number(p.amount);
                if (p.status === 'paid') paid += Number(p.amount);
            });

            res.json({
                success: true,
                stats: {
                    totalClicks: linkInfo?.total_clicks || 0,
                    totalSignups,
                    totalHires,
                    earnings: {
                        pending,
                        approved,
                        paid
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching referral dashboard:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    });

    /**
     * Public Route to Tracking a Click (Increments the counter)
     * POST /api/referrals/track/:referralCode
     */
    app.post('/api/referrals/track/:referralCode', async (req, res) => {
        try {
            const { referralCode } = req.params;
            
            await supabase.rpc('increment_referral_click', { code: referralCode }).catch(() => {
                // Fallback if RPC not defined
                supabase.from('referral_links')
                    .update({ total_clicks: supabase.raw('total_clicks + 1') })
                    .eq('referral_code', referralCode)
                    .then(() => {});
            });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Tracking failed' });
        }
    });

    /**
     * ADMIN: Process Payouts or Check Lock-Ins (The Watchdog endpoint)
     * POST /api/admin/referrals/process-lock-ins
     */
    app.post('/api/admin/referrals/process-lock-ins', authenticateUser, async (req, res) => {
        // Enforce Admin Role
        if (req.user.user_metadata?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        try {
            // Find all pending log-ins
            const { data: pendingPayouts } = await supabase
                .from('referral_payouts')
                .select('*')
                .eq('status', 'pending_lock_in')
                .lte('lock_in_end_date', new Date().toISOString());

            let updatedCount = 0;

            for (const payout of pendingPayouts || []) {
                // Verify if the candidate is still employed
                // (In a real system, you'd check the current employer mapped to the candidate)
                // For now, we assume success if date passed and we haven't received a cancellation
                if (payout.company_paid_fee) {
                    await supabase
                        .from('referral_payouts')
                        .update({ status: 'approved', updated_at: new Date().toISOString() })
                        .eq('id', payout.id);
                    updatedCount++;
                } else {
                    await supabase
                        .from('referral_payouts')
                        .update({ status: 'lock_in_completed', updated_at: new Date().toISOString() })
                        .eq('id', payout.id);
                    updatedCount++;
                }
            }

            res.json({ success: true, processed: updatedCount });
        } catch (error) {
            console.error('Error processing lock-ins:', error);
            res.status(500).json({ error: 'Failed to process lock-ins' });
        }
    });
}
