# 🗓️ Date Correction Guide — Fix June 13 Start Date

**Problem:** Your dashboard shows "Prep Started 2026-06-03" and "Day 7" instead of June 13.

**Solution:** Run this SQL migration to update your profile dates.

---

## 🔧 STEP-BY-STEP FIX

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Select your PrepOS project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Date Correction Migration

1. Click **New Query**
2. Copy the entire contents of `migration_fix_dates.sql`
3. Paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl+Enter)

**Expected Output:**
```
UPDATE 1
SELECT 1 row(s) returned
```

### Step 3: Verify the Fix

Run this query to check your updated dates:

```sql
SELECT 
  email, 
  freeze_date, 
  prep_start_date, 
  current_day
FROM public.profiles;
```

**Expected Result:**
- `freeze_date`: 2026-06-02 ✅
- `prep_start_date`: 2026-06-13 ✅
- `current_day`: 1 (or whatever day you're on)

### Step 4: Refresh Your App

1. Go to your PrepOS app
2. Refresh the page (F5 or Cmd+R)
3. Dashboard should now show:
   - **Prep Started: 2026-06-13** ✅
   - **Day 0 / 140** (if before June 13) or **Day X / 140** (if after June 13)

---

## 📊 WHAT CHANGED

### Before (Incorrect):
- Freeze Date: June 2, 2026 ✅ (correct)
- Prep Start: June 3, 2026 ❌ (WRONG!)
- Current Day: 7 (counting from wrong date)

### After (Correct):
- Freeze Date: June 2, 2026 ✅
- Prep Start: **June 13, 2026** ✅
- Current Day: **Recalculated from June 13**

---

## 🎯 NEW FEATURES ADDED

### 1. Full Timetable Page ✅

**Location:** `/timetable` or click "Timetable" in sidebar

**Features:**
- ⏰ **Complete time-blocked schedule** (5AM - 10PM)
- 📚 **5 study sessions** with Pomodoro timing
- 💪 **Health activities** (walk, exercise, water breaks)
- 😴 **Power nap** and rest periods
- 🔄 **Revision slots** (morning + evening)
- 📊 **Mock test slots** (from Day 20 onwards)

**Schedule Highlights:**
- **5:00 AM** — Wake up + water
- **5:15 AM** — Morning walk 3km
- **6:30 AM** — Exercise + strength training
- **7:30 AM** — Study Session 1 (Quant/Reasoning)
- **9:15 AM** — Study Session 2 (Reasoning/English)
- **1:00 PM** — Study Session 3 (CS Technical)
- **3:15 PM** — Study Session 4 (Mock/PYQs)
- **5:00 PM** — Revision session
- **10:00 PM** — Sleep (7-8 hours)

**Total Study Time:** 6-8 hours/day  
**Total Health Activities:** 4 per day  
**Total Revision Time:** 90 minutes/day

---

## 🕐 REAL-TIME DAY CALCULATION

The system now automatically calculates:

```typescript
Day = Today's Date - June 13, 2026
```

**Examples:**
- June 13, 2026 → Day 1
- June 14, 2026 → Day 2
- June 20, 2026 → Day 8
- July 1, 2026 → Day 19

The counter updates automatically every day at midnight!

---

## 📱 HOW TO USE TIMETABLE

### Daily Flow:

1. **Morning (5AM - 12PM)**
   - Follow health routine
   - Complete 2-3 study sessions
   - Log activities in Health tab

2. **Afternoon (12PM - 6PM)**
   - Lunch + power nap
   - 2 study sessions (CS Technical)
   - Error logging + revision

3. **Evening (6PM - 10PM)**
   - Light revision
   - Plan tomorrow
   - Wind down
   - Sleep by 10PM

### Weekly Variation:

- **Mon-Sat:** Full schedule (6-8h study)
- **Sunday:** 50% study + 50% rest (recovery day)
- **Mock Days (3x/week):** Replace Session 5 with full mock test
- **Revision Days:** No new topics, only revision

---

## ✅ VERIFICATION CHECKLIST

After running the migration:

- [ ] Dashboard shows "Prep Started: 2026-06-13"
- [ ] Day counter shows correct day (0 if before June 13)
- [ ] Timetable page accessible from sidebar
- [ ] Timetable shows 5AM - 10PM schedule
- [ ] All dates in Weekly page start from June 13
- [ ] Daily Planner generates tasks for correct date

---

## 🎉 YOU'RE ALL SET!

Your PrepOS V1.1 now has:
- ✅ Correct start date (June 13, 2026)
- ✅ Real-time day calculation
- ✅ Full-fledged timetable with time blocks
- ✅ Complete daily schedule (5AM - 10PM)
- ✅ Health + Study + Revision balance

**Ready for your preparation journey! 🚀**

---

*Need help? Check README.md or QUICKSTART_USER.md*