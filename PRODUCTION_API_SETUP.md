# 🔒 Production-Level API Key Management System

## Overview
This system provides **enterprise-grade security** for storing and managing API keys in HireGo AI. All sensitive credentials are encrypted using **AES-256-CBC** and stored in Supabase database instead of browser localStorage.

---

## 🏗️ Architecture

### Components:
1. **Backend API** (`server/index.js`) - Handles encryption/decryption and database operations
2. **Supabase Database** - Stores encrypted credentials
3. **Frontend Admin Panel** - UI for managing keys
4. **Encryption Layer** - AES-256-CBC encryption for all sensitive data

### Security Features:
- ✅ **AES-256-CBC Encryption** - Industry-standard encryption
- ✅ **Encrypted at Rest** - All keys encrypted in database
- ✅ **Encrypted in Transit** - HTTPS/TLS for API calls
- ✅ **Row-Level Security** - Supabase RLS policies
- ✅ **Admin-Only Access** - Only authorized admins can view/edit keys
- ✅ **No Client-Side Storage** - Keys never stored in browser
- ✅ **Audit Trail** - Timestamps for all changes

---

## 📦 Setup Instructions

### Step 1: Database Setup

1. **Run the Supabase Migration:**
   ```bash
   # Navigate to Supabase project
   cd supabase
   
   # Apply migration
   supabase db push
   ```

   Or manually execute `supabase/migrations/001_api_keys.sql` in your Supabase SQL Editor.

2. **Verify Tables Created:**
   - `api_keys` - Stores AI provider API keys
   - `youtube_config` - Stores YouTube API configuration

### Step 2: Backend Configuration

1. **Copy Environment Template:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Generate Encryption Key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update `.env` File:**
   ```env
   PORT=3000
   NODE_ENV=development
   
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   
   # CRITICAL: Use the generated key from step 2
   ENCRYPTION_KEY=your-generated-encryption-key-here
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

5. **Start Backend Server:**
   ```bash
   npm start
   ```

   Server should start on `http://localhost:3000`

### Step 3: Frontend Configuration

The frontend is already configured to use the backend API. No additional setup needed!

---

## 🚀 Usage

### For Admins:

#### 1. Configure AI API Keys
1. Navigate to **Admin Panel** > **API Configuration** (`/admin/api-config`)
2. Enter API keys for:
   - Google Gemini Pro
   - OpenAI GPT-4
   - Anthropic Claude 3
   - DeepSeek R1
3. Click **"Test Connection"** to verify each key
4. Click **"Save Credentials"** to store encrypted keys in database

#### 2. Configure YouTube Storage
1. Navigate to **Admin Panel** > **Video Storage** (`/admin/video-storage`)
2. Enter YouTube API credentials:
   - API Key
   - Client ID
   - Client Secret
   - Access Token (for testing)
3. Click **"Verify Token"** to test connection
4. Click **"Save Changes"** to store encrypted credentials

---

## 🔐 Security Best Practices

### For Development:
1. ✅ Use `.env` file for local development
2. ✅ Never commit `.env` to Git
3. ✅ Use different encryption keys for dev/staging/production
4. ✅ Test encryption/decryption locally

### For Production:
1. ✅ Set `NODE_ENV=production`
2. ✅ Use environment variables from hosting provider
3. ✅ Generate a strong, unique `ENCRYPTION_KEY` (32+ characters)
4. ✅ Enable HTTPS/TLS on backend
5. ✅ Restrict CORS to your frontend domain only
6. ✅ Use Supabase RLS policies (already configured)
7. ✅ Regularly rotate API keys
8. ✅ Monitor access logs

---

## 📡 API Endpoints

### Admin Endpoints (Protected)

#### Get All API Keys
```http
GET /api/admin/api-keys
```
Returns all API keys (decrypted) for admin panel.

#### Save/Update API Key
```http
POST /api/admin/api-keys
Content-Type: application/json

{
  "provider": "gemini",
  "api_key": "your-api-key-here"
}
```

#### Test API Connection
```http
POST /api/admin/test-api-key
Content-Type: application/json

{
  "provider": "gemini",
  "api_key": "your-api-key-here"
}
```

#### Get YouTube Config
```http
GET /api/admin/youtube-config
```

