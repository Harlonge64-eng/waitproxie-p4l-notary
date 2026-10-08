CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS customer_reference_id text;

UPDATE public.booking_requests SET customer_reference_id=upper(substr(md5(random()::text),1,8)) WHERE customer_reference_id IS NULL;

ALTER TABLE public.booking_requests ALTER COLUMN customer_reference_id SET DEFAULT upper(substr(md5(random()::text),1,8));
ALTER TABLE public.booking_requests ALTER COLUMN customer_reference_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_requests_customer_reference_id ON public.booking_requests(customer_reference_id);

COMMENT ON COLUMN public.booking_requests.customer_reference_id IS 'Customer-facing 8-character booking reference. Never expose the internal booking UUID.';

DROP FUNCTION IF EXISTS public.lookup_booking(text,text);

CREATE FUNCTION public.lookup_booking(lookup_id text,lookup_email text)
RETURNS TABLE(id uuid,customer_reference_id text,full_name text,service text,document_type text,status text,admin_message text,requires_manual_review boolean,created_at timestamptz,notified_at timestamptz,cancelled_at timestamptz,cancellation_reason text,cancellation_type text,penalty_amount_cents integer,penalty_applied boolean,penalty_reason text,no_show boolean,cancellation_notice_hours numeric,penalty_applied_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT br.id,br.customer_reference_id,br.full_name,br.service,br.document_type,br.status,br.admin_message,br.requires_manual_review,br.created_at,br.notified_at,br.cancelled_at,br.cancellation_reason,br.cancellation_type,br.penalty_amount_cents,br.penalty_applied,br.penalty_reason,br.no_show,br.cancellation_notice_hours,br.penalty_applied_at FROM public.booking_requests br WHERE lower(br.email)=lower(trim(lookup_email)) AND lower(trim(lookup_id))=lower(br.customer_reference_id) LIMIT 1; $$;

GRANT EXECUTE ON FUNCTION public.lookup_booking(text,text) TO anon,authenticated;
