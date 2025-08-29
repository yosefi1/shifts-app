# 🚀 Supabase Setup Guide for Shifts App

## Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (free)
4. Click **"New Project"**

## Step 2: Create New Project
1. **Organization**: Choose your GitHub account
2. **Name**: `shifts-app` (or any name you want)
3. **Database Password**: Create a strong password (save it!)
4. **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

## Step 3: Get Your Project Details
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Key** (public key)

## Step 4: Update Your App Configuration
1. Open `src/lib/supabase.ts`
2. Replace these lines:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
   ```
3. With your actual values:
   ```typescript
   const supabaseUrl = 'https://your-project-id.supabase.co'
   const supabaseAnonKey = 'your-anon-key-here'
   ```

## Step 5: Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content of `supabase-setup.sql`
3. Paste it in the SQL Editor
4. Click **"Run"**
5. Wait for all tables to be created

## Step 6: Test Your App
1. Refresh your local app at http://localhost:3000/
2. Try logging in with any worker ID (e.g., `8863762`)
3. Check if data loads from Supabase

## 🎯 What This Gives You:
- ✅ **Real-time database** - all workers see the same data
- ✅ **Automatic sync** - manager sees worker submissions instantly
- ✅ **Data persistence** - survives browser restarts, device changes
- ✅ **Free hosting** - up to 500MB database, 2GB bandwidth/month
- ✅ **Automatic backups** - your data is safe

## 🔧 Troubleshooting:
- **"Table doesn't exist"**: Make sure you ran the SQL script
- **"Connection failed"**: Check your URL and key are correct
- **"Permission denied"**: Make sure RLS policies are set up

## 🚀 Next Steps:
After setup, your app will automatically sync between all devices!
Workers submit from phones → Manager sees on PC instantly! 🎉
