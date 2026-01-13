# Admin Panel API Endpoints Documentation

## Overview
This document lists all available API endpoints for the HireGo Admin Panel.

**Base URL:** `http://localhost:3000`

---

## Authentication
All admin endpoints require Bearer token authentication.
```
Authorization: Bearer <supabase_token>
```

---

## Dashboard Statistics

### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
```
Returns: totalUsers, totalCandidates, totalEmployers, activeJobs, totalApplications, totalInterviews, totalRevenue, creditsSold

---

## User Management

### Get All Users
```
GET /api/admin/users
Query Params: role, status, search, page, limit
```

### Get Single User
```
GET /api/admin/users/:id
```

### Update User Status
```
PATCH /api/admin/users/:id/status
Body: { status: 'Active' | 'Pending' | 'Blocked' | 'Suspended' }
```

### Update User Details
```
PUT /api/admin/users/:id
Body: { name, email, phone, location, role, status, wallet_balance, plan }
```

### Delete User
```
DELETE /api/admin/users/:id
```

### Reset User Password
```
POST /api/admin/users/:id/reset-password
```

### Adjust User Credits
```
POST /api/admin/users/:id/credits
Body: { amount, reason, type }
```

---

## API Key Management

### Get All API Keys
```
GET /api/admin/api-keys
```

### Save/Update API Keys
```
POST /api/admin/api-keys
Body: { provider, api_key, client_id, client_secret, access_token, metadata }
```

### Test API Key
```
POST /api/admin/test-api-key
Body: { provider, api_key }
```

---

## Email Configuration

### Get Email Config
```
GET /api/admin/email-config
```

### Save Email Config
```
POST /api/admin/email-config
Body: { provider, smtp_host, smtp_port, smtp_user, smtp_password, api_key, from_email, from_name, enabled }
```

### Test Email Config
```
POST /api/admin/email-config/test
Body: { testEmail }
```

---

## Credit System Control

### Get Credit Config
```
GET /api/admin/credit-config
```

### Save Credit Config
```
POST /api/admin/credit-config
Body: { packages, creditCosts }
```

---

## Job Pricing Control

### Get Job Pricing Config
```
GET /api/admin/job-pricing
```

### Save Job Pricing Config
```
POST /api/admin/job-pricing
Body: { basePricing, addons, discounts, customRules }
```

---

## Proctoring Configuration

### Get Proctoring Config
```
GET /api/admin/proctoring-config
```

### Save Proctoring Config
```
POST /api/admin/proctoring-config
Body: { enabled, settings, violationActions }
```

---

## Interview Management

### Get All Interviews
```
GET /api/admin/interviews
Query Params: status, jobId, date, page, limit
```

### Get Interview Details
```
GET /api/admin/interviews/:id
```

### Update Interview
```
PATCH /api/admin/interviews/:id
Body: { status, notes, score, decision }
```

---

## AI Control

### Get AI Config
```
GET /api/admin/ai-config
```

### Save AI Config
```
POST /api/admin/ai-config
Body: { primaryProvider, fallbackProvider, features, weights, thresholds }
```

### Trigger AI Model Retraining
```
POST /api/admin/ai-config/retrain
```

---

## YouTube Configuration

### Get YouTube Config
```
GET /api/admin/youtube-config
```

### Save YouTube Config
```
POST /api/admin/youtube-config
Body: { api_key, client_id, client_secret, access_token, channel_id, privacy_status, auto_upload }
```

---

## Payment Configuration

### Get Payment Config
```
GET /api/admin/payment-config
```

### Save Payment Config
```
POST /api/admin/payment-config
Body: { provider, currency, stripe_public_key, stripe_secret_key, stripe_webhook_secret, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, enabled }
```

---

## System Logs

### Get System Logs
```
GET /api/admin/system-logs
Query Params: level, source, startDate, endDate, page, limit
```

### Export Logs
```
GET /api/admin/system-logs/export
Query Params: format (json|csv), startDate, endDate
```

### Get Logs (Basic)
```
GET /api/logs
```

### Add Log
```
POST /api/logs
Body: { level, message, source }
```

---

## AI Analytics

### Get Performance Summary
```
GET /api/ai/analytics/summary
```

### Get Performance Metrics
```
GET /api/ai/analytics/metrics
Query Params: startDate, endDate
```

### Get Performance Report
```
GET /api/ai/analytics/report
```

### Update Daily Metrics
```
POST /api/ai/analytics/update
```

---

## System Health

### Health Check
```
GET /health
```

### Test Connection
```
GET /api/test
```

### AI System Status
```
GET /api/ai/status
```

---

## Database Setup

To set up the admin panel database tables, run the following SQL files in Supabase SQL Editor:
1. `db_schema.sql` - Base schema
2. `db_schema_extended.sql` - Extended AI tables
3. `db_schema_admin.sql` - Admin configuration tables

---

## Servers Running

- **Frontend:** http://localhost:5179
- **Backend:** http://localhost:3000
