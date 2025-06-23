# Supabase Setup Guide for Video Streaming Platform

## 🚀 Step-by-Step Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with GitHub/Google
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - **Name**: `video-streaming-platform`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
7. Click "Create new project"
8. Wait for project to be ready (2-3 minutes)

### 2. Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

### 3. Configure Environment Variables
1. In your project, click "Connect to Supabase" button in the top right
2. Enter your Project URL and Anon Key
3. Or manually create `.env` file with:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Set Up Database Schema
The migration files are already created. In Supabase dashboard:
1. Go to **SQL Editor**
2. Click "New query"
3. Copy the content from `supabase/migrations/20250623090112_wild_pebble.sql`
4. Paste and click "Run"
5. Copy the content from `supabase/migrations/add_videos_profiles_relationship.sql`
6. Paste and click "Run"
7. Verify tables are created in **Table Editor**

### 5. Configure Storage Buckets
1. Go to **Storage** in Supabase dashboard
2. Create two buckets:

**Videos Bucket:**
- Name: `videos`
- Public: ✅ Yes
- File size limit: 100MB
- Allowed MIME types: `video/*`

**Thumbnails Bucket:**
- Name: `thumbnails` 
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/*`

### 6. Set Up Authentication
1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:5173` (for development)
3. **Email confirmation**: Disable for testing
4. **Email templates**: Customize if needed

### 7. Set Up Storage Policies
In **SQL Editor**, run these policies:

```sql
-- Videos bucket policies
CREATE POLICY "Anyone can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Thumbnails bucket policies  
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own thumbnails" ON storage.objects
FOR UPDATE USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 8. Test the Setup
1. Start your development server: `npm run dev`
2. Open the application
3. Try signing up with a test account
4. Upload a test video
5. Check if data appears in Supabase dashboard

## 🔧 Troubleshooting

### Common Issues:

**Environment Variables Not Loading:**
- Restart your dev server after adding `.env`
- Check variable names start with `VITE_`

**Upload Errors:**
- Verify storage buckets are created and public
- Check storage policies are applied
- Ensure file size limits are appropriate

**Authentication Issues:**
- Verify Site URL matches your development URL
- Check if email confirmation is disabled for testing
- Ensure RLS policies allow user operations

**Database Errors:**
- Verify all migration SQL has been executed
- Check table permissions in Table Editor
- Ensure RLS is enabled on all tables

**Video-Profile Relationship Errors:**
- Ensure both migration files have been run
- Verify foreign key constraint exists between videos.user_id and profiles.id
- Check that profiles are created for all users

## 📊 Verify Setup

### Check These in Supabase Dashboard:

**Tables Created:**
- ✅ profiles
- ✅ videos  
- ✅ comments
- ✅ video_likes
- ✅ investments
- ✅ subscriptions

**Foreign Key Relationships:**
- ✅ videos.user_id → users.id
- ✅ videos.user_id → profiles.id (added by migration)
- ✅ profiles.id → users.id

**Storage Buckets:**
- ✅ videos (public)
- ✅ thumbnails (public)

**Authentication:**
- ✅ Email/Password enabled
- ✅ Site URL configured

## 🎯 Next Steps

Once setup is complete:
1. **Test user registration** and profile creation
2. **Upload a test video** with thumbnail
3. **Try commenting** and liking videos
4. **Test investment functionality**
5. **Verify subscription system**

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase dashboard for data
3. Check network tab for failed requests
4. Ensure all environment variables are set
5. Verify all migration files have been executed

Your video streaming platform will be fully functional once this setup is complete!