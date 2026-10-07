-- P4L ADMIN AUTHORIZATION AND RLS SECURITY

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_p4l_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_p4l_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_p4l_admin() TO authenticated;

-- admin_users is intentionally not directly readable by normal clients.

DROP POLICY IF EXISTS "settings_insert_authenticated" ON public.site_settings;
DROP POLICY IF EXISTS "settings_update_authenticated" ON public.site_settings;
CREATE POLICY "settings_insert_p4l_admin" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_p4l_admin());
CREATE POLICY "settings_update_p4l_admin" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_p4l_admin())
  WITH CHECK (public.is_p4l_admin());

DROP POLICY IF EXISTS "services_insert_authenticated" ON public.services;
DROP POLICY IF EXISTS "services_update_authenticated" ON public.services;
DROP POLICY IF EXISTS "services_delete_authenticated" ON public.services;
CREATE POLICY "services_insert_p4l_admin" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.is_p4l_admin());
CREATE POLICY "services_update_p4l_admin" ON public.services
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "services_delete_p4l_admin" ON public.services
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "pricing_insert_authenticated" ON public.pricing_config;
DROP POLICY IF EXISTS "pricing_update_authenticated" ON public.pricing_config;
DROP POLICY IF EXISTS "pricing_delete_authenticated" ON public.pricing_config;
CREATE POLICY "pricing_insert_p4l_admin" ON public.pricing_config
  FOR INSERT TO authenticated WITH CHECK (public.is_p4l_admin());
CREATE POLICY "pricing_update_p4l_admin" ON public.pricing_config
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "pricing_delete_p4l_admin" ON public.pricing_config
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "testimonials_update_authenticated" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_delete_authenticated" ON public.testimonials;
CREATE POLICY "testimonials_update_p4l_admin" ON public.testimonials
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "testimonials_delete_p4l_admin" ON public.testimonials
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "contact_select_authenticated" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_update_authenticated" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_delete_authenticated" ON public.contact_messages;
CREATE POLICY "contact_select_p4l_admin" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_p4l_admin());
CREATE POLICY "contact_update_p4l_admin" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "contact_delete_p4l_admin" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "ron_leads_select_authenticated" ON public.ron_notification_leads;
DROP POLICY IF EXISTS "ron_leads_update_authenticated" ON public.ron_notification_leads;
DROP POLICY IF EXISTS "ron_leads_delete_authenticated" ON public.ron_notification_leads;
CREATE POLICY "ron_leads_select_p4l_admin" ON public.ron_notification_leads
  FOR SELECT TO authenticated USING (public.is_p4l_admin());
CREATE POLICY "ron_leads_update_p4l_admin" ON public.ron_notification_leads
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "ron_leads_delete_p4l_admin" ON public.ron_notification_leads
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "social_insert_authenticated" ON public.social_links;
DROP POLICY IF EXISTS "social_update_authenticated" ON public.social_links;
DROP POLICY IF EXISTS "social_delete_authenticated" ON public.social_links;
CREATE POLICY "social_insert_p4l_admin" ON public.social_links
  FOR INSERT TO authenticated WITH CHECK (public.is_p4l_admin());
CREATE POLICY "social_update_p4l_admin" ON public.social_links
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "social_delete_p4l_admin" ON public.social_links
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "audit_select_authenticated" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert_authenticated" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_delete_authenticated" ON public.audit_logs;
CREATE POLICY "audit_select_p4l_admin" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_p4l_admin());
CREATE POLICY "audit_insert_p4l_admin" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_p4l_admin());
CREATE POLICY "audit_delete_p4l_admin" ON public.audit_logs
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "booking_select_authenticated" ON public.booking_requests;
DROP POLICY IF EXISTS "booking_update_authenticated" ON public.booking_requests;
DROP POLICY IF EXISTS "booking_delete_authenticated" ON public.booking_requests;
CREATE POLICY "booking_select_p4l_admin" ON public.booking_requests
  FOR SELECT TO authenticated USING (public.is_p4l_admin());
CREATE POLICY "booking_update_p4l_admin" ON public.booking_requests
  FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "booking_delete_p4l_admin" ON public.booking_requests
  FOR DELETE TO authenticated USING (public.is_p4l_admin());

DROP POLICY IF EXISTS "consents_select_authenticated" ON public.consents;
CREATE POLICY "consents_select_p4l_admin" ON public.consents
  FOR SELECT TO authenticated USING (public.is_p4l_admin());

-- Customer documents remain uploadable by the public booking workflow,
-- but only approved P4L administrators can read them.
DROP POLICY IF EXISTS "Authenticated can read customer documents" ON storage.objects;
CREATE POLICY "P4L admins can read customer documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'customer-documents'
    AND public.is_p4l_admin()
  );



-- Notifications are managed only by approved P4L administrators.
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_authenticated" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_authenticated" ON public.notifications;
CREATE POLICY "notifications_insert_p4l_admin" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_p4l_admin());
CREATE POLICY "notifications_update_p4l_admin" ON public.notifications FOR UPDATE TO authenticated USING (public.is_p4l_admin()) WITH CHECK (public.is_p4l_admin());
CREATE POLICY "notifications_delete_p4l_admin" ON public.notifications FOR DELETE TO authenticated USING (public.is_p4l_admin());


-- Notifications must not be directly readable; customer access is through lookup_notifications().
DROP POLICY IF EXISTS "notifications_select_by_email" ON public.notifications;
CREATE POLICY "notifications_select_p4l_admin" ON public.notifications FOR SELECT TO authenticated USING (public.is_p4l_admin());
