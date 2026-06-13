import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcExecutionRatio, getExecutionMode } from "../lib/formulas-v2";

export interface ExecutionData {
  planningHours: number;
  studyHours: number;
  ratio: number;
  mode: 'execution' | 'planning' | 'danger';
  message: string;
  level: 'great' | 'ok' | 'warn' | 'danger';
  dailyScore: number;
  weeklyScore: number;
}

export function useExecutionMode() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Fetch study logs
  const { data: studyLogs } = useQuery({
    queryKey: ["study_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("study_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch week logs
  const { data: weekLogs } = useQuery({
    queryKey: ["week_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("week_logs")
        .select("*")
        .eq("user_id", uid)
        .order("week_start", { ascending: false })
        .limit(12);
      return data || [];
    },
    enabled: !!uid,
  });

  // Calculate execution metrics
  const calculateExecution = (): ExecutionData => {
    const planningHours = profile?.total_plan_hours || 0;
    const studyHours = profile?.total_study_hours || 0;
    
    const ratio = calcExecutionRatio(planningHours, studyHours);
    const { mode, message, level } = getExecutionMode(ratio, 0, 0);
    
    // Daily score (today)
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = (studyLogs || []).filter(log => log.log_date === today);
    const dailyStudyHours = todayLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0;
    const dailyScore = Math.min(100, Math.round((dailyStudyHours / 8) * 100));
    
    // Weekly score
    const weeklyStudyHours = weekLogs?.[0]?.study_hours || 0;
    const weeklyMocks = weekLogs?.[0]?.mocks_done || 0;
    const weeklyRevisions = weekLogs?.[0]?.revisions_done || 0;
    const weeklyScore = Math.round(
      (Math.min(100, (weeklyStudyHours / 56) * 100) * 0.4) +
      (Math.min(100, (weeklyMocks / 7) * 100) * 0.3) +
      (Math.min(100, (weeklyRevisions / 7) * 100) * 0.3)
    );
    
    return {
      planningHours,
      studyHours,
      ratio,
      mode,
      message,
      level,
      dailyScore,
      weeklyScore,
    };
  };

  const execution = calculateExecution();

  // Save execution log
  const saveExecutionLogMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("execution_logs").insert({
        user_id: uid,
        log_date: new Date().toISOString().split("T")[0],
        planning_hours: execution.planningHours,
        study_hours: execution.studyHours,
        execution_ratio: execution.ratio,
        execution_score: execution.dailyScore,
        mode: execution.mode,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["execution_logs", uid] });
    },
  });

  return {
    ...execution,
    isOverPlanning: execution.mode === 'planning',
    isInDanger: execution.level === 'danger',
    saveExecutionLog: () => saveExecutionLogMutation.mutate(),
  };
}