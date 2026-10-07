-- =====================================================
-- FIX CUSTOMER BOOKING REFERENCE LOOKUP
-- Allows the 8-character customer reference to be used
-- while keeping the internal UUID unchanged.
-- =====================================================

DROP FUNCTION IF EXISTS public.lookup_booking(uuid, text);
DROP FUNCTION IF EXISTS public.lookup_booking(text, text);

CREATE FUNCTION public.lookup_booking(
  lookup_id text,
  lookup_email text
)
RETURNS TABLE(
  id uuid,
  full_name text,
  service text,
  document_type text,
  status text,
  admin_message text,
  requires_manual_review boolean,
  created_at timestamptz,
  notified_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  cancellation_type text,
  penalty_amount_cents integer,
  penalty_applied boolean,
  penalty_reason text,
  no_show boolean,
  cancellation_notice_hours numeric,
  penalty_applied_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    br.id,
    br.full_name,
    br.service,
    br.document_type,
    br.status,
    br.admin_message,
    br.requires_manual_review,
    br.created_at,
    br.notified_at,
    br.cancelled_at,
    br.cancellation_reason,
    br.cancellation_type,
    br.penalty_amount_cents,
    br.penalty_applied,
    br.penalty_reason,
    br.no_show,
    br.cancellation_notice_hours,
    br.penalty_applied_at
  FROM booking_requests br
  WHERE lower(br.email) = lower(trim(lookup_email))
    AND (
      lower(trim(lookup_id)) = lower(br.id::text)
      OR lower(left(br.id::text, 8)) = lower(trim(lookup_id))
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_booking(text, text)
TO anon, authenticated;