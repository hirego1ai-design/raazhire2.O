# Payment Security Quick Reference

## 🔧 Configuration Required

### Add to `.env` (Production)
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
NODE_ENV=production
ALLOW_DEV_AUTH_BYPASS=false
```

---

## 🎯 Key Security Fixes Applied

### 1. Signature Verification (Line ~157-208)
```javascript
// HMAC-SHA256 signature verification with timing-safe comparison
const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

const signatureValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
);
```

**Why**: Prevents payment fraud by ensuring request originated from Razorpay.

---

### 2. Atomic Transactions (Line ~195-208)
```javascript
// Replace direct DB updates with atomic service
const transactionResult = await atomicWalletTransaction(
    req.user.id,
    amount,
    'credit',
    { description: '...', status: 'completed' }
);
```

**Why**: Prevents race conditions and double-spending.

---

### 3. Idempotency Check (Line ~175-186)
```javascript
// Check if already processed
const { data: existingTransaction } = await supabase
    .from('wallet_transactions')
    .select('id, status')
    .eq('reference_id', orderId)
    .eq('transaction_id', paymentId)
    .single();

if (existingTransaction?.status === 'completed') {
    return res.json({ success: true, message: 'Already verified', duplicate: true });
}
```

**Why**: Prevents duplicate processing of same payment.

---

### 4. Input Validation (Line ~260-275)
```javascript
// Strict type checking
if (!candidate_id || typeof candidate_id !== 'string') {
    return res.status(400).json({ error: 'Valid candidate_id is required' });
}

if (!fee || typeof fee !== 'number' || fee <= 0) {
    return res.status(400).json({ error: 'Valid positive fee amount is required' });
}
```

**Why**: Prevents injection attacks and data corruption.

---

### 5. Automatic Rollback (Line ~338-352)
```javascript
if (pphError) {
    // CRITICAL: Refund on failure
    await atomicWalletTransaction(
        req.user.id,
        fee,
        'refund',
        {
            original_transaction_id: debitResult.transactionId,
            reason: 'PPH record creation failed'
        }
    );
}
```

**Why**: Ensures money isn't lost on transaction failures.

---

### 6. Webhook Handlers (Line ~416-653)
```javascript
// Razorpay webhook with signature verification
app.post('/api/webhooks/razorpay', async (req, res) => {
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    // Process payment.captured, payment.failed events
});

// Stripe webhook with SDK verification
app.post('/api/webhooks/stripe', async (req, res) => {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    // Process checkout.session.completed, etc.
});
```

**Why**: Enables automated, secure payment gateway callbacks.

---

## 🧪 Test Scenarios

### Test Case 1: Valid Payment Verification
```bash
curl -X POST http://localhost:3000/api/wallet/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_test123",
    "orderId": "order_test123",
    "signature": "VALID_HMAC_SIGNATURE",
    "amount": 1000
  }'
```

**Expected**: `200 OK` with wallet credited

---

### Test Case 2: Invalid Signature (Fraud Attempt)
```bash
curl -X POST http://localhost:3000/api/wallet/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_fake",
    "orderId": "order_fake",
    "signature": "INVALID_SIGNATURE"
  }'
```

**Expected**: `403 Forbidden` with security alert logged

---

### Test Case 3: Duplicate Payment
Send same payment verification twice.

**Expected**: 
- First: `200 OK` ✅
- Second: `200 OK` with `duplicate: true` ⚠️

---

### Test Case 4: Insufficient Funds for PPH
```bash
curl -X POST http://localhost:3000/api/pph/hire \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidate_id": "cand_123",
    "fee": 50000,
    "job_id": "job_456"
  }'
```

**Expected**: `402 Payment Required` with balance info

---

### Test Case 5: Concurrent Requests (Race Condition)
Send 10 simultaneous requests to unlock same candidate.

**Expected**: Only 1 succeeds, others get `409 Conflict` or "already unlocked"

---

## 📊 Response Format Changes

### Enhanced Responses
```json
{
  "success": true,
  "message": "Candidate unlocked successfully",
  "transactionId": "txn_abc123",
  "remainingBalance": 45000,
  "pphRecordId": "pph_xyz789"
}
```

### Error Responses
```json
{
  "error": "Insufficient wallet balance. Required: ₹50000, Available: ₹30000",
  "required": 50000,
  "available": 30000,
  "code": "INSUFFICIENT_FUNDS"
}
```

---

## 🚨 Security Alerts to Monitor

Watch logs for these patterns:

```bash
# Invalid payment signature
🔴 SECURITY ALERT: Invalid payment signature from user

# Invalid webhook signature  
🔴 SECURITY ALERT: Invalid Razorpay webhook signature

# Critical transaction failure
CRITICAL: Failed to insert PPH record after deduction

# Refund failure
CRITICAL: Refund also failed!
```

---

## 🔍 Debugging Commands

### Check Transaction History
```sql
SELECT * FROM wallet_transactions 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verify PPH Records
```sql
SELECT * FROM pay_per_hire_records 
WHERE employer_id = 'EMPLOYER_ID' 
AND candidate_id = 'CANDIDATE_ID';
```

### Check Wallet Balance
```sql
SELECT balance FROM wallet 
WHERE user_id = 'USER_ID';
```

---

## 📝 Migration Checklist

- [ ] Add new environment variables to `.env`
- [ ] Update database schema if needed
- [ ] Test signature verification with test keys
- [ ] Configure webhooks in Razorpay/Stripe dashboards
- [ ] Set up log monitoring for security alerts
- [ ] Review and test rollback scenarios
- [ ] Update frontend to handle enhanced responses

---

## 🎯 Production Deployment

### Pre-deployment Checks
1. ✅ `NODE_ENV=production` set
2. ✅ `ALLOW_DEV_AUTH_BYPASS=false`
3. ✅ All payment secrets configured
4. ✅ HTTPS enabled (required for webhooks)
5. ✅ Database constraints in place

### Post-deployment Tests
1. ✅ Test payment flow end-to-end
2. ✅ Verify webhook delivery
3. ✅ Confirm atomic transactions work
4. ✅ Validate error handling
5. ✅ Check audit logs populated

---

## 📞 Emergency Procedures

### If Fraud Detected
1. Immediately review `/api/wallet/verify` logs
2. Check for invalid signature attempts
3. Freeze suspicious accounts
4. Contact payment gateway fraud team

### If Race Condition Exploited
1. Audit all transactions in time window
2. Compare wallet balances vs transaction sums
3. Manual reconciliation required
4. Consider temporary rate limiting

---

**Quick Reference Version**: 1.0  
**Last Updated**: March 19, 2026  
**Status**: ✅ Production Ready
