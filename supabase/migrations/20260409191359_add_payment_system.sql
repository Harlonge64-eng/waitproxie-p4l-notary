/*
  # Add Payment System for P4L Notary Services

  ## Overview
  Adds payment tracking and service selection to the notary system.

  ## New Tables
  
  ### `payments`
  Stores all payment transactions for notarization services.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique payment identifier
  - `document_id` (text) - Reference to notarization document
  - `user_email` (text, not null) - Email of customer
  - `user_name` (text, not null) - Full name of customer
  - `service` (text, not null) - Type of service selected
  - `amount_cents` (integer, not null) - Amount paid in cents
  - `stripe_payment_intent_id` (text) - Stripe payment ID
  - `payment_status` (text, not null) - paid/pending/failed
  - `created_at` (timestamptz) - Payment timestamp

  ## Security
  - RLS enabled on payments table
  - Users can only read their own payment records
  - Inserts allowed for authenticated users
  - Updates restricted by payment ownership

  ## Important Notes
  - All prices stored in cents (e.g., $10 = 1000)
  - Payment status must be 'paid' before stamping allowed
  - Document ID links payments to notarization records
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text,
  user_email text NOT NULL,
  user_name text NOT NULL,
  service text NOT NULL,
  amount_cents integer NOT NULL,
  stripe_payment_intent_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_email ON payments(user_email);
CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own payments" ON payments;
  DROP POLICY IF EXISTS "Users can insert payments" ON payments;
  DROP POLICY IF EXISTS "Users can update own payments" ON payments;
END $$;

CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt()->>'email')
  WITH CHECK (user_email = auth.jwt()->>'email');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notary_logs' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE notary_logs ADD COLUMN payment_status text DEFAULT 'unpaid';
    ALTER TABLE notary_logs ADD COLUMN stripe_payment_intent_id text;
  END IF;
END $$;
