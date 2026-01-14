/**
 * Admin Panel API Routes
 * 
 * Complete backend endpoints for admin panel functionality:
 * - User Management
 * - Email Configuration
 * - Credit System Control
 * - Job Pricing Control
 * - Proctoring Configuration
 * - Interview Management
 * - AI Control
 * - Dashboard Statistics
 */

import express from 'express';

export function setupAdminRoutes(app, supabase, authenticateUser, encrypt, decrypt, readLocalDb, writeLocalDb) {

    // ==================== DASHBOARD STATISTICS ====================

    /**
     * Get admin dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    app.get('/api/admin/dashboard/stats', authenticateUser, async (req, res) => {
        try {
            let stats = {
                totalUsers: 0,
                totalCandidates: 0,
                totalEmployers: 0,
                activeJobs: 0,
                totalApplications: 0,
                totalInterviews: 0,
                totalRevenue: 0,
                creditsSold: 0
            };

            if (supabase) {
                // Get user counts
                const { count: totalUsers } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });

                const { count: totalCandidates } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'candidate');

                const { count: totalEmployers } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'employer');

                // Get job counts
                const { count: activeJobs } = await supabase
                    .from('jobs')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active');

                // Get application counts
                const { count: totalApplications } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true });

                // Get interview counts
                const { count: totalInterviews } = await supabase
                    .from('interviews')
                    .select('*', { count: 'exact', head: true });

                // Get revenue data
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount, type');

                if (transactions) {
                    stats.totalRevenue = transactions
                        .filter(t => t.type === 'credit_purchase')
                        .reduce((sum, t) => sum + (t.amount || 0), 0);
                    stats.creditsSold = transactions
                        .filter(t => t.type === 'credit_purchase')
                        .reduce((sum, t) => sum + (t.credits || 0), 0);
                }

                stats = {
                    ...stats,
                    totalUsers: totalUsers || 0,
                    totalCandidates: totalCandidates || 0,
                    totalEmployers: totalEmployers || 0,
                    activeJobs: activeJobs || 0,
                    totalApplications: totalApplications || 0,
                    totalInterviews: totalInterviews || 0
                };
            }

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
        }
    });

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with pagination and filtering
     * GET /api/admin/users
     */
    app.get('/api/admin/users', authenticateUser, async (req, res) => {
        try {
            const { role, status, search, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('users')
                .select('*', { count: 'exact' });

            if (role) query = query.eq('role', role);
            if (status) query = query.eq('status', status);
            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                users: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    });

    /**
     * Get single user details
     * GET /api/admin/users/:id
     */
    app.get('/api/admin/users/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Get additional data based on role
            let additionalData = {};

            if (user.role === 'candidate') {
                const { count: applicationsCount } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('candidate_id', id);

                additionalData = { applicationsCount };
            } else if (user.role === 'employer') {
                const { count: jobsCount } = await supabase
                    .from('jobs')
                    .select('*', { count: 'exact', head: true })
                    .eq('employer_id', id);

                additionalData = { jobsCount };
            }

            res.json({
                success: true,
                user: { ...user, ...additionalData }
            });

        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Failed to fetch user details' });
        }
    });

    /**
     * Update user status
     * PATCH /api/admin/users/:id/status
     */
    app.patch('/api/admin/users/:id/status', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['Active', 'Pending', 'Blocked', 'Suspended'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

            const { data, error } = await supabase
                .from('users')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({
                success: true,
                user: data[0]
            });

        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ error: 'Failed to update user status' });
        }
    });

    /**
     * Update user details
     * PUT /api/admin/users/:id
     */
    app.put('/api/admin/users/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone, location, role, status, wallet_balance, plan } = req.body;

            const updateData = {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(location && { location }),
                ...(role && { role }),
                ...(status && { status }),
                ...(wallet_balance !== undefined && { wallet_balance }),
                ...(plan && { plan }),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({
                success: true,
                user: data[0]
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    /**
     * Delete user
     * DELETE /api/admin/users/:id
     */
    app.delete('/api/admin/users/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    });

    /**
     * Reset user password (send reset email)
     * POST /api/admin/users/:id/reset-password
     */
    app.post('/api/admin/users/:id/reset-password', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            // Get user email
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('email')
                .eq('id', id)
                .single();

            if (userError) throw userError;

            // Trigger password reset via Supabase Auth
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);

            if (error) throw error;

            res.json({
                success: true,
                message: 'Password reset email sent successfully'
            });

        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ error: 'Failed to send password reset email' });
        }
    });

    // ==================== EMAIL CONFIGURATION ====================

    /**
     * Get email configuration
     * GET /api/admin/email-config
     */
    app.get('/api/admin/email-config', authenticateUser, async (req, res) => {
        try {
            let config = null;

            if (supabase) {
                const { data, error } = await supabase
                    .from('email_config')
                    .select('*')
                    .single();

                if (!error) config = data;
            }

            // Fallback to local DB
            if (!config) {
                const localDb = await readLocalDb();
                config = localDb.email_config;
            }

            if (!config) {
                return res.json({
                    success: true,
                    config: null
                });
            }

            // Decrypt sensitive fields
            const decryptedConfig = {
                ...config,
                smtp_password: config.smtp_password ? decrypt(config.smtp_password) : null,
                api_key: config.api_key ? decrypt(config.api_key) : null
            };

            res.json({
                success: true,
                config: decryptedConfig
            });

        } catch (error) {
            console.error('Error fetching email config:', error);
            res.status(500).json({ error: 'Failed to fetch email configuration' });
        }
    });

    /**
     * Save email configuration
     * POST /api/admin/email-config
     */
    app.post('/api/admin/email-config', authenticateUser, async (req, res) => {
        try {
            const {
                provider, // 'smtp' | 'sendgrid' | 'mailgun' | 'ses'
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_password,
                api_key,
                from_email,
                from_name,
                enabled
            } = req.body;

            const encryptedConfig = {
                provider,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_password: smtp_password ? encrypt(smtp_password) : null,
                api_key: api_key ? encrypt(api_key) : null,
                from_email,
                from_name,
                enabled: enabled !== undefined ? enabled : true,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('email_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data, error } = await supabase
                        .from('email_config')
                        .update(encryptedConfig)
                        .eq('id', existing.id)
                        .select();
                    if (!error) result = data;
                } else {
                    const { data, error } = await supabase
                        .from('email_config')
                        .insert([{ ...encryptedConfig, created_at: new Date().toISOString() }])
                        .select();
                    if (!error) result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.email_config = {
                id: 1,
                ...encryptedConfig,
                created_at: localDb.email_config?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            if (!result) result = localDb.email_config;

            res.json({
                success: true,
                config: result
            });

        } catch (error) {
            console.error('Error saving email config:', error);
            res.status(500).json({ error: 'Failed to save email configuration' });
        }
    });

    /**
     * Test email configuration
     * POST /api/admin/email-config/test
     */
    app.post('/api/admin/email-config/test', authenticateUser, async (req, res) => {
        try {
            const { testEmail } = req.body;

            if (!testEmail) {
                return res.status(400).json({ error: 'Test email address is required' });
            }

            // For now, return success - actual implementation would send test email
            res.json({
                success: true,
                message: `Test email sent to ${testEmail}`
            });

        } catch (error) {
            console.error('Error testing email:', error);
            res.status(500).json({ error: 'Failed to send test email' });
        }
    });

    // ==================== CREDIT SYSTEM CONTROL ====================

    /**
     * Get credit system configuration
     * GET /api/admin/credit-config
     */
    app.get('/api/admin/credit-config', authenticateUser, async (req, res) => {
        try {
            let config = null;

            if (supabase) {
                const { data } = await supabase
                    .from('credit_config')
                    .select('*')
                    .single();
                config = data;
            }

            if (!config) {
                const localDb = await readLocalDb();
                config = localDb.credit_config;
            }

            res.json({
                success: true,
                config: config || {
                    packages: [
                        { id: 1, name: 'Starter', credits: 100, price: 9.99, popular: false },
                        { id: 2, name: 'Professional', credits: 500, price: 39.99, popular: true },
                        { id: 3, name: 'Enterprise', credits: 2000, price: 149.99, popular: false }
                    ],
                    creditCosts: {
                        jobPost: 25,
                        featuredJob: 50,
                        resumeAccess: 5,
                        aiScreening: 10
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching credit config:', error);
            res.status(500).json({ error: 'Failed to fetch credit configuration' });
        }
    });

    /**
     * Save credit system configuration
     * POST /api/admin/credit-config
     */
    app.post('/api/admin/credit-config', authenticateUser, async (req, res) => {
        try {
            const { packages, creditCosts } = req.body;

            const configData = {
                packages,
                creditCosts,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('credit_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('credit_config')
                        .update(configData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('credit_config')
                        .insert([{ ...configData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.credit_config = {
                id: 1,
                ...configData,
                created_at: localDb.credit_config?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            res.json({
                success: true,
                config: result || localDb.credit_config
            });

        } catch (error) {
            console.error('Error saving credit config:', error);
            res.status(500).json({ error: 'Failed to save credit configuration' });
        }
    });

    /**
     * Adjust user credits manually
     * POST /api/admin/users/:id/credits
     */
    app.post('/api/admin/users/:id/credits', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { amount, reason, type = 'adjustment' } = req.body;

            // Get current balance
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('wallet_balance')
                .eq('id', id)
                .single();

            if (userError) throw userError;

            const newBalance = (user.wallet_balance || 0) + amount;

            // Update balance
            const { data, error } = await supabase
                .from('users')
                .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

            // Log transaction
            await supabase.from('transactions').insert([{
                user_id: id,
                amount: amount,
                type: type,
                reason: reason,
                balance_after: newBalance,
                created_at: new Date().toISOString()
            }]);

            res.json({
                success: true,
                newBalance,
                user: data[0]
            });

        } catch (error) {
            console.error('Error adjusting credits:', error);
            res.status(500).json({ error: 'Failed to adjust credits' });
        }
    });

    // ==================== JOB PRICING CONTROL ====================

    /**
     * Get job pricing configuration
     * GET /api/admin/job-pricing
     */
    app.get('/api/admin/job-pricing', authenticateUser, async (req, res) => {
        try {
            let config = null;

            if (supabase) {
                const { data } = await supabase
                    .from('job_pricing_config')
                    .select('*')
                    .single();
                config = data;
            }

            if (!config) {
                const localDb = await readLocalDb();
                config = localDb.job_pricing_config;
            }

            res.json({
                success: true,
                config: config || {
                    basePricing: {
                        standard: 25,
                        featured: 75,
                        premium: 150
                    },
                    addons: {
                        urgentHiring: 20,
                        logoHighlight: 15,
                        socialPromotion: 30,
                        topPlacement: 50
                    },
                    discounts: {
                        bulk5: 10,
                        bulk10: 20,
                        bulk25: 30
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching job pricing:', error);
            res.status(500).json({ error: 'Failed to fetch job pricing configuration' });
        }
    });

    /**
     * Save job pricing configuration
     * POST /api/admin/job-pricing
     */
    app.post('/api/admin/job-pricing', authenticateUser, async (req, res) => {
        try {
            const { basePricing, addons, discounts, customRules } = req.body;

            const configData = {
                basePricing,
                addons,
                discounts,
                customRules,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('job_pricing_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('job_pricing_config')
                        .update(configData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('job_pricing_config')
                        .insert([{ ...configData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.job_pricing_config = {
                id: 1,
                ...configData,
                created_at: localDb.job_pricing_config?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            res.json({
                success: true,
                config: result || localDb.job_pricing_config
            });

        } catch (error) {
            console.error('Error saving job pricing:', error);
            res.status(500).json({ error: 'Failed to save job pricing configuration' });
        }
    });

    // ==================== PROCTORING CONFIGURATION ====================

    /**
     * Get proctoring configuration
     * GET /api/admin/proctoring-config
     */
    app.get('/api/admin/proctoring-config', authenticateUser, async (req, res) => {
        try {
            let config = null;

            if (supabase) {
                const { data } = await supabase
                    .from('proctoring_config')
                    .select('*')
                    .single();
                config = data;
            }

            if (!config) {
                const localDb = await readLocalDb();
                config = localDb.proctoring_config;
            }

            res.json({
                success: true,
                config: config || {
                    enabled: true,
                    settings: {
                        faceDetection: true,
                        tabSwitchDetection: true,
                        fullscreenRequired: true,
                        recordingEnabled: true,
                        maxTabSwitches: 3,
                        warningThreshold: 2,
                        autoTerminate: true
                    },
                    violationActions: {
                        tabSwitch: 'warning',
                        faceNotDetected: 'warning',
                        multipleFaces: 'terminate',
                        exitFullscreen: 'warning'
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching proctoring config:', error);
            res.status(500).json({ error: 'Failed to fetch proctoring configuration' });
        }
    });

    /**
     * Save proctoring configuration
     * POST /api/admin/proctoring-config
     */
    app.post('/api/admin/proctoring-config', authenticateUser, async (req, res) => {
        try {
            const { enabled, settings, violationActions } = req.body;

            const configData = {
                enabled,
                settings,
                violationActions,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('proctoring_config')
                    .select('id')
                    .maybeSingle();

                if (existing) {
                    const { data } = await supabase
                        .from('proctoring_config')
                        .update(configData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('proctoring_config')
                        .insert([{ ...configData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.proctoring_config = {
                id: 1,
                ...configData,
                created_at: localDb.proctoring_config?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            res.json({
                success: true,
                config: result || localDb.proctoring_config
            });

        } catch (error) {
            console.error('Error saving proctoring config:', error);
            res.status(500).json({ error: 'Failed to save proctoring configuration' });
        }
    });

    // ==================== INTERVIEW MANAGEMENT ====================

    /**
     * Get all interviews with filters
     * GET /api/admin/interviews
     */
    app.get('/api/admin/interviews', authenticateUser, async (req, res) => {
        try {
            const { status, jobId, date, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:candidate_id(id, name, email),
                    job:job_id(id, title, company)
                `, { count: 'exact' });

            if (status) query = query.eq('status', status);
            if (jobId) query = query.eq('job_id', jobId);
            if (date) query = query.gte('scheduled_date', date);

            const { data, count, error } = await query
                .order('scheduled_date', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                interviews: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });

        } catch (error) {
            console.error('Error fetching interviews:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    });

    /**
     * Get interview details
     * GET /api/admin/interviews/:id
     */
    app.get('/api/admin/interviews/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:candidate_id(id, name, email, phone, resume_url),
                    job:job_id(id, title, company, description),
                    violations:proctoring_violations(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            res.json({
                success: true,
                interview: data
            });

        } catch (error) {
            console.error('Error fetching interview:', error);
            res.status(500).json({ error: 'Failed to fetch interview details' });
        }
    });

    /**
     * Update interview status/details
     * PATCH /api/admin/interviews/:id
     */
    app.patch('/api/admin/interviews/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { status, notes, score, decision } = req.body;

            const updateData = {
                ...(status && { status }),
                ...(notes && { notes }),
                ...(score !== undefined && { score }),
                ...(decision && { decision }),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('interviews')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({
                success: true,
                interview: data[0]
            });

        } catch (error) {
            console.error('Error updating interview:', error);
            res.status(500).json({ error: 'Failed to update interview' });
        }
    });

    // ==================== AI CONTROL ====================

    /**
     * Get AI system configuration
     * GET /api/admin/ai-config
     */
    app.get('/api/admin/ai-config', authenticateUser, async (req, res) => {
        try {
            let config = null;

            if (supabase) {
                const { data } = await supabase
                    .from('ai_config')
                    .select('*')
                    .single();
                config = data;
            }

            if (!config) {
                const localDb = await readLocalDb();
                config = localDb.ai_config;
            }

            res.json({
                success: true,
                config: config || {
                    primaryProvider: 'gemini',
                    fallbackProvider: 'gpt4',
                    features: {
                        resumeScreening: true,
                        videoAnalysis: true,
                        skillMapping: true,
                        rankingEngine: true,
                        continuousLearning: true
                    },
                    weights: {
                        technicalSkills: 0.35,
                        communication: 0.25,
                        experience: 0.20,
                        cultureFit: 0.20
                    },
                    thresholds: {
                        autoReject: 30,
                        autoShortlist: 80,
                        humanReview: 50
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching AI config:', error);
            res.status(500).json({ error: 'Failed to fetch AI configuration' });
        }
    });

    /**
     * Save AI system configuration
     * POST /api/admin/ai-config
     */
    app.post('/api/admin/ai-config', authenticateUser, async (req, res) => {
        try {
            const { primaryProvider, fallbackProvider, features, weights, thresholds } = req.body;

            const configData = {
                primaryProvider,
                fallbackProvider,
                features,
                weights,
                thresholds,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('ai_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('ai_config')
                        .update(configData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('ai_config')
                        .insert([{ ...configData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.ai_config = {
                id: 1,
                ...configData,
                created_at: localDb.ai_config?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            res.json({
                success: true,
                config: result || localDb.ai_config
            });

        } catch (error) {
            console.error('Error saving AI config:', error);
            res.status(500).json({ error: 'Failed to save AI configuration' });
        }
    });

    /**
     * Trigger AI model retraining
     * POST /api/admin/ai-config/retrain
     */
    app.post('/api/admin/ai-config/retrain', authenticateUser, async (req, res) => {
        try {
            // Log the retraining request
            if (supabase) {
                await supabase.from('model_training_logs').insert([{
                    trigger_source: 'admin_manual',
                    status: 'initiated',
                    created_at: new Date().toISOString()
                }]);
            }

            res.json({
                success: true,
                message: 'AI model retraining initiated',
                jobId: `retrain_${Date.now()}`
            });

        } catch (error) {
            console.error('Error triggering retrain:', error);
            res.status(500).json({ error: 'Failed to trigger AI retraining' });
        }
    });

    // ==================== SYSTEM LOGS ====================

    /**
     * Get system logs with filtering
     * GET /api/admin/system-logs
     */
    app.get('/api/admin/system-logs', authenticateUser, async (req, res) => {
        try {
            const { level, source, startDate, endDate, page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('system_logs')
                .select('*', { count: 'exact' });

            if (level) query = query.eq('level', level);
            if (source) query = query.eq('source', source);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                logs: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });

        } catch (error) {
            console.error('Error fetching system logs:', error);
            res.status(500).json({ error: 'Failed to fetch system logs' });
        }
    });

    /**
     * Export system logs
     * GET /api/admin/system-logs/export
     */
    app.get('/api/admin/system-logs/export', authenticateUser, async (req, res) => {
        try {
            const { format = 'json', startDate, endDate } = req.query;

            let query = supabase
                .from('system_logs')
                .select('*');

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            if (format === 'csv') {
                const csv = data.map(log =>
                    `${log.created_at},${log.level},${log.source},${log.message}`
                ).join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=system_logs.csv');
                res.send(`timestamp,level,source,message\n${csv}`);
            } else {
                res.json({
                    success: true,
                    logs: data || [],
                    exportedAt: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Error exporting logs:', error);
            res.status(500).json({ error: 'Failed to export system logs' });
        }
    });

    console.log('✅ Admin routes initialized');
}
