-- ============================================================
-- ⚠️ CRITICAL: Run this SQL to fix your PrepOS dates!
-- This will update your profile to start from June 13, 2026
-- ============================================================

-- Step 1: Update prep_start_date from June 3 to June 13, 2026
UPDATE public.profiles 
SET prep_start_date = '2026-06-13'::DATE
WHERE prep_start_date = '2026-06-03'::DATE;

-- Step 2: Verify the change
SELECT 
  id,
  email,
  freeze_date,
  prep_start_date,
  current_day
FROM public.profiles;

-- Expected result:
-- freeze_date: 2026-06-02
-- prep_start_date: 2026-06-13 ← FIXED!
-- current_day: will recalculate automatically

-- ============================================================
-- After running this:
-- 1. Refresh your PrepOS app (F5 or Cmd+R)
-- 2. Dashboard will show: "Prep Started 2026-06-13"
-- 3. Day counter will show correct day (0 if before June 13)
-- ============================================================