# 🔐 SUPABASE SETUP PROTOCOL — Nexus Forensics

Complete step-by-step guide to integrate Supabase with your Nexus Forensics contact form.

---

## **📋 TABLE OF CONTENTS**

1. [Supabase Account Setup](#1-supabase-account-setup)
2. [Create Database Tables](#2-create-database-tables)
3. [Configure Row Level Security (RLS)](#3-configure-row-level-security-rls)
4. [Get API Keys](#4-get-api-keys)
5. [Update Frontend Code](#5-update-frontend-code)
6. [Test Integration](#6-test-integration)
7. [Troubleshooting](#7-troubleshooting)

---

## **1. SUPABASE ACCOUNT SETUP**

### **Step 1A: Create Supabase Account**
1. Go to **https://supabase.com**
2. Click **"Sign Up"**
3. Use your email (recommended: `ops@nexusforensics.io`)
4. Verify email
5. Create password

### **Step 1B: Create New Project**
1. Click **"New Project"**
2. **Project name:** `Nexus-Forensics`
3. **Database password:** Save this securely! ⚠️
4. **Region:** Choose closest to your users (e.g., `us-east-1`)
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

---

## **2. CREATE DATABASE TABLES**

### ⚠️ **IMPORTANT: FIRST, DROP OLD TABLE (IF EXISTS)**

Go to **SQL Editor** and run:

```sql
-- Drop old incomplete table if it exists
DROP TABLE IF EXISTS public.inquiries CASCADE;
```

### **Step 2A: Open SQL Editor**
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy & paste the SQL below:

```sql
-- ═══════════════════════════════════════════════════════════
-- NEXUS FORENSICS — CONTACT FORM TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  case_type TEXT,
  priority TEXT DEFAULT 'standard',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at);

-- Add comments
COMMENT ON TABLE public.inquiries IS 'Contact form submissions from Nexus Forensics website';
COMMENT ON COLUMN public.inquiries.priority IS 'Priority level: standard, high, critical';
COMMENT ON COLUMN public.inquiries.case_type IS 'Type of investigation case';
```

4. Click **"Run"** (blue button)
5. Success! ✅ Table created

---

## **3. CONFIGURE ROW LEVEL SECURITY (RLS)**

### **Step 3A: Enable RLS and Add Policies**

Run this SQL in the SQL Editor:

```sql
-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY SETUP
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on inquiries table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone (anonymous) to INSERT
CREATE POLICY "Allow public inserts" ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to READ their own submissions
CREATE POLICY "Allow authenticated users to read" ON public.inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 3: Allow admins to read all
CREATE POLICY "Allow admins to read all" ON public.inquiries
  FOR SELECT
  USING (auth.role() = 'service_role');
```

Click **"Run"**. Done! ✅

---

## **4. GET API KEYS**

### **Step 4A: Find Your Project URL**
1. Click **"Project Settings"** (bottom left gear icon)
2. Click **"API"** tab
3. Copy **"Project URL"** (looks like: `https://xxxxx.supabase.co`)
4. Save this as `SUPABASE_URL`

### **Step 4B: Get Your Anon Key**
1. In same **"API"** tab
2. Find section **"Project API keys"**
3. Copy the key labeled **"anon public"** (starts with `eyJh...`)
4. Save this as `SUPABASE_ANON_KEY`

⚠️ **IMPORTANT:** Keep these secret! Add to `.env` or `.env.local` file

---

## **5. UPDATE FRONTEND CODE**

### **Step 5A: Add Supabase Script to index.html**

Find line **20** in `index.html`:
```html
<link rel="icon" type="image/png" href="icons/icon-192.png">
```

Add this AFTER line 20:
```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### **Step 5B: Update script.js with Supabase Config**

Add this at the **TOP of script.js** (before line 1):

```javascript
// ═══════════════════════════════════════════════════════════
// SUPABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════

// TODO: Replace with your actual keys from Supabase dashboard
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✓ Supabase initialized');
```

### **Step 5C: Replace Contact Form Handler**

Find this section in `script.js` (around line 504-534):

```javascript
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // OLD CODE HERE
    });
}
```

**Replace entire block with:**

```javascript
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submit-btn');
        const btnText = btn.querySelector('.btn-text');
        const original = btnText.textContent;
        
        // Collect form data
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const org = document.getElementById('contact-org').value.trim();
        const type = document.getElementById('contact-type').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        const message = document.getElementById('contact-message').value.trim();
        
        // Validation
        if (!name || !email || !type || !message) {
            alert('❌ Please fill all required fields');
            return;
        }
        
        btnText.textContent = 'ENCRYPTING...';
        btn.style.pointerEvents = 'none';
        
        try {
            // Insert into Supabase
            const { data, error } = await supabase
                .from('inquiries')
                .insert([
                    {
                        name: name,
                        email: email,
                        organization: org || null,
                        case_type: type,
                        priority: priority,
                        message: message
                    }
                ]);
            
            if (error) {
                console.error('❌ Supabase error:', error);
                btnText.textContent = '✗ FAILED';
                btn.style.background = 'rgba(255, 51, 102, 0.15)';
                btn.style.color = '#ff3366';
                setTimeout(() => {
                    btnText.textContent = original;
                    btn.style.pointerEvents = '';
                    btn.style.background = '';
                    btn.style.color = '';
                }, 3000);
                return;
            }
            
            // Success animation
            btnText.textContent = 'TRANSMITTING...';
            setTimeout(() => {
                btnText.textContent = '✓ TRANSMISSION COMPLETE';
                btn.style.background = 'rgba(0, 255, 136, 0.15)';
                btn.style.color = '#00ff88';
                btn.style.border = '1px solid rgba(0, 255, 136, 0.3)';
                
                setTimeout(() => {
                    btnText.textContent = original;
                    btn.style.pointerEvents = '';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.border = '';
                    contactForm.reset();
                    console.log('✓ Form submitted successfully');
                }, 3000);
            }, 1000);
            
        } catch (err) {
            console.error('❌ Error:', err);
            btnText.textContent = '✗ ERROR';
            btn.style.background = 'rgba(255, 51, 102, 0.15)';
            btn.style.color = '#ff3366';
            setTimeout(() => {
                btnText.textContent = original;
                btn.style.pointerEvents = '';
                btn.style.background = '';
                btn.style.color = '';
            }, 3000);
        }
    });
}
```

---

## **6. TEST INTEGRATION**

### **Step 6A: Add Your Keys to script.js**
1. In Supabase dashboard: Copy your **Project URL** and **Anon Key**
2. In `script.js`, replace:
   - `YOUR_PROJECT_REF` → Your actual project ref (e.g., `abcdefg123`)
   - `YOUR_ANON_KEY_HERE` → Your actual anon key

### **Step 6B: Test in Supabase First**

Go to SQL Editor and run:

```sql
SET LOCAL role anon;
INSERT INTO public.inquiries (name, email, case_type, priority, message)
VALUES ('Test User', 'test@example.com', 'cyber', 'standard', 'This is a test')
RETURNING id, created_at;
```

✅ If this returns an ID → RLS is working!
❌ If error → Check your policies

### **Step 6C: Deploy & Test**
1. Push changes to GitHub:
   ```bash
   git add index.html script.js SUPABASE_SETUP.md
   git commit -m "Add Supabase integration with corrected schema"
   git push origin main
   ```

2. Open your website: **https://nexus-forensics-one.vercel.app**

3. Scroll to **CONTACT** section

4. Fill the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Organization: `Test Org`
   - Case Type: `Cybercrime Investigation`
   - Priority: `Standard`
   - Message: `This is a test message`

5. Click **"TRANSMIT SECURELY"**

6. Button should show: `✓ TRANSMISSION COMPLETE` ✅

### **Step 6D: Verify in Supabase**
1. Go to Supabase Dashboard
2. Click **"Table Editor"** (left sidebar)
3. Select **"inquiries"** table
4. You should see your test row! 🎉

---

## **7. TROUBLESHOOTING**

### **Problem: "Cannot find Supabase"**
**Solution:** Make sure you added the Supabase script to `index.html` before `</head>`

### **Problem: "column does not exist"**
**Solution:** Run the DROP TABLE query first, then recreate with the corrected SQL above

### **Problem: "401 Unauthorized"**
**Solution:** Your anon key is wrong. Check:
1. You're using the correct key (not service_role key)
2. No extra spaces in the key
3. RLS policies allow INSERT for anonymous users

### **Problem: "Row-level security violation"**
**Solution:** Your RLS policy is too restrictive. Run this SQL:
```sql
DROP POLICY IF EXISTS "Allow public inserts" ON public.inquiries;
CREATE POLICY "Allow public inserts" ON public.inquiries
  FOR INSERT WITH CHECK (true);
```

### **Problem: Data not appearing in table**
**Solution:** 
1. Check browser console (F12) for errors
2. Check Supabase logs: **"Logs"** tab in dashboard
3. Verify table name is exactly `inquiries` (lowercase)

### **Problem: CORS errors**
**Solution:** Supabase handles CORS automatically. If you get CORS errors:
1. Clear browser cache (Ctrl+Shift+Del)
2. Try in incognito/private window
3. Check that your Supabase URL is correct

---

## **✅ COMPLETION CHECKLIST**

- [ ] Supabase account created
- [ ] Project created
- [ ] Old `inquiries` table dropped
- [ ] New `inquiries` table created with correct columns
- [ ] RLS policies added
- [ ] API URL copied
- [ ] Anon key copied
- [ ] Supabase script added to HTML
- [ ] script.js updated with keys
- [ ] Contact form handler replaced
- [ ] Code pushed to GitHub
- [ ] SQL test passed (anon insert works)
- [ ] Test form submission works
- [ ] Data appears in Supabase table

---

## **🎯 NEXT STEPS**

Once form is working:

1. **View Submissions:** Go to Supabase → Table Editor → inquiries
2. **Export Data:** Click "Download" to export as CSV
3. **Set Alerts:** Add email notifications when new inquiry arrives
4. **Monitor:** Check Supabase logs for any errors

---

## **❓ NEED HELP?**

- Supabase Docs: https://supabase.com/docs
- Discord Community: https://discord.supabase.io
- GitHub Issues: https://github.com/2410305056-tech/Nexus-forensics/issues

**Status:** Last updated August 1, 2026 ✓
