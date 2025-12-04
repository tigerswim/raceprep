# Demo User Setup

This directory contains a seed script to create a demo user account with complete data for showcasing RacePrep.

## Quick Start

```bash
# From RacePrep root directory
node scripts/seed-demo-user.js
```

## What Gets Created

The script creates a fully populated demo account:

### 1. User Account
- **Email**: `demo@raceprep.app`
- **Password**: `RacePrep2024!`
- **Name**: John Doe
- **Profile**: 35-39 M, Intermediate, Atlanta, GA

### 2. Training Data (60 days)
- **~40-50 training sessions** across swim/bike/run
- Realistic weekly training schedule:
  - Swim: Mon, Wed, Fri (2-3km)
  - Bike: Tue, Thu, Sat (40-120km)
  - Run: Mon, Wed, Fri, Sat (8-20km)
- Complete metrics: distance, time, heart rate, power, cadence
- Mix of indoor/outdoor and different workout types

### 3. Goals (3 active)
- Complete 3 races this season (1/3 progress)
- Olympic distance under 2:30:00 (current: 2:45:00)
- T1/T2 transitions under 2 minutes (current: 2:30)

### 4. Races (4 total)
- **1 completed race** with full results and splits
- **3 upcoming races**: Sprint (45 days), Olympic (90 days), 70.3 (150 days)
- Complete course details for each race
- Planned with target times

### 5. Additional Data
- Nutrition plan for upcoming Olympic race
- User settings configured
- Race registrations tracked

## Dashboard Widgets Covered

All widgets will display data:

✅ **PerformanceOverviewWidget**
- 60 days of training trends
- Volume and intensity charts
- Week-over-week comparisons

✅ **UpcomingRacesWidget**
- 3 races in next 6 months
- Distance, location, days until race

✅ **TrainingPlanProgressWidget**
- Training volume trends
- Discipline breakdown

✅ **GoalsProgressWidget**
- 3 active goals with progress bars
- Current vs target values

✅ **WeatherWidget**
- Will fetch for upcoming race location (Gainesville, GA)

## Requirements

### Environment Variables

Add to `.env.local`:

```env
# Required (already in your .env.local)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional (for creating auth user)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Finding your Service Role Key**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API
4. Copy "service_role" key (not "anon" key)

### With Service Role Key
✅ Script creates complete auth user
✅ User can log in immediately
✅ Fully functional demo account

### Without Service Role Key
⚠️ Script creates data only
⚠️ Must manually create auth user in Supabase dashboard
⚠️ Use the User ID from manual creation

## Usage

### Option 1: With Service Role Key (Recommended)

```bash
# 1. Add service role key to .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env.local

# 2. Run seed script
node scripts/seed-demo-user.js

# 3. Done! Share credentials:
#    Email: demo@raceprep.app
#    Password: RacePrep2024!
```

### Option 2: Without Service Role Key

```bash
# 1. Manually create user in Supabase Dashboard
#    Email: demo@raceprep.app
#    Password: RacePrep2024!

# 2. Get the user ID from Supabase

# 3. Edit seed-demo-user.js line 97:
#    Replace: userId = '00000000-0000-0000-0000-000000000001';
#    With:    userId = 'your-actual-user-id';

# 4. Run seed script
node scripts/seed-demo-user.js
```

## Output

Successful run:

```
🌱 Starting demo user seed...

1️⃣  Creating auth user...
   ✅ Auth user created: abc123-def456-...

2️⃣  Creating user profile...
   ✅ User profile created

3️⃣  Creating training sessions...
   ✅ Created 48 training sessions

4️⃣  Creating user goals...
   ✅ Created 3 goals

5️⃣  Creating races...
   ✅ Created 3 courses and 4 races

6️⃣  Creating race results...
   ✅ Created 1 race result(s)

7️⃣  Creating user planned races...
   ✅ Created 3 planned race(s)

8️⃣  Creating nutrition plan...
   ✅ Created 1 nutrition plan(s)

9️⃣  Creating user settings...
   ✅ Created user settings

✅ Demo user seed complete!

═══════════════════════════════════════════════════════
📧 Email:    demo@raceprep.app
🔑 Password: RacePrep2024!
🆔 User ID:  abc123-def456-ghi789
═══════════════════════════════════════════════════════

💡 Share these credentials to demo RacePrep!
```

## Sharing Demo Credentials

When giving others access:

```
🏊‍♂️🚴‍♂️🏃‍♂️ Try RacePrep!

Visit: https://raceprep.netlify.app
Email: demo@raceprep.app
Password: RacePrep2024!

Explore:
✅ 60 days of training data
✅ Upcoming races with plans
✅ Goals and progress tracking
✅ Performance analytics
✅ Race nutrition planning
```

## Re-running

**Can I run this multiple times?**

Yes! The script uses `upsert` for most data:
- User profile: Updates if exists
- Races/courses: Updates if exists
- Training sessions: Adds new ones (may create duplicates)
- Goals: Adds new ones (may create duplicates)

**To fully reset**:
1. Delete user from Supabase Auth dashboard
2. Delete all related data from tables (cascade should handle this)
3. Re-run script

**Recommended**: Only run once per demo account.

## Troubleshooting

### Error: "Missing required environment variables"
- Check `.env.local` exists in RacePrep root
- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set

### Error: "User already exists"
- Script will fetch existing user ID and continue
- Or manually delete user from Supabase dashboard first

### Error: "duplicate key value"
- Data already exists from previous run
- Either continue (data will be skipped) or delete existing data

### No data appears in app
- Verify user ID matches between auth and data
- Check Supabase RLS policies allow reading
- Try logging in with credentials to verify account works

## Data Realism

The demo data is designed to be realistic:

- **Training Volume**: Typical intermediate triathlete (8-12 hours/week)
- **Pacing**: Realistic paces for each discipline
- **Race Results**: Middle-of-pack placements (45th overall, 8th AG)
- **Goals**: Achievable with consistent training
- **Upcoming Races**: Realistic race calendar (Spring → Summer → Fall)

## Customization

To modify the demo data, edit `seed-demo-user.js`:

- **Line 13-21**: User profile (name, email, age group, etc.)
- **Line 165-220**: Training session generation logic
- **Line 226-245**: User goals
- **Line 251-321**: Races and courses
- **Line 342-371**: Race results

## Notes

- **One-time setup**: Script is intended for initial demo setup
- **No Strava connection**: Demo user won't have Strava linked (as requested)
- **Generic data**: Uses "John Doe" with realistic but generic training
- **All widgets**: Data covers all dashboard widgets for full demo

## Support

For issues or questions:
1. Check Supabase dashboard for data
2. Review script output for error messages
3. Verify environment variables are correct
4. Check that Supabase project is active

---

**Ready to create your demo user?**

```bash
node scripts/seed-demo-user.js
```
