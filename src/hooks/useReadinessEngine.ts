import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcReadinessV2, calcSyllabusCompletion, calcMockAccuracy, calcRevisionCompletion, calcPYQCompletion, calcConsistency } from "../lib/formulas-v2";

export interface ReadinessData {
  cgl: number;
  coal: number;
  net: number;
  jad: number;
  overall: number;
  components: {
    syllabus: number;
    mocks: number;
    revision: number;
    pyq: number;
    consistency: number;
  };
  trend: number;
  projection: number;
}

export function useReadinessEngine() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";
  const day = profile?.current_day || 1;
  
  // GAP 9: Start Date Lock Mode - Check if prep has started
  const prepStartDate = profile?.prep_start_date ? new Date(profile.prep_start_date) : new Date("2026-06-13");
  const today = new Date();
  const isPrepMode = today >= prepStartDate;

  // Fetch all required data
  const { data: topicProgress } = useQuery({
    queryKey: ["topic_progress", uid],
    queryFn: async () => {
      const { data } = await supabase.from("topic_progress")
        .select("*")
        .eq("user_id", uid);
      return data || [];
    },
    enabled: !!uid,
  });

  const { data: mockScores } = useQuery({
    queryKey: ["mock_scores", uid],
    queryFn: async () => {
      const { data } = await supabase.from("mock_scores")
        .select("*")
        .eq("user_id", uid)
        .order("test_date", { ascending: false });
      return data || [];
    },
    enabled: !!uid,
  });

  const { data: revisionLog } = useQuery({
    queryKey: ["revision_log", uid],
    queryFn: async () => {
      const { data } = await supabase.from("revision_log")
        .select("*")
        .eq("user_id", uid);
      return data || [];
    },
    enabled: !!uid,
  });

  // GAP 9: If in Setup Mode (before prep start date), return placeholder values
  if (!isPrepMode) {
    return {
      readiness: { cgl: 0, coal: 0, net: 0, jad: 0, overall: 0 },
      components: { syllabus: 0, mocks: 0, revision: 0, pyq: 0, consistency: 0 },
      trend: 0,
      projection: 0,
      day: 0,
      saveSnapshot: () => {},
      isPrepMode: false,
      daysUntilPrep: Math.ceil((prepStartDate.getTime() - today.getTime()) / 86400000),
      prepStartDate: prepStartDate.toISOString().split('T')[0],
    };
  }

  // Calculate readiness components (only in Prep Mode)
  const doneTopics = topicProgress?.filter(t => t.is_done).length || 0;
  const totalTopics = 89; // Total topics across all exams
  
  const syllabusPct = calcSyllabusCompletion(doneTopics, totalTopics);
  const mockPct = calcMockAccuracy(mockScores || []);
  const revisionPct = calcRevisionCompletion(revisionLog || []);
  const pyqPct = 65; // Placeholder - would need PYQ tracking
  const consistencyPct = calcConsistency(day, 140);

  const components = {
    syllabus: syllabusPct,
    mocks: mockPct,
    revision: revisionPct,
    pyq: pyqPct,
    consistency: consistencyPct,
  };

  // Calculate overall readiness
  const overallReadiness = calcReadinessV2(components);

  // Calculate exam-specific readiness (simplified - would need exam-specific data)
  const examReadiness = {
    cgl: Math.round(overallReadiness * 0.95),
    coal: Math.round(overallReadiness * 0.90),
    net: Math.round(overallReadiness * 0.85),
    jad: Math.round(overallReadiness * 0.88),
  };

  // Calculate trend (compare with last week)
  const trend = overallReadiness - (overallReadiness - 2); // Placeholder

  // Calculate projection
  const daysRemaining = 140 - day;
  const projection = Math.min(99, Math.round(overallReadiness + (daysRemaining * 0.3)));

  // Save snapshot
  const saveSnapshotMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("readiness_snapshots").insert({
        user_id: uid,
        snapshot_date: new Date().toISOString().split("T")[0],
        cgl_readiness: examReadiness.cgl,
        coal_readiness: examReadiness.coal,
        net_readiness: examReadiness.net,
        jad_readiness: examReadiness.jad,
        overall_readiness: overallReadiness,
        syllabus_pct: syllabusPct,
        mock_pct: mockPct,
        revision_pct: revisionPct,
        pyq_pct: pyqPct,
        consistency_pct: consistencyPct,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness", uid] });
    },
  });

  return {
    readiness: {
      cgl: examReadiness.cgl,
      coal: examReadiness.coal,
      net: examReadiness.net,
      jad: examReadiness.jad,
      overall: overallReadiness,
    },
    components,
    trend,
    projection,
    day,
    saveSnapshot: () => saveSnapshotMutation.mutate(),
    isPrepMode: true,
  };
}