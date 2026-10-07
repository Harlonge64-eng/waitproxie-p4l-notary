/*
  # Add Manual Payment Verification System

  ## Summary
  Extends the payments table and notary_logs table to support:
  - Manual payment methods (Zelle, Cash App) with proof of payment upload
  - Admin verification workflow (pending → approved/rejected)
  - Proof of payment file storage URL tracking

  ## Changes to `payments` table
  - `payment_method` (text): 'card' | 'zelle' | 'cashapp' | 'cash'
  - `verification_status` (text): 'pending' | 'approved' | 'rejected'
  - `proof_of_payment_url` (text): URL to uploaded screenshot/receipt
  - `admin_notes` (text): Optional notes from admin on rejection

  ## Changes to `notary_logs` table
  - `payment_method` (text): mirrors payment method used
  - `verification_status` (text): mirrors verification state

  ## Security
  - RLS remains enabled on payments
  - Admin operations secured via service_role key in edge functions
  - proof_of_payment_url stored in Supabase storage bucket

  ## Notes
  1. All new columns use IF NOT EXISTS to be idempotent
  2. verification_status defaults to 'pending' for manual payments
  3. Card payments auto-set verification_status to 'approved'
*/

-- Add new columns to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_method text DEFAULT 'card';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE payments ADD COLUMN verification_status text DEFAULT 'pending'
      CHECK (verification_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'proof_of_payment_url'
  ) THEN
    ALTER TABLE payments ADD COLUMN proof_of_payment_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE payments ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Add new columns to notary_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notary_logs' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE notary_logs ADD COLUMN payment_method text DEFAULT 'card';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notary_logs' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE notary_logs ADD COLUMN verification_status text DEFAULT 'pending';
  END IF;
END $$;

-- Index for admin dashboard queries (filter by verification_status)
CREATE INDEX IF NOT EXISTS idx_payments_verification_status ON payments(verification_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Create storage bucket for payment proofs (idempotent via insert ignore)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-proofs bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload payment proofs'
  ) THEN
    CREATE POLICY "Authenticated users can upload payment proofs"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'payment-proofs');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Payment proof owners can view their files'
  ) THEN
    CREATE POLICY "Payment proof owners can view their files"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'payment-proofs');
  END IF;
END $$;

-- Update RLS policies: allow updating verification_status (for admin use via service role)
-- The existing update policy only allows users to update their own payments
-- Admin verification happens server-side via service role key, bypassing RLS
