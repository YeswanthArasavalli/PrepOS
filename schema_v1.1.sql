-- ============================================================
-- PrepOS V1.1 — Execution Patch Tables (Patches 11-20)
-- Append to existing schema.sql
-- ============================================================

-- TABLE 12: daily_plans
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks           JSONB NOT NULL DEFAULT '[]',
  study_hours_target NUMERIC(3,1) DEFAULT 6,
  health_target   JSONB DEFAULT '{"wake":1,"sleep":1,"water":0.9,"steps":0.9,"exercise":1,"strength":1}',
  completion_pct  SMALLINT DEFAULT 0,
  is_generated    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, plan_date)
);

-- TABLE 13: resources
CREATE TABLE IF NOT EXISTS public.resources (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('book','playlist','pdf','course','pyq_bank','mock_series')),
  subject         TEXT,
  total_chapters  INTEGER,
  completed_chapters INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  url             TEXT,
  notes           TEXT,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 14: weekly_targets
CREATE TABLE IF NOT EXISTS public.weekly_targets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  week_end        DATE NOT NULL,
  targets         JSONB NOT NULL DEFAULT '[]',
  study_hours_target NUMERIC(4,1) DEFAULT 56,
  mocks_target    SMALLINT DEFAULT 7,
  revisions_target SMALLINT DEFAULT 7,
  success_score   SMALLINT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','partial')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- TABLE 15: setup_checklist
CREATE TABLE IF NOT EXISTS public.setup_checklist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id         TEXT NOT NULL,
  label           TEXT NOT NULL,
  is_complete     BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

-- TABLE 16: study_calendar
CREATE TABLE IF NOT EXISTS public.study_calendar (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calendar_date   DATE NOT NULL,
  day_type        TEXT NOT NULL CHECK (day_type IN ('study','mock','revision','rest','missed')),
  study_hours     NUMERIC(3,1) DEFAULT 0,
  mocks_done      SMALLINT DEFAULT 0,
  health_score    SMALLINT DEFAULT 0,
  execution_score SMALLINT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, calendar_date)
);

-- TABLE 17: mock_analytics_detailed
CREATE TABLE IF NOT EXISTS public.mock_analytics_detailed (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mock_score_id   UUID REFERENCES public.mock_scores(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempted       INTEGER,
  correct         INTEGER,
  wrong           INTEGER,
  skipped         INTEGER,
  time_lost_mins  INTEGER,
  strong_areas    JSONB DEFAULT '[]',
  weak_areas      JSONB DEFAULT '[]',
  improvement_suggestions JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 18: topic_recommendations
CREATE TABLE IF NOT EXISTS public.topic_recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id        TEXT NOT NULL,
  subject         TEXT NOT NULL,
  resource_name   TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_url    TEXT,
  priority        SMALLINT DEFAULT 1,
  is_default      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date     ON public.daily_plans     (user_id, plan_date DESC);
CREATE INDEX IF NOT EXISTS idx_resources_user            ON public.resources       (user_id, subject);
CREATE INDEX IF NOT EXISTS idx_weekly_targets_user       ON public.weekly_targets  (user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_setup_checklist_user      ON public.setup_checklist (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_study_calendar_user_date  ON public.study_calendar  (user_id, calendar_date DESC);
CREATE INDEX IF NOT EXISTS idx_mock_analytics_mock       ON public.mock_analytics_detailed (mock_score_id);
CREATE INDEX IF NOT EXISTS idx_topic_recommendations     ON public.topic_recommendations (topic_id, priority);

-- ROW LEVEL SECURITY
ALTER TABLE public.daily_plans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_targets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_checklist        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_calendar         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_analytics_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_recommendations  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_plans: own"          ON public.daily_plans            FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "resources: own"            ON public.resources              FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "weekly_targets: own"       ON public.weekly_targets         FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "setup_checklist: own"      ON public.setup_checklist        FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "study_calendar: own"       ON public.study_calendar         FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "mock_analytics_detailed: own" ON public.mock_analytics_detailed FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "topic_recommendations: all" ON public.topic_recommendations FOR SELECT USING (TRUE);
CREATE POLICY "topic_recommendations: own" ON public.topic_recommendations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RPC: generate_daily_plan (Patch 11 + 12)
CREATE OR REPLACE FUNCTION public.generate_daily_plan(p_user_id UUID, p_date DATE)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tasks JSONB := '[]';
  v_due_rev RECORD;
  v_weak_subs RECORD;
  v_day_plan RECORD;
  v_recovery_days INTEGER;
BEGIN
  -- Check if plan already exists
  SELECT * INTO v_day_plan FROM public.daily_plans 
    WHERE user_id=p_user_id AND plan_date=p_date;
  IF v_day_plan.id IS NOT NULL THEN
    RETURN json_build_object('success',TRUE,'existing',TRUE,'plan',row_to_json(v_day_plan));
  END IF;

  -- Calculate recovery days (if user skipped days)
  SELECT COUNT(*) INTO v_recovery_days FROM public.study_calendar 
    WHERE user_id=p_user_id AND calendar_date < p_date AND day_type='missed';

  -- 1. Add overdue revisions (highest priority)
  FOR v_due_rev IN 
    SELECT topic_id, topic_name, subject, due_at 
    FROM public.revision_log 
    WHERE user_id=p_user_id AND due_at < NOW()
    ORDER BY due_at ASC LIMIT 5
  LOOP
    v_tasks := v_tasks || jsonb_build_array(
      jsonb_build_object(
        'id',uuid_generate_v4(),
        'title','Revise: ' || v_due_rev.topic_name,
        'type','revision',
        'priority',1,
        'scheduled_time','08:00',
        'topic_id',v_due_rev.topic_id,
        'subject',v_due_rev.subject,
        'carried_from',v_due_rev.due_at
      )
    );
  END LOOP;

  -- 2. Add weak subject topics (from error patterns)
  FOR v_weak_subs IN 
    SELECT subject, COUNT(*) as cnt FROM public.error_logs 
    WHERE user_id=p_user_id AND log_date > (p_date - INTERVAL '14 days')
    GROUP BY subject ORDER BY cnt DESC LIMIT 3
  LOOP
    v_tasks := v_tasks || jsonb_build_array(
      jsonb_build_object(
        'id',uuid_generate_v4(),
        'title','Practice: ' || v_weak_subs.subject || ' PYQs',
        'type','study',
        'priority',2,
        'scheduled_time','10:00',
        'subject',v_weak_subs.subject
      )
    );
  END LOOP;

  -- 3. Add health tasks
  v_tasks := v_tasks || jsonb_build_array(
    jsonb_build_object('id',uuid_generate_v4(),'title','Morning Walk 3km','type','health','priority',1,'scheduled_time','05:15'),
    jsonb_build_object('id',uuid_generate_v4(),'title','Exercise + Strength','type','health','priority',1,'scheduled_time','06:30'),
    jsonb_build_object('id',uuid_generate_v4(),'title','3L Water','type','health','priority',2,'scheduled_time','all_day')
  );

  -- 4. If recovery mode, add catch-up task
  IF v_recovery_days > 2 THEN
    v_tasks := v_tasks || jsonb_build_array(
      jsonb_build_object(
        'id',uuid_generate_v4(),
        'title','Recovery: Complete ' || v_recovery_days || ' missed days',
        'type','recovery',
        'priority',1,
        'scheduled_time','07:00',
        'recovery_days',v_recovery_days
      )
    );
  END IF;

  -- Insert the plan
  INSERT INTO public.daily_plans (user_id, plan_date, tasks, study_hours_target, is_generated)
  VALUES (p_user_id, p_date, 
          CASE WHEN v_tasks = '[]'::jsonb THEN 
            jsonb_build_array(
              jsonb_build_object('id',uuid_generate_v4(),'title','Day 1: Setup + Orientation','type','study','priority',1,'scheduled_time','08:00'),
              jsonb_build_object('id',uuid_generate_v4(),'title','Morning Walk 3km','type','health','priority',1,'scheduled_time','05:15'),
              jsonb_build_object('id',uuid_generate_v4(),'title','Exercise','type','health','priority',1,'scheduled_time','06:30')
            )
          ELSE v_tasks END,
          CASE WHEN v_recovery_days>2 THEN 4 ELSE 6 END,
          TRUE)
  RETURNING * INTO v_day_plan;

  RETURN json_build_object('success',TRUE,'existing',FALSE,'plan',row_to_json(v_day_plan));
END;
$$;

-- RPC: calculate_weekly_success
CREATE OR REPLACE FUNCTION public.calculate_weekly_success(p_user_id UUID, p_week_start DATE)
RETURNS SMALLINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_target RECORD;
  v_actual RECORD;
  v_score NUMERIC;
BEGIN
  SELECT * INTO v_target FROM public.weekly_targets 
    WHERE user_id=p_user_id AND week_start=p_week_start;
  
  IF v_target.id IS NULL THEN RETURN 0; END IF;

  SELECT COALESCE(SUM(hours),0) as study_hrs, 
         COUNT(*) FILTER (WHERE subject LIKE '%mock%') as mocks
    INTO v_actual
    FROM public.study_logs 
    WHERE user_id=p_user_id 
      AND log_date BETWEEN p_week_start AND (p_week_start + INTERVAL '6 days');

  v_score := (
    (LEAST(COALESCE(v_actual.study_hrs,0), v_target.study_hours_target) / NULLIF(v_target.study_hours_target,0) * 40) +
    (LEAST(COALESCE(v_actual.mocks,0), v_target.mocks_target) / NULLIF(v_target.mocks_target,0) * 30) +
    (LEAST((SELECT COUNT(*) FROM public.revision_log WHERE user_id=p_user_id AND done_at BETWEEN p_week_start AND (p_week_start + INTERVAL '6 days')), v_target.revisions_target) / NULLIF(v_target.revisions_target,0) * 30)
  );

  UPDATE public.weekly_targets 
    SET success_score = ROUND(v_score)::SMALLINT,
        status = CASE WHEN v_score>=80 THEN 'completed' WHEN v_score>=50 THEN 'partial' ELSE 'active' END
    WHERE id = v_target.id;

  RETURN ROUND(v_score)::SMALLINT;
END;
$$;

-- RPC: adaptive_recovery_plan
CREATE OR REPLACE FUNCTION public.adaptive_recovery_plan(p_user_id UUID, p_from_date DATE, p_to_date DATE)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_missed_days INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_missed_days FROM public.study_calendar
    WHERE user_id=p_user_id AND calendar_date BETWEEN p_from_date AND p_to_date AND day_type='missed';

  IF v_missed_days = 0 THEN
    RETURN json_build_object('success',TRUE,'missed_days',0,'plan','[]','type','normal');
  END IF;

  RETURN json_build_object(
    'success',TRUE,
    'missed_days',v_missed_days,
    'type',CASE 
      WHEN v_missed_days<=2 THEN 'recovery'
      WHEN v_missed_days<=5 THEN 'emergency'
      ELSE 'rebuild'
    END,
    'recommendations',CASE 
      WHEN v_missed_days<=2 THEN jsonb_build_array('Complete 1 missed topic','Maintain health routine','No new topics today')
      WHEN v_missed_days<=5 THEN jsonb_build_array('Pause new topics for 2 days','Only P1 topics','Reduce GK to flashcards','Maintain 5AM wake + walk')
      ELSE jsonb_build_array('Drop to minimum viable plan','Keep only CGL + 1 exam','P1 topics only for 1 week','Full rest day this week')
    END
  );
END;
$$;

-- SEED: Default V5.1 Resources (Patch 14)
INSERT INTO public.topic_recommendations (topic_id, subject, resource_name, resource_type, resource_url, priority, is_default) VALUES
('pct','Quant','Rakesh Yadav Arithmetic','book','https://www.amazon.in/Rakesh-Arithmetic-English-Rakesh-Yadav/dp/8192913252',1,TRUE),
('rat','Quant','Rakesh Yadav Arithmetic','book','https://www.amazon.in/Rakesh-Arithmetic-English-Rakesh-Yadav/dp/8192913252',1,TRUE),
('avg','Quant','Rakesh Yadav Arithmetic','book','https://www.amazon.in/Rakesh-Arithmetic-English-Rakesh-Yadav/dp/8192913252',1,TRUE),
('os','CS -- Coal India','Neso Academy OS Playlist','playlist','https://youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O',1,TRUE),
('db','CS -- Coal India','Gate Smashers DBMS','playlist','https://youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',1,TRUE),
('cn','CS -- Coal India','Neso Academy Networks','playlist','https://youtube.com/playlist?list=PLBlnK6fEyqRjMRIDr1GfjEXq8H1Z4oWkt',1,TRUE),
('ds','CS -- Coal India','Gate Smashers DSA','playlist','https://youtube.com/playlist?list=PLxCzCOWd7aiEed7T71X7NuX9O5bS4tC5Y',1,TRUE),
('jad-dm','JAD -- Telecom','Neso Communication Systems','playlist','https://youtube.com/playlist?list=PLBlnK6fEyqRhXVaEqHw1f-5aVkqYB8k0v',1,TRUE),
('jad-wn','JAD -- Telecom','Neso Wireless Communication','playlist','https://youtube.com/playlist?list=PLBlnK6fEyqRg7K0jJqXvXmXmXmXmXmXmX',2,TRUE),
('mh','GK','Lucent GK Book','book','https://www.amazon.in/Lucent-General-Knowledge-English/dp/9356278008',1,TRUE),
('ca','GK','AffairsCloud Monthly PDF','pdf','https://affairscloud.com',1,TRUE),
('rc','English','Word Power Made Easy','book','https://www.amazon.in/Power-Made-Easy-Norman-Lewis/dp/8173725179',2,TRUE),
('err','English','Word Power Made Easy','book','https://www.amazon.in/Power-Made-Easy-Norman-Lewis/dp/8173725179',2,TRUE);

-- FUNCTION: Initialize setup checklist for new user
CREATE OR REPLACE FUNCTION public.initialize_setup_checklist(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.setup_checklist (user_id, item_id, label, is_default) VALUES
    (p_user_id, 'books', 'Books Collected (Lucent GK, Rakesh Yadav Arithmetic)', TRUE),
    (p_user_id, 'pdfs', 'PDFs Collected (PYQs, Mocks)', TRUE),
    (p_user_id, 'resources', 'Resources Organized (Folders, Bookmarks)', TRUE),
    (p_user_id, 'workspace', 'Workspace Ready (Study Table, Chair)', TRUE),
    (p_user_id, 'apps', 'Apps Installed (Testbook, Unacademy, YouTube)', TRUE),
    (p_user_id, 'water', 'Water Bottle (1L marked)', TRUE),
    (p_user_id, 'shoes', 'Walking Shoes Ready', TRUE),
    (p_user_id, 'alarm', 'Alarm Set for 5AM', TRUE),
    (p_user_id, 'table', 'Study Table Clean & Organized', TRUE),
    (p_user_id, 'notebook', 'Error Log Notebook', TRUE);
END;
$$;

-- FUNCTION: Initialize recommended resources for new user
CREATE OR REPLACE FUNCTION public.initialize_recommended_resources(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.resources (user_id, name, type, subject, total_chapters, completed_chapters, status, url, is_default)
  SELECT 
    p_user_id,
    resource_name,
    resource_type::TEXT,
    subject,
    CASE WHEN resource_type = 'book' THEN 1 ELSE 10 END,
    0,
    'not_started',
    resource_url,
    FALSE
  FROM public.topic_recommendations
  WHERE is_default = TRUE;
END;
$$;

-- TRIGGER: Auto-initialize setup checklist on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Call initialize_setup_checklist for the new user
  PERFORM public.initialize_setup_checklist(NEW.id);
  -- Call initialize_recommended_resources for the new user
  PERFORM public.initialize_recommended_resources(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- GRANT permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;