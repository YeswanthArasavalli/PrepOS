-- ============================================================
-- PrepOS V1 — Supabase PostgreSQL Schema
-- Run entire file in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT,
  display_name        TEXT,
  is_assessed         BOOLEAN DEFAULT FALSE,
  current_day         INTEGER DEFAULT 1,
  freeze_date         DATE DEFAULT '2026-06-02',
  prep_start_date     DATE DEFAULT '2026-06-03',
  score_quant         SMALLINT DEFAULT 2 CHECK (score_quant BETWEEN 0 AND 9),
  score_reasoning     SMALLINT DEFAULT 2 CHECK (score_reasoning BETWEEN 0 AND 9),
  score_english       SMALLINT DEFAULT 3 CHECK (score_english BETWEEN 0 AND 9),
  score_gk            SMALLINT DEFAULT 2 CHECK (score_gk BETWEEN 0 AND 9),
  score_cs            SMALLINT DEFAULT 1 CHECK (score_cs BETWEEN 0 AND 9),
  total_plan_hours    NUMERIC(8,1) DEFAULT 0,
  total_study_hours   NUMERIC(8,1) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: health_logs
CREATE TABLE IF NOT EXISTS public.health_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  wake         NUMERIC(3,2) DEFAULT 0 CHECK (wake BETWEEN 0 AND 1),
  sleep        NUMERIC(3,2) DEFAULT 0 CHECK (sleep BETWEEN 0 AND 1),
  water        NUMERIC(3,2) DEFAULT 0 CHECK (water BETWEEN 0 AND 1),
  exercise     NUMERIC(3,2) DEFAULT 0 CHECK (exercise BETWEEN 0 AND 1),
  steps        NUMERIC(3,2) DEFAULT 0 CHECK (steps BETWEEN 0 AND 1),
  strength     NUMERIC(3,2) DEFAULT 0 CHECK (strength BETWEEN 0 AND 1),
  health_score SMALLINT GENERATED ALWAYS AS (
    ROUND(wake*20 + sleep*20 + steps*20 + water*15 + exercise*15 + strength*10)::SMALLINT
  ) STORED,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, log_date)
);

-- TABLE 3: study_logs
CREATE TABLE IF NOT EXISTS public.study_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  subject          TEXT NOT NULL,
  topic_id         TEXT,
  topic_name       TEXT,
  hours            NUMERIC(4,2) DEFAULT 0,
  questions_solved INTEGER DEFAULT 0,
  pyqs_solved      INTEGER DEFAULT 0,
  accuracy_pct     SMALLINT CHECK (accuracy_pct BETWEEN 0 AND 100),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: mock_scores
