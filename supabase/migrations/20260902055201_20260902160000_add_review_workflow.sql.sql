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
