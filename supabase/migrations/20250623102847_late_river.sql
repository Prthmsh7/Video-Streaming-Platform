/*
  # Create Storage Buckets for Video Platform

  1. New Storage Buckets
    - `videos` - For storing uploaded video files
    - `thumbnails` - For storing video thumbnail images

  2. Security & Access
    - Both buckets allow public access for viewing content
    - Only authenticated users can upload files
    - Users can only delete their own files
    - Proper file size and type restrictions

  3. Configuration
    - Videos bucket: 500MB file size limit, video file types only
    - Thumbnails bucket: 10MB file size limit, image file types only
*/

-- Create videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000, -- 500MB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
-- Allow public viewing of videos
CREATE POLICY "Public can view videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for thumbnails bucket
-- Allow public viewing of thumbnails
CREATE POLICY "Public can view thumbnails"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own thumbnails
CREATE POLICY "Users can update own thumbnails"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own thumbnails
CREATE POLICY "Users can delete own thumbnails"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );