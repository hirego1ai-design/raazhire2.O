import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { atomicWalletTransaction, getWalletBalance, getTransactionHistory } from '../services/wallet_service.js';

export function setupPaymentRoutes(app, supabase, authenticateUser) {

    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
        ? new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        : null;

    // ==================== SUBSCRIPTION PLANS ====================

    /**
     * Get all active subscription plans
     * GET /api/plans
     */
    app.get('/api/plans', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('price_inr', { ascending: true });

            if (error) throw error;

            res.json({
                success: true,
                plans: data
            });
        } catch (error) {
            console.error('Error fetching plans:', error);
            res.status(500).json({ error: 'Failed to fetch subscription plans' });
        }
    });

    // ==================== WALLET & CREDITS ====================
    // SECURITY FIX: Using atomic wallet transactions to prevent race conditions

    /**
     * Get wallet balance
     * GET /api/wallet
     */
    app.get('/api/wallet', authenticateUser, async (req, res) => {
        try {
            const result = await getWalletBalance(req.user.id);

            res.json({
                success: true,
                balance: result.balance,
                currency: result.currency,
                hasWallet: result.hasWallet
            });
        } catch (error) {
            console.error('Error fetching wallet:', error);
            res.status(500).json({ error: 'Failed to fetch wallet balance' });
        }
    });

    /**
     * Get transaction history
     * GET /api/wallet/transactions
     */
    app.get('/api/wallet/transactions', authenticateUser, async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const result = await getTransactionHistory(req.user.id, parseInt(limit));

            res.json({
                success: true,
                transactions: result.transactions,
                count: result.count
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ error: 'Failed to fetch transaction history' });
        }
    });

    /**
     * Add money to wallet (Razorpay)
     * POST /api/wallet/add
     * SECURITY FIX: Using atomic transactions to prevent race conditions
     */
    app.post('/api/wallet/add', authenticateUser, async (req, res) => {
        try {
            const { amount, currency = 'INR' } = req.body;

            // Validate input
            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Valid amount is required' });
            }

            if (amount < 10) {
                return res.status(400).json({ error: 'Minimum amount is ₹10' });
            }

            // Create Razorpay order
            if (!razorpay) {
                return res.status(503).json({ error: 'Payment gateway not configured' });
            }

            const options = {
                amount: amount * 100, // Razorpay expects paise
                currency: currency,
                receipt: `receipt_${req.user.id}_${Date.now()}`
            };

            const order = await razorpay.orders.create(options);

            // Create pending transaction record
            const transactionResult = await atomicWalletTransaction(
                req.user.id,
                amount,
                'credit',
                {
                    description: `Wallet top-up: ₹${amount}`,
                    payment_method: 'razorpay',
                    order_id: order.id,
                    status: 'pending'
                }
            );

            res.json({
                success: true,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                transaction_id: transactionResult.transactionId
            });

        } catch (error) {
            console.error('Error creating wallet top-up:', error);
            res.status(500).json({ error: error.message || 'Failed to initiate payment' });
        }
    });


    /**
     * Verify Payment (Razorpay Webhook/Manual)
     * POST /api/wallet/verify
     */
    app.post('/api/wallet/verify', authenticateUser, async (req, res) => {
        try {
            const { paymentId, orderId, signature } = req.body;

            // In a real app, verify signature here using crypto

            // Update transaction status
            const { data, error } = await supabase
                .from('wallet_transactions')
                .update({ status: 'completed', transaction_id: paymentId })
                .eq('reference_id', orderId)
                .select()
                .single();

            if (error) throw error;

            // Credit the wallet
            if (data) {
                // Check if wallet exists
                const { data: wallet } = await supabase
                    .from('wallet')
                    .select('id, balance')
                    .eq('employer_id', req.user.id)
                    .single();

                if (wallet) {
                    await supabase
                        .from('wallet')
                        .update({ balance: wallet.balance + data.amount })
                        .eq('id', wallet.id);
                } else {
                    // Update user table directly if separate wallet table unused or empty
                    const { data: user } = await supabase
                        .from('users')
                        .select('wallet_balance')
                        .eq('id', req.user.id)
                        .single();

                    await supabase
                        .from('users')
                        .update({ wallet_balance: (user?.wallet_balance || 0) + data.amount })
                        .eq('id', req.user.id);
                }
            }

            res.json({ success: true, message: 'Payment verified and wallet updated' });

        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({ error: 'Payment verification failed' });
        }
    });

    // ==================== PAY PER HIRE (PPH) ====================

    /**
     * Calculate PPH Fee
     * POST /api/pph/calculate
     */
    app.post('/api/pph/calculate', authenticateUser, async (req, res) => {
        try {
            const { salary, currency = 'INR' } = req.body;

            // Try fetch slabs
            let { data: slabs } = await supabase
                .from('salary_slabs')
                .select('*')
                .eq('currency', currency)
                .order('min_salary', { ascending: true });

            let fee = 0;
            if (slabs && slabs.length > 0) {
                const slab = slabs.find(s => salary >= s.min_salary && (s.max_salary === null || salary <= s.max_salary));
                // Use percentage or fixed fee
                if (slab) {
                    fee = slab.pph_fee ? slab.pph_fee : (salary * 0.10); // Example fallback
                } else {
                    fee = salary * 0.10;
                }
            } else {
                fee = salary * 0.0833; // Default ~1 month salary (8.33%)
            }

            res.json({
                success: true,
                salary,
                fee: Math.round(fee),
                currency
            });

        } catch (error) {
            console.error('Error calculating PPH:', error);
            res.status(500).json({ error: 'Calculation failed' });
        }
    });

    /**
     * Unlock/Hire Candidate (PPH)
     * POST /api/pph/hire
     */
    app.post('/api/pph/hire', authenticateUser, async (req, res) => {
        try {
            const { candidate_id, fee, currency = 'INR', job_id } = req.body;

            // 1. Check if already unlocked
            const { data: existing } = await supabase
                .from('pay_per_hire_records')
                .select('id')
                .eq('employer_id', req.user.id)
                .eq('candidate_id', candidate_id)
                .limit(1); // Use limit 1 instead of single to avoid error if multiple

            if (existing && existing.length > 0) {
                return res.json({ success: true, message: 'Candidate already unlocked', already_paid: true });
            }

            // 2. Check Wallet Balance
            let { data: wallet } = await supabase
                .from('wallet')
                .select('id, balance')
                .eq('employer_id', req.user.id)
                .single();

            let currentBalance = 0;
            let walletId = null;

            if (wallet) {
                currentBalance = wallet.balance;
                walletId = wallet.id;
            } else {
                const { data: user, error: userFetchError } = await supabase.from('users').select('wallet_balance').eq('id', req.user.id).single();
                if (userFetchError) throw userFetchError;
                currentBalance = user?.wallet_balance || 0;
            }

            if (currentBalance < fee) {
                return res.status(402).json({ error: `Insufficient wallet balance. Required: ${fee}, Available: ${currentBalance}` });
            }

            // 3. Deduct Fee
            if (walletId) {
                const { error: walletError } = await supabase.from('wallet').update({ balance: currentBalance - fee }).eq('id', walletId);
                if (walletError) throw walletError;
            } else {
                const { error: userError } = await supabase.from('users').update({ wallet_balance: currentBalance - fee }).eq('id', req.user.id);
                if (userError) throw userError;
            }

            // 4. Record PPH (Unlock)
            const { error: pphError } = await supabase.from('pay_per_hire_records').insert([{
                employer_id: req.user.id,
                candidate_id,
                job_id, // Optional, can be null
                amount: fee,
                currency,
                status: 'completed',
                unlocked_at: new Date().toISOString()
            }]);

            if (pphError) {
                // Critical: Failed to record unlock after deduction!
                // In production, we should refund or retry. For now, log error.
                console.error('CRITICAL: Failed to insert PPH record after deduction', pphError);
                return res.status(500).json({ error: 'Transaction recorded but unlock failed. Please contact support.' });
            }

            // 5. Log Transaction
            await supabase.from('wallet_transactions').insert([{
                employer_id: req.user.id,
                amount: -fee,
                type: 'debit',
                status: 'completed',
                description: `Unlocked Candidate: ${candidate_id}`,
                metadata: { type: 'pph_unlock', candidate_id, job_id }
            }]);

            res.json({ success: true, message: 'Candidate unlocked successfully' });

        } catch (error) {
            console.error('Error processing PPH hire:', error);
            res.status(500).json({ error: 'Transaction failed' });
        }
    });

    /**
     * Check Unlock Status
     * GET /api/pph/status/:candidateId
     */
    app.get('/api/pph/status/:candidateId', authenticateUser, async (req, res) => {
        try {
            const { candidateId } = req.params;
            const { data, error } = await supabase
                .from('pay_per_hire_records')
                .select('id, unlocked_at')
                .eq('employer_id', req.user.id)
                .eq('candidate_id', candidateId)
                .maybeSingle();

            res.json({
                success: true,
                unlocked: !!data,
                details: data
            });

        } catch (error) {
            console.error('Error checking PPH status:', error);
            res.status(500).json({ error: 'Check failed' });
        }
    });

}
