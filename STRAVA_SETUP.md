# Strava OAuth Integration Setup Guide

## Overview

This app now supports importing activities directly from Strava! This MVP implementation includes:
- ✅ OAuth authentication
- ✅ Activity syncing
- ✅ Token management (localStorage)
- ✅ "Connect with Strava" button on Upload page

---

## 🔑 Step 1: Get Your Strava API Credentials

1. Go to https://www.strava.com/settings/api
2. Fill in the application details:
   - **Application Name**: `Running Metrics Analyzer` (or your preferred name)
   - **Category**: `Visualizer`
   - **Website**: `https://zxu28.github.io/runningmetric/`
   - **Authorization Callback Domain**: `zxu28.github.io`
   
3. Click "Create"
4. You'll receive:
   - **Client ID** (a number like `181996`)
   - **Client Secret** (a long string)

---

## 📝 Step 2: Create .env File

Create a file named `.env` in the project root:

```env
# Strava OAuth Configuration
VITE_STRAVA_CLIENT_ID=181996
VITE_STRAVA_CLIENT_SECRET=your_actual_client_secret_here

# For local development
VITE_STRAVA_REDIRECT_URI=http://localhost:5175/runningmetric/strava-callback

# For production (uncomment this line when deploying)
# VITE_STRAVA_REDIRECT_URI=https://zxu28.github.io/runningmetric/strava-callback
```

**Replace** `your_actual_client_secret_here` with your actual secret!

---

## 🔒 Security Notes

- **NEVER** commit `.env` to Git (it's already in `.gitignore`)
- Client Secret should be kept private
- For production use, consider moving secrets to GitHub Secrets or environment variables
- Tokens are stored in browser localStorage (secure enough for MVP, but Firebase would be better for production)

---

## 🚀 Step 3: Test Locally

1. Make sure `.env` file exists with your credentials
2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Navigate to http://localhost:5175/runningmetric/upload
4. Click "Connect with Strava"
5. Authorize the app on Strava
6. You should be redirected back and see "Connected to Strava"
7. Click "Sync Activities" to fetch your runs

---

## 📦 Step 4: Deploy to Production

### Update Strava Redirect URI

Before deploying, you need to update the redirect URI for production:

1. **Option A: Update .env** (for build-time configuration):
   ```env
   # Comment out local URI
   # VITE_STRAVA_REDIRECT_URI=http://localhost:5175/runningmetric/strava-callback
   
   # Uncomment production URI
   VITE_STRAVA_REDIRECT_URI=https://zxu28.github.io/runningmetric/strava-callback
   ```

2. **Option B: GitHub Secrets** (recommended for production):
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_STRAVA_CLIENT_ID`
     - `VITE_STRAVA_CLIENT_SECRET`
   - Update `.github/workflows/deploy.yml` to inject these during build

### Build and Deploy

```bash
# Build with production env vars
npm run build

# Deploy (your existing GitHub Actions will handle this)
git add -A
git commit -m "feat: add Strava OAuth integration MVP"
git push
```

---

## 🧪 Testing the Integration

1. **Connect to Strava**:
   - Go to Upload page
   - Click "Connect with Strava"
   - Authorize on Strava
   - Should redirect back and show connection status

2. **Sync Activities**:
   - Click "Sync Activities" button
   - Should see alert with number of activities fetched
   - Check browser console for activity data

3. **Disconnect**:
   - Click "Disconnect" to clear tokens
   - Should return to "Connect" state

---

## 🐛 Troubleshooting

### "Authorization denied"
- Make sure Authorization Callback Domain is correct in Strava settings
- Check that redirect URI matches exactly (including protocol and path)

### "Failed to connect to Strava"
- Verify Client ID and Secret are correct in `.env`
- Check browser console for detailed error messages
- Make sure `.env` file is in project root
- Restart dev server after changing `.env`

### "No authorization code received"
- Check redirect URI configuration
- Verify the callback route exists (`/strava-callback`)

### Activities not syncing
- Check if you're connected (tokens in localStorage)
- Verify you have runs in your Strava account
- Check browser console for API errors
- Token might be expired - try disconnecting and reconnecting

---

## 📊 Current Limitations (MVP)

This is an MVP implementation with some limitations:

1. **No detailed GPS data yet**: Activities are fetched but not converted to GPXData format
2. **localStorage only**: Tokens stored in browser (not Firebase)
3. **No automatic refresh**: Manual sync required
4. **Limited error handling**: Basic error messages
5. **No activity details**: Only summary data, streams not fetched yet

---

## 🔮 Next Steps (Phase 2)

After MVP is working, we can add:

1. **Convert Strava activities to GPXData**:
   - Fetch activity streams (GPS coordinates)
   - Transform to GPX format
   - Display in existing charts/maps

2. **Auto-sync on page load**:
   - Check for Strava connection on Analysis page
   - Auto-fetch new activities

3. **Better token management**:
   - Firebase integration
   - Automatic token refresh
   - Secure storage

4. **Activity filtering**:
   - Date range picker
   - Activity type filter
   - Search functionality

5. **Sync status**:
   - Last sync time
   - New activities badge
   - Progress indicators

---

## 📚 API Documentation

- [Strava API v3 Docs](https://developers.strava.com/docs/reference/)
- [OAuth Flow](https://developers.strava.com/docs/authentication/)
- [Activities API](https://developers.strava.com/docs/reference/#api-Activities)
- [Streams API](https://developers.strava.com/docs/reference/#api-Streams)

---

## ✅ Quick Checklist

- [ ] Register app on Strava
- [ ] Create `.env` file with credentials
- [ ] Test locally (connect, sync, disconnect)
- [ ] Update redirect URI for production
- [ ] Deploy to GitHub Pages
- [ ] Test on production URL
- [ ] Verify OAuth callback works
- [ ] Check activity syncing

---

**Need help?** Check the console logs or refer to the Strava API documentation.

