# Environment Configuration Guide

## 📋 Overview

RacePrep uses different API configurations for local development vs. production deployment.

---

## 🏠 Local Development Setup

### Configuration
In `.env.local`, use:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Required Services
You need **TWO servers running**:

1. **Expo Dev Server** (Frontend)
   ```bash
   npm run web
   # Runs on http://localhost:8081
   ```

2. **API Server** (Backend)
   ```bash
   cd server
   node server.js
   # Runs on http://localhost:3001
   ```

### How It Works
- Frontend calls: `http://localhost:3001/api/strava/connect`
- API server proxies to external APIs (Strava, RunSignup, etc.)
- Keeps API keys secure on the backend

---

## 🚀 Production Deployment (Netlify)

### Configuration
In `.env.local` **OR** Netlify environment variables, use:
```bash
# Comment out the localhost URL
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Use relative path for production
EXPO_PUBLIC_API_BASE_URL=/api
```

### How It Works
- Frontend calls: `/api/strava/connect` (relative path)
- Netlify Functions handle the API requests at `/.netlify/functions/*`
- `netlify.toml` redirects `/api/*` to `/.netlify/functions/*`
- No separate backend server needed!

### Netlify Configuration

Your `netlify.toml` already has the redirect configured:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## 🔐 Environment Variables in Netlify

### Set in Netlify Dashboard

Go to: **Site Settings → Environment Variables**

Add these variables:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://jpimixridnqwnpjhwdja.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API Base URL (production)
EXPO_PUBLIC_API_BASE_URL=/api

# Strava
EXPO_PUBLIC_STRAVA_CLIENT_ID=your_client_id
EXPO_PUBLIC_STRAVA_CLIENT_SECRET=your_client_secret

# RunSignup
EXPO_PUBLIC_RUNSIGNUP_API_KEY=your_key
EXPO_PUBLIC_RUNSIGNUP_SECRET=your_secret

# OpenWeatherMap
EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=your_key

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

**IMPORTANT**: Use the **production** values for these, not your local `.env.local` values!

---

## 🔄 Switching Between Environments

### Option 1: Manual (Simple)

**For Local Development:**
```bash
# In .env.local
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

**For Production Build:**
```bash
# In .env.local (before building)
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api  # Comment out
EXPO_PUBLIC_API_BASE_URL=/api  # Uncomment
```

Then rebuild:
```bash
npm run build:web
```

### Option 2: Automatic (Recommended)

Use separate environment files:

1. **Create `.env.production`**:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=/api
   # Add other production-specific values
   ```

2. **Keep `.env.local` for development**:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
   ```

3. **Update `package.json` scripts**:
   ```json
   {
     "scripts": {
       "web": "expo start --web",
       "build:web": "EXPO_ENV=production expo export --platform web && cp public/_redirects dist/"
     }
   }
   ```

---

## 📝 Deployment Checklist

### Before Deploying to Netlify

- [ ] **Update `.env.local`** OR **Set Netlify env vars**
  - Change `EXPO_PUBLIC_API_BASE_URL` from `http://localhost:3001/api` to `/api`

- [ ] **Verify `netlify.toml`** has API redirect configured
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/:splat"
    status = 200
  ```

- [ ] **Add all environment variables** in Netlify Dashboard

- [ ] **Test build locally**:
  ```bash
  npm run build:web
  npm run preview:web
  ```

- [ ] **Deploy**:
  ```bash
  git add .
  git commit -m "Deploy: Updated API configuration"
  git push origin main
  ```

---

## 🐛 Troubleshooting

### "PARSING_ERROR: Not valid JSON"
**Cause**: API calls are returning HTML instead of JSON
**Solution**: Make sure API server is running (local) or API base URL is set correctly (production)

### Local Development Not Working
**Check**:
1. Is API server running? (`cd server && node server.js`)
2. Is `.env.local` correct? (`EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api`)
3. Did you restart Expo after changing `.env.local`?

### Production Deployment Not Working
**Check**:
1. Are Netlify environment variables set?
2. Is `EXPO_PUBLIC_API_BASE_URL=/api` (relative path)?
3. Are Netlify Functions deployed? (Check Functions tab in Netlify)
4. Is `netlify.toml` in the repository root?

---

## 🎯 Quick Reference

| Environment | API Base URL | Backend |
|-------------|--------------|---------|
| **Local Dev** | `http://localhost:3001/api` | Node server (port 3001) |
| **Production** | `/api` | Netlify Functions |

---

## 📚 Related Documentation

- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Netlify Configuration**: `netlify.toml`
- **API Setup**: `API_SETUP.md`
- **Environment Variables**: `.env.local` (not committed)

---

**Last Updated**: November 12, 2025
