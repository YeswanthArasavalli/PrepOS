# 🚀 PrepOS V1.1 — Preparation Operating System

**Final Execution Patch** | Production Ready | June 2026

> **7 Exams · 20 Patches · Adaptive Recovery · Execution-First Design**

---

## 📋 TABLE OF CONTENTS

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [User Guide](#user-guide)
- [Patches 11-20](#patches-11-20)
- [File Structure](#file-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 OVERVIEW

PrepOS V1.1 is a **production-ready web application** for competitive exam preparation tracking. Built for SSC CGL, Coal India MT, UGC NET CS, and UPSC JAD aspirants.

### Core Philosophy

1. **Execution First** — Daily actions over perfect plans
2. **Adaptive Recovery** — Automatically adjusts when you miss days
3. **Health-Integrated** — 20% of your success comes from health
4. **No Guilt Design** — Structured recovery, not emotional crash

### Key Metrics

- **Preparation Duration:** 140 days (5 phases)
- **Exams Tracked:** 7 (SSC CGL, CHSL, MTS, Coal India, NTPC, UGC NET, UPSC JAD)
- **Health Formula:** Wake(20%) + Sleep(20%) + Steps(20%) + Water(15%) + Exercise(15%) + Strength(10%)
- **Readiness Formula:** Syllabus(30%) + Mocks(25%) + Revision(20%) + PYQs(15%) + Consistency(10%) + Health(5%)

---

## ⚡ QUICK START

```bash
# 1. Clone repository
git clone <your-repo-url>
cd prep-os-v1

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run database migration
# Open Supabase Dashboard > SQL Editor
# Copy-paste contents of schema.sql + schema_v1.1.sql

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:5173
```

---

## ✨ FEATURES

### 📊 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| **Dashboard** | Overall readiness, weak routing, streaks | ✅ Complete |
| **Daily Planner** | Auto-generated daily tasks with adaptive recovery | ✅ Complete |
| **Health Tracker** | V2 formula with streaks and micro-strength | ✅ Complete |
| **Study Logger** | PYQ pipeline with 8-stage tracking | ✅ Complete |
| **Mock Tracker** | Detailed analytics with improvement suggestions | ✅ Complete |
| **Resource Tracker** | Books, playlists, PDFs with progress | ✅ Complete |
| **Weekly Targets** | Goal setting with success score | ✅ Complete |
| **Study Calendar** | Monthly view with day type tracking | ✅ Complete |
| **Revision System** | Spaced repetition (1/3/7/15/30 days) | ✅ Complete |
| **Setup Mode** | June 12 checklist for Day 1 launch | ✅ Complete |
| **JAD Tracker** | Telecom + CS overlap + Interview prep | ✅ Complete |
| **Analytics** | Performance trends + error patterns | ✅ Complete |

### 🔄 Adaptive Features

1. **Daily Plan Generation** — Automatically creates today's plan based on:
   - Overdue revisions
   - Weak subjects (from error logs)
   - Health tasks
   - Recovery needs

2. **Recovery Modes:**
   - **Normal** (0 missed days) — Continue as planned
   - **Recovery** (2-3 missed) — Catch up gradually
   - **Emergency** (4-6 missed) — Pause new topics, focus P1 only
   - **Rebuild** (7+ missed) — Minimum viable plan, reset

3. **Task Carry-Forward** — Unfinished tasks automatically roll to next day

---

## 🛠 TECH STACK

### Frontend
- **React 18** + TypeScript
- **Vite** (Build tool)
- **TailwindCSS** (Styling)
- **React Router** (Navigation)
- **React Query** (Data fetching)
- **Lucide Icons** (Icon set)

### Backend
- **Supabase** (BaaS)
  - PostgreSQL database
  - Row Level Security
  - Real-time subscriptions
  - Authentication (Email/Password)

### Deployment
- **Vercel** (Hosting)
- **PWA** (Progressive Web App ready)

---

## 📦 INSTALLATION

### Prerequisites

- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Supabase account (free tier sufficient)

### Step-by-Step

#### 1. Clone & Install

```bash
git clone <your-repo-url>
cd prep-os-v1
npm install
```

#### 2. Environment Setup

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Database Setup

**CRITICAL:** Execute SQL migrations in order:

1. Open Supabase Dashboard
2. Go to **SQL Editor** > **New Query**
3. Copy entire contents of `schema.sql`
4. Click **Run** (or Cmd/Ctrl+Enter)
5. Repeat for `schema_v1.1.sql`

Verify tables created:
- profiles
- health_logs
- study_logs
- mock_scores
- error_logs
- topic_progress
- revision_log
- events
- week_logs
- jad_progress
- net_unit_progress
- **daily_plans** (NEW)
- **resources** (NEW)
- **weekly_targets** (NEW)
- **setup_checklist** (NEW)
- **study_calendar** (NEW)
- **mock_analytics_detailed** (NEW)
- **topic_recommendations** (NEW)

#### 4. Seed Data Verification

Check if seed data exists:

```sql
SELECT COUNT(*) FROM public.topic_recommendations;
-- Should return 13

SELECT COUNT(*) FROM public.setup_checklist;
-- Should return 10 (template items)
```

#### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🚀 DEPLOYMENT

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Production Build**
   ```bash
   npm run build
   vercel --prod
   ```

### PWA Configuration

The app is PWA-ready via `vite-plugin-pwa`. To enable:

1. Update `vite.config.ts`:
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa';

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'PrepOS V1.1',
           short_name: 'PrepOS',
           description: 'Preparation Operating System',
           theme_color: '#020617',
           icons: [
             {
               src: '/icon-192.png',
               sizes: '192x192',
               type: 'image/png'
             },
             {
               src: '/icon-512.png',
               sizes: '512x512',
               type: 'image/png'
             }
           ]
         }
       })
     ]
   });
   ```

2. Add icons to `public/` folder

3. Rebuild and deploy

---

## 📖 USER GUIDE

### 🎬 Getting Started (June 12-13)

#### June 12 — Setup Day

1. **Complete Setup Checklist** (`/setup`)
   - Books collected
   - PDFs organized
   - Workspace ready
   - Apps installed
   - Water bottle ready
   - Walking shoes ready
   - Alarm set for 5AM
   - Study table clean
   - Error log notebook ready

2. **No Studying Required**
   - This day is purely for preparation
   - System unlocks main dashboard on completion

#### June 13 — Day 1 Launch

**Auto-Generated Plan:**
- 5:00 AM — Wake up + 300ml water
- 5:15 AM — Morning walk 3km
- 6:30 AM — Exercise + strength training
- 7:00 AM — Bath + breakfast
- 8:00 AM — **Percentage** (Quant P1)
- 10:00 AM — **Reasoning** (Series, Analogy)
- 2:00 PM — **OS Basics** (CS for Coal India)
- 8:00 PM — **Revision** of morning topics

### 📱 Daily Workflow

#### Morning (5AM - 12PM)

1. **Wake up at 5AM** → Log in Health tab
2. **Morning walk** → 3km brisk pace
3. **Exercise** → Wall push-ups + chair squats
4. **Check Planner** → Review today's tasks
5. **Complete health tasks** → Mark as done

#### Afternoon (12PM - 6PM)

1. **Study session 1** → Quant/Reasoning
2. **Lunch + power nap** → 20 min
3. **Study session 2** → CS Technical
4. **Log study hours** → Auto-tracked via tasks

#### Evening (6PM - 10PM)

1. **Mock test** (from Day 20) → 2-3x/week
2. **Error logging** → Add wrong questions
3. **Revision** → Spaced repetition
4. **Plan tomorrow** → Auto-generated overnight

### 📊 Understanding Metrics

#### Readiness Score (0-100%)

- **70%+** → On track for safe score (Green)
- **40-69%** → Needs work (Amber)
- **<40%** → Danger zone (Red)

#### Health Score (0-100%)

Formula: `Wake(20%) + Sleep(20%) + Steps(20%) + Water(15%) + Exercise(15%) + Strength(10%)`

- Track daily in Health tab
- Affects overall readiness (5% bonus)
- Streaks visible on dashboard

#### Execution Score (0-100%)

Weekly metric: `Study(40%) + Mocks(30%) + Revisions(30%)`

- Target: 56h study, 7 mocks, 7 revisions/week
- Shown in Weekly tab
- Reality check on dashboard

---

## 🔧 PATCHES 11-20

### Patch 11 — Daily Planner Engine ✅

**Purpose:** Convert roadmap into executable daily plan

**Features:**
- Auto-generated tasks each morning
- Priority ordering (1=high, 2=medium, 3=low)
- Task types: study, revision, health, mock, recovery
- Completion percentage tracking
- Carry-forward unfinished tasks

**Usage:**
```typescript
import { useDailyPlan } from './hooks/useDailyPlan';

