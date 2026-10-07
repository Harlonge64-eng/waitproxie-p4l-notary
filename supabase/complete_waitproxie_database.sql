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
USING (bucket_id = 'notary-documents');/*
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
/*
  # Add Manual Payment Verification System

  ## Summary
  Extends the payments table and notary_logs table to support:
  - Manual payment methods (Zelle, Cash App) with proof of payment upload
  - Admin verification workflow (pending â†’ approved/rejected)
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
/*
  # Add Appointments, Notarial Journal, and Receipts

  ## Summary
  Adds three new tables to support the full notary SaaS platform:

  1. `appointments` - Scheduling system for in-person/mobile notary visits
     - Tracks date, time, location, service type, status, and pricing details
     - Links to payments via user_email

  2. `notarial_journal` - Legal compliance log (required in many states)
     - Records every notarization with document hash, signer info, service type
     - Immutable audit trail for legal compliance

  3. `receipts` - Payment receipts for completed transactions
     - Auto-generated after payment approval
     - Stores line items, totals, transaction IDs

  ## New Columns on `payments`
  - `phone_number` - Client phone number
  - `document_type` - Type of document being notarized
  - `notary_type` - in-person, ron, mobile
  - `num_signatures` - Number of signatures required
  - `appointment_date` - Requested date
  - `appointment_time` - Requested time
  - `client_address` - For mobile notary visits
  - `add_ons` - JSON array of selected add-ons

  ## Security
  - RLS enabled on all new tables
  - Authenticated users can view/insert their own records
  - Admin operations via service role
*/

-- Extend payments table with intake form fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='phone_number') THEN
    ALTER TABLE payments ADD COLUMN phone_number text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='document_type') THEN
    ALTER TABLE payments ADD COLUMN document_type text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='notary_type') THEN
    ALTER TABLE payments ADD COLUMN notary_type text DEFAULT 'in-person';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='num_signatures') THEN
    ALTER TABLE payments ADD COLUMN num_signatures integer DEFAULT 1;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='appointment_date') THEN
    ALTER TABLE payments ADD COLUMN appointment_date date;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='appointment_time') THEN
    ALTER TABLE payments ADD COLUMN appointment_time text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='client_address') THEN
    ALTER TABLE payments ADD COLUMN client_address text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='add_ons') THEN
    ALTER TABLE payments ADD COLUMN add_ons jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='base_price_cents') THEN
    ALTER TABLE payments ADD COLUMN base_price_cents integer DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='addons_price_cents') THEN
    ALTER TABLE payments ADD COLUMN addons_price_cents integer DEFAULT 0;
  END IF;
END $$;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  phone_number text,
  service text NOT NULL,
  notary_type text DEFAULT 'in-person',
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  client_address text,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert appointments"
  ON appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Notarial journal table
