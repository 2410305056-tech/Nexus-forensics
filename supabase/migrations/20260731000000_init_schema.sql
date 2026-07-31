-- Enable pgcrypto extension for UUIDs
create extension if not exists pgcrypto;

-- Create Contact Form table
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text not null,
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

-- Set permissions for public contact form entries
grant insert on public.inquiries to anon;

drop policy if exists "Allow public form submissions" on public.inquiries;
create policy "Allow public form submissions" 
on public.inquiries 
for insert 
to anon 
with check (true);
