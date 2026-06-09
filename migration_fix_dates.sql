-- ============================================================
-- PrepOS V1.1 — Date Correction Migration
-- Run this to update existing user profiles to correct dates
-- ============================================================

-- Update freeze_date to June 2, 2026
UPDATE public.profiles 
SET freeze_date = '2026-06-02'::DATE
WHERE freeze_date = '2026-06-02'::DATE;

-- Update prep_start_date to June 13, 2026 (CRITICAL FIX)
UPDATE public.profiles 
SET prep_start_date = '2026-06-13'::DATE
WHERE prep_start_date = '2026-06-03'::DATE;

-- Verify the update
SELECT id, email, freeze_date, prep_start_date, current_day
FROM public.profiles;

-- Optional: Reset current_day to 1 if needed (uncomment if you want to reset)
-- UPDATE public.profiles SET current_day = 1;