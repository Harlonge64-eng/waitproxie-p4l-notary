-- Production security hardening for financial, appointment, notarial, and P4L-admin-managed tables.

-- APPOINTMENTS: P4L admins only.
DROP POLICY IF EXISTS "Users can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments readable by all" ON public.appointments;
DROP POLICY IF EXISTS "appointments insertable" ON public.appointments;
DROP POLICY IF EXISTS "appointments updatable" ON public.appointments;

CREATE POLICY "appointments_select_p4l_admin"
ON public.appointments FOR SELECT TO authenticated
USING (public.is_p4l_admin());

CREATE POLICY "appointments_insert_p4l_admin"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "appointments_update_p4l_admin"
ON public.appointments FOR UPDATE TO authenticated
USING (public.is_p4l_admin())
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "appointments_delete_p4l_admin"
ON public.appointments FOR DELETE TO authenticated
USING (public.is_p4l_admin());

-- PAYMENTS: financial records are P4L-admin managed.
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;

CREATE POLICY "payments_select_p4l_admin"
ON public.payments FOR SELECT TO authenticated
USING (public.is_p4l_admin());

CREATE POLICY "payments_insert_p4l_admin"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "payments_update_p4l_admin"
ON public.payments FOR UPDATE TO authenticated
USING (public.is_p4l_admin())
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "payments_delete_p4l_admin"
ON public.payments FOR DELETE TO authenticated
USING (public.is_p4l_admin());

-- NOTARIAL JOURNAL: highly sensitive legal records are P4L-admin managed.
DROP POLICY IF EXISTS "Journal entries readable by all" ON public.notarial_journal;
DROP POLICY IF EXISTS "Journal entries insertable" ON public.notarial_journal;
DROP POLICY IF EXISTS "Journal entries updatable" ON public.notarial_journal;

CREATE POLICY "notarial_journal_select_p4l_admin"
ON public.notarial_journal FOR SELECT TO authenticated
USING (public.is_p4l_admin());

CREATE POLICY "notarial_journal_insert_p4l_admin"
ON public.notarial_journal FOR INSERT TO authenticated
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "notarial_journal_update_p4l_admin"
ON public.notarial_journal FOR UPDATE TO authenticated
USING (public.is_p4l_admin())
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "notarial_journal_delete_p4l_admin"
ON public.notarial_journal FOR DELETE TO authenticated
USING (public.is_p4l_admin());

-- RECEIPTS: remove public read/write access.
-- Customer-facing receipt access should use a controlled authenticated workflow.
DROP POLICY IF EXISTS "Receipts readable by email owner" ON public.receipts;
DROP POLICY IF EXISTS "Receipts insertable" ON public.receipts;

CREATE POLICY "receipts_select_p4l_admin"
ON public.receipts FOR SELECT TO authenticated
USING (public.is_p4l_admin());

CREATE POLICY "receipts_insert_p4l_admin"
ON public.receipts FOR INSERT TO authenticated
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "receipts_update_p4l_admin"
ON public.receipts FOR UPDATE TO authenticated
USING (public.is_p4l_admin())
WITH CHECK (public.is_p4l_admin());

CREATE POLICY "receipts_delete_p4l_admin"
ON public.receipts FOR DELETE TO authenticated
USING (public.is_p4l_admin());
