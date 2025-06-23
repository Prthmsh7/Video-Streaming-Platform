/*
  # Add Filecoin storage fields to videos table

  1. New Columns
    - `filecoin_cid` (text) - Content Identifier for Filecoin storage
    - `filecoin_deal_id` (text) - Filecoin storage deal identifier
    - `storage_provider` (text) - Filecoin storage provider address
    - `file_size` (bigint) - File size in bytes
    - `storage_status` (text) - Status of Filecoin storage deal

  2. Indexes
    - Add index on `filecoin_cid` for efficient lookups
    - Add index on `storage_status` for filtering by status

  3. Notes
    - These fields support the FilCDN integration for hackathon requirements
    - Enables tracking of decentralized storage deals and content retrieval
*/

-- Add Filecoin-related columns to videos table
DO $$
BEGIN
  -- Add filecoin_cid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'filecoin_cid'
  ) THEN
    ALTER TABLE videos ADD COLUMN filecoin_cid text;
  END IF;

  -- Add filecoin_deal_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'filecoin_deal_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN filecoin_deal_id text;
  END IF;

  -- Add storage_provider column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'storage_provider'
  ) THEN
    ALTER TABLE videos ADD COLUMN storage_provider text;
  END IF;

  -- Add file_size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE videos ADD COLUMN file_size bigint DEFAULT 0;
  END IF;

  -- Add storage_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'storage_status'
  ) THEN
    ALTER TABLE videos ADD COLUMN storage_status text DEFAULT 'pending';
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_videos_filecoin_cid ON videos(filecoin_cid);
CREATE INDEX IF NOT EXISTS idx_videos_storage_status ON videos(storage_status);

-- Add comments for documentation
COMMENT ON COLUMN videos.filecoin_cid IS 'Content Identifier (CID) for Filecoin storage';
COMMENT ON COLUMN videos.filecoin_deal_id IS 'Filecoin storage deal identifier';
COMMENT ON COLUMN videos.storage_provider IS 'Filecoin storage provider address';
COMMENT ON COLUMN videos.file_size IS 'File size in bytes';
COMMENT ON COLUMN videos.storage_status IS 'Status of Filecoin storage deal (pending, active, completed, failed)';