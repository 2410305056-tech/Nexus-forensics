-- Enable pgcrypto extension for UUIDs
create extension if not exists pgcrypto;

-- Create Contact Form table
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text not null,
  organization text,
  case_type text,
  priority text not null default 'standard' check (priority in ('standard', 'high', 'critical')),
  message text not null
);

-- Create AI Chat Logs table
create table if not exists public.ai_chat_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  session_id text,
  user_prompt text not null,
  ai_response text not null
);

-- Enable Row Level Security (RLS)
alter table public.inquiries enable row level security;
alter table public.ai_chat_logs enable row level security;

-- Allow public (anon) to submit inquiries but not read them (sensitive case data)
drop policy if exists "Allow public form submissions" on public.inquiries;
create policy "anon_insert_inquiries"
on public.inquiries for insert
to anon, authenticated
with check (true);

-- Allow logging chat sessions but not reading them back
drop policy if exists "anon_insert_chat_logs" on public.ai_chat_logs;
create policy "anon_insert_chat_logs"
on public.ai_chat_logs for insert
to anon, authenticated
with check (true);

-- Grant insert permissions
grant insert on public.inquiries to anon, authenticated;
grant insert on public.ai_chat_logs to anon, authenticated;
