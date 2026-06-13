import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export type ExamId = "cgl" | "chsl" | "ntpc" | "mts" | "coal" | "net" | "jad";
export type PipelineStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ErrorType = "concept" | "formula" | "reading" | "calc" | "time" | "guess";
export type EventId =
  | "coal_clear" | "coal_fail" | "coal_post"
  | "ssc_t1_clear" | "ssc_t1_fail" | "ssc_post"
  | "net_qual" | "net_fail" | "jad_clear" | "jad_post";

export interface HealthLogInput {
  log_date: string;
  wake_time?: string;
  sleep_time?: string;
  sleep_hours?: number;
  water_liters?: number;
  steps?: number;
  exercise_minutes?: number;
  strength_minutes?: number;
  mental_health_score?: number;
  // Legacy fields for backward compatibility
  wake?: number; sleep?: number; water?: number; exercise?: number; strength?: number;
  notes?: string;
}
export interface MockScoreInput {
  exam_id: ExamId; test_date: string; score: number; total: number;
  duration_mins?: number; weak_areas?: string[]; strong_areas?: string[]; notes?: string;
}
export interface ErrorLogInput {
  subject: string; topic: string; error_type: ErrorType; notes?: string;
  source?: "manual" | "mock" | "pyq"; exam_id?: ExamId;
}
export interface StudyLogInput {
  log_date: string; subject: string; topic_id?: string; topic_name?: string;
  hours: number; questions_solved?: number; pyqs_solved?: number;
  accuracy_pct?: number; notes?: string;
}
export interface WeekLogInput {
  week_start: string; study_hours: number; mocks_done: number;
  revisions_done: number; plan_hours: number;
}

