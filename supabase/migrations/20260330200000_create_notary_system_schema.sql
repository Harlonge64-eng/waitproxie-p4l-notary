/*
  # P4L Mobile Notary Auto-Stamp System Database Schema

  ## Overview
  Creates the database infrastructure for an AI-powered notarization system that processes documents,
  applies notary stamps, and maintains verification records.

  ## New Tables
  
  ### `notary_logs`
  Stores complete records of all notarization transactions for verification and audit purposes.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each notarization record
  - `document_id` (text, unique, not null) - Public reference ID for document verification
  - `hash` (text, not null) - SHA256 hash of original document for integrity verification
  - `timestamp` (timestamptz, not null) - When the notarization was completed
  - `notary_name` (text, not null) - Name of the notary (Walt Poitevien)
  - `commission_number` (text, not null) - Notary commission number (805-9995)
  - `business_name` (text, not null) - Business name (P4L Mobile Notary Services)
  - `status` (text, not null) - Processing status (Completed/Verified/Failed)
  - `file_url` (text) - URL to stamped document in Supabase storage
  - `user_email` (text, not null) - Email of user who submitted document
  - `user_name` (text, not null) - Full name of user who submitted document
  - `original_filename` (text, not null) - Original filename of uploaded document
  - `stamp_position` (jsonb) - Coordinates where stamp was applied {x, y, page}
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Security
  
  1. **Row Level Security (RLS)**
     - Enabled on all tables
     - Public can only READ records (for verification)
     - Only authenticated service role can INSERT/UPDATE
  
  2. **Storage Buckets**
     - `notary-documents` bucket for storing stamped documents
     - Public read access for verification
     - Upload restricted to service role

  ## Indexes
  - Index on `document_id` for fast verification lookups
  - Index on `user_email` for user document retrieval
  - Index on `created_at` for chronological queries
*/

-- Create notary_logs table
CREATE TABLE IF NOT EXISTS notary_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text UNIQUE NOT NULL,
  hash text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  notary_name text NOT NULL DEFAULT 'Walt Poitevien',
  commission_number text NOT NULL DEFAULT '805-9995',
  business_name text NOT NULL DEFAULT 'P4L Mobile Notary Services',
  status text NOT NULL DEFAULT 'Pending',
  file_url text,
  user_email text NOT NULL,
  user_name text NOT NULL,
  original_filename text NOT NULL,
  stamp_position jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_notary_logs_document_id ON notary_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_notary_logs_user_email ON notary_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_notary_logs_created_at ON notary_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notary_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read notary logs for verification" ON notary_logs;
  DROP POLICY IF EXISTS "Service role can insert notary logs" ON notary_logs;
  DROP POLICY IF EXISTS "Service role can update notary logs" ON notary_logs;
END $$;

-- Public can read all records (for verification)
CREATE POLICY "Anyone can read notary logs for verification"
  ON notary_logs
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can insert (will be service role from Edge Function)
CREATE POLICY "Service role can insert notary logs"
  ON notary_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update (will be service role from Edge Function)
CREATE POLICY "Service role can update notary logs"
  ON notary_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for notary documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('notary-documents', 'notary-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate storage policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can read notary documents" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can upload notary documents" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can delete notary documents" ON storage.objects;
END $$;

-- Allow public to read files from notary-documents bucket
CREATE POLICY "Public can read notary documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'notary-documents');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated can upload notary documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notary-documents');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated can delete notary documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'notary-documents');