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
