# 🗄️ Database Migration Guide

**IMPORTANT:** Follow these steps exactly to set up your PrepOS V1.1 database.

---

## ⚠️ CRITICAL: Migration Order

You MUST run the SQL files in this exact order:

1. **schema.sql** (original tables)
2. **schema_v1.1.sql** (new tables + functions)

---

## 📋 STEP-BY-STEP MIGRATION

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run schema.sql

1. Click **New Query**
2. Open `schema.sql` file
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl+Enter)
6. Wait for success message: `Success. No rows returned`

**Expected Output:**
- 11 tables created
- Indexes created
- RLS policies enabled
- Triggers created

### Step 3: Run schema_v1.1.sql

1. Click **New Query** (clear previous query)
2. Open `schema_v1.1.sql` file
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **Run**
6. Wait for success message

**Expected Output:**
- 7 new tables created
- 5 new functions created
- 1 new trigger created
- Seed data inserted (topic_recommendations)

### Step 4: Verify Tables

Run this query to check all tables exist:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**You should see 18 tables:**
```
analytics_summary (if exists)
daily_plans           ← NEW
error_logs
events
health_logs
jad_progress
mock_analytics_detailed ← NEW
mock_scores
net_unit_progress
profiles
resources             ← NEW
revision_log
setup_checklist       ← NEW
study_calendar        ← NEW
study_logs
topic_progress
topic_recommendations ← NEW
week_logs             ← NEW
```

### Step 5: Verify Functions

Run this query:

```sql
SELECT proname 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
ORDER BY proname;
```

**You should see these functions:**
```
adaptive_recovery_plan     ← NEW
calculate_weekly_success   ← NEW
generate_daily_plan        ← NEW
get_analytics_summary
get_streak_counts
handle_new_user
handle_new_user_setup      ← NEW
initialize_recommended_resources ← NEW
initialize_setup_checklist ← NEW
set_updated_at
```

### Step 6: Test User Creation

1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Create a test user:
   - Email: `test@prepos.com`
   - Password: `Test123!@#`
4. Click **Create User**

**Verify auto-initialization:**

```sql
-- Check setup checklist was created
SELECT COUNT(*) FROM setup_checklist;
-- Should return: 10

-- Check resources were created
SELECT COUNT(*) FROM resources;
-- Should return: 13 (recommended resources)
```

---

## 🔧 TROUBLESHOOTING

### Error: "column is_default does not exist"

**Cause:** Running old version of schema_v1.1.sql

**Solution:** 
1. Make sure you have the LATEST version of schema_v1.1.sql
2. The file should have `is_default BOOLEAN DEFAULT FALSE` in setup_checklist table
3. Re-run the corrected schema_v1.1.sql

### Error: "relation already exists"

**Cause:** Tables already created from previous run

**Solution:**
```sql
-- Drop all tables (CAREFUL - this deletes everything!)
DROP TABLE IF EXISTS daily_plans CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS weekly_targets CASCADE;
DROP TABLE IF EXISTS setup_checklist CASCADE;
DROP TABLE IF EXISTS study_calendar CASCADE;
DROP TABLE IF EXISTS mock_analytics_detailed CASCADE;
DROP TABLE IF EXISTS topic_recommendations CASCADE;

-- Then re-run schema_v1.1.sql
```

### Error: "function uuid_generate_v4() does not exist"

**Cause:** uuid-ossp extension not enabled

**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### No seed data in topic_recommendations

**Check if INSERT ran:**

```sql
SELECT COUNT(*) FROM topic_recommendations;
-- Should return: 13
```

**If 0, manually insert:**

```sql
-- Copy the INSERT statement from schema_v1.1.sql lines 297-318
-- Run it manually
```

### Trigger not firing

**Test trigger manually:**

```sql
-- Get your user ID from Authentication > Users
SELECT id FROM auth.users WHERE email = 'test@prepos.com';

-- Manually call the function
SELECT initialize_setup_checklist('your-user-id-here');
SELECT initialize_recommended_resources('your-user-id-here');

-- Verify
SELECT COUNT(*) FROM setup_checklist WHERE user_id = 'your-user-id-here';
```

---

## 🎯 POST-MIGRATION CHECKLIST

After migration, verify:

- [ ] 18 tables exist
- [ ] 6 RPC functions exist
- [ ] RLS policies enabled on all tables
- [ ] Triggers working (create test user)
- [ ] topic_recommendations has 13 rows
- [ ] Test user has 10 setup checklist items
- [ ] Test user has 13 recommended resources

---

## 🚀 READY TO DEPLOY

Once all checks pass:

1. Go to Vercel
2. Deploy your project
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Test signup flow
5. Verify setup checklist appears
6. Verify resources tab shows recommendations

---

**Migration Complete! ✅**

Next: Follow QUICKSTART_USER.md for user onboarding.