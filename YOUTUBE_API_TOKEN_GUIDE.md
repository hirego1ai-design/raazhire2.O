# 🎥 YouTube API - How to Get Access Token

## 📋 What You Have
- ✅ Client ID
- ✅ Client Secret
- ❓ Need: **Access Token** & **Refresh Token**

---

## 🔑 Method 1: Using OAuth 2.0 Playground (Easiest)

### Step 1: Go to OAuth 2.0 Playground
1. Open: https://developers.google.com/oauthplayground/
2. This is Google's official tool for testing OAuth flows

### Step 2: Configure Settings
1. Click the **⚙️ Settings icon** (top right)
2. Check ✅ **"Use your own OAuth credentials"**
3. Enter your:
   - **OAuth Client ID**: `your_client_id_here`
   - **OAuth Client secret**: `your_client_secret_here`
4. Click **Close**

### Step 3: Select YouTube API Scope
1. In the left panel, find **"YouTube Data API v3"**
2. Expand it and select:
   - ✅ `https://www.googleapis.com/auth/youtube`
   - ✅ `https://www.googleapis.com/auth/youtube.upload` (if you need upload)
3. Click **"Authorize APIs"** button

### Step 4: Authorize Access
1. You'll be redirected to Google Sign-In
2. **Sign in** with your Google account
3. Click **"Allow"** to grant permissions
4. You'll be redirected back to the playground

### Step 5: Get Your Tokens
1. Click **"Exchange authorization code for tokens"**
2. You'll see:
   ```json
   {
     "access_token": "ya29.a0AfH6SMBx...",
     "refresh_token": "1//0gXXXXXXXXXXXX...",
     "expires_in": 3599,
     "token_type": "Bearer"
   }
   ```
3. **Copy both tokens** - you'll need them!

---

## 🔑 Method 2: Using Command Line (curl)

### Step 1: Get Authorization Code

Open this URL in your browser (replace `YOUR_CLIENT_ID`):

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/youtube
```

**Example:**
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=123456789-abcdefg.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/youtube
```

1. Sign in with your Google account
2. Click "Allow"
3. You'll see an **authorization code** on the screen
4. **Copy this code**

### Step 2: Exchange Code for Tokens

Run this curl command (replace the values):

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=YOUR_AUTHORIZATION_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  -d "grant_type=authorization_code"
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "refresh_token": "1//0gXXXXXXXXXXXX...",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/youtube",
  "token_type": "Bearer"
}
```

---

## 🔑 Method 3: Using Postman

### Step 1: Create New Request
1. Open Postman
2. Create a new **GET** request

### Step 2: Configure Authorization
1. Go to **Authorization** tab
2. Type: Select **OAuth 2.0**
3. Click **"Get New Access Token"**

### Step 3: Fill OAuth Configuration
```
Token Name: YouTube API Token
Grant Type: Authorization Code
Callback URL: https://oauth.pstmn.io/v1/callback
Auth URL: https://accounts.google.com/o/oauth2/v2/auth
Access Token URL: https://oauth2.googleapis.com/token
Client ID: YOUR_CLIENT_ID
Client Secret: YOUR_CLIENT_SECRET
Scope: https://www.googleapis.com/auth/youtube
```

### Step 4: Get Token
1. Click **"Request Token"**
2. Sign in and authorize
3. Postman will show your **Access Token** and **Refresh Token**

---

## 🔄 Refreshing Access Tokens

Access tokens expire after **1 hour**. Use the refresh token to get a new one:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "grant_type=refresh_token"
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/youtube",
  "token_type": "Bearer"
}
```

---

## 📝 Important Notes

### Token Types
- **Access Token**: 
  - Used for API requests
  - Expires in 1 hour
  - Format: `ya29.a0AfH6SMBx...`

- **Refresh Token**: 
  - Used to get new access tokens
  - Never expires (unless revoked)
  - Format: `1//0gXXXXXXXXXXXX...`
  - **SAVE THIS SECURELY!**

### Security Best Practices
- ⚠️ **Never share** your tokens publicly
- ⚠️ **Never commit** tokens to Git
- ✅ Store tokens in environment variables
- ✅ Use refresh tokens to get new access tokens
- ✅ Implement token refresh logic in your app

---

## 🔧 For HireGo Admin Panel

Once you have your tokens, enter them in:
```
http://localhost:5179/admin/video-storage
```

### Required Fields:
1. **Client ID**: Your OAuth Client ID
2. **Client Secret**: Your OAuth Client Secret
3. **Refresh Token**: The refresh token from OAuth flow
4. **Channel ID**: Your YouTube channel ID

### How to Find Channel ID:
1. Go to: https://www.youtube.com/account_advanced
2. Copy your **Channel ID**

---

## 🚀 Quick Start (Recommended)

### Use OAuth 2.0 Playground:
1. Go to: https://developers.google.com/oauthplayground/
2. Click ⚙️ → Check "Use your own OAuth credentials"
3. Enter Client ID & Secret
4. Select scope: `https://www.googleapis.com/auth/youtube`
5. Authorize → Exchange code for tokens
6. Copy **Refresh Token** (starts with `1//`)
7. Paste in HireGo admin panel

---

## ❓ Troubleshooting

### "redirect_uri_mismatch" Error
- Add `https://developers.google.com/oauthplayground` to authorized redirect URIs in Google Cloud Console

### "invalid_client" Error
- Double-check your Client ID and Client Secret
- Make sure they're from the same OAuth 2.0 Client

### "access_denied" Error
- Make sure you're signing in with the correct Google account
- Check if the YouTube API is enabled in your project

### Token Expired
- Use the refresh token to get a new access token
- Implement automatic token refresh in your backend

---

## 📚 Additional Resources

- **Google OAuth 2.0 Docs**: https://developers.google.com/identity/protocols/oauth2
- **YouTube API Docs**: https://developers.google.com/youtube/v3
- **OAuth Playground**: https://developers.google.com/oauthplayground/
- **Google Cloud Console**: https://console.cloud.google.com/

---

## ✅ Checklist

- [ ] Have Client ID
- [ ] Have Client Secret
- [ ] Enabled YouTube Data API v3 in Google Cloud Console
- [ ] Added authorized redirect URI
- [ ] Got Authorization Code
- [ ] Exchanged code for tokens
- [ ] Saved Refresh Token securely
- [ ] Tested token with API request
- [ ] Configured in HireGo admin panel

---

**Last Updated**: 2026-01-18  
**Status**: Ready to use
