# RacePrep Production Deployment Guide
## Domain: raceprep.kineticbrandpartners.com

This guide walks you through deploying RacePrep to production using your existing tech stack:
- **Domain**: GoDaddy (kineticbrandpartners.com)
- **DNS/SSL**: Cloudflare
- **Code Repository**: HubSpot
- **Deployment**: Netlify
- **Backend**: Supabase

---

## 🚀 **Step 1: Cloudflare DNS Configuration**

### 1.1 Create Subdomain Record
1. **Log into Cloudflare Dashboard**
2. **Select your domain**: `kineticbrandpartners.com`
3. **Go to DNS > Records**
4. **Add a new CNAME record**:
   - **Type**: `CNAME`
   - **Name**: `raceprep`
   - **Content**: `netlify-placeholder.netlify.app` (temporary - we'll update this)
   - **Proxy status**: 🟠 Proxied (for SSL and performance)
   - **TTL**: Auto

### 1.2 Configure SSL Settings
1. **Go to SSL/TLS > Overview**
2. **Set encryption mode**: `Full (strict)`
3. **Go to SSL/TLS > Edge Certificates**
4. **Ensure these are enabled**:
   - ✅ Always Use HTTPS
   - ✅ HTTP Strict Transport Security (HSTS)
   - ✅ Minimum TLS Version: 1.2

---

## 📦 **Step 2: Push Code to Repository**

### 2.1 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial RacePrep setup with Supabase backend"
```

### 2.2 Connect to HubSpot/GitHub Repository
```bash
# If using GitHub (recommended for Netlify integration)
git remote add origin https://github.com/kineticbrandpartners/raceprep.git
git push -u origin main
```

**Note**: If you're strictly using HubSpot for code storage, you may need to:
- Export code from HubSpot to GitHub for Netlify deployment, OR
- Use Netlify's drag-and-drop deployment method

---

## 🌐 **Step 3: Netlify Deployment Setup**

### 3.1 Create New Site on Netlify
1. **Log into Netlify Dashboard**
2. **Click "New site from Git"**
3. **Connect your Git provider**:
   - Choose GitHub (if you pushed there)
   - Select repository: `kineticbrandpartners/raceprep`
4. **Configure build settings**:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`

### 3.2 Configure Environment Variables
🚨 **CRITICAL**: Environment variables must be set manually in Netlify dashboard for security.

1. **Go to Site Settings > Environment Variables**
2. **Follow the detailed setup guide**: See `NETLIFY_ENV_SETUP.md` for complete list
3. **Required variables include**:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` 
   - `EXPO_PUBLIC_API_BASE_URL`
   - `EXPO_PUBLIC_ENVIRONMENT`
   - And 6 additional variables (see NETLIFY_ENV_SETUP.md)

**⚠️ Security Note**: `.env.production` is NOT committed to GitHub - all production secrets must be set in Netlify dashboard.

### 3.3 Configure Custom Domain
1. **Go to Site Settings > Domain Management**
2. **Add custom domain**: `raceprep.kineticbrandpartners.com`
3. **Netlify will provide DNS instructions** - note these for the next step

---

## 🔄 **Step 4: Update Cloudflare DNS**

### 4.1 Update CNAME Record
1. **Return to Cloudflare DNS > Records**
2. **Edit the raceprep CNAME record**:
   - **Content**: Change to your Netlify domain (e.g., `amazing-site-123456.netlify.app`)
   - **Keep Proxy status**: 🟠 Proxied

### 4.2 Verify DNS Propagation
```bash
# Check DNS propagation
dig raceprep.kineticbrandpartners.com CNAME
nslookup raceprep.kineticbrandpartners.com
```

---

## 🔐 **Step 5: Configure SSL Certificate**

### 5.1 Netlify SSL Setup
1. **In Netlify > Site Settings > Domain Management**
2. **HTTPS section**: Netlify should automatically provision SSL
3. **If issues occur**: Disable Cloudflare proxy temporarily during setup

### 5.2 Force HTTPS Redirects
1. **In Netlify > Site Settings > Domain Management**
2. **Force HTTPS**: Enable this option
3. **In Cloudflare**: Ensure "Always Use HTTPS" is enabled

---

## 🧪 **Step 6: Test Production Build**

### 6.1 Build Locally First
```bash
# Test build locally
npm run build:web

# Preview the build
npm run preview:web
```

### 6.2 Deploy to Netlify
1. **Push to main branch** (triggers auto-deploy)
2. **Or manual deploy**: Drag `dist` folder to Netlify
3. **Check deploy logs** for any errors

### 6.3 Test Production Site
1. **Visit**: `https://raceprep.kineticbrandpartners.com`
2. **Verify**:
   - ✅ Site loads correctly
   - ✅ Supabase connection works
   - ✅ Dashboard shows course/race data
   - ✅ SSL certificate is valid
   - ✅ Mobile responsive design works

---

## ⚙️ **Step 7: Configure Supabase for Production**

### 7.1 Update Supabase Auth URLs
1. **In Supabase Dashboard > Authentication > Settings**
2. **Update Site URL**: `https://raceprep.kineticbrandpartners.com`
3. **Add to Redirect URLs**:
   - `https://raceprep.kineticbrandpartners.com/auth/callback`
   - Keep existing localhost URLs for development

---

## 📊 **Step 8: Performance & SEO Optimization**

### 8.1 Cloudflare Performance Settings
1. **Go to Speed > Optimization**
2. **Enable**:
   - ✅ Auto Minify (CSS, HTML, JavaScript)
   - ✅ Brotli compression
   - ✅ Early Hints
3. **Go to Caching > Configuration**
4. **Caching Level**: Standard
5. **Browser Cache TTL**: 4 hours

### 8.2 Add Meta Tags for SEO
Update your main HTML template with:
```html
<meta name="description" content="RacePrep - The only triathlon app that understands your race as a complete event, not three separate sports.">
<meta name="keywords" content="triathlon, race prep, swim bike run, transition analytics, race planning">
<meta property="og:title" content="RacePrep - Triathlon Performance Analytics">
<meta property="og:description" content="Track your triathlon performance, analyze transitions, and plan your next race with RacePrep.">
<meta property="og:url" content="https://raceprep.kineticbrandpartners.com">
<meta property="og:type" content="website">
```

---

## 🔍 **Step 9: Monitoring & Analytics**

### 9.1 Setup Domain Monitoring
1. **Cloudflare Analytics**: Monitor traffic and performance
2. **Netlify Analytics**: Track deployment success and site performance
3. **Supabase Dashboard**: Monitor database usage and performance

### 9.2 Error Monitoring (Future)
Consider adding:
- **Sentry**: For error tracking
- **Google Analytics**: For user behavior analysis
- **LogRocket**: For user session recording

---

## ✅ **Step 10: Verification Checklist**

Before going live, verify:

- [ ] **Domain resolves**: `raceprep.kineticbrandpartners.com` loads correctly
- [ ] **SSL certificate**: Valid and shows padlock icon
- [ ] **Mobile responsive**: Works on all device sizes
- [ ] **Supabase connection**: Dashboard shows live data
- [ ] **Authentication**: Ready for user sign-up/login
- [ ] **Performance**: Site loads in < 3 seconds
- [ ] **SEO**: Meta tags and descriptions are set
- [ ] **Error handling**: Graceful error pages display

---

## 🚨 **Troubleshooting Common Issues**

### Issue: DNS Not Propagating
- **Solution**: Wait 24-48 hours or flush DNS cache
- **Command**: `sudo dscacheutil -flushcache` (macOS)

### Issue: SSL Certificate Problems  
- **Solution**: Temporarily disable Cloudflare proxy, let Netlify provision SSL, then re-enable

### Issue: Build Failures
- **Check**: Netlify deploy logs for specific errors
- **Common fix**: Ensure all environment variables are set

### Issue: Supabase Connection Errors
- **Verify**: Environment variables are correctly set in Netlify
- **Check**: Supabase URL whitelist includes production domain

---

## 🎯 **Next Steps After Deployment**

1. **User Testing**: Test the production app thoroughly
2. **Performance Monitoring**: Set up alerts for downtime
3. **Backup Strategy**: Regular database backups via Supabase
4. **Feature Development**: Continue building triathlon features
5. **Marketing**: Launch the triathlon community outreach

---

**Your RacePrep production deployment is ready! 🏊‍♂️🚴‍♂️🏃‍♂️**

The triathlon community now has access to the only app that understands races as complete events, not three separate sports.