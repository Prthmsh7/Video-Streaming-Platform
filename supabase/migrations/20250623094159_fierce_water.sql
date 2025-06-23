/*
  # Add foreign key relationship between videos and profiles

  1. Changes
    - Add foreign key constraint linking videos.user_id to profiles.id
    - This enables direct joins between videos and profiles tables
  
  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity with CASCADE delete
*/

-- Add foreign key constraint between videos.user_id and profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'videos_user_id_profiles_fkey'
    AND table_name = 'videos'
  ) THEN
    ALTER TABLE public.videos
    ADD CONSTRAINT videos_user_id_profiles_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (id)
    ON DELETE CASCADE;
  END IF;
END $$;