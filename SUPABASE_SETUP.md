# 🔐 Supabase + Backend Setup — Nexus Forensics

How the contact form reaches the database, and how to stand it up from scratch.

---

## Architecture

```
browser  ──POST /api/inquiries──▶  serverless function  ──service_role──▶  Supabase Postgres
         ◀──201 {ok:true}────────   (api/inquiries.js)                      public.inquiries
```

The browser holds **no database credential**. It talks only to `/api/inquiries`.
The function holds the `service_role` key server-side, which bypasses RLS.

Why: a contact form carrying sensitive case details should not let the public write
to Postgres directly. Routing through the function buys input validation, a honeypot,
throttling, and the ability to lock `anon` out of the database entirely.

---

## 1. Create the Supabase project

1. Go to **https://supabase.com** and sign in
2. **New Project** — name it `Nexus-Forensics`, pick the region closest to your users
3. Save the **database password** somewhere safe

> The previous project (`ylbidjnuxghyzrngehwz`) was deleted — its hostname no longer
> resolves. Nothing can be recovered from it, so treat this as a fresh start.

---

## 2. Apply the schema

There is exactly one migration: `supabase/migrations/20260731000000_init_schema.sql`.

**Option A — automatic, via GitHub Actions (recommended)**

Add the three repository secrets from step 5, then push to `main`. The workflow
`.github/workflows/main.yml` runs `supabase link` and then `supabase db push`.

**Option B — paste into the SQL Editor**

Open the migration file, copy everything, paste into **SQL Editor → New Query → Run**.

**Option C — Supabase CLI locally**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Whichever you pick, verify in **Table Editor** — you should see `inquiries` and
`ai_chat_logs`.

---

## 3. Get credentials

In **Project Settings → API**:

| Value | Goes where | Secret? |
|---|---|---|
| Project URL | `SUPABASE_URL` | no |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **YES — server-side only** |
| `anon` / `publishable` key | not used | — |

The `anon` key is no longer needed anywhere — the frontend does not use the Supabase
SDK at all. **Never** put the `service_role` key in `index.html` or any client-side
file; it bypasses RLS and grants full read/write on your database.

Generate the admin token:

```bash
openssl rand -hex 32
```

---

## 4. Set Vercel environment variables

**Vercel → your project → Settings → Environment Variables.** Add all three for
Production, Preview, and Development:

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
ADMIN_TOKEN=<the random string>
```

Redeploy afterwards — Vercel only injects env vars into new deployments.

---

## 5. Set GitHub Actions secrets

**GitHub → repo → Settings → Secrets and variables → Actions → New repository secret:**

| Secret | Where to get it |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | the `<ref>` in `https://<ref>.supabase.co` |
| `SUPABASE_DB_PASSWORD` | the password from step 1 |

Without all three the workflow fails fast with a clear error instead of silently
doing nothing.

---

## 6. Test it

**Submit (public):**

```bash
curl -i -X POST https://<your-site>/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","case_type":"cyber","priority":"standard","message":"hello"}'
```

Expect `201 {"ok":true}`. A malformed email returns `400`; the sixth submission
within a minute from one IP returns `429`.

**Read back (admin):**

```bash
curl -s "https://<your-site>/api/inquiries?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expect `200 {"data":[...]}`. Without the header: `401`.

**Confirm anon is locked out** — this must never return rows:

```bash
curl -s "https://<ref>.supabase.co/rest/v1/inquiries?select=*" \
  -H "apikey: <anon key>"
```

---

## 7. Reading submissions day to day

Use the **Table Editor** in the Supabase dashboard, or the admin endpoint above.
There is no in-app admin UI. Adding one means creating authenticated users and a
matching `SELECT` policy — *not* re-opening `anon`.

---

## Security model

- `anon` and `authenticated` have **no** policies and **no** grants on either table
- The 60-second / 5-submission throttle is in-memory and per serverless instance.
  It blunts casual abuse but is not a hard guarantee. For real protection put
  hCaptcha or Cloudflare Turnstile in front of the form
- Rate limiting keys off `x-forwarded-for`, which a determined attacker can vary
- The honeypot field (`contact-website`) catches naive bots only
- All input is length-capped and the email format-checked in both the function and
  the database `CHECK` constraints

---

## Troubleshooting

**`500 Server is not configured`** — env vars missing, or the deployment predates
them. Redeploy.

**`502 Could not store submission`** — check the function logs. Usually a wrong
`service_role` key, or a migration that has not been applied.

**`429 Too many submissions`** — throttle tripped. Wait a minute, or raise
`MAX_PER_WINDOW` in `api/inquiries.js`.

**Form shows "Transmission failed"** — open the browser console and Network tab. A
404 means `/api/inquiries` was not deployed: check that `api/inquiries.js` is
committed and that `vercel.json` has no `builds` block forcing static-only output.

**Workflow fails on "Verify required secrets"** — one of the three Actions secrets
is missing.

**`supabase db push` reports nothing to do** — the migration is already applied.
That is success.
