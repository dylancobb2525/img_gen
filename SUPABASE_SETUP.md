# Supabase Setup Guide

This guide will help you set up Supabase for cross-device library synchronization.

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `ush-image-helper` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose the closest region to your users (e.g., "US East (North Virginia)")
   - **Pricing Plan**: Select "Free" (includes 500MB database, 50,000 monthly active users)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Set Up the Database

1. Once your project is ready, click on the **SQL Editor** icon in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `/lib/database-schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see a success message: "Success. No rows returned"

## Step 4: Get Your API Credentials

1. Click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this entire URL

### API Keys
Find the **"anon" "public"** key (it's a long string starting with `eyJ...`)
Copy this key

⚠️ **Important**: Use the **anon/public** key, NOT the service_role key!

## Step 5: Add Credentials to Your App

1. Open `/img_gen/.env.local` in your project
2. Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save the file
4. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Step 6: Test the Connection

1. Go to http://localhost:3001
2. Log in with your email
3. Generate an image suggestion
4. Click **"Save to Library"**
5. Go to **Library** page
6. You should see your saved item!

### Test Cross-Device Sync

1. Open a different browser (or incognito window)
2. Go to http://localhost:3001
3. Log in with the **same email**
4. Click **Library**
5. You should see the same items! 🎉

## Troubleshooting

### "Failed to save to library" error
- Check that your Supabase URL and key are correct in `.env.local`
- Make sure you ran the database schema SQL
- Check the browser console (F12) for detailed error messages

### Library is empty
- Make sure you're logged in with the correct email
- Check the Supabase dashboard → Table Editor → `library_items` to see if data is there
- Try refreshing the page

### Can't connect to Supabase
- Verify your project is active in the Supabase dashboard
- Check that the URL starts with `https://`
- Make sure you're using the **anon** key, not the service_role key

## Viewing Your Data

To see all library items in Supabase:

1. Go to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Click on the **library_items** table
4. You'll see all saved library items from all users

## Free Tier Limits

Supabase free tier includes:
- ✅ 500 MB database space
- ✅ 50,000 monthly active users  
- ✅ 2 GB file storage
- ✅ 50 GB bandwidth per month
- ✅ Unlimited API requests

This should be more than enough for your use case!

## Security Notes

The `anon` key is safe to use in your frontend code because:
- It's rate-limited
- Row Level Security (RLS) policies protect the data
- Users can only access their own library items (based on email)

## Need Help?

If you run into any issues:
1. Check the browser console (F12) for errors
2. Check the Supabase logs in your dashboard
3. Verify your `.env.local` has the correct values
4. Make sure you ran the database schema SQL

---

Once set up, your library will sync across all devices automatically! 🚀

