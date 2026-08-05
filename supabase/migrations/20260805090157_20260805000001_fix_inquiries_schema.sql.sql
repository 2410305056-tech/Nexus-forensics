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
- `inquiries`: Replaced the single INSERT policy with a proper INSERT-only policy for anon+authenticated.
  Public users can submit inquiries but CANNOT read, update, or delete them (contact form submissions
  are sensitive — only server-side/admin access should read them).
- `ai_chat_logs`: Added INSERT-only policy for anon+authenticated so chat logs can be saved.
  No SELECT/UPDATE/DELETE policies — chat logs are write-only from the public client.

## Important Notes
1. No data is lost — only new columns are added, existing columns are untouched.
2. The INSERT-only approach for inquiries is intentional: contact form submissions contain
   sensitive case details that should not be readable by anonymous clients.
3. The `priority` column has a CHECK constraint to ensure only valid values are stored.
*/