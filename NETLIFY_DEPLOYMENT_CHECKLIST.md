# Netlify Deployment Checklist - RacePrep

**Date Created**: November 12, 2025
**Deployment URL**: https://raceprep.kineticbrandpartners.com

---

## 📋 Pre-Deployment Checklist

### 1. Netlify Environment Variables Setup

Go to: **Netlify Dashboard** → **Your Site** → **Site Settings** → **Environment Variables**

Click **"Add a variable"** for each of the following:

#### Critical Variables (Must Set):

- [ ] **EXPO_PUBLIC_API_BASE_URL**
  - **Key**: `EXPO_PUBLIC_API_BASE_URL`
  - **Value**: `/api`
  - **Scopes**: Production, Deploy previews, Branch deploys

- [ ] **EXPO_PUBLIC_SUPABASE_URL**
  - **Key**: `EXPO_PUBLIC_SUPABASE_URL`
  - **Value**: `https://jpimixridnqwnpjhwdja.supabase.co`
  - **Scopes**: Production, Deploy previews, Branch deploys

- [ ] **EXPO_PUBLIC_SUPABASE_ANON_KEY**
  - **Key**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - **Value**: (Copy from your `.env.local` - the `eyJhbGciOi...` string)
  - **Scopes**: Production, Deploy previews, Branch deploys

- [ ] **SUPABASE_SERVICE_ROLE_KEY**
  - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
  - **Value**: (Copy from your `.env.local`)
  - **Scopes**: Production only (for security)
  - ⚠️ **Keep this secret!**

#### Strava Integration:

- [ ] **EXPO_PUBLIC_STRAVA_CLIENT_ID**
  - **Value**: (From Strava API settings)

- [ ] **EXPO_PUBLIC_STRAVA_CLIENT_SECRET**
  - **Value**: (From Strava API settings)
  - ⚠️ **Keep this secret!**

#### Other API Keys:

- [ ] **EXPO_PUBLIC_RUNSIGNUP_API_KEY**
- [ ] **EXPO_PUBLIC_RUNSIGNUP_API_SECRET**
- [ ] **EXPO_PUBLIC_OPENWEATHERMAP_API_KEY**
- [ ] **EXPO_PUBLIC_GOOGLE_MAPS_API_KEY**

---

### 2. Strava API Configuration

Update Strava redirect URI:

1. Go to: https://www.strava.com/settings/api
2. Find your RacePrep application
3. Update **Authorization Callback Domain**:
   - **Production**: `raceprep.kineticbrandpartners.com`
4. Save changes

**Callback URL will be**: `https://raceprep.kineticbrandpartners.com/strava-callback`

---

### 3. Repository & Build Settings

Verify in Netlify:

- [ ] **Base directory**: Leave empty (root)
- [ ] **Build command**: `npm run build:web`
- [ ] **Publish directory**: `dist`
- [ ] **Node version**: 18 or 20 (set in `netlify.toml` or build settings)

---

### 4. Verify netlify.toml Configuration

Check that `netlify.toml` exists in repository root:

```toml
[build]
  command = "npm run build:web"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] File exists at root
- [ ] API redirect is configured
- [ ] SPA redirect is configured

---

### 5. Local Testing Before Deploy

Test the production build locally:

```bash
# Build for production
npm run build:web

# Preview the build
npm run preview:web

# Test in browser at http://localhost:8080 or similar
```

Check:
- [ ] App loads without errors
- [ ] Navigation works (all tabs)
- [ ] Dashboard displays
- [ ] Can browse training plans (if testing that flow)

---

## 🚀 Deployment Steps

### Initial Deployment

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "chore: Configure production environment for Netlify"
   git push origin main
   ```

2. **Netlify will auto-deploy** (if connected to GitHub)
   - Monitor build logs in Netlify Dashboard
   - Build should take 2-5 minutes

3. **Check deployment status**:
   - Go to Netlify Dashboard → Deploys
   - Wait for "Published" status

4. **Verify deployment**:
   - Visit: https://raceprep.kineticbrandpartners.com
   - Check browser console for errors
   - Test basic functionality

---

## ✅ Post-Deployment Verification

### Smoke Tests

After deployment, test these critical features:

- [ ] **Home page loads**
  - No JavaScript errors in console
  - Dashboard displays correctly

- [ ] **Authentication works**
  - Can sign up / log in
  - Redirected to dashboard after login

- [ ] **Navigation functions**
  - All tabs clickable and load
  - URLs update correctly

- [ ] **Strava connection** (if configured)
  - Click "Connect to Strava"
  - Authorize on Strava
  - Redirected back successfully
  - Connection saved

- [ ] **Training Plans** (our new feature!)
  - Navigate to Training Plans
  - Templates load and display
  - Can view plan details
  - (Don't need to create a plan yet)

- [ ] **API calls work**
  - Network tab shows calls to `/api/*`
  - Responses are JSON (not HTML)
  - No CORS errors

---

## 🐛 Troubleshooting

### Build Fails

**Check**:
1. Netlify build logs for errors
2. All environment variables are set
3. `netlify.toml` is in repository
4. Node version compatible (18 or 20)

**Common fixes**:
```bash
# Clear Netlify cache and retry
# In Netlify: Site Settings → Build & Deploy → Clear cache and retry deploy
```

### App Loads But API Calls Fail

**Check**:
1. `EXPO_PUBLIC_API_BASE_URL=/api` is set in Netlify
2. API redirects in `netlify.toml` are correct
3. Netlify Functions are deployed (check Functions tab)

**Debug**:
- Open browser dev tools → Network tab
- Look for failed requests
- Check if they're going to `/api/*` or wrong URL

### Strava Auth Not Working

**Check**:
1. Strava redirect URI matches: `https://raceprep.kineticbrandpartners.com/strava-callback`
2. `EXPO_PUBLIC_STRAVA_CLIENT_ID` and `_SECRET` are set in Netlify
3. Callback route exists: `src/app/strava-callback.tsx`

### Environment Variables Not Loading

**Fix**:
1. Verify variables are set in Netlify (Site Settings → Environment Variables)
2. Make sure **Scopes** include "Production"
3. Trigger a new deploy (they only apply on build)

---

## 📊 Monitoring

### After Deployment

**Check these in Netlify Dashboard**:

- [ ] **Deploy status**: Green/Published
- [ ] **Functions**: Should see deployed functions
- [ ] **Analytics** (if enabled): Site is receiving traffic
- [ ] **Logs**: No critical errors

**Check in Browser**:
- [ ] No console errors
- [ ] No 404s in Network tab
- [ ] API calls return JSON (not HTML)

---

## 🔄 Ongoing Deployments

For future updates:

1. **Make changes locally**
2. **Test locally**: `npm run build:web` then `npm run preview:web`
3. **Commit & push**: Netlify auto-deploys
4. **Verify deployment**: Check the live site

**No need to change environment variables** unless:
- Adding new API keys
- Changing Supabase project
- Updating Strava credentials

---

## 📝 Notes

- **Local `.env.local`**: Keep `http://localhost:3001/api` for development
- **Netlify env vars**: Use `/api` for production
- **No code changes needed** when switching environments!
- **All secrets stay in Netlify** - never commit to git

---

## 🎯 Quick Command Reference

```bash
# Test production build locally
npm run build:web
npm run preview:web

# Deploy to production
git add .
git commit -m "Your commit message"
git push origin main

# Check build in Netlify
# Visit: https://app.netlify.com/sites/YOUR_SITE/deploys
```

---

**Ready to Deploy?** Complete all checkboxes above, then push to `main` branch!

---

**Last Updated**: November 12, 2025
**Next Review**: Before first production deployment
