# Profile Feature Setup Guide

This guide will help you complete the setup for the user profile editing feature.

## What's Been Implemented

✅ **Profile Editing UI** - Complete interface for editing user profiles
✅ **Database Schema** - Migration to add `bio`, `avatar_url`, and `last_active_at` fields
✅ **Supabase Integration** - Full integration with Supabase for data persistence
✅ **Avatar Upload** - Image upload functionality with Supabase Storage
✅ **Password Change** - Secure password update through Supabase Auth
✅ **Auto-save** - All changes persist to the database immediately

## Features

- **Edit Profile Information**:
  - Username (updates in database)
  - Biography (up to 200 characters)
  - Profile picture (image upload with preview)
  - Password (optional, requires current password)

- **View Profile**:
  - Avatar image display
  - ELO rating
  - Games played, wins, losses, draws
  - Win rate percentage
  - Biography

- **Click to View Other Players**:
  - Click on any friend to view their full profile
  - See their stats, recent games, and bio

## Setup Steps

### 1. Run Database Migration

First, apply the migration to add the new profile fields:

```bash
# If using Supabase CLI
npx supabase db push

# Or manually run the migration in Supabase SQL Editor:
# Copy and paste the contents of:
# supabase/migrations/20240101000009_add_profile_fields.sql
```

This adds:
- `bio` (TEXT) - User biography
- `avatar_url` (TEXT) - URL to profile picture
- `last_active_at` (TIMESTAMPTZ) - Last activity timestamp

### 2. Create Storage Bucket

In your Supabase Dashboard:

1. Go to **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Configure:
   - Name: `avatars`
   - Public: **Yes** (enable public access)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### 3. Set Up Storage Policies

Run the storage policy SQL in the Supabase SQL Editor:

```bash
# Copy and paste the contents of:
# scripts/010_setup_storage_policies.sql
```

Or manually create these policies in Storage > Policies:
- Public read access for all avatar images
- Authenticated users can upload their avatars
- Authenticated users can update their avatars  
- Authenticated users can delete their avatars

See `scripts/setup_storage.md` for detailed policy configurations.

### 4. Test the Feature

1. Navigate to `/players` in your app
2. Click **"Edit Profile"**
3. Update your information:
   - Upload a profile picture
   - Change your username
   - Add a biography
   - Optionally change your password
4. Click **"Save Changes"**
5. Verify changes persist after page refresh

## How It Works

### Data Flow

1. **Loading**: On page load, the app fetches the current user's profile from Supabase
2. **Editing**: User clicks "Edit Profile" and makes changes in the dialog
3. **Avatar Upload**: If a new image is selected:
   - Old avatar is deleted from storage (if exists)
   - New image is uploaded to `avatars/avatars/` folder
   - Public URL is generated and saved to database
4. **Saving**: Profile updates are saved to the `profiles` table
5. **Password**: If password is changed, Supabase Auth handles the update securely
6. **Persistence**: All changes are immediately reflected in the database

### Security

- ✅ Row Level Security (RLS) ensures users can only edit their own profiles
- ✅ Password updates require current password verification
- ✅ Avatar uploads are limited to authenticated users
- ✅ File type and size validation on upload
- ✅ Old avatars are automatically cleaned up

## Files Modified/Created

### New Files
- `supabase/migrations/20240101000009_add_profile_fields.sql` - Database migration
- `scripts/009_add_profile_fields.sql` - Backup migration script
- `scripts/010_setup_storage_policies.sql` - Storage policies
- `scripts/setup_storage.md` - Storage setup documentation
- `PROFILE_SETUP.md` - This file

### Modified Files
- `app/players/page.tsx` - Updated to use Supabase (fetch & save)
- `app/players/[id]/page.tsx` - Uses dummy data for now
- `components/player-profile-client.tsx` - Enhanced to show avatar and bio

## Troubleshooting

### "Failed to load profile"
- Check that the migration has been applied
- Verify user is logged in
- Check browser console for errors

### "Failed to save profile"
- Ensure storage bucket `avatars` exists
- Verify storage policies are set up correctly
- Check that the user is authenticated

### Avatar not uploading
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, GIF, WebP only)
- Ensure storage bucket is public
- Check storage policies allow authenticated uploads

### Password not changing
- Verify current password is correct
- Ensure new passwords match
- Check Supabase Auth settings

## Next Steps

After completing the setup:

1. **Test thoroughly** - Try all features with different users
2. **Integrate friends list** - Connect to real friend data from database
3. **Add validation** - Username uniqueness, profanity filters, etc.
4. **Image optimization** - Resize/compress avatars before upload
5. **Loading states** - Add skeleton loaders for better UX

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review browser console errors
- Verify RLS policies in Supabase
- Check storage bucket configuration