CREATE TABLE IF NOT EXISTS public.mock_scores (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id      TEXT NOT NULL,
  test_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  score        NUMERIC(6,2) NOT NULL,
  total        NUMERIC(6,2) NOT NULL,
  accuracy_pct SMALLINT GENERATED ALWAYS AS (
    ROUND((score / NULLIF(total,0)) * 100)::SMALLINT
  ) STORED,
  duration_mins INTEGER,
  weak_areas   JSONB DEFAULT '[]',
  strong_areas JSONB DEFAULT '[]',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 5: error_logs
CREATE TABLE IF NOT EXISTS public.error_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  subject     TEXT NOT NULL,
  topic       TEXT NOT NULL,
  error_type  TEXT NOT NULL CHECK (error_type IN ('concept','formula','reading','calc','time','guess')),
  notes       TEXT,
  source      TEXT DEFAULT 'manual',
  exam_id     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: topic_progress
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id       TEXT NOT NULL,
  topic_name     TEXT NOT NULL,
  subject        TEXT NOT NULL,
  pipeline_stage SMALLINT DEFAULT 0 CHECK (pipeline_stage BETWEEN 0 AND 7),
  is_done        BOOLEAN DEFAULT FALSE,
  done_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

-- TABLE 7: revision_log
CREATE TABLE IF NOT EXISTS public.revision_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id       TEXT NOT NULL,
  topic_name     TEXT NOT NULL,
  subject        TEXT NOT NULL,
  done_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at         TIMESTAMPTZ NOT NULL,
  revision_count INTEGER DEFAULT 0,
  revision_dates JSONB DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

-- TABLE 8: events
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id    TEXT NOT NULL,
  occurred    BOOLEAN DEFAULT TRUE,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- TABLE 9: week_logs
CREATE TABLE IF NOT EXISTS public.week_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,
  study_hours    NUMERIC(5,1) DEFAULT 0,
  mocks_done     SMALLINT DEFAULT 0,
  revisions_done SMALLINT DEFAULT 0,
  plan_hours     NUMERIC(5,1) DEFAULT 0,
  exec_score     SMALLINT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- TABLE 10: jad_progress
CREATE TABLE IF NOT EXISTS public.jad_progress (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tech_stars            SMALLINT DEFAULT 0 CHECK (tech_stars BETWEEN 0 AND 5),
  comm_stars            SMALLINT DEFAULT 0 CHECK (comm_stars BETWEEN 0 AND 5),
  wireless_stars        SMALLINT DEFAULT 0 CHECK (wireless_stars BETWEEN 0 AND 5),
  cyber_stars           SMALLINT DEFAULT 0 CHECK (cyber_stars BETWEEN 0 AND 5),
  current_affairs_stars SMALLINT DEFAULT 0 CHECK (current_affairs_stars BETWEEN 0 AND 5),
  polnet_stars          SMALLINT DEFAULT 0 CHECK (polnet_stars BETWEEN 0 AND 5),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- TABLE 11: net_unit_progress
CREATE TABLE IF NOT EXISTS public.net_unit_progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_number SMALLINT NOT NULL CHECK (unit_number BETWEEN 1 AND 10),
  stage       SMALLINT DEFAULT 0 CHECK (stage BETWEEN 0 AND 3),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, unit_number)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_health_logs_user_date   ON public.health_logs   (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date    ON public.study_logs    (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_mock_scores_user_exam   ON public.mock_scores   (user_id, exam_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_subject ON public.error_logs    (user_id, subject, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_topic_progress_user     ON public.topic_progress(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_revision_log_due        ON public.revision_log  (user_id, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_events_user             ON public.events        (user_id, event_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jad_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_unit_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own"          ON public.profiles          FOR ALL USING (auth.uid()=id);
CREATE POLICY "health_logs: own"       ON public.health_logs       FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "study_logs: own"        ON public.study_logs        FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "mock_scores: own"       ON public.mock_scores       FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "error_logs: own"        ON public.error_logs        FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "topic_progress: own"    ON public.topic_progress    FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "revision_log: own"      ON public.revision_log      FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "events: own"            ON public.events            FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "week_logs: own"         ON public.week_logs         FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "jad_progress: own"      ON public.jad_progress      FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "net_unit_progress: own" ON public.net_unit_progress FOR ALL USING (auth.uid()=user_id);

-- TRIGGER: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER set_profiles_updated_at       BEFORE UPDATE ON public.profiles       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_topic_progress_updated_at BEFORE UPDATE ON public.topic_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_revision_log_updated_at   BEFORE UPDATE ON public.revision_log   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RPC: get_analytics_summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_mock JSON; v_err JSON; v_done INT; v_overdue INT;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO v_mock FROM (
    SELECT exam_id, COUNT(*)::INT as count, ROUND(AVG(accuracy_pct))::INT as avg_accuracy,
      (array_agg(accuracy_pct ORDER BY test_date DESC))[1] - (array_agg(accuracy_pct ORDER BY test_date ASC))[1] as trend
    FROM public.mock_scores WHERE user_id=p_user_id GROUP BY exam_id ORDER BY avg_accuracy DESC
  ) t;
  SELECT json_agg(row_to_json(t)) INTO v_err FROM (
    SELECT subject, COUNT(*)::INT as count FROM public.error_logs WHERE user_id=p_user_id GROUP BY subject ORDER BY count DESC LIMIT 10
  ) t;
  SELECT COUNT(*) INTO v_done FROM public.topic_progress WHERE user_id=p_user_id AND is_done=TRUE;
  SELECT COUNT(*) INTO v_overdue FROM public.revision_log WHERE user_id=p_user_id AND due_at < NOW();
  RETURN json_build_object(
    'mock_by_exam', COALESCE(v_mock,'[]'::JSON),
    'error_by_subject', COALESCE(v_err,'[]'::JSON),
    'topics_done', COALESCE(v_done,0),
    'topics_total', 89,
    'overdue_revisions', COALESCE(v_overdue,0)
  );
END;
$$;

-- RPC: get_streak_counts
CREATE OR REPLACE FUNCTION public.get_streak_counts(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_wake INT:=0; v_sleep INT:=0; v_water INT:=0; v_steps INT:=0; v_exer INT:=0;
  v_today DATE:=CURRENT_DATE; v_log RECORD;
BEGIN
  FOR v_log IN
    SELECT log_date,wake,sleep,water,steps,exercise FROM public.health_logs
    WHERE user_id=p_user_id AND log_date>=(v_today-30) ORDER BY log_date DESC
  LOOP
    IF v_log.wake>=1   AND (v_wake=0  OR v_log.log_date=v_today-v_wake*'1 day'::interval)  THEN v_wake:=v_wake+1;   END IF;
    IF v_log.sleep>=1  AND (v_sleep=0 OR v_log.log_date=v_today-v_sleep*'1 day'::interval) THEN v_sleep:=v_sleep+1; END IF;
    IF v_log.water>=0.9 AND (v_water=0 OR v_log.log_date=v_today-v_water*'1 day'::interval) THEN v_water:=v_water+1; END IF;
    IF v_log.steps>=0.9 AND (v_steps=0 OR v_log.log_date=v_today-v_steps*'1 day'::interval) THEN v_steps:=v_steps+1; END IF;
    IF v_log.exercise>=1 AND (v_exer=0 OR v_log.log_date=v_today-v_exer*'1 day'::interval) THEN v_exer:=v_exer+1; END IF;
  END LOOP;
  RETURN json_build_object('wake',v_wake,'sleep',v_sleep,'water',v_water,'steps',v_steps,'exercise',v_exer);
END;
$$;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