const { dailyPlan, updateTask, addCustomTask } = useDailyPlan();

// Mark task complete
updateTask(taskId, true);

// Add custom task
addCustomTask({
  title: "Extra PYQs",
  type: "study",
  priority: 2,
  scheduled_time: "16:00",
  completed: false
});
```

### Patch 12 — Today's Task Engine ✅

**Purpose:** Dynamically generate top 5 tasks

**Logic:**
1. Overdue revisions (highest priority)
2. Weak subject PYQs (from error logs)
3. Health tasks (non-negotiable)
4. Mock test (if none taken recently)

**Example Output:**
```
Today's Top 5 Tasks:
1. Revise: Percentage (Overdue by 2 days)
2. OS Scheduling PYQs (Most errors)
3. Morning Walk 3km (Health V2)
4. Exercise + Strength (Health V2)
5. Coal India Mock (Weekly target)
```

### Patch 13 — Revision Calendar ✅

**Purpose:** Spaced repetition scheduling

**Intervals:** 1 day → 3 days → 7 days → 15 days → 30 days

**Usage:**
- Mark topic done → Auto-schedules first revision
- Mark revised → Moves to next interval
- Overdue revisions shown in planner
- Revision debt displayed on dashboard

### Patch 14 — Resource Tracker ✅

**Purpose:** Track books, playlists, PDFs progress

**Pre-populated Resources:**
- Lucent GK (Book)
- Rakesh Yadav Arithmetic (Book)
- Neso Academy OS (Playlist)
- Gate Smashers DBMS (Playlist)
- Word Power Made Easy (Book)

**Features:**
- Chapter-by-chapter progress
- Status: Not Started / In Progress / Completed
- URL links to resources
- Add custom resources

### Patch 15 — Weekly Target Engine ✅

**Purpose:** Set and track weekly goals

**Default Targets:**
- Study: 56 hours/week (8h/day)
- Mocks: 7/week (1/day)
- Revisions: 7/week (1/day)

**Success Score Formula:**
```
Success = Study(40%) + Mocks(30%) + Revisions(30%)

