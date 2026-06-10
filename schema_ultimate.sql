-- ============================================================
-- PrepOS Qwen Ultimate Edition — Database Schema
-- Run this AFTER schema_v1.1.sql
-- ============================================================

-- TABLE 1: readiness_snapshots
CREATE TABLE IF NOT EXISTS public.readiness_snapshots (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  cgl_readiness       SMALLINT,
  coal_readiness      SMALLINT,
  net_readiness       SMALLINT,
  jad_readiness       SMALLINT,
  overall_readiness   SMALLINT,
  syllabus_pct        SMALLINT,
  mock_pct            SMALLINT,
  revision_pct        SMALLINT,
  pyq_pct             SMALLINT,
  consistency_pct     SMALLINT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, snapshot_date)
);

-- TABLE 2: event_triggers
CREATE TABLE IF NOT EXISTS public.event_triggers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id            TEXT NOT NULL,
  triggered_at        TIMESTAMPTZ DEFAULT NOW(),
  allocation_changes  JSONB DEFAULT '[]',
  readiness_changes   JSONB DEFAULT '[]',
  task_changes        JSONB DEFAULT '[]',
  status              TEXT DEFAULT 'active',
  UNIQUE (user_id, event_id)
);

-- TABLE 3: adaptive_allocations
CREATE TABLE IF NOT EXISTS public.adaptive_allocations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  allocation_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  quant_alloc         SMALLINT,
  reasoning_alloc     SMALLINT,
  english_alloc       SMALLINT,
  gk_alloc            SMALLINT,
  technical_alloc     SMALLINT,
  generated_by        TEXT DEFAULT 'adaptive_routing_v2',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, allocation_date)
);

-- TABLE 4: streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_type         TEXT NOT NULL,
  current_streak      INTEGER DEFAULT 0,
  longest_streak      INTEGER DEFAULT 0,
  last_activity       DATE DEFAULT CURRENT_DATE,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, streak_type)
);

-- TABLE 5: execution_logs
CREATE TABLE IF NOT EXISTS public.execution_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  planning_hours      NUMERIC(5,1),
  study_hours         NUMERIC(5,1),
  execution_ratio     NUMERIC(5,2),
  execution_score     SMALLINT,
  mode                TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, log_date)
);

-- TABLE 6: revision_queue
CREATE TABLE IF NOT EXISTS public.revision_queue (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id            TEXT NOT NULL,
  priority            SMALLINT DEFAULT 4,
  due_date            DATE NOT NULL,
  overdue_days        INTEGER DEFAULT 0,
  revision_cycle      SMALLINT DEFAULT 0,
  status              TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_user_date ON public.readiness_snapshots (user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_triggers_user ON public.event_triggers (user_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_adaptive_allocations_user_date ON public.adaptive_allocations (user_id, allocation_date DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON public.streaks (user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_date ON public.execution_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_revision_queue_user_priority ON public.revision_queue (user_id, priority ASC, due_date ASC);

-- ROW LEVEL SECURITY
ALTER TABLE public.readiness_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_triggers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_allocations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_queue           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readiness_snapshots: own"    ON public.readiness_snapshots      FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "event_triggers: own"         ON public.event_triggers           FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "adaptive_allocations: own"   ON public.adaptive_allocations     FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "streaks: own"                ON public.streaks                  FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "execution_logs: own"         ON public.execution_logs           FOR ALL USING (auth.uid()=user_id);
CREATE POLICY "revision_queue: own"         ON public.revision_queue           FOR ALL USING (auth.uid()=user_id);

-- RPC: update_revision_queue
CREATE OR REPLACE FUNCTION public.update_revision_queue()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Update overdue days
  NEW.overdue_days := GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - NEW.due_date))::INTEGER);
  
  -- Update priority based on overdue days and revision cycle
  IF NEW.overdue_days > 7 THEN
    NEW.priority := 1; -- Critical
  ELSIF NEW.overdue_days > 3 THEN
    NEW.priority := 2; -- High
  ELSIF NEW.overdue_days > 0 THEN
    NEW.priority := 3; -- Medium
  ELSE
    NEW.priority := 4; -- Normal
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- TRIGGER: auto-update revision queue
CREATE TRIGGER set_revision_queue_priority
  BEFORE INSERT OR UPDATE ON public.revision_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_revision_queue();

-- GRANT permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- SEED: Initialize streaks for common types
-- (This will be done automatically by the app on first login)