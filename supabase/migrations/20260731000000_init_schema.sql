-- ═══════════════════════════════════════════════════════════
-- NEXUS FORENSICS — schema
-- ═══════════════════════════════════════════════════════════
-- This file replaces the previous migration set, which had three
-- defects that made `supabase db push` unreliable:
--   1. two files both claimed migration version 20260805000001
--   2. ...090157_...sql.sql contained only a comment block, no SQL
--   3. both carried a doubled .sql.sql extension
--
-- The previous Supabase project was deleted, so there is no applied
-- migration history to reconcile against. This is the single source
-- of truth; run it on a fresh project.
--
-- Access model: the browser NEVER talks to Postgres directly. All
-- reads and writes go through the serverless functions in /api,
-- which hold the service_role key. That key bypasses RLS, so no
-- policies are granted to anon or authenticated below.

-- ── Contact form submissions ───────────────────────────────
create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (length(btrim(name)) between 1 and 200),
  email         text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  organization  text check (organization is null or length(organization) <= 200),
  case_type     text check (case_type is null or length(case_type) <= 100),
  priority      text not null default 'standard'
                  check (priority in ('standard', 'high', 'critical')),
  message       text not null check (length(btrim(message)) between 1 and 5000)
);

create index if not exists idx_inquiries_created_at
  on public.inquiries (created_at desc);
create index if not exists idx_inquiries_email
  on public.inquiries (email);

comment on table public.inquiries is
  'Contact form submissions. Written only by /api/inquiries using the service_role key.';

-- ── AI chat logs ───────────────────────────────────────────
-- No code currently reads or writes this table. It is kept so the
-- shape is documented, but it is locked down (see below) so it is
-- not a public write target. Drop it if you decide not to build the
-- chat feature.
create table if not exists public.ai_chat_logs (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  session_id   text,
  user_prompt  text not null,
  ai_response  text not null
);

-- ── Row Level Security ─────────────────────────────────────
alter table public.inquiries   enable row level security;
alter table public.ai_chat_logs enable row level security;

-- Drop the historical policies. The previous schema granted an
-- unbounded INSERT to anon (`with check (true)`) on both tables,
-- which let anyone holding the public anon key fill the database.
drop policy if exists "Allow public form submissions" on public.inquiries;
drop policy if exists "Allow public inserts"         on public.inquiries;
drop policy if exists "anon_insert_inquiries"        on public.inquiries;
drop policy if exists "Allow authenticated users to read" on public.inquiries;
drop policy if exists "Allow admins to read all"     on public.inquiries;
drop policy if exists "anon_insert_chat_logs"        on public.ai_chat_logs;

-- Revoke the leftover grants from the previous migrations.
revoke insert on public.inquiries   from anon, authenticated;
revoke insert on public.ai_chat_logs from anon, authenticated;

-- No policies are created on purpose. anon and authenticated can do
-- nothing; service_role bypasses RLS and is used only server-side.
-- To add an in-app admin view later, create an authenticated role
-- check and a matching SELECT policy rather than re-opening anon.
