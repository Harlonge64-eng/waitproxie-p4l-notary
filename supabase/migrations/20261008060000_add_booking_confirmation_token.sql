-- Secure one-time confirmation token for anonymous booking email delivery.
-- The raw token is never stored in the database.

create extension if not exists pgcrypto;

alter table public.booking_requests add column if not exists confirmation_token_hash text, add column if not exists confirmation_token_expires_at timestamptz, add column if not exists confirmation_token_used_at timestamptz;

create index if not exists idx_booking_requests_confirmation_token_hash on public.booking_requests(confirmation_token_hash);

comment on column public.booking_requests.confirmation_token_hash is 'SHA-256 hash of the one-time token used to authorize the initial booking confirmation email.';
comment on column public.booking_requests.confirmation_token_expires_at is 'Expiration time for the one-time booking confirmation token.';
comment on column public.booking_requests.confirmation_token_used_at is 'Timestamp when the one-time booking confirmation token was consumed.';

-- Atomically validate and consume a booking confirmation token.
create or replace function public.consume_booking_confirmation_token(p_booking_id uuid, p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  consumed boolean := false;
begin
  update public.booking_requests
  set confirmation_token_used_at = now()
  where id = p_booking_id
    and confirmation_token_hash = p_token_hash
    and confirmation_token_used_at is null
    and confirmation_token_expires_at is not null
    and confirmation_token_expires_at > now();

  consumed := found;
  return consumed;
end;
$func$;

revoke all on function public.consume_booking_confirmation_token(uuid, text) from public, anon, authenticated;

grant execute on function public.consume_booking_confirmation_token(uuid, text) to service_role;
