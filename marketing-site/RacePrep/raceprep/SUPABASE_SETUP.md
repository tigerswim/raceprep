# Supabase Setup Guide for RacePrep

This guide will walk you through setting up Supabase as the backend for the RacePrep triathlon application.

## Step 1: Create a Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign in (create an account if you don't have one)

2. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - **Project Name**: `RacePrep`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users (US East for Atlanta-based app)
   - **Pricing Plan**: Start with the free tier for development

3. **Wait for the project to be created** (this takes a few minutes)

## Step 2: Configure Database Schema

1. **Open the SQL Editor** in your Supabase dashboard
2. **Run the schema creation script:**
   - Copy the contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Run the security policies:**
   - Copy the contents of `supabase/policies.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Add sample data (optional for development):**
   - Copy the contents of `supabase/seed.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

## Step 3: Configure Authentication

1. **Go to Authentication > Settings**
2. **Site URL Configuration:**
   - **Site URL**: `raceprep://` (for mobile app deep linking)
   - **Redirect URLs**: Add these URLs:
     - `raceprep://auth/callback`
     - `http://localhost:8081` (for development)
     - `https://raceprep.kineticbrandpartners.com` (for production web)

3. **Email Templates** (optional customization):
   - Customize the confirmation and password reset email templates with RacePrep branding

4. **Auth Providers** (configure as needed):
   - **Email/Password**: Enable this (default)
   - **Social Logins** (optional for Phase 2):
     - Google
     - Apple
     - Facebook

## Step 4: API Settings

1. **Go to Settings > API**
2. **Copy your credentials:**
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Project API Key** (anon/public): This is safe to use in your app
   - **Service Role Key**: Keep this secret, only use on server-side

## Step 5: Update Environment Variables

1. **Update your `.env.local` file:**
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

2. **For production, you'll also need:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

## Step 6: Test the Connection

1. **Start your development server:**
   ```bash
   npm start
   ```

2. **Test basic functionality:**
   - The app should connect to Supabase without errors
   - Authentication flows should work
   - Data fetching should work (even if returning empty results initially)

## Step 7: Database Management

### Viewing Data
- Use the **Table Editor** in Supabase dashboard to view and edit data
- Use the **SQL Editor** for complex queries

### Backup Strategy
- Supabase automatically creates backups on paid plans
- For additional safety, you can export data using the dashboard

### Monitoring
- **Logs**: View real-time logs in the Dashboard
- **Database Usage**: Monitor storage and bandwidth usage
- **Auth Users**: Track user registrations and activity

## Step 8: Security Best Practices

1. **Row Level Security (RLS)**: Already configured in `policies.sql`
2. **API Keys**: Never expose service role keys in client-side code
3. **Database Access**: Limit direct database access to development only
4. **Backups**: Regularly backup your data
5. **SSL**: Always use HTTPS in production

## Database Schema Overview

The RacePrep database includes these main tables:

- **users**: User profiles and preferences
- **courses**: Triathlon course database
- **races**: Race events
- **race_results**: User race performance data
- **course_reviews**: User course ratings and reviews
- **race_weather**: Weather data for races
- **nutrition_plans**: Race nutrition strategies
- **user_equipment**: Equipment preferences
- **user_goals**: Personal goals and targets
- **packing_lists**: Race day packing checklists

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check your URL and API key in `.env.local`
2. **Auth Issues**: Verify redirect URLs are correctly configured
3. **Permission Denied**: Check RLS policies are properly applied
4. **Schema Errors**: Make sure all SQL scripts ran without errors

### Getting Help:

- Check Supabase [Documentation](https://supabase.com/docs)
- Review error logs in the Supabase dashboard
- Check network connectivity and CORS settings

## Production Deployment

When ready for production:

1. **Upgrade to Pro Plan** for better performance and support
2. **Configure Custom Domain** (optional)
3. **Set up Monitoring and Alerts**
4. **Review and Test Security Settings**
5. **Configure Backup Strategy**
6. **Set up Production Environment Variables**

## Next Steps

After Supabase is configured:

1. **Implement Authentication**: User sign up, sign in, profile management
2. **Add Race Data Entry**: Forms for adding race results
3. **Build Analytics Engine**: Race performance analysis
4. **Integrate Third-party APIs**: Weather data, race timing platforms
5. **Add Premium Features**: Advanced analytics, nutrition planning

---

**Need Help?** Refer to the comprehensive development documentation in `raceprep_development_docs.2.md` for detailed implementation guidance.