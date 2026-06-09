-- ============================================================
-- ⚠️ CRITICAL FIX: Update ALL user profiles to correct dates
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- Fix prep_start_date for ALL users
UPDATE public.profiles 
SET prep_start_date = '2026-06-13'::DATE
WHERE prep_start_date != '2026-06-13'::DATE;

-- Verify the fix
SELECT 
  id,
  email, 
  freeze_date,
  prep_start_date,
  current_day
FROM public.profiles
ORDER BY created_at DESC;

-- You should see prep_start_date = 2026-06-13 for all users