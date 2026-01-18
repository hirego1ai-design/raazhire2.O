# 🎬 Complete YouTube API Setup Guide for HireGo

## 📋 Overview
This guide will walk you through setting up YouTube API access for video storage in HireGo, from creating a Google Cloud project to configuring it in the admin panel.

---

## 🚀 Part 1: Create Google Cloud Project

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create New Project
1. Click **"Select a project"** dropdown (top left)
2. Click **"NEW PROJECT"**
3. Enter project details:
   - **Project name**: `HireGo-YouTube-API` (or any name)
   - **Organization**: Leave as default
4. Click **"CREATE"**
5. Wait for project creation (takes ~30 seconds)

### Step 3: Select Your Project
1. Click the project dropdown again
2. Select your newly created project

---

## 🔧 Part 2: Enable YouTube Data API

### Step 1: Go to API Library
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Or go directly to: https://console.cloud.google.com/apis/library

### Step 2: Search for YouTube API
1. In the search bar, type: `YouTube Data API v3`
2. Click on **"YouTube Data API v3"**

### Step 3: Enable the API
1. Click the **"ENABLE"** button
2. Wait for it to enable (~10 seconds)
3. You'll see "API enabled" confirmation

---

## 🔑 Part 3: Create OAuth 2.0 Credentials

### Step 1: Go to Credentials Page
1. Click **"APIs & Services"** → **"Credentials"**
2. Or go to: https://console.cloud.google.com/apis/credentials

### Step 2: Configure OAuth Consent Screen (First Time Only)
1. Click **"CONFIGURE CONSENT SCREEN"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"CREATE"**

4. Fill in the form:
   - **App name**: `HireGo`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Leave other fields as default
5. Click **"SAVE AND CONTINUE"**

6. **Scopes** page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Search for: `YouTube Data API v3`
   - Check: ✅ `.../auth/youtube`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

7. **Test users** page:
   - Click **"+ ADD USERS"**
   - Enter your Google email
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

8. Click **"BACK TO DASHBOARD"**

### Step 3: Create OAuth Client ID
1. Go back to **"Credentials"** page
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. Configure:
   - **Application type**: Select **"Web application"**
   - **Name**: `HireGo YouTube Client`
   
4. **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Add these URIs (one at a time):
     ```
     https://developers.google.com/oauthplayground
     http://localhost:3000/auth/callback
     http://localhost:5179/auth/callback
     ```
   - Click **"ADD URI"** for each

5. Click **"CREATE"**

### Step 4: Save Your Credentials
You'll see a popup with:
- ✅ **Your Client ID**: `123456789-abc...apps.googleusercontent.com`
- ✅ **Your Client Secret**: `GOCSPX-abc123...`

**IMPORTANT**: 
- Click **"DOWNLOAD JSON"** (optional, for backup)
- **Copy both values** - you'll need them!
- Click **"OK"**

---

## 🎫 Part 4: Get Access & Refresh Tokens

### Method A: Using OAuth 2.0 Playground (Recommended)

#### Step 1: Open OAuth Playground
Go to: https://developers.google.com/oauthplayground/

#### Step 2: Configure Settings
1. Click the **⚙️ gear icon** (top right)
2. Check ✅ **"Use your own OAuth credentials"**
3. Enter:
   - **OAuth Client ID**: Paste your Client ID
   - **OAuth Client secret**: Paste your Client Secret
4. Click **"Close"**

#### Step 3: Select Scopes
1. In the left panel, scroll to **"YouTube Data API v3"**
2. Expand it
3. Check ✅ `https://www.googleapis.com/auth/youtube`
4. Check ✅ `https://www.googleapis.com/auth/youtube.upload` (optional)

#### Step 4: Authorize
1. Click **"Authorize APIs"** button (bottom left)
2. You'll be redirected to Google Sign-In
3. **Select your Google account**
4. You may see a warning "Google hasn't verified this app"
   - Click **"Advanced"**
   - Click **"Go to HireGo (unsafe)"** (it's safe, it's your app!)
5. Review permissions
6. Click **"Allow"**

#### Step 5: Get Tokens
1. You'll be redirected back to OAuth Playground
2. You'll see an **Authorization Code** in the box
3. Click **"Exchange authorization code for tokens"**
4. You'll see:
   ```json
   {
     "access_token": "ya29.a0AfH6SMBx...",
     "refresh_token": "1//0gXXXXXXXXXXXX...",
     "expires_in": 3599,
     "token_type": "Bearer"
   }
   ```

5. **COPY THE REFRESH TOKEN** ⭐
   - It starts with `1//`
   - This is what you'll use in HireGo!

---

## 📺 Part 5: Get Your YouTube Channel ID

