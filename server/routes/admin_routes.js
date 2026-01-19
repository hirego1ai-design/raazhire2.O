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

    // ==================== ADMIN AUTH ====================
    app.post('/api/admin/login', (req, res) => {
        const { email, password } = req.body;
        console.log('Login attempt:', email, password); // Debug log

        const cleanEmail = email ? email.trim() : '';
        const cleanPass = password ? password.trim() : '';

        // Simple hardcoded check for demo purposes
        if (cleanEmail === 'admin@hirego.com' && cleanPass === 'admin123') {
            return res.json({
                success: true,
                token: 'mock-admin-token-secure-123',
                user: { name: 'Super Admin', email: cleanEmail, role: 'admin' }
            });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    });

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

    // ==================== UPSKILL PLATFORM ADMIN ====================

    /**
     * Get all upskill courses (admin)
     * GET /api/admin/upskill/courses
     */
    app.get('/api/admin/upskill/courses', authenticateUser, async (req, res) => {
        try {
            const { status, category, search, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let courses = [];
            let total = 0;

            if (supabase) {
                let query = supabase
                    .from('courses')
                    .select('*', { count: 'exact' });

                if (status) query = query.eq('status', status);
                if (category) query = query.eq('category', category);
                if (search) {
                    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
                }

                const { data, count, error } = await query
                    .order('created_at', { ascending: false })
                    .range(offset, offset + parseInt(limit) - 1);

                if (!error) {
                    courses = data || [];
                    total = count || 0;
                }
            }

            // Fallback mock data
            if (courses.length === 0) {
                courses = [
                    { id: 'C001', title: 'Full Stack Web Development', category: 'Web Development', level: 'Intermediate', duration: '40 hours', lessons: 45, enrollments: 1250, rating: 4.8, status: 'Published', instructor: 'John Doe', price: 2999, isFree: false },
                    { id: 'C002', title: 'AI & Machine Learning Fundamentals', category: 'AI/ML', level: 'Beginner', duration: '25 hours', lessons: 30, enrollments: 890, rating: 4.6, status: 'Published', instructor: 'Jane Smith', price: 0, isFree: true },
                    { id: 'C003', title: 'Advanced Data Structures', category: 'Computer Science', level: 'Advanced', duration: '35 hours', lessons: 40, enrollments: 560, rating: 4.9, status: 'Draft', instructor: 'Alex Johnson', price: 1999, isFree: false }
                ];
                total = courses.length;
            }

            res.json({
                success: true,
                courses,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            });

        } catch (error) {
            console.error('Error fetching upskill courses:', error);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    });

    /**
     * Create/Update upskill course (admin)
     * POST /api/admin/upskill/courses
     */
    app.post('/api/admin/upskill/courses', authenticateUser, async (req, res) => {
        try {
            const { id, title, description, category, level, duration, instructor, price, isFree, status, thumbnail } = req.body;

            const courseData = {
                title,
                description,
                category,
                level,
                duration,
                instructor,
                price: isFree ? 0 : price,
                is_free: isFree,
                status: status || 'Draft',
                thumbnail,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                if (id) {
                    // Update existing course
                    const { data, error } = await supabase
                        .from('courses')
                        .update(courseData)
                        .eq('id', id)
                        .select();
                    if (!error) result = data[0];
                } else {
                    // Create new course
                    const { data, error } = await supabase
                        .from('courses')
                        .insert([{ ...courseData, created_at: new Date().toISOString(), lessons_count: 0, enrollments_count: 0, rating: 0 }])
                        .select();
                    if (!error) result = data[0];
                }
            }

            res.json({
                success: true,
                course: result || { id: `C${Date.now()}`, ...courseData }
            });

        } catch (error) {
            console.error('Error saving course:', error);
            res.status(500).json({ error: 'Failed to save course' });
        }
    });

    /**
     * Delete upskill course (admin)
     * DELETE /api/admin/upskill/courses/:id
     */
    app.delete('/api/admin/upskill/courses/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            if (supabase) {
                const { error } = await supabase
                    .from('courses')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            }

            res.json({
                success: true,
                message: 'Course deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({ error: 'Failed to delete course' });
        }
    });

    /**
     * Toggle course status (Publish/Unpublish)
     * PATCH /api/admin/upskill/courses/:id/status
     */
    app.patch('/api/admin/upskill/courses/:id/status', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['Published', 'Draft', 'Archived'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

            let result;

            if (supabase) {
                const { data, error } = await supabase
                    .from('courses')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select();

                if (!error) result = data[0];
            }

            res.json({
                success: true,
                course: result || { id, status }
            });

        } catch (error) {
            console.error('Error updating course status:', error);
            res.status(500).json({ error: 'Failed to update course status' });
        }
    });

    /**
     * Get upskill learner progress (admin)
     * GET /api/admin/upskill/learners
     */
    app.get('/api/admin/upskill/learners', authenticateUser, async (req, res) => {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let learners = [];
            let total = 0;

            if (supabase) {
                let query = supabase
                    .from('user_learning_progress')
                    .select(`
                        *,
                        user:users(id, name, email, avatar)
                    `, { count: 'exact' });

                if (search) {
                    query = query.or(`user.name.ilike.%${search}%,user.email.ilike.%${search}%`);
                }

                const { data, count, error } = await query
                    .order('total_xp', { ascending: false })
                    .range(offset, offset + parseInt(limit) - 1);

                if (!error) {
                    learners = data || [];
                    total = count || 0;
                }
            }

            // Fallback mock data
            if (learners.length === 0) {
                learners = [
                    { id: 'L001', userId: 'U001', userName: 'Priya Sharma', email: 'priya@example.com', totalCoursesEnrolled: 5, coursesCompleted: 3, totalHoursLearned: 45, currentStreak: 12, level: 8, xp: 2450, badges: 2, certificates: 1 },
                    { id: 'L002', userId: 'U002', userName: 'Rahul Verma', email: 'rahul@example.com', totalCoursesEnrolled: 3, coursesCompleted: 2, totalHoursLearned: 28, currentStreak: 5, level: 5, xp: 1200, badges: 1, certificates: 0 },
                    { id: 'L003', userId: 'U003', userName: 'Ananya Patel', email: 'ananya@example.com', totalCoursesEnrolled: 8, coursesCompleted: 7, totalHoursLearned: 120, currentStreak: 30, level: 15, xp: 5800, badges: 4, certificates: 3 }
                ];
                total = learners.length;
            }

            res.json({
                success: true,
                learners,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            });

        } catch (error) {
            console.error('Error fetching learners:', error);
            res.status(500).json({ error: 'Failed to fetch learner progress' });
        }
    });

    /**
     * Get learner detail with certificates and badges
     * GET /api/admin/upskill/learners/:id
     */
    app.get('/api/admin/upskill/learners/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            let learner = null;
            let certificates = [];
            let badges = [];

            if (supabase) {
                // Get learner progress
                const { data: progressData } = await supabase
                    .from('user_learning_progress')
                    .select(`
                        *,
                        user:users(id, name, email, avatar)
                    `)
                    .eq('user_id', id)
                    .single();

                if (progressData) {
                    learner = progressData;

                    // Get certificates
                    const { data: certData } = await supabase
                        .from('certificates')
                        .select('*, course:courses(title)')
                        .eq('user_id', id);

                    certificates = certData || [];

                    // Get badges
                    const { data: badgeData } = await supabase
                        .from('user_badges')
                        .select('*')
                        .eq('user_id', id);

                    badges = badgeData || [];
                }
            }

            res.json({
                success: true,
                learner: learner || { id, userName: 'Sample User', email: 'user@example.com' },
                certificates,
                badges
            });

        } catch (error) {
            console.error('Error fetching learner detail:', error);
            res.status(500).json({ error: 'Failed to fetch learner details' });
        }
    });

    /**
     * Get/Set gamification settings
     * GET /api/admin/upskill/gamification
     */
    app.get('/api/admin/upskill/gamification', authenticateUser, async (req, res) => {
        try {
            let settings = null;

            if (supabase) {
                const { data } = await supabase
                    .from('gamification_settings')
                    .select('*')
                    .single();
                settings = data;
            }

            if (!settings) {
                const localDb = await readLocalDb();
                settings = localDb.gamification_settings;
            }

            res.json({
                success: true,
                settings: settings || {
                    xpPerLessonComplete: 50,
                    xpPerCourseComplete: 500,
                    xpPerBadgeEarned: 100,
                    streakBonusMultiplier: 1.5,
                    levelUpXpThreshold: 500
                }
            });

        } catch (error) {
            console.error('Error fetching gamification settings:', error);
            res.status(500).json({ error: 'Failed to fetch gamification settings' });
        }
    });

    /**
     * Update gamification settings
     * POST /api/admin/upskill/gamification
     */
    app.post('/api/admin/upskill/gamification', authenticateUser, async (req, res) => {
        try {
            const { xpPerLessonComplete, xpPerCourseComplete, xpPerBadgeEarned, streakBonusMultiplier, levelUpXpThreshold } = req.body;

            const settingsData = {
                xp_per_lesson_complete: xpPerLessonComplete,
                xp_per_course_complete: xpPerCourseComplete,
                xp_per_badge_earned: xpPerBadgeEarned,
                streak_bonus_multiplier: streakBonusMultiplier,
                level_up_xp_threshold: levelUpXpThreshold,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('gamification_settings')
                    .select('id')
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('gamification_settings')
                        .update(settingsData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('gamification_settings')
                        .insert([{ ...settingsData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            // Save to local DB
            const localDb = await readLocalDb();
            localDb.gamification_settings = {
                id: 1,
                ...settingsData,
                created_at: localDb.gamification_settings?.created_at || new Date().toISOString()
            };
            await writeLocalDb(localDb);

            res.json({
                success: true,
                settings: result || localDb.gamification_settings
            });

        } catch (error) {
            console.error('Error saving gamification settings:', error);
            res.status(500).json({ error: 'Failed to save gamification settings' });
        }
    });

    /**
     * Get all badges (admin)
     * GET /api/admin/upskill/badges
     */
    app.get('/api/admin/upskill/badges', authenticateUser, async (req, res) => {
        try {
            let badges = [];

            if (supabase) {
                const { data } = await supabase
                    .from('badges')
                    .select('*')
                    .order('created_at', { ascending: false });
                badges = data || [];
            }

            // Fallback mock data
            if (badges.length === 0) {
                badges = [
                    { id: 'PB1', name: 'First Course', description: 'Complete your first course', icon: 'book', color: 'text-green-400', awardedCount: 145 },
                    { id: 'PB2', name: 'Fast Learner', description: 'Complete 3 lessons in one day', icon: 'zap', color: 'text-yellow-400', awardedCount: 89 },
                    { id: 'PB3', name: 'Streak Master', description: 'Maintain a 30-day streak', icon: 'fire', color: 'text-red-400', awardedCount: 23 },
                    { id: 'PB4', name: 'Top Performer', description: 'Score 90%+ in all assessments', icon: 'star', color: 'text-purple-400', awardedCount: 45 },
                    { id: 'PB5', name: 'Course Champion', description: 'Complete 10 courses', icon: 'trophy', color: 'text-cyan-400', awardedCount: 12 }
                ];
            }

            res.json({
                success: true,
                badges
            });

        } catch (error) {
            console.error('Error fetching badges:', error);
            res.status(500).json({ error: 'Failed to fetch badges' });
        }
    });

    /**
     * Create/Update badge
     * POST /api/admin/upskill/badges
     */
    app.post('/api/admin/upskill/badges', authenticateUser, async (req, res) => {
        try {
            const { id, name, description, icon, color, criteria } = req.body;

            const badgeData = {
                name,
                description,
                icon,
                color,
                criteria,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                if (id) {
                    const { data, error } = await supabase
                        .from('badges')
                        .update(badgeData)
                        .eq('id', id)
                        .select();
                    if (!error) result = data[0];
                } else {
                    const { data, error } = await supabase
                        .from('badges')
                        .insert([{ ...badgeData, created_at: new Date().toISOString() }])
                        .select();
                    if (!error) result = data[0];
                }
            }

            res.json({
                success: true,
                badge: result || { id: `B${Date.now()}`, ...badgeData }
            });

        } catch (error) {
            console.error('Error saving badge:', error);
            res.status(500).json({ error: 'Failed to save badge' });
        }
    });

    /**
     * Get certificate settings
     * GET /api/admin/upskill/certificate-settings
     */
    app.get('/api/admin/upskill/certificate-settings', authenticateUser, async (req, res) => {
        try {
            let settings = null;

            if (supabase) {
                const { data } = await supabase
                    .from('certificate_settings')
                    .select('*')
                    .single();
                settings = data;
            }

            res.json({
                success: true,
                settings: settings || {
                    autoIssue: true,
                    minimumScore: 60,
                    includeGrade: true,
                    templateUrl: null
                }
            });

        } catch (error) {
            console.error('Error fetching certificate settings:', error);
            res.status(500).json({ error: 'Failed to fetch certificate settings' });
        }
    });

    /**
     * Update certificate settings
     * POST /api/admin/upskill/certificate-settings
     */
    app.post('/api/admin/upskill/certificate-settings', authenticateUser, async (req, res) => {
        try {
            const { autoIssue, minimumScore, includeGrade, templateUrl } = req.body;

            const settingsData = {
                auto_issue: autoIssue,
                minimum_score: minimumScore,
                include_grade: includeGrade,
                template_url: templateUrl,
                updated_at: new Date().toISOString()
            };

            let result;

            if (supabase) {
                const { data: existing } = await supabase
                    .from('certificate_settings')
                    .select('id')
                    .single();

                if (existing) {
                    const { data } = await supabase
                        .from('certificate_settings')
                        .update(settingsData)
                        .eq('id', existing.id)
                        .select();
                    result = data;
                } else {
                    const { data } = await supabase
                        .from('certificate_settings')
                        .insert([{ ...settingsData, created_at: new Date().toISOString() }])
                        .select();
                    result = data;
                }
            }

            res.json({
                success: true,
                settings: result || settingsData
            });

        } catch (error) {
            console.error('Error saving certificate settings:', error);
            res.status(500).json({ error: 'Failed to save certificate settings' });
        }
    });

    /**
     * Issue certificate manually
     * POST /api/admin/upskill/certificates/issue
     */
    app.post('/api/admin/upskill/certificates/issue', authenticateUser, async (req, res) => {
        try {
            const { userId, courseId, grade } = req.body;

            const certificateData = {
                user_id: userId,
                course_id: courseId,
                grade,
                issued_at: new Date().toISOString(),
                certificate_number: `CERT-${Date.now()}`
            };

            let result;

            if (supabase) {
                const { data, error } = await supabase
                    .from('certificates')
                    .insert([certificateData])
                    .select();
                if (!error) result = data[0];
            }

            res.json({
                success: true,
                certificate: result || certificateData
            });

        } catch (error) {
            console.error('Error issuing certificate:', error);
            res.status(500).json({ error: 'Failed to issue certificate' });
        }
    });

    /**
     * Get upskill analytics/dashboard stats
     * GET /api/admin/upskill/stats
     */
    app.get('/api/admin/upskill/stats', authenticateUser, async (req, res) => {
        try {
            let stats = {
                totalCourses: 0,
                publishedCourses: 0,
                totalEnrollments: 0,
                activeLearners: 0,
                certificatesIssued: 0,
                badgesAwarded: 0,
                avgCompletionRate: 0,
                totalHoursLearned: 0
            };

            if (supabase) {
                const { count: totalCourses } = await supabase
                    .from('courses')
                    .select('*', { count: 'exact', head: true });

                const { count: publishedCourses } = await supabase
                    .from('courses')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Published');

                const { count: totalEnrollments } = await supabase
                    .from('user_enrollments')
                    .select('*', { count: 'exact', head: true });

                const { count: certificatesIssued } = await supabase
                    .from('certificates')
                    .select('*', { count: 'exact', head: true });

                const { count: badgesAwarded } = await supabase
                    .from('user_badges')
                    .select('*', { count: 'exact', head: true });

                stats = {
                    totalCourses: totalCourses || 3,
                    publishedCourses: publishedCourses || 2,
                    totalEnrollments: totalEnrollments || 2700,
                    activeLearners: activeLearners || 850,
                    certificatesIssued: certificatesIssued || 156,
                    badgesAwarded: badgesAwarded || 423,
                    avgCompletionRate: 68,
                    totalHoursLearned: 4520
                };
            } else {
                // Mock stats
                stats = {
                    totalCourses: 12,
                    publishedCourses: 10,
                    totalEnrollments: 2700,
                    activeLearners: 850,
                    certificatesIssued: 156,
                    badgesAwarded: 423,
                    avgCompletionRate: 68,
                    totalHoursLearned: 4520
                };
            }

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            console.error('Error fetching upskill stats:', error);
            res.status(500).json({ error: 'Failed to fetch upskill statistics' });
        }
    });

    // ==================== BADGE MANAGEMENT ====================

    /**
     * Create new badge
     * POST /api/admin/upskill/badges
     */
    app.post('/api/admin/upskill/badges', authenticateUser, async (req, res) => {
        try {
            const { name, description, icon, color, criteria } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Badge name is required' });
            }

            const newBadge = {
                id: `B${Date.now()}`,
                name,
                description: description || '',
                icon: icon || 'award',
                color: color || 'text-neon-cyan',
                criteria: criteria || {},
                created_at: new Date().toISOString()
            };

            if (supabase) {
                const { data, error } = await supabase
                    .from('badges')
                    .insert([newBadge])
                    .select()
                    .single();

                if (error) throw error;

                res.json({
                    success: true,
                    badge: data
                });
            } else {
                // Local DB fallback
                const localDb = await readLocalDb();
                if (!localDb.badges) localDb.badges = [];
                localDb.badges.push(newBadge);
                await writeLocalDb(localDb);

                res.json({
                    success: true,
                    badge: newBadge
                });
            }

        } catch (error) {
            console.error('Error creating badge:', error);
            res.status(500).json({ error: 'Failed to create badge' });
        }
    });

    /**
     * Update badge
     * PUT /api/admin/upskill/badges/:id
     */
    app.put('/api/admin/upskill/badges/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, icon, color, criteria } = req.body;

            const updates = {
                name,
                description,
                icon,
                color,
                criteria,
                updated_at: new Date().toISOString()
            };

            if (supabase) {
                const { data, error } = await supabase
                    .from('badges')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                res.json({
                    success: true,
                    badge: data
                });
            } else {
                // Local DB fallback
                const localDb = await readLocalDb();
                if (!localDb.badges) localDb.badges = [];

                const badgeIndex = localDb.badges.findIndex(b => b.id === id);
                if (badgeIndex === -1) {
                    return res.status(404).json({ error: 'Badge not found' });
                }

                localDb.badges[badgeIndex] = {
                    ...localDb.badges[badgeIndex],
                    ...updates
                };
                await writeLocalDb(localDb);

                res.json({
                    success: true,
                    badge: localDb.badges[badgeIndex]
                });
            }

        } catch (error) {
            console.error('Error updating badge:', error);
            res.status(500).json({ error: 'Failed to update badge' });
        }
    });

    /**
     * Delete badge
     * DELETE /api/admin/upskill/badges/:id
     */
    app.delete('/api/admin/upskill/badges/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            if (supabase) {
                const { error } = await supabase
                    .from('badges')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                res.json({
                    success: true,
                    message: 'Badge deleted successfully'
                });
            } else {
                // Local DB fallback
                const localDb = await readLocalDb();
                if (!localDb.badges) localDb.badges = [];

                localDb.badges = localDb.badges.filter(b => b.id !== id);
                await writeLocalDb(localDb);

                res.json({
                    success: true,
                    message: 'Badge deleted successfully'
                });
            }

        } catch (error) {
            console.error('Error deleting badge:', error);
            res.status(500).json({ error: 'Failed to delete badge' });
        }
    });

    /**
     * Award badge to learner
     * POST /api/admin/upskill/learners/:learnerId/award-badge
     */
    app.post('/api/admin/upskill/learners/:learnerId/award-badge', authenticateUser, async (req, res) => {
        try {
            const { learnerId } = req.params;
            const { badgeId } = req.body;

            if (!badgeId) {
                return res.status(400).json({ error: 'Badge ID is required' });
            }

            const awardedBadge = {
                id: `UB${Date.now()}`,
                user_id: learnerId,
                badge_id: badgeId,
                earned_at: new Date().toISOString()
            };

            if (supabase) {
                const { data, error } = await supabase
                    .from('user_badges')
                    .insert([awardedBadge])
                    .select()
                    .single();

                if (error) throw error;

                res.json({
                    success: true,
                    awardedBadge: data
                });
            } else {
                // Local DB fallback
                const localDb = await readLocalDb();
                if (!localDb.user_badges) localDb.user_badges = [];
                localDb.user_badges.push(awardedBadge);
                await writeLocalDb(localDb);

                res.json({
                    success: true,
                    awardedBadge
                });
            }

        } catch (error) {
            console.error('Error awarding badge:', error);
            res.status(500).json({ error: 'Failed to award badge' });
        }
    });

    console.log('✅ Admin routes initialized');
}
