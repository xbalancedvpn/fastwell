-- FastWell dedicated Supabase project only.
-- Never execute this in a coaching or other existing app database.
-- Run in a NEW FastWell project after its organization/billing is confirmed.
-- Public-facing client MUST use only the Supabase publishable key.

begin;
create table if not exists public.fastwell_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint fastwell_snapshot_is_object check (jsonb_typeof(snapshot) = 'object'),
  constraint fastwell_snapshot_size_limit check (octet_length(snapshot::text) <= 2097152)
);

alter table public.fastwell_user_data enable row level security;
revoke all on table public.fastwell_user_data from public, anon;
grant select, insert, update, delete on table public.fastwell_user_data to authenticated;

drop policy if exists "fastwell_select_own" on public.fastwell_user_data;
create policy "fastwell_select_own"
  on public.fastwell_user_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "fastwell_insert_own" on public.fastwell_user_data;
create policy "fastwell_insert_own"
  on public.fastwell_user_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "fastwell_update_own" on public.fastwell_user_data;
create policy "fastwell_update_own"
  on public.fastwell_user_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "fastwell_delete_own" on public.fastwell_user_data;
create policy "fastwell_delete_own"
  on public.fastwell_user_data for delete
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.fastwell_user_data is 'Per-account private FastWell offline-first user state. Access is scoped to owner via RLS.';
commit;
