ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS appointment_confirmed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_booking_requests_appointment_confirmed_at
  ON public.booking_requests(appointment_confirmed_at);