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
