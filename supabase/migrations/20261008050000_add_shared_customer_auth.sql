-- SHARED SUPABASE AUTH: CUSTOMER ACCOUNTS
-- Customers and P4L administrators use the same Supabase Auth system.
-- Existing anonymous booking submission remains supported.

alter table public.booking_requests add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_booking_requests_customer_user_id on public.booking_requests(customer_user_id);

-- Automatically associate authenticated customer submissions with their Auth user.
create or replace function public.set_booking_customer_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  if auth.uid() is not null then
    new.customer_user_id := auth.uid();
  end if;
  return new;
end;
 $func$;

drop trigger if exists set_booking_customer_user_id on public.booking_requests;

create trigger set_booking_customer_user_id
before insert on public.booking_requests
for each row
execute function public.set_booking_customer_user_id();

-- Remove the original unrestricted authenticated policies.
drop policy if exists booking_select_authenticated on public.booking_requests;
drop policy if exists booking_update_authenticated on public.booking_requests;
drop policy if exists booking_delete_authenticated on public.booking_requests;

-- Customers can read their own bookings; P4L admins can read all bookings.
create policy booking_select_authenticated
  on public.booking_requests
  for select
  to authenticated
  using (public.is_p4l_admin() or customer_user_id = auth.uid());

-- Only P4L administrators can update bookings.
create policy booking_update_authenticated
  on public.booking_requests
  for update
  to authenticated
  using (public.is_p4l_admin())
  with check (public.is_p4l_admin());

-- Only P4L administrators can update or delete bookings.
create policy booking_delete_authenticated
  on public.booking_requests
  for delete
  to authenticated
  using (public.is_p4l_admin());




