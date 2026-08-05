/*
# Fix inquiries table schema and RLS policies

## Problem
The `inquiries` table was created with only 5 columns (id, created_at, name, email, message),
but the contact form collects 6 fields: name, email, organization, case_type, priority, message.
Three columns are missing, so form submissions with those fields would fail.

The `ai_chat_logs` table has RLS enabled but zero policies, making it completely inaccessible.

## Changes

### Modified Tables
- `public.inquiries`: Added 3 new columns:
  - `organization` (text, nullable) — the submitter's company or agency
  - `case_type` (text, nullable) — classification of the case (cyber, corporate, mobile, malware, financial, other)
  - `priority` (text, not null, default 'standard') — priority level (standard, high, critical)

### Security Changes (RLS)
- `inquiries`: INSERT-only policy for anon+authenticated. Public users can submit inquiries
  but CANNOT read, update, or delete them (contact form submissions are sensitive).
- `ai_chat_logs`: INSERT-only policy for anon+authenticated so chat logs can be saved.
  No SELECT/UPDATE/DELETE policies — chat logs are write-only from the public client.

## Important Notes
1. No data is lost — only new columns are added, existing columns are untouched.
2. The INSERT-only approach for inquiries is intentional: contact form submissions contain
   sensitive case details that should not be readable by anonymous clients.
3. The `priority` column has a CHECK constraint to ensure only valid values are stored.
*/

-- Add missing columns to inquiries table
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS case_type text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'high', 'critical'));

-- Fix inquiries RLS: INSERT-only for public submissions
DROP POLICY IF EXISTS "Allow public form submissions" ON public.inquiries;
DROP POLICY IF EXISTS "anon_insert_inquiries" ON public.inquiries;

CREATE POLICY "anon_insert_inquiries"
ON public.inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Fix ai_chat_logs RLS: INSERT-only for logging
DROP POLICY IF EXISTS "anon_insert_chat_logs" ON public.ai_chat_logs;

CREATE POLICY "anon_insert_chat_logs"
ON public.ai_chat_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Grant insert to anon and authenticated
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT INSERT ON public.ai_chat_logs TO anon, authenticated;