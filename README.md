# ◈ NEXUS FORENSICS

> Elite Digital Forensic Investigation & Cybercrime Analysis Platform

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-operational-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

## 🔬 Overview

Nexus Forensics is a premium, dark-themed forensic investigation website featuring
stunning animations, interactive data visualizations, and a noir cybersecurity
aesthetic. Contact form submissions are stored in Supabase via a serverless backend.

## ✨ Features

- **Matrix Rain Background** — Falling code characters
- **Interactive Particle System** — Mouse-reactive floating particles
- **Cursor Trail & Glow** — Green particle trail effect
- **Glitch Text Effects** — Cyberpunk hover distortion
- **Neon Rotating Borders** — Animated gradient card borders
- **Animated Charts** — Line, Donut, Bar, Radar graphs
- **3D Threat Globe** — Rotating globe with pulsing attack points
- **Live Threat Ticker** — Scrolling threat feed
- **Terminal Typewriter** — Forensic command simulation
- **Testimonials Carousel** — Auto-sliding client reviews
- **FAQ Accordion** — Expandable Q&A section
- **Case Filters** — Filter by status (Resolved/Active/Classified)
- **Agent Profiles** — Team section with animated avatars
- **Keyboard Navigation** — Arrow keys to navigate sections
- **Responsive Design** — Works on all devices
- **Contact Form → Supabase** — Validated, throttled, honeypot-protected submission

> The charts, threat ticker, cases, and testimonials are **static demo data**
> hardcoded in `script.js`. The contact form is the only live data path.

## 🛠️ Tech Stack

- **HTML5 / CSS3** — semantic structure, custom properties, glassmorphism
- **Vanilla JavaScript** — canvas animations, DOM manipulation
- **Vercel** — static hosting plus serverless functions in `api/`
- **Supabase (Postgres)** — stores contact form submissions
- **Google Fonts** — Orbitron, Rajdhani, Share Tech Mono

## 🏗️ Architecture

```
browser ──POST /api/inquiries──▶ serverless function ──service_role──▶ Supabase
        ◀──201 {ok:true}────────  (api/inquiries.js)                   public.inquiries
```

The browser holds no database credential. Admin reads go through
`GET /api/inquiries` with a bearer token. See `SUPABASE_SETUP.md`.

## 📁 Project Structure

```
nexus-forensics/
├── index.html                  # Main HTML
├── styles.css                  # All styles & animations
├── script.js                   # Interactive features, charts, form handler
├── manifest.json               # PWA manifest
├── icons/                      # PWA icons
├── api/
│   └── inquiries.js            # POST submit / GET admin read
├── supabase/
│   └── migrations/
│       └── 20260731000000_init_schema.sql
├── .github/workflows/main.yml  # Applies migrations via Supabase CLI
├── .env.example                # Required server-side env vars
├── vercel.json                 # Security headers
└── README.md
```

## 🚀 Deployment

### Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Add the environment variables from `.env.example` (Settings → Environment Variables)
3. Deploy — `vercel.json` needs no build step; `api/` is picked up automatically
4. Add the GitHub Actions secrets so migrations apply on push

Full walkthrough: **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

### Local Development

```bash
npm install
npx vercel dev
```

Use `vercel dev`, not `npx serve .` — a plain static server cannot execute
`/api/inquiries`, so the contact form will 404.

## 📄 License

MIT License — free to use and modify.

---

**◈ NEXUS FORENSICS** — *Truth in every byte.*
