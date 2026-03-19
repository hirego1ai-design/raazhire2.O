# Payment Security Deployment Checklist ✅

## 🎯 Pre-Deployment Verification

### 1. Environment Configuration
- [ ] **Required Variables Added to `.env`**
  ```env
  # Razorpay (Production/Test)
  RAZORPAY_KEY_ID=rzp_live_...
  RAZORPAY_KEY_SECRET=your_secret_key
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  
  # Stripe (Production/Test)
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # Security Settings
  NODE_ENV=production
  ALLOW_DEV_AUTH_BYPASS=false
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ENCRYPTION_KEY=your_64_char_key
  ```

- [ ] **Test Mode Variables** (for staging)
  ```env
  RAZORPAY_KEY_ID=rzp_test_...
  RAZORPAY_KEY_SECRET=test_secret
  STRIPE_SECRET_KEY=sk_test_...
  ```

---

### 2. Database Schema Verification
Run these SQL queries to verify schema:

```sql
-- Check wallet_transactions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'wallet_transactions';

-- Check pay_per_hire_records table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'pay_per_hire_records';

-- Verify CHECK constraints exist
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE contype = 'c' AND conrelid = 'wallet'::regclass;

-- Verify RLS policies are active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('wallet', 'wallet_transactions', 'pay_per_hire_records');
```

**Expected**: All tables exist with proper constraints and RLS policies

---

### 3. Code Review Checklist
- [ ] `payment_routes.js` includes crypto import (line 5)
- [ ] Signature verification implemented (lines 157-208)
- [ ] Atomic transactions used throughout
- [ ] Idempotency checks present
- [ ] Input validation on all endpoints
- [ ] Rollback mechanism implemented
- [ ] Webhook handlers added (lines 416-653)
- [ ] Error handling consistent (no internal exposure)

**Quick Test**: 
```bash
cd "Fnal-hiring-by-Google-\server"
node -c routes/payment_routes.js
# Should output: syntax OK
```

---

## 🧪 Testing Phase

### Unit Tests (Local)
```bash
# Start server in test mode
NODE_ENV=test node server/index.js

# Run these curl commands:
```

#### Test 1: Missing Signature (Should Fail)
```bash
curl -X POST http://localhost:3000/api/wallet/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay_123", "orderId": "order_123"}'
```
**Expected**: `400 Bad Request` - Missing required parameters

---

#### Test 2: Invalid Signature (Should Block)
```bash
curl -X POST http://localhost:3000/api/wallet/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_fake",
    "orderId": "order_fake",
    "signature": "invalid_signature"
  }'
```
**Expected**: `403 Forbidden` - Invalid signature

---

#### Test 3: Valid PPH Hire (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/pph/hire \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "test_candidate",
    "fee": 5000,
    "job_id": "test_job"
  }'
```
**Expected**: Either `200 OK` (success) or `402` (insufficient funds)

---

#### Test 4: Invalid Fee Type (Should Reject)
```bash
curl -X POST http://localhost:3000/api/pph/hire \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "test",
    "fee": "not_a_number",
    "job_id": "test"
  }'
```
**Expected**: `400 Bad Request` - Invalid fee type

---

### Integration Tests (Staging)

#### Razorpay Webhook Test
1. Use Razorpay CLI to send test webhook:
```bash
razorpay mock webhook \
  --event payment.captured \
  --url https://your-staging.com/api/webhooks/razorpay
```

**Expected**: `200 OK` with success message

---

#### Stripe Webhook Test
1. Use Stripe CLI to forward events:
```bash
stripe listen --forward-to https://your-staging.com/api/webhooks/stripe
stripe trigger checkout.session.completed
```

**Expected**: `200 OK` with success message

---

### Load Testing (Optional but Recommended)
```bash
# Install Apache Bench
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p pph_payload.json \
  http://localhost:3000/api/pph/hire
```

**Expected**: No race conditions, all transactions atomic

---

## 🔒 Security Audit

### Manual Security Checks
- [ ] Attempt signature forgery (should fail)
- [ ] Try replay attack with same payment ID (should be blocked)
- [ ] Send 10 concurrent PPH requests (only 1 should succeed)
- [ ] Try SQL injection in candidate_id (should be sanitized)
- [ ] Attempt to access another user's transactions (should be blocked by auth)

---

### Automated Security Scanning
```bash
# If you have OWASP ZAP installed
zap-baseline.py -t http://localhost:3000/api/wallet/verify
```

---

## 📊 Monitoring Setup

### Log Aggregation Configuration
Add to your logging service (e.g., Datadog, Papertrail):

```yaml
# Patterns to alert on (CRITICAL)
- "🔴 SECURITY ALERT: Invalid payment signature"
- "🔴 SECURITY ALERT: Invalid.*webhook signature"
- "CRITICAL: Failed to insert PPH record"
- "CRITICAL: Refund also failed"

