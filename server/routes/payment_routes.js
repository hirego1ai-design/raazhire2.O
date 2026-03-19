import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { atomicWalletTransaction, getWalletBalance, getTransactionHistory } from '../services/wallet_service.js';

export function setupPaymentRoutes(app, supabase, authenticateUser) {

    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
        ? new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        : null;

    // SECURITY: Validate payment gateway configuration
    if (!process.env.RAZORPAY_KEY_SECRET) {
        console.warn('⚠️  RAZORPAY_KEY_SECRET not configured - payment verification will fail');
    }

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
            // Mock plans if DB is empty for demo purposes
            res.json({
                success: true,
                plans: [
                    { id: 1, name: 'Free', price_inr: 0, job_posts_limit: 1, description: 'Basic access', features: ['1 Job Post', 'Basic Support'] },
                    { id: 2, name: 'Pro', price_inr: 2999, job_posts_limit: 10, description: 'Growing teams', features: ['10 Job Posts', 'Priority Support', 'AI Screening'] },
                    { id: 3, name: 'Enterprise', price_inr: 9999, job_posts_limit: 100, description: 'Scale', features: ['Unlimited', 'Dedicated Manager', 'API Access'] }
                ]
            });
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
     * SECURITY FIX: Proper signature verification and atomic transactions
     */
    app.post('/api/wallet/verify', authenticateUser, async (req, res) => {
        try {
            const { paymentId, orderId, signature } = req.body;

            // Validate required parameters
            if (!paymentId || !orderId || !signature) {
                return res.status(400).json({ error: 'Missing required payment verification parameters' });
            }

            // SECURITY: Verify Razorpay signature
            if (!razorpay) {
                return res.status(503).json({ error: 'Payment gateway not configured' });
            }

            // Generate HMAC-SHA256 signature
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(`${orderId}|${paymentId}`)
                .digest('hex');

            // Constant-time comparison to prevent timing attacks
            const signatureValid = crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );

            if (!signatureValid) {
                console.warn(`🔴 SECURITY ALERT: Invalid payment signature from user ${req.user.id}`);
                return res.status(403).json({ error: 'Invalid payment signature - potential fraud attempt' });
            }

            // Check for idempotency - verify if transaction already processed
            const { data: existingTransaction } = await supabase
                .from('wallet_transactions')
                .select('id, status')
                .eq('reference_id', orderId)
                .eq('transaction_id', paymentId)
                .single();

            if (existingTransaction) {
                if (existingTransaction.status === 'completed') {
                    return res.json({ success: true, message: 'Payment already verified', duplicate: true });
                } else if (existingTransaction.status === 'pending') {
                    return res.status(409).json({ error: 'Transaction still pending', transactionId: existingTransaction.id });
                }
            }

            // Use atomic transaction service to credit wallet
            const transactionResult = await atomicWalletTransaction(
                req.user.id,
                parseFloat(req.body.amount) || 0,
                'credit',
                {
                    description: `Wallet top-up verified: ₹${req.body.amount}`,
                    payment_method: 'razorpay',
                    order_id: orderId,
                    payment_id: paymentId,
                    status: 'completed'
                }
            );

            res.json({ 
                success: true, 
                message: 'Payment verified and wallet updated',
                transactionId: transactionResult.transactionId,
                newBalance: transactionResult.newBalance
            });

        } catch (error) {
            console.error('Error verifying payment:', error);
            // Don't expose internal errors to client
            res.status(500).json({ error: 'Payment verification failed - please contact support' });
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
     * SECURITY FIX: Input validation, atomic transactions, and proper error handling
     */
    app.post('/api/pph/hire', authenticateUser, async (req, res) => {
        try {
            const { candidate_id, fee, currency = 'INR', job_id } = req.body;

            // SECURITY: Input validation
            if (!candidate_id || typeof candidate_id !== 'string') {
                return res.status(400).json({ error: 'Valid candidate_id is required' });
            }

            if (!fee || typeof fee !== 'number' || fee <= 0) {
                return res.status(400).json({ error: 'Valid positive fee amount is required' });
            }

            // Sanitize job_id if provided
            const sanitizedJobId = job_id ? String(job_id).slice(0, 100) : null;

            // 1. Check if already unlocked
            const { data: existing } = await supabase
                .from('pay_per_hire_records')
                .select('id, status')
                .eq('employer_id', req.user.id)
                .eq('candidate_id', candidate_id)
                .limit(1);

            if (existing && existing.length > 0) {
                const record = existing[0];
                if (record.status === 'completed') {
                    return res.json({ 
                        success: true, 
                        message: 'Candidate already unlocked', 
                        already_paid: true 
                    });
                } else {
                    return res.status(409).json({ 
                        error: 'Previous unlock transaction pending',
                        recordId: record.id
                    });
                }
            }

            // 2. Get current balance using wallet service
            const balanceResult = await getWalletBalance(req.user.id);
            const currentBalance = balanceResult.balance;

            if (currentBalance < fee) {
                return res.status(402).json({ 
                    error: `Insufficient wallet balance. Required: ₹${fee}, Available: ₹${currentBalance}`,
                    required: fee,
                    available: currentBalance
                });
            }

            // 3. Use atomic transaction to deduct fee
            const debitResult = await atomicWalletTransaction(
                req.user.id,
                -fee,
                'debit',
                {
                    description: `PPH Fee - Unlock Candidate: ${candidate_id}`,
                    payment_method: 'wallet',
                    candidate_id,
                    job_id: sanitizedJobId,
                    type: 'pph_unlock'
                }
            );

            // 4. Record PPH (Unlock) - with transaction safety
            const pphRecord = {
                employer_id: req.user.id,
                candidate_id,
                job_id: sanitizedJobId,
                amount: fee,
                currency,
                status: 'completed',
                unlocked_at: new Date().toISOString(),
                transaction_reference: debitResult.transactionId
            };

            const { data: pphData, error: pphError } = await supabase
                .from('pay_per_hire_records')
                .insert([pphRecord])
                .select()
                .single();

            if (pphError) {
                // CRITICAL: Rollback the debit transaction
                console.error('CRITICAL: PPH record insertion failed, attempting refund', pphError);
                
                try {
                    await atomicWalletTransaction(
                        req.user.id,
                        fee,
                        'refund',
                        {
                            description: `Refund: PPH unlock failed for candidate ${candidate_id}`,
                            original_transaction_id: debitResult.transactionId,
                            reason: 'PPH record creation failed'
                        }
                    );
                } catch (refundError) {
                    console.error('CRITICAL: Refund also failed!', refundError);
                }

                return res.status(500).json({ 
                    error: 'Transaction failed - please contact support with transaction ID: ' + debitResult.transactionId 
                });
            }

            // 5. Log additional transaction metadata (already logged by atomicWalletTransaction)
            // Update transaction with PPH reference
            await supabase
                .from('wallet_transactions')
                .update({ 
                    metadata: { 
                        type: 'pph_unlock', 
                        candidate_id, 
                        job_id: sanitizedJobId,
                        pph_record_id: pphData.id
                    }
                })
                .eq('id', debitResult.transactionId);

            res.json({ 
                success: true, 
                message: 'Candidate unlocked successfully',
                transactionId: debitResult.transactionId,
                remainingBalance: debitResult.newBalance,
                pphRecordId: pphData.id
            });

        } catch (error) {
            console.error('Error processing PPH hire:', error);
            res.status(500).json({ 
                error: 'Transaction failed - please try again',
                code: error.code || 'TRANSACTION_ERROR'
            });
        }
    });

    /**
     * Check Unlock Status
     * GET /api/pph/status/:candidateId
     */
    app.get('/api/pph/status/:candidateId', authenticateUser, async (req, res) => {
        try {
            const { candidateId } = req.params;
            
            if (!candidateId || typeof candidateId !== 'string') {
                return res.status(400).json({ error: 'Valid candidate ID is required' });
            }
            
            const { data, error } = await supabase
                .from('pay_per_hire_records')
                .select('id, unlocked_at, status, amount, currency')
                .eq('employer_id', req.user.id)
                .eq('candidate_id', candidateId)
                .maybeSingle();

            res.json({
                success: true,
                unlocked: !!data && data?.status === 'completed',
                details: data
            });

        } catch (error) {
            console.error('Error checking PPH status:', error);
            res.status(500).json({ error: 'Status check failed' });
        }
    });

    // ==================== PAYMENT WEBHOOKS ====================
    /**
     * Razorpay Webhook Handler
     * POST /api/webhooks/razorpay
     * SECURITY: Signature verification and idempotent processing
     */
    app.post('/api/webhooks/razorpay', async (req, res) => {
        try {
            const razorpaySignature = req.headers['x-razorpay-signature'];
            const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

            if (!webhookSecret) {
                console.warn('⚠️  RAZORPAY_WEBHOOK_SECRET not configured - webhook ignored');
                return res.status(503).json({ error: 'Webhook not configured' });
            }

            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (razorpaySignature !== expectedSignature) {
                console.warn('🔴 SECURITY ALERT: Invalid Razorpay webhook signature');
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }

            const event = req.body;
            console.log(`📦 Razorpay webhook received: ${event.event}`);

            // Handle different webhook events
            switch (event.event) {
                case 'payment.captured': {
                    const payment = event.payload.payment.entity;
                    
                    // Check for idempotency
                    const { data: existingTx } = await supabase
                        .from('wallet_transactions')
                        .select('id')
                        .eq('transaction_id', payment.id)
                        .single();

                    if (existingTx) {
                        console.log(`ℹ️  Payment ${payment.id} already processed`);
                        break;
                    }

                    // Process captured payment
                    const metadata = payment.metadata || {};
                    const userId = metadata.user_id;

                    if (!userId) {
                        console.warn('⚠️  No user_id in payment metadata');
                        break;
                    }

                    const amountInRupees = payment.amount / 100; // Convert paise to rupees

                    await atomicWalletTransaction(
                        userId,
                        amountInRupees,
                        'credit',
                        {
                            description: `Razorpay webhook: ₹${amountInRupees}`,
                            payment_method: 'razorpay',
                            order_id: payment.order_id,
                            payment_id: payment.id,
                            status: 'completed',
                            webhook_verified: true
                        }
                    );

                    console.log(`✅ Payment captured: ₹${amountInRupees} for user ${userId}`);
                    break;
                }

                case 'payment.failed': {
                    const payment = event.payload.payment.entity;
                    const metadata = payment.metadata || {};
                    const userId = metadata.user_id;

                    if (userId) {
                        console.log(`❌ Payment failed for user ${userId}: ${payment.description}`);
                        // Update transaction status to failed
                        await supabase
                            .from('wallet_transactions')
                            .update({ 
                                status: 'failed',
                                error_message: payment.description || 'Payment failed'
                            })
                            .eq('reference_id', payment.order_id);
                    }
                    break;
                }

                default:
                    console.log(`ℹ️  Unhandled webhook event: ${event.event}`);
            }

            res.json({ success: true });

        } catch (error) {
            console.error('Error processing Razorpay webhook:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    });

    /**
     * Stripe Webhook Handler
     * POST /api/webhooks/stripe
     * SECURITY: Signature verification with Stripe SDK
     */
    app.post('/api/webhooks/stripe', async (req, res) => {
        try {
            const sig = req.headers['stripe-signature'];
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!webhookSecret || !stripe) {
                console.warn('⚠️  Stripe webhook not configured');
                return res.status(503).json({ error: 'Stripe webhook not configured' });
            }

            let event;

            // Verify Stripe signature
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            } catch (err) {
                console.error('🔴 Stripe webhook signature verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }

            console.log(`📦 Stripe webhook received: ${event.type}`);

            // Handle different webhook events
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    
                    // Check for idempotency
                    const { data: existingTx } = await supabase
                        .from('wallet_transactions')
                        .select('id')
                        .eq('transaction_id', session.id)
                        .single();

                    if (existingTx) {
                        console.log(`ℹ️  Stripe session ${session.id} already processed`);
                        break;
                    }

                    const userId = session.metadata?.user_id;
                    const amountInDollars = session.amount_total / 100;

                    if (!userId) {
                        console.warn('⚠️  No user_id in Stripe session metadata');
                        break;
                    }

                    await atomicWalletTransaction(
                        userId,
                        amountInDollars,
                        'credit',
                        {
                            description: `Stripe checkout: $${amountInDollars}`,
                            payment_method: 'stripe',
                            order_id: session.id,
                            payment_id: session.id,
                            status: 'completed',
                            webhook_verified: true
                        }
                    );

                    console.log(`✅ Stripe payment completed: $${amountInDollars} for user ${userId}`);
                    break;
                }

                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object;
                    console.log(`❌ Stripe payment failed: ${paymentIntent.last_payment_error?.message}`);
                    break;
                }

                default:
                    console.log(`ℹ️  Unhandled Stripe event: ${event.type}`);
            }

            res.json({ success: true });

        } catch (error) {
            console.error('Error processing Stripe webhook:', error);
            res.status(500).json({ error: 'Stripe webhook processing failed' });
        }
    });

}
