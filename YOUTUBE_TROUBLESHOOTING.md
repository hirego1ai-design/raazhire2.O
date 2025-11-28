# 🔧 YouTube Connection Troubleshooting Guide

## Issue: "Verify Token" Button Not Working

### ✅ **FIXED!** Updates Made:

1. **Added Show/Hide Button** for Access Token field
   - Click the 👁️ icon to see your token
   - Verify the token is actually entered

2. **Better Error Messages** with emojis and details
   - ❌ Clear error descriptions
   - Status codes shown
   - Helpful hints for common issues

3. **Console Logging** for debugging
   - Open browser DevTools (F12)
   - Check Console tab for detailed logs

---

## 🎯 How to Test YouTube Connection:

### Step 1: Get Access Token from OAuth Playground

1. Go to: https://developers.google.com/oauthplayground
2. In **Step 1** (Select & authorize APIs):
   - Find "YouTube Data API v3"
   - Check: `https://www.googleapis.com/auth/youtube.readonly`
   - Click **"Authorize APIs"**
3. Sign in with your Google account
4. In **Step 2** (Exchange authorization code for tokens):
   - Click **"Exchange authorization code for tokens"**
5. **Copy the Access Token** from the response

### Step 2: Enter Token in Admin Panel

1. Open: http://localhost:5173/admin/video-storage
2. Scroll to **"Access Token (Required for Testing)"** field
3. **Paste** the token you copied
4. Click the **👁️ icon** to verify the token is there
5. Click **"Verify Token"** button

### Step 3: Check Results

**If Successful:**
- ✅ Alert: "Successfully connected to channel: [Your Channel Name]"
- Connection Status changes to "Connected"
- Channel ID appears

**If Failed:**
- ❌ Alert with error message
- Check browser console (F12) for details

---

## 🐛 Common Issues & Solutions:

### Issue 1: "Access Token field appears to be empty"
**Solution:**
- Click the 👁️ icon to show the token
- Make sure you actually pasted the token
- Token should start with `ya29.`

### Issue 2: "Invalid or expired Access Token"
**Solution:**
- Tokens from OAuth Playground expire in 1 hour
- Generate a new token
- For production, use refresh tokens

### Issue 3: "Access denied. Make sure your token has youtube.readonly scope"
**Solution:**
- Go back to OAuth Playground
- Make sure you selected: `https://www.googleapis.com/auth/youtube.readonly`
- Re-authorize and get new token

### Issue 4: "No YouTube channel found"
**Solution:**
- Make sure the Google account has a YouTube channel
- Create a channel if needed: https://youtube.com

### Issue 5: Button doesn't respond at all
**Solution:**
- Open browser console (F12)
- Look for JavaScript errors
- Refresh the page
- Make sure backend is running on port 3000

---

## 🔍 Debugging Steps:

### 1. Check Browser Console
```
Press F12 → Console tab
Look for:
- "=== YouTube Connection Test ==="
- "Access Token exists: true/false"
- "Access Token length: [number]"
- Any red error messages
```

### 2. Check Network Tab
```
Press F12 → Network tab
Click "Verify Token"
Look for:
- Request to: googleapis.com/youtube/v3/channels
- Status code (200 = success, 401 = invalid token, 403 = no permission)
```

### 3. Verify Backend is Running
```bash
curl http://localhost:3000/health
```
Should return:
```json
{
  "status": "ok",
  "services": {
    "database": "configured",
    "encryption": "configured"
  }
}
```

---

## 📝 What the Logs Show:

### Console Output (Success):
```
=== YouTube Connection Test ===
Access Token exists: true
Access Token length: 183
Starting YouTube API call...
YouTube API Response Status: 200
YouTube API Response: { items: [...] }
✅ Connection successful!
=== Connection test completed ===
```

### Console Output (Failure):
```
=== YouTube Connection Test ===
Access Token exists: true
Access Token length: 183
Starting YouTube API call...
YouTube API Response Status: 401
YouTube API Error: { error: { message: "Invalid Credentials" } }
=== Connection test completed ===
```

---

## ✅ Verification Checklist:

Before clicking "Verify Token":

- [ ] Backend server is running (`npm start` in server folder)
- [ ] Frontend is running (`npm run dev`)
- [ ] Access Token is pasted in the field
- [ ] Token is visible when clicking 👁️ icon
- [ ] Token starts with `ya29.`
- [ ] Token was generated in last hour
- [ ] Correct scope was selected in OAuth Playground
- [ ] Browser console is open (F12) to see logs

---

## 🎯 Expected Behavior:

1. **Click "Verify Token"**
2. **Button shows "Connecting..."** with spinning icon
3. **Console logs appear** showing the test progress
4. **Alert appears** with success or error message
5. **Connection status updates** to "Connected" or stays "Not Connected"

---

## 🔗 Useful Links:

- **OAuth Playground:** https://developers.google.com/oauthplayground
- **YouTube API Docs:** https://developers.google.com/youtube/v3
- **Scopes Reference:** https://developers.google.com/identity/protocols/oauth2/scopes#youtube

---

## 💡 Pro Tips:

1. **Use the Eye Icon** - Always verify your token is actually in the field
2. **Check Console First** - Logs tell you exactly what's happening
3. **Fresh Tokens** - Generate new tokens if yours is older than 1 hour
4. **Right Scope** - Must use `youtube.readonly` scope minimum
5. **Backend Running** - Make sure both frontend AND backend are running

---

**Status:** ✅ All fixes applied!
**Last Updated:** 2025-11-28 13:35 IST