80%+ = Completed (Green)
50-79% = Partial (Amber)
<50% = Active (Red)
```

### Patch 16 — Study Calendar ✅

**Purpose:** Monthly overview of preparation

**Day Types:**
- 📚 Study — Regular study day
- 📝 Mock — Full mock test day
- 🔄 Revision — Only revision, no new topics
- 😴 Rest — Complete rest (1x/week recommended)
- ❌ Missed — Auto-detected if no activity

**Features:**
- Tap to cycle day types
- Color-coded visualization
- Monthly stats summary
- Health/execution score tracking

### Patch 17 — Improved Mock Analytics ✅

**Purpose:** Deep mock test analysis

**New Fields:**
- Attempted questions
- Correct answers
- Wrong answers
- Skipped questions
- Time lost (in minutes)
- Strong areas (JSONB)
- Weak areas (JSONB)
- Improvement suggestions (JSONB)

**Improvement Score:**
```
Score = (Accuracy Improvement × 2) + (Time Saved × 0.5)
```

### Patch 18 — Recommended Resource Engine ✅

**Purpose:** Suggest resources for weak topics

**Logic:**
- Analyze error logs (last 14 days)
- Identify weak subjects
- Show max 2 recommendations per topic
- Priority-based ordering

**Example:**
```
Weak: OS Scheduling
Recommended:
1. Neso Academy OS Playlist (Priority 1)
2. Gate Smashers OS (Priority 2)
```

### Patch 19 — June 12 Setup Mode ✅

**Purpose:** Pre-preparation checklist

**10 Items:**
1. ✅ Books collected
2. ✅ PDFs collected
3. ✅ Resources organized
4. ✅ Workspace ready
5. ✅ Apps installed
6. ✅ Water bottle ready
7. ✅ Walking shoes ready
8. ✅ Alarm set
9. ✅ Study table ready
10. ✅ Error log notebook

**Completion:** Unlocks "System Ready for Day 1" banner

### Patch 20 — Day 1 Launch Mode ✅

**Purpose:** Auto-generate first day plan

**Day 1 Plan (June 13):**
```
Morning:
- Walk 3km
- Exercise
- Percentage Concepts

Afternoon:
- Reasoning (Series, Analogy)

Evening:
- OS Basics