export function usePrepData() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // ── Profile ────────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      return data;
    },
    enabled: !!uid,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from("profiles").update(data).eq("id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", uid] }),
  });

  const updateProfile = (data: Record<string, unknown>) => updateProfileMutation.mutate(data);

  const updateAssessment = (scores: { quant: number; reasoning: number; english: number; gk: number; cs: number }) =>
    updateProfile({
      score_quant: scores.quant, score_reasoning: scores.reasoning,
      score_english: scores.english, score_gk: scores.gk,
      score_cs: scores.cs, is_assessed: true,
    });

  const updateDay = (day: number) => updateProfile({ current_day: day });

  // ── Health Logs ────────────────────────────────────────────
  const { data: healthLogs = [] } = useQuery({
    queryKey: ["health_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("health_logs").select("*")
        .eq("user_id", uid).order("log_date", { ascending: false }).limit(30);
      return data ?? [];
    },
    enabled: !!uid, staleTime: 5 * 60 * 1000,
  });

  const logHealthMutation = useMutation({
    mutationFn: async (input: HealthLogInput) => {
      const { error } = await supabase.from("health_logs").upsert({ ...input, user_id: uid }, { onConflict: "user_id,log_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_logs", uid] }),
  });
  const logHealth = (input: HealthLogInput) => logHealthMutation.mutate(input);
  const isLoggingHealth = logHealthMutation.isPending;

  const updateHealthMutation = useMutation({
    mutationFn: async ({id, data}: {id: string; data: HealthLogInput}) => {
      const { error } = await supabase.from("health_logs").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_logs", uid] }),
  });
  const updateHealth = (id: string, data: HealthLogInput) => updateHealthMutation.mutate({id, data});

  const deleteHealthMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("health_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_logs", uid] }),
  });
  const deleteHealth = (id: string) => deleteHealthMutation.mutate(id);

  // ── Mock Scores ────────────────────────────────────────────
  const { data: mockScores = [] } = useQuery({
    queryKey: ["mock_scores", uid],
    queryFn: async () => {
      const { data } = await supabase.from("mock_scores").select("*")
        .eq("user_id", uid).order("test_date", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: !!uid, staleTime: 5 * 60 * 1000,
  });

  const addMockMutation = useMutation({
    mutationFn: async (input: MockScoreInput) => {
      const { error } = await supabase.from("mock_scores").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock_scores", uid] }),
  });
  const addMock = (input: MockScoreInput) => addMockMutation.mutate(input);

  const updateMockMutation = useMutation({
    mutationFn: async ({id, data}: {id: string; data: MockScoreInput}) => {
      const { error } = await supabase.from("mock_scores").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock_scores", uid] }),
  });
  const updateMock = (id: string, data: MockScoreInput) => updateMockMutation.mutate({id, data});

  const deleteMockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mock_scores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock_scores", uid] }),
  });
  const deleteMock = (id: string) => deleteMockMutation.mutate(id);

  // ── Error Logs ─────────────────────────────────────────────
  const { data: errorLogs = [] } = useQuery({
    queryKey: ["error_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("error_logs").select("*")
        .eq("user_id", uid).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
    enabled: !!uid, staleTime: 5 * 60 * 1000,
  });

  const addErrorMutation = useMutation({
    mutationFn: async (input: ErrorLogInput) => {
      const { error } = await supabase.from("error_logs").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["error_logs", uid] }),
  });
  const addError = (input: ErrorLogInput) => addErrorMutation.mutate(input);

  // ── Topic Progress ─────────────────────────────────────────
  const { data: topicProgressList = [] } = useQuery({
    queryKey: ["topic_progress", uid],
    queryFn: async () => {
      const { data } = await supabase.from("topic_progress").select("*").eq("user_id", uid);
      return data ?? [];
    },
    enabled: !!uid, staleTime: 60 * 1000,
  });

  const topicProgressMap = Object.fromEntries((topicProgressList || []).map(t => [t.topic_id, t]));

  const updateTopicMutation = useMutation({
    mutationFn: async ({ topicId, subject, topicName, isDone, stage }: {
      topicId: string; subject: string; topicName: string; isDone: boolean; stage: PipelineStage;
    }) => {
      const { error } = await supabase.from("topic_progress").upsert({
        user_id: uid, topic_id: topicId, topic_name: topicName, subject,
        is_done: isDone, pipeline_stage: stage,
        done_at: isDone ? new Date().toISOString() : undefined,
      }, { onConflict: "user_id,topic_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topic_progress", uid] }),
  });
  const updateTopic = (args: Parameters<typeof updateTopicMutation.mutate>[0]) => updateTopicMutation.mutate(args);

  // ── Revision Log ───────────────────────────────────────────
  const { data: revisionLogs = [] } = useQuery({
    queryKey: ["revision_log", uid],
    queryFn: async () => {
      const { data } = await supabase.from("revision_log").select("*")
        .eq("user_id", uid).order("due_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!uid, staleTime: 60 * 1000,
  });

  const revisionMap = Object.fromEntries((revisionLogs || []).map(r => [r.topic_id, r]));
  const overdueRevisions = (revisionLogs || []).filter(r => new Date(r.due_at) < new Date());
  const upcomingRevisions = (revisionLogs || []).filter(r => {
    const due = new Date(r.due_at), now = new Date();
    return due >= now && (due.getTime() - now.getTime()) < 3 * 86400000;
  });

  const markRevisedMutation = useMutation({
    mutationFn: async ({ topicId, topicName, subject }: { topicId: string; topicName: string; subject: string }) => {
      const existing = revisionMap[topicId];
      const gaps = [1, 3, 7, 15, 30];
      const revCount = existing?.revision_count ?? 0;
      const nextDays = gaps[Math.min(revCount, gaps.length - 1)];
      const dueAt = new Date(Date.now() + nextDays * 86400000).toISOString();
      const now = new Date().toISOString();
      const prevDates: string[] = existing?.revision_dates ?? [];
      return supabase.from("revision_log").upsert({
        user_id: uid, topic_id: topicId, topic_name: topicName, subject,
        done_at: existing?.done_at ?? now, due_at: dueAt,
        revision_count: revCount + 1, revision_dates: [...prevDates, now],
      }, { onConflict: "user_id,topic_id" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revision_log", uid] }),
  });
  const markRevised = (args: Parameters<typeof markRevisedMutation.mutate>[0]) => markRevisedMutation.mutate(args);

  // ── Events ─────────────────────────────────────────────────
  const { data: eventsList = [] } = useQuery({
    queryKey: ["events", uid],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("user_id", uid);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const occurredEventIds = new Set((eventsList || []).filter(e => e.occurred).map(e => e.event_id as EventId));

  const toggleEventMutation = useMutation({
    mutationFn: async (eventId: EventId) => {
      const isActive = occurredEventIds.has(eventId);
      return supabase.from("events").upsert(
        { user_id: uid, event_id: eventId, occurred: !isActive, occurred_at: new Date().toISOString() },
        { onConflict: "user_id,event_id" }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", uid] }),
  });
  const toggleEvent = (id: EventId) => toggleEventMutation.mutate(id);

  // ── Week Logs ──────────────────────────────────────────────
  const { data: weekLogs = [] } = useQuery({
    queryKey: ["week_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("week_logs").select("*")
        .eq("user_id", uid).order("week_start", { ascending: false }).limit(12);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const addWeekLogMutation = useMutation({
    mutationFn: async (input: WeekLogInput) => {
      const { error } = await supabase.from("week_logs").upsert({ ...input, user_id: uid }, { onConflict: "user_id,week_start" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["week_logs", uid] });
      const totalPlan  = (weekLogs || []).reduce((s, w) => s + (w.plan_hours ?? 0), 0);
      const totalStudy = (weekLogs || []).reduce((s, w) => s + (w.study_hours ?? 0), 0);
      updateProfile({ total_plan_hours: totalPlan, total_study_hours: totalStudy });
    },
  });
  const addWeekLog = (input: WeekLogInput) => addWeekLogMutation.mutate(input);

  // ── JAD Progress ───────────────────────────────────────────
  const { data: jadProgress } = useQuery({
    queryKey: ["jad_progress", uid],
    queryFn: async () => {
      const { data } = await supabase.from("jad_progress").select("*").eq("user_id", uid).maybeSingle();
      return data;
    },
    enabled: !!uid,
  });

  const updateJADMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from("jad_progress").upsert({ user_id: uid, ...data }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jad_progress", uid] }),
  });
  const updateJADProgress = (data: Record<string, unknown>) => updateJADMutation.mutate(data);

  // ── NET Units ──────────────────────────────────────────────
  const { data: netUnitList = [] } = useQuery({
    queryKey: ["net_unit_progress", uid],
    queryFn: async () => {
      const { data } = await supabase.from("net_unit_progress").select("*").eq("user_id", uid);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const netUnitMap = Object.fromEntries((netUnitList || []).map(u => [u.unit_number, u.stage]));

  const updateNETUnitMutation = useMutation({
    mutationFn: async ({ unit, stage }: { unit: number; stage: 0 | 1 | 2 | 3 }) => {
      const { error } = await supabase.from("net_unit_progress").upsert(
        { user_id: uid, unit_number: unit, stage },
        { onConflict: "user_id,unit_number" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["net_unit_progress", uid] }),
  });
  const updateNETUnit = (unit: number, stage: 0 | 1 | 2 | 3) => updateNETUnitMutation.mutate({ unit, stage });

  // ── Study Logs ─────────────────────────────────────────────
  const { data: studyLogs = [] } = useQuery({
    queryKey: ["study_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("study_logs").select("*")
        .eq("user_id", uid).order("log_date", { ascending: false }).limit(100);
      return data ?? [];
    },
    enabled: !!uid, staleTime: 5 * 60 * 1000,
  });

  const addStudyLogMutation = useMutation({
    mutationFn: async (input: StudyLogInput) => {
      const { error } = await supabase.from("study_logs").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study_logs", uid] }),
  });
  const addStudyLog = (input: StudyLogInput) => addStudyLogMutation.mutate(input);

  // ── Analytics RPC ──────────────────────────────────────────
  const { data: analyticsSummary } = useQuery({
    queryKey: ["analytics", uid],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_analytics_summary", { p_user_id: uid });
      return data;
    },
    enabled: !!uid, staleTime: 10 * 60 * 1000,
  });

  const { data: streakCounts } = useQuery({
    queryKey: ["streaks", uid],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_streak_counts", { p_user_id: uid });
      return data;
    },
    enabled: !!uid, staleTime: 5 * 60 * 1000,
  });

  return {
    profile, updateProfile, updateAssessment, updateDay,
    healthLogs, logHealth, updateHealth, deleteHealth, isLoggingHealth,
    mockScores, addMock, updateMock, deleteMock,
    errorLogs, addError,
    topicProgressMap, updateTopic,
    revisionMap, overdueRevisions, upcomingRevisions, markRevised,
    occurredEventIds, toggleEvent,
    weekLogs, addWeekLog,
    jadProgress, updateJADProgress,
    netUnitMap, updateNETUnit,
    analyticsSummary, streakCounts,
  };
}