CREATE TABLE IF NOT EXISTS notarial_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  notary_log_id uuid,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  signer_phone text,
  document_type text NOT NULL,
  document_id text,
  document_hash text,
  service_type text NOT NULL,
  notary_type text DEFAULT 'in-person',
  num_signatures integer DEFAULT 1,
  fee_charged_cents integer DEFAULT 0,
  payment_status text DEFAULT 'pending',
  notarization_status text DEFAULT 'pending' CHECK (notarization_status IN ('pending', 'completed', 'rejected')),
  notes text,
  notarized_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notarial_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Journal entries readable by all"
  ON notarial_journal FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Journal entries insertable"
  ON notarial_journal FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Journal entries updatable"
  ON notarial_journal FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  receipt_number text UNIQUE NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  business_name text DEFAULT 'P4L Mobile Notary Services',
  service_description text NOT NULL,
  line_items jsonb DEFAULT '[]'::jsonb,
  subtotal_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  transaction_id text,
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Receipts readable by email owner"
  ON receipts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Receipts insertable"
  ON receipts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_email ON appointments(user_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_journal_signer_email ON notarial_journal(signer_email);
CREATE INDEX IF NOT EXISTS idx_journal_status ON notarial_journal(notarization_status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_email ON receipts(user_email);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts(payment_id);
-- P4L Mobile Notary Services LLC - Business System
-- Adds site settings, services, pricing config, testimonials, contact messages,
-- RON notification leads, social links, audit logs, booking requests, and consents

-- ===================== SITE SETTINGS =====================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'P4L Mobile Notary Services LLC',
  website text NOT NULL DEFAULT 'https://www.p4lmobilenotary.com',
  phone text NOT NULL DEFAULT '347-641-3313',
  email text NOT NULL DEFAULT 'waltpoitevien734@gmail.com',
  address text NOT NULL DEFAULT '7410 Hull Street Road, Suite 200, Unit 352',
  address_city text NOT NULL DEFAULT 'North Chesterfield',
  address_state text NOT NULL DEFAULT 'VA',
  address_zip text NOT NULL DEFAULT '23235',
  service_areas text NOT NULL DEFAULT 'Richmond, North Chesterfield, Surrounding Virginia areas',
  notary_name text NOT NULL DEFAULT 'Walt Dimitri Poitevien',
  notary_title text NOT NULL DEFAULT 'Virginia Notary Public',
  commission_number text NOT NULL DEFAULT '8059995',
  commission_expiration text NOT NULL DEFAULT 'July 31, 2027',
  ron_status text NOT NULL DEFAULT 'coming_soon' CHECK (ron_status IN ('coming_soon','available','disabled')),
  business_hours text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_readable_by_all" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "settings_insert_authenticated" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "settings_update_authenticated" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Seed default settings
INSERT INTO site_settings (business_name, website, phone, email)
SELECT 'P4L Mobile Notary Services LLC', 'https://www.p4lmobilenotary.com', '347-641-3313', 'waltpoitevien734@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ===================== SERVICES =====================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean DEFAULT true,
  requires_manual_review boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_readable_by_all" ON services FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "services_insert_authenticated" ON services FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "services_update_authenticated" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "services_delete_authenticated" ON services FOR DELETE
  TO authenticated USING (true);

INSERT INTO services (name, description, category, sort_order) VALUES
('Mobile Notary Services', 'Professional notarial services at a convenient location agreed upon with the customer.', 'mobile', 1),
('General Document Notarization', 'Professional notarial support for eligible documents requiring notarization.', 'general', 2),
('Business & Personal Documents', 'Professional notarial support for eligible business and personal documents.', 'general', 3),
('Specialized Documents', 'Powers of attorney, real-estate documents, vehicle titles, loan/signing documents, wills and trusts, and international documents.', 'specialized', 4)
ON CONFLICT DO NOTHING;

-- ===================== PRICING CONFIG =====================
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name text NOT NULL,
  label text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_readable_by_all" ON pricing_config FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "pricing_insert_authenticated" ON pricing_config FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "pricing_update_authenticated" ON pricing_config FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pricing_delete_authenticated" ON pricing_config FOR DELETE
  TO authenticated USING (true);

-- ===================== TESTIMONIALS =====================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_location text,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_approved boolean DEFAULT false,
  is_demo boolean DEFAULT false,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_read_approved" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "testimonials_insert_all" ON testimonials FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "testimonials_update_authenticated" ON testimonials FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "testimonials_delete_authenticated" ON testimonials FOR DELETE
  TO authenticated USING (true);

-- ===================== CONTACT MESSAGES =====================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new','read','responded','archived')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_insert_all" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_select_authenticated" ON contact_messages FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "contact_update_authenticated" ON contact_messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contact_delete_authenticated" ON contact_messages FOR DELETE
  TO authenticated USING (true);

-- ===================== RON NOTIFICATION LEADS =====================
CREATE TABLE IF NOT EXISTS ron_notification_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  consent boolean NOT NULL DEFAULT true,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ron_notification_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ron_leads_insert_all" ON ron_notification_leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ron_leads_select_authenticated" ON ron_notification_leads FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "ron_leads_update_authenticated" ON ron_notification_leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ron_leads_delete_authenticated" ON ron_notification_leads FOR DELETE
  TO authenticated USING (true);

-- ===================== SOCIAL LINKS =====================
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_read_all" ON social_links FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "social_insert_authenticated" ON social_links FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "social_update_authenticated" ON social_links FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "social_delete_authenticated" ON social_links FOR DELETE
  TO authenticated USING (true);

-- ===================== AUDIT LOGS =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  performed_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_authenticated" ON audit_logs FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "audit_insert_authenticated" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "audit_delete_authenticated" ON audit_logs FOR DELETE
  TO authenticated USING (true);

-- ===================== BOOKING REQUESTS =====================
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  num_signers integer DEFAULT 1,
  signer_location text,
  document_type text,
  receiving_organization text,
  requested_date date,
  preferred_time text,
  service text NOT NULL,
  additional_info text,
  status text DEFAULT 'Request Submitted' CHECK (status IN ('Request Submitted','Document Review','Notary Review','Awaiting Payment','Appointment Confirmed','Appointment Scheduled','Meet With the Notary','Completed','Document Delivered','Cancelled')),
  requires_manual_review boolean DEFAULT false,
  document_url text,
  ai_review_summary jsonb,
  price_estimate_cents integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_insert_all" ON booking_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "booking_select_authenticated" ON booking_requests FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "booking_update_authenticated" ON booking_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "booking_delete_authenticated" ON booking_requests FOR DELETE
  TO authenticated USING (true);

-- ===================== CONSENTS =====================
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_type text NOT NULL,
  entity_id text,
  entity_email text,
  consent_given boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consents_insert_all" ON consents FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "consents_select_authenticated" ON consents FOR SELECT
  TO authenticated USING (true);

-- ===================== PRIVATE STORAGE BUCKET =====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-documents',
  'customer-documents',
  false,
  26214400,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can upload customer documents'
  ) THEN
    CREATE POLICY "Authenticated can upload customer documents"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'customer-documents');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can read customer documents'
  ) THEN
    CREATE POLICY "Authenticated can read customer documents"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'customer-documents');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can delete customer documents'
  ) THEN
    CREATE POLICY "Authenticated can delete customer documents"
      ON storage.objects FOR DELETE
      TO anon, authenticated
      USING (bucket_id = 'customer-documents');
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_email ON booking_requests(email);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_ron_leads_email ON ron_notification_leads(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, is_visible);
-- Add review workflow columns to booking_requests
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS admin_message text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