#### Save YouTube Config
```http
POST /api/admin/youtube-config
Content-Type: application/json

{
  "api_key": "...",
  "client_id": "...",
  "client_secret": "...",
  "access_token": "...",
  "channel_id": "...",
  "privacy_status": "private",
  "auto_upload": true
}
```

### Internal Endpoints (For Backend Use)

#### Get API Key for Provider
```http
GET /api/internal/api-key/:provider
```
Used internally by backend services to retrieve decrypted keys.

---

## 🛠️ Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Render/Railway/Heroku (Backend)
1. Connect GitHub repository
2. Set environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ENCRYPTION_KEY=... (CRITICAL!)
   ```
3. Deploy!

### Environment Variables Checklist:
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `ENCRYPTION_KEY` (Generate new for production!)
- [ ] `NODE_ENV=production`
- [ ] `PORT` (if required by host)

---

## 🧪 Testing

### Test Backend Encryption:
```bash
cd server
node -e "
const crypto = require('crypto');
const key = 'test-key-32-chars-minimum-here';
const text = 'test-api-key';

// Encrypt
const iv = crypto.randomBytes(16);
const keyBuffer = crypto.scryptSync(key, 'salt', 32);
const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
let encrypted = cipher.update(text, 'utf8', 'hex');
encrypted += cipher.final('hex');
const result = iv.toString('hex') + ':' + encrypted;
console.log('Encrypted:', result);

// Decrypt
const parts = result.split(':');
const ivDec = Buffer.from(parts.shift(), 'hex');
const encryptedText = parts.join(':');
const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivDec);
let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
decrypted += decipher.final('utf8');
console.log('Decrypted:', decrypted);
"
```

### Test API Endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Test API key save (requires Supabase)
curl -X POST http://localhost:3000/api/admin/api-keys \
  -H "Content-Type: application/json" \
  -d '{"provider":"gemini","api_key":"test-key"}'
```

---

## 📊 Database Schema

### `api_keys` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| provider | VARCHAR(50) | Provider name (gemini, gpt4, etc.) |
| api_key | TEXT | Encrypted API key |
| client_id | TEXT | Encrypted OAuth client ID |
| client_secret | TEXT | Encrypted OAuth client secret |
| access_token | TEXT | Encrypted access token |
| metadata | JSONB | Additional provider info |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `youtube_config` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| api_key | TEXT | Encrypted YouTube API key |
| client_id | TEXT | Encrypted OAuth client ID |
| client_secret | TEXT | Encrypted OAuth client secret |
| access_token | TEXT | Encrypted access token |
| channel_id | VARCHAR(255) | YouTube channel ID |
| privacy_status | VARCHAR(20) | Default privacy (public/private/unlisted) |
| auto_upload | BOOLEAN | Auto-upload enabled |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

## 🆘 Troubleshooting

### Issue: "Database not configured"
**Solution:** Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`

### Issue: "Encryption failed"
**Solution:** Ensure `ENCRYPTION_KEY` is at least 32 characters

### Issue: "API key not found"
**Solution:** Save the API key via Admin Panel first

### Issue: "Connection test failed"
**Solution:** Verify the API key is correct and has proper permissions

### Issue: "CORS error"
**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`

---

## 📝 Migration from localStorage

If you previously used localStorage, the data will be ignored. You need to:
1. Re-enter all API keys via Admin Panel
2. They will be automatically saved to the secure backend
3. Old localStorage data can be cleared (optional)

---

## ✅ Checklist for Production

- [ ] Database tables created (`api_keys`, `youtube_config`)
- [ ] Backend `.env` configured with strong `ENCRYPTION_KEY`
- [ ] Backend deployed and accessible
- [ ] Frontend `VITE_API_URL` points to backend
- [ ] All API keys entered and tested via Admin Panel
- [ ] HTTPS enabled on backend
- [ ] CORS configured correctly
- [ ] Supabase RLS policies active
- [ ] Admin access restricted

---

## 🎉 Benefits

✅ **No more localStorage** - Keys never exposed in browser  
✅ **Encrypted storage** - AES-256-CBC encryption  
✅ **Centralized management** - One place for all keys  
✅ **Easy rotation** - Update keys without code changes  
✅ **Audit trail** - Track when keys were updated  
✅ **Team-friendly** - Multiple admins can manage keys  
✅ **Production-ready** - Enterprise-grade security  

---

**Status:** ✅ Production-Ready
**Last Updated:** 2025-11-28