# Patterns to monitor (WARNING)
- "Error verifying payment:"
- "Error processing PPH hire:"
- "Insufficient wallet balance"
```

---

### Metrics Dashboard
Create dashboard with these metrics:

1. **Payment Verification Rate**
   - Success rate > 95%
   - Alert if < 90%

2. **Duplicate Detection Count**
   - Track number of duplicate attempts
   - Spike indicates potential attack

3. **Rollback Frequency**
   - Monitor failed transaction rollbacks
   - High rate indicates system issues

4. **Webhook Processing Time**
   - Average latency < 200ms
   - Alert if > 500ms

---

## 🚀 Deployment Steps

### Step 1: Staging Deployment
```bash
# Deploy to staging environment first
git push staging main

# Wait for deployment to complete
# Verify health check endpoint
curl https://staging.your-domain.com/health
```

**Verification**:
- [ ] Server starts without errors
- [ ] All endpoints respond
- [ ] Logs show no critical errors
- [ ] Webhook URLs accessible

---

### Step 2: Staging Testing (24-48 hours)
- [ ] Process 10 real payments through Razorpay
- [ ] Process 5 real payments through Stripe
- [ ] Trigger webhooks successfully
- [ ] Verify atomic transactions work
- [ ] Test rollback scenarios
- [ ] Monitor logs for issues

---

### Step 3: Production Deployment
```bash
# Deploy to production
git push production main

# Monitor deployment logs
heroku logs --tail # or your platform's log command
```

**Critical Checks**:
- [ ] `NODE_ENV=production` confirmed
- [ ] `ALLOW_DEV_AUTH_BYPASS=false` confirmed
- [ ] All secrets loaded correctly
- [ ] HTTPS enforced
- [ ] Webhook endpoints publicly accessible

---

### Step 4: Production Verification (First Hour)
- [ ] Process test payment (₹1) via Razorpay
- [ ] Process test payment ($1) via Stripe
- [ ] Verify webhook delivery
- [ ] Check atomic transaction logs
- [ ] Monitor error rates
- [ ] Verify audit trail populated

---

### Step 5: Production Monitoring (First 48 Hours)
- [ ] Zero security breaches detected
- [ ] Payment success rate > 95%
- [ ] Webhook delivery rate > 98%
- [ ] No unhandled errors
- [ ] Response times acceptable (< 500ms)

---

## 📝 Documentation Updates

### Update These Resources:
- [ ] API documentation with new endpoints
- [ ] Frontend integration guide
- [ ] Runbook for on-call team
- [ ] Incident response procedures
- [ ] Team training materials

---

## 🎯 Success Criteria

### Must Have (All Required)
- ✅ Zero critical security vulnerabilities
- ✅ All tests passing (unit + integration)
- ✅ Webhook delivery working
- ✅ Atomic transactions verified
- ✅ Rollback mechanism tested
- ✅ Monitoring alerts configured
- ✅ Documentation complete

### Nice to Have
- ⏳ Performance benchmarks met
- ⏳ Load testing completed
- ⏳ Automated regression tests
- ⏳ Blue-green deployment ready

---

## 🆘 Rollback Plan

### If Issues Detected:
1. **Immediate Action** (within 5 minutes)
   ```bash
   git revert <deployment-commit>
   git push production main
   ```

2. **Communication** (within 10 minutes)
   - Notify stakeholders
   - Update status page
   - Contact payment gateways if needed

3. **Post-Mortem** (within 24 hours)
   - Document root cause
   - Fix identified issues
   - Re-test thoroughly
   - Reschedule deployment

---

## 📞 Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Tech Lead | [Name] | [Phone/Email] | 24/7 |
| Security Team | [Name] | [Phone/Email] | Business Hours |
| DevOps | [Name] | [Phone/Email] | 24/7 |
| Razorpay Support | - | support@razorpay.com | 24/7 |
| Stripe Support | - | support@stripe.com | 24/7 |

---

## ✅ Final Sign-off

### Required Approvals
- [ ] **Development Lead**: Code quality approved
- [ ] **Security Team**: Security audit passed
- [ ] **QA Lead**: Testing completed
- [ ] **DevOps Lead**: Infrastructure ready
- [ ] **Product Owner**: Business requirements met

---

### Deployment Authorization
**Authorized By**: ___________________  
**Date**: ___________________  
**Time**: ___________________  

**Deployment Window**: [Start Time] to [End Time]  
**Risk Level**: 🟢 LOW (all issues resolved)

---

## 🎉 Post-Deployment

### Immediate Actions (Day 1)
- [ ] Monitor dashboards continuously
- [ ] Respond to any alerts immediately
- [ ] Document any issues encountered
- [ ] Celebrate successful deployment! 🎊

### Follow-up (Week 1)
- [ ] Review metrics and logs daily
- [ ] Optimize based on performance data
- [ ] Update documentation with learnings
- [ ] Plan Phase 2 enhancements

---

**Checklist Version**: 1.0  
**Last Updated**: March 19, 2026  
**Status**: ✅ Ready for Deployment
