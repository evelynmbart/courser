# Supabase Storage Setup

This document describes how to set up the required storage buckets for the application.

## Avatars Storage Bucket

The application requires an `avatars` storage bucket for user profile pictures.

### Manual Setup (via Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Use the following settings:
   - **Bucket name**: `avatars`
   - **Public bucket**: Enable (so avatar images can be accessed publicly)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### Storage Policies

After creating the bucket, set up the following policies:

#### 1. Public Read Access
Allow anyone to view avatar images:

```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

#### 2. Authenticated Upload
Allow authenticated users to upload their own avatars:

```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);
```

#### 3. Authenticated Update
Allow users to update their own avatars:

```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

#### 4. Authenticated Delete
Allow users to delete their own avatars:

```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

## Verification

To verify the setup:

1. Try uploading an avatar through the profile edit form
2. Check that the image appears in the Supabase Storage dashboard under `avatars/avatars/`
3. Verify that the avatar URL is accessible in a browser
4. Try updating the avatar to ensure old ones are deleted

## Troubleshooting

**Error: "Bucket not found"**
- Make sure you've created the `avatars` bucket in Supabase Storage

**Error: "Permission denied"**
- Check that you've set up the storage policies correctly
- Verify that the user is authenticated

**Avatar not displaying**
- Make sure the bucket is set to "Public"
- Check that the URL is correct in the database
- Verify CORS settings if accessing from a different domain