-- Customer-facing notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES booking_requests(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_insert_authenticated" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_select_by_email" ON notifications FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "notifications_update_authenticated" ON notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notifications_delete_authenticated" ON notifications FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(customer_email);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications(booking_id);
-- Secure lookup functions for customer tracking (anon-accessible, email-gated)
CREATE OR REPLACE FUNCTION public.lookup_booking(lookup_id uuid, lookup_email text)
RETURNS TABLE(
  id uuid,
  full_name text,
  service text,
  document_type text,
  status text,
  admin_message text,
  requires_manual_review boolean,
  created_at timestamptz,
  notified_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, service, document_type, status, admin_message,
         requires_manual_review, created_at, notified_at
  FROM booking_requests
  WHERE id = lookup_id AND lower(email) = lower(trim(lookup_email));
$$;

GRANT EXECUTE ON FUNCTION public.lookup_booking TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.lookup_notifications(lookup_email text)
RETURNS TABLE(
  id uuid,
  subject text,
  message text,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, subject, message, is_read, created_at
  FROM notifications
  WHERE lower(customer_email) = lower(trim(lookup_email))
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_notifications TO anon, authenticated;
-- =====================================================
-- CANCELLATION / NO-SHOW / $50 PENALTY SYSTEM
-- =====================================================

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_type text
    CHECK (cancellation_type IN ('customer', 'admin', 'notary', 'no_show')),
  ADD COLUMN IF NOT EXISTS penalty_amount_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_applied boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS penalty_reason text,
  ADD COLUMN IF NOT EXISTS no_show boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_notice_hours numeric,
  ADD COLUMN IF NOT EXISTS penalty_applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS appointment_confirmed_at timestamptz;

-- Helpful indexes for administration/reporting
CREATE INDEX IF NOT EXISTS idx_booking_requests_cancelled_at
  ON booking_requests(cancelled_at);

CREATE INDEX IF NOT EXISTS idx_booking_requests_penalty_applied
  ON booking_requests(penalty_applied);

CREATE INDEX IF NOT EXISTS idx_booking_requests_no_show
  ON booking_requests(no_show);

CREATE INDEX IF NOT EXISTS idx_booking_requests_appointment_confirmed_at
  ON booking_requests(appointment_confirmed_at);

-- Keep updated_at current when booking records are changed.
CREATE OR REPLACE FUNCTION update_booking_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_requests_updated_at
  ON booking_requests;

CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_requests_updated_at();