### Step 1: Go to YouTube Settings
1. Go to: https://www.youtube.com/account_advanced
2. Or:
   - Go to YouTube.com
   - Click your profile picture (top right)
   - Click **"Settings"**
   - Click **"Advanced settings"**

### Step 2: Copy Channel ID
1. You'll see **"Channel ID"**
2. It looks like: `UCxxxxxxxxxxxxxxxxxx`
3. **Copy this ID**

---

## ⚙️ Part 6: Configure in HireGo Admin Panel

### Step 1: Open Admin Panel
1. Make sure both servers are running:
   ```bash
   npm run dev
   npm run start
   ```

2. Go to: http://localhost:5179/admin/video-storage

### Step 2: Enter YouTube Configuration
Fill in the form:

1. **Client ID**: 
   ```
   123456789-abc...apps.googleusercontent.com
   ```

2. **Client Secret**:
   ```
   GOCSPX-abc123...
   ```

3. **Refresh Token**:
   ```
   1//0gXXXXXXXXXXXX...
   ```

4. **Channel ID**:
   ```
   UCxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Save Configuration
1. Click **"Save Configuration"** button
2. You should see a success message
3. The configuration is now saved!

---

## ✅ Part 7: Test Your Setup

### Test 1: Check Configuration Saved
1. Refresh the page: http://localhost:5179/admin/video-storage
2. Your configuration should still be there
3. Sensitive fields will show as dots (•••)

### Test 2: Upload a Test Video (Optional)
1. Go to candidate video resume page
2. Try uploading a test video
3. It should upload to YouTube

---

## 🔒 Security Best Practices

### ✅ DO:
- Store credentials in environment variables for production
- Use refresh tokens, not access tokens
- Keep your Client Secret private
- Add only necessary redirect URIs
- Regularly rotate credentials

### ❌ DON'T:
- Commit credentials to Git
- Share your Client Secret publicly
- Use access tokens directly (they expire in 1 hour)
- Add wildcard redirect URIs

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: 
1. Go to Google Cloud Console → Credentials
2. Click your OAuth Client ID
3. Add the exact redirect URI shown in the error
4. Common URIs to add:
   - `https://developers.google.com/oauthplayground`
   - `http://localhost:3000/auth/callback`

### Error: "invalid_client"
**Solution**:
- Double-check your Client ID and Client Secret
- Make sure you copied them completely
- No extra spaces or characters

### Error: "access_denied"
**Solution**:
- Make sure you're using the correct Google account
- Check if you added yourself as a test user
- Try authorizing again

### Error: "This app isn't verified"
**Solution**:
- Click **"Advanced"**
- Click **"Go to [Your App Name] (unsafe)"**
- This is normal for apps in testing mode

### Tokens Not Working
**Solution**:
1. Make sure you're using the **Refresh Token**, not Access Token
2. Refresh tokens start with `1//`
3. Try generating new tokens from OAuth Playground

---

## 📝 Quick Reference

### URLs You'll Need:
- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth Playground**: https://developers.google.com/oauthplayground/
- **YouTube Channel ID**: https://www.youtube.com/account_advanced
- **HireGo Admin**: http://localhost:5179/admin/video-storage

### What Goes Where:
| Field | Starts With | Example | Where to Use |
|-------|-------------|---------|--------------|
| Client ID | Numbers | `123456789-abc.apps.googleusercontent.com` | Admin Panel |
| Client Secret | `GOCSPX-` | `GOCSPX-abc123xyz` | Admin Panel |
| Refresh Token | `1//` | `1//0gXXXXXXXXXXXX` | Admin Panel ⭐ |
| Access Token | `ya29.` | `ya29.a0AfH6SMBx...` | Don't use directly |
| Channel ID | `UC` | `UCxxxxxxxxxxxxxxxxxx` | Admin Panel |

---

## 🎯 Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled YouTube Data API v3
- [ ] Configured OAuth Consent Screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized redirect URIs
- [ ] Got Client ID and Client Secret
- [ ] Used OAuth Playground to get Refresh Token
- [ ] Got YouTube Channel ID
- [ ] Entered all credentials in HireGo admin panel
- [ ] Saved configuration
- [ ] Tested setup

---

## 📞 Need Help?

If you're stuck on any step:
1. Check the Troubleshooting section above
2. Make sure you followed each step exactly
3. Double-check all copied values (no extra spaces)
4. Try the process again from the OAuth Playground step

---

## 🎉 Success!

Once you've completed all steps, your HireGo platform can now:
- ✅ Upload videos to YouTube
- ✅ Store video resumes
- ✅ Manage video content
- ✅ Automatically refresh access tokens

**Your YouTube API integration is complete!** 🚀

---

**Last Updated**: 2026-01-18  
**Difficulty**: Beginner-Friendly  
**Time Required**: 15-20 minutes
