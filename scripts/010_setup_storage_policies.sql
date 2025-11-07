-- Storage policies for avatars bucket
-- Note: The bucket must be created manually in the Supabase dashboard first
-- Go to Storage > Create bucket > Name: "avatars", Public: Yes

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Policy 1: Public read access for avatar images
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Policy 3: Authenticated users can update avatars
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

-- Policy 4: Authenticated users can delete avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

