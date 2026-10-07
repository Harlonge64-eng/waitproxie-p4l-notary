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
