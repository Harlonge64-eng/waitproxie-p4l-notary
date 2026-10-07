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
  ADD COLUMN IF NOT EXISTS penalty_applied_at timestamptz;

-- Helpful indexes for administration/reporting
CREATE INDEX IF NOT EXISTS idx_booking_requests_cancelled_at
  ON booking_requests(cancelled_at);

CREATE INDEX IF NOT EXISTS idx_booking_requests_penalty_applied
  ON booking_requests(penalty_applied);

CREATE INDEX IF NOT EXISTS idx_booking_requests_no_show
  ON booking_requests(no_show);

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