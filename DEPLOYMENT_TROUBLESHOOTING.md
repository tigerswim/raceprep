# 🚨 RacePrep Deployment Troubleshooting

## **Current Issue: 404 Error**

The domain `raceprep.kineticbrandpartners.com` is resolving but returning a 404 error. Here's how to diagnose and fix:

---

## **🔍 Step 1: Check Netlify Deploy Status**

### **In Netlify Dashboard:**
1. Go to **[netlify.com](https://netlify.com)** → Your RacePrep site
2. Click **"Deploys"** tab
3. **Check the latest deploy status:**
   - ✅ **Published** = Good
   - ❌ **Failed** = Need to fix build issues
   - 🟡 **Building** = Wait for completion

### **If Deploy Failed:**
Click on the failed deploy to see error logs. Common issues:
- Missing environment variables
- Build command errors
- Node.js version issues

---

## **🔧 Step 2: Verify Build Configuration**

### **In Site Settings > Build & Deploy:**
Confirm these settings:
- **Repository**: `tigerswim/raceprep`
- **Branch**: `main`
- **Build command**: `npm run build:web`
- **Publish directory**: `dist`

### **If Settings Are Wrong:**
Update and trigger a new deploy.

---

## **🌐 Step 3: Check Custom Domain Configuration**

### **In Site Settings > Domain Management:**
1. **Check custom domain**: Should show `raceprep.kineticbrandpartners.com`
2. **Check DNS configuration**: Should show "DNS configured correctly" ✅
3. **Check HTTPS**: Should show "HTTPS enabled" ✅

### **If Domain Issues:**
- Remove and re-add the custom domain
- Verify DNS is pointing to the correct Netlify site

---

## **📋 Step 4: Verify Environment Variables**

### **In Site Settings > Environment Variables:**
Ensure ALL 10 variables are set:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_ENVIRONMENT`
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_VERSION`
- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_CHRONOTRACK_API_KEY`
- `EXPO_PUBLIC_RUNSIGNUP_API_KEY`
- `EXPO_PUBLIC_OPENWEATHERMAP_API_KEY`

### **After Adding Variables:**
Click **"Trigger deploy"** to rebuild with environment variables.

---

## **🧪 Step 5: Test Direct Netlify URL**

1. **Find your Netlify URL**: In site overview, look for something like `amazing-site-123456.netlify.app`
2. **Test direct URL**: Visit `https://[your-site].netlify.app`
3. **If Netlify URL works**: Issue is with custom domain configuration
4. **If Netlify URL fails**: Issue is with build/environment variables

---

## **⚡ Quick Fixes**

### **Fix 1: Retrigger Deploy**
Sometimes a simple redeploy fixes issues:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

### **Fix 2: Clear Deploy Cache**
If builds are failing:
1. Go to **Site Settings** → **Build & Deploy**
2. Click **"Clear cache and retry"**

### **Fix 3: Check Build Logs**
Always check the deploy logs for specific error messages:
1. Click on any deploy
2. Read through the build log
3. Look for red error messages

---

## **🎯 Expected Working State**

When fixed, you should see:
- ✅ **Deploy Status**: Published
- ✅ **Custom Domain**: DNS configured correctly
- ✅ **Site loads**: Shows RacePrep dashboard
- ✅ **Supabase works**: "🎉 Supabase Connected!"
- ✅ **HTTPS**: Green padlock in browser

---

## **📞 Next Steps**

1. **Check Netlify dashboard** using the steps above
2. **Identify the specific issue** (build, domain, or environment variables)
3. **Apply the appropriate fix**
4. **Test again** at `https://raceprep.kineticbrandpartners.com`

If you find the specific error in Netlify, I can help you fix it! Just share what you see in the deploy logs or dashboard.

---

## **Common Error Solutions**

### **"Command failed: npm run build:web"**
- **Fix**: Check environment variables are set
- **Or**: Update build command to just `npm run build`

### **"Module not found" errors**
- **Fix**: Ensure all dependencies in package.json
- **Try**: Clear cache and retry deploy

### **"Environment variable undefined"**
- **Fix**: Add missing environment variables in Netlify dashboard
- **Then**: Trigger new deploy

The most likely issue is either missing environment variables or incorrect build configuration. Check these first!