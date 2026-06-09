# PrepOS V1 — Setup Guide (5 Steps)

## Step 1 — Create Project

```bash
npm create vite@latest prep-os -- --template react-ts
cd prep-os
npm install @supabase/supabase-js @tanstack/react-query @tanstack/react-query-devtools \
  react-router-dom recharts lucide-react date-fns clsx zustand tailwind-merge
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa @types/node
npx tailwindcss init -p
```

## Step 2 — Copy All Source Files

Replace contents of your new project with the files from this zip:
- Copy ALL files maintaining the folder structure exactly
- The zip already has the correct structure

## Step 3 — Supabase Setup

1. Go to https://supabase.com → New project → name it "prep-os"
2. Dashboard → SQL Editor → New Query
3. Paste entire contents of `schema.sql` → click Run
4. Verify: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   Should show 11 tables.

## Step 4 — Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- `VITE_SUPABASE_URL` = your Supabase Project URL (Settings → API)
- `VITE_SUPABASE_ANON_KEY` = your anon/public key (Settings → API)

## Step 5 — Run and Deploy

```bash
npm run dev          # Development at http://localhost:5173
npm run build        # Production build
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```
Add the same env variables in Vercel dashboard → Settings → Environment Variables.

After deploying, update Supabase Auth:
- Dashboard → Authentication → URL Configuration
- Site URL: your Vercel URL
- Redirect URLs: add `https://your-app.vercel.app/**`

---

## File Structure

```
prep-os/
├── public/
│   ├── manifest.json       PWA manifest
│   └── favicon.svg         App icon
├── src/
│   ├── lib/
│   │   ├── supabase.ts     Supabase client
│   │   ├── types.ts        (unused — types in hooks)
│   │   ├── constants.ts    All static data (EXAMS, TOPICS, etc.)
│   │   └── formulas.ts     All calculation functions
│   ├── context/
│   │   └── AuthContext.tsx Auth provider + useAuth hook
│   ├── hooks/
│   │   └── usePrepData.ts  Main data hook — all Supabase CRUD
│   ├── components/layout/
│   │   ├── AppShell.tsx    Main layout wrapper
│   │   ├── BottomNav.tsx   Mobile bottom navigation
│   │   ├── TopBar.tsx      Header with freeze date + day counter
│   │   └── Sidebar.tsx     Desktop sidebar
│   ├── pages/
│   │   ├── auth/           LoginPage, SignupPage, ResetPasswordPage
│   │   ├── dashboard/      DashboardPage (readiness + routing + streaks)
│   │   ├── health/         HealthPage (V2 formula + log form)
│   │   ├── study/          StudyPage (topics + revision + errors)
│   │   ├── mocks/          MocksPage (score log + analysis)
│   │   ├── analytics/      AnalyticsPage (exec score + charts)
│   │   ├── jad/            JADPage (7 sub-tabs)
│   │   └── settings/       SettingsPage (assessment + profile)
│   ├── styles/
│   │   └── globals.css     Tailwind + CSS variables
│   ├── main.tsx            App entry point
│   └── App.tsx             Router + auth guard
├── schema.sql              Run in Supabase SQL Editor
├── .env.example            Copy to .env.local
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## What You Get

| Feature | Location |
|---------|----------|
| 7-exam readiness V2 | Dashboard |
| Auto weakness routing | Dashboard |
| Anti-lazy streaks | Dashboard + Analytics |
| Execution mode warning | Dashboard |
| Reality check (plan vs study) | Dashboard + Analytics |
| Weekly execution score | Analytics |
| Health V2 logging (6 metrics) | Health |
| Spaced repetition revision | Study |
| PYQ pipeline (7 stages) | Study |
| Error log + analytics | Study |
| Mock score tracker | Mocks |
| Event engine (coal cleared etc) | JAD → Events |
| JAD telecom fast track | JAD → Telecom |
| UGC NET unit tracker | JAD → NET Units |
| JAD interview readiness | JAD → Interview |
| Full assessment re-calibration | Settings |