Night:
- Revision
```

**First Week Plan:**
- Days 1-7: Focus on habit building
- Target: 5h study/day (not 8h)
- Health routine locked first

---

## 📁 FILE STRUCTURE

```
prep-os-v1/
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       ├── BottomNav.tsx       (Updated: Plan tab)
│   │       ├── Sidebar.tsx         (Updated: New nav items)
│   │       └── TopBar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useDailyPlan.ts         (NEW)
│   │   ├── useResources.ts         (NEW)
│   │   ├── useWeeklyTargets.ts     (NEW)
│   │   ├── useStudyCalendar.ts     (NEW)
│   │   ├── useSetupChecklist.ts    (NEW)
│   │   └── usePrepData.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── formulas.ts             (Updated: New functions)
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── health/
│   │   ├── study/
│   │   ├── mocks/
│   │   ├── analytics/
│   │   ├── jad/
│   │   ├── settings/
│   │   ├── planner/
│   │   │   └── PlannerPage.tsx     (NEW)
│   │   ├── resources/
│   │   │   └── ResourcesPage.tsx   (NEW)
│   │   ├── weekly/
│   │   │   └── WeeklyPage.tsx      (NEW)
│   │   ├── calendar/
│   │   │   └── CalendarPage.tsx    (NEW)
│   │   └── setup/
│   │       └── SetupPage.tsx       (NEW)
│   ├── App.tsx                     (Updated: New routes)
│   └── main.tsx
├── schema.sql                      (Original schema)
├── schema_v1.1.sql                 (NEW: Patch tables)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🐛 TROUBLESHOOTING

### Database Issues

**Problem:** "relation does not exist" error

**Solution:**
```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- If missing, re-run schema_v1.1.sql
```

**Problem:** RPC functions not found

**Solution:**
```sql
-- Check functions
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;

-- Re-create if missing
```

### Frontend Issues

**Problem:** Blank page after login

**Solution:**
1. Check browser console for errors
2. Verify Supabase URL in `.env.local`
3. Check network tab for failed requests

**Problem:** Daily plan not generating

**Solution:**
```sql
-- Manually trigger plan generation
SELECT generate_daily_plan('your-user-uuid', CURRENT_DATE);
```

### Recovery Mode Issues

**Problem:** Stuck in recovery mode

**Solution:**
1. Complete at least 1 study task
2. Log health for the day
3. System auto-exits after 1 successful day

---

## 📊 READINESS FORMULAS

### Overall Readiness (V2)

```
Readiness = Syllabus(30%) + Mocks(25%) + Revision(20%) + PYQs(15%) + Consistency(10%) + Health(5%)
```

### Health V2

```
Health = Wake(20%) + Sleep(20%) + Steps(20%) + Water(15%) + Exercise(15%) + Strength(10%)
```

### Weekly Execution

```
Execution = Study Hours(40%) + Mocks(30%) + Revisions(30%)
Target: 56h + 7 mocks + 7 revisions
```

### Auto Weakness Routing

```
If subject < 50%: Boost allocation (+12%)
If subject 50-65%: Moderate boost (+5%)
If subject > 80%: Maintenance only (-8%)
```

---

## 🎯 FINAL CHECKLIST

### Before June 12 (Setup Day)

- [ ] Database schema executed
- [ ] Environment variables set
- [ ] Development build working
- [ ] Production build tested
- [ ] Deployed to Vercel
- [ ] Mobile tested

### June 12 (Setup Day)

- [ ] Complete setup checklist
- [ ] Verify all resources accessible
- [ ] Test daily plan generation
- [ ] Log test health entry

### June 13 (Day 1)

- [ ] Follow auto-generated plan
- [ ] Log all activities
- [ ] Mark tasks complete
- [ ] Review evening analytics

---

## 📝 LICENSE

**Proprietary** — For personal use only

---

## 🙏 ACKNOWLEDGMENTS

Built for competitive exam aspirants preparing for:
- SSC CGL (Master Exam)
- Coal India MT (Fast-Track)
- UGC NET CS (Separate Track)
- UPSC JAD (Specialized Track)
- SSC CHSL, MTS, NTPC (Secondary)

**Version:** V1.1 Final Execution Patch  
**Release Date:** June 8, 2026  
**Status:** Production Ready ✅

---

## 📞 SUPPORT

For issues or questions:
1. Check [AUDIT_REPORT.md](./AUDIT_REPORT.md)
2. Review this README
3. Check Supabase logs
4. Verify environment variables

**Remember:** The system is designed to adapt to YOU. Miss a day? Recovery mode activates. Behind schedule? Minimum viable plan loads. Perfection is not required — consistency is.

**Good luck with your preparation! 🚀**