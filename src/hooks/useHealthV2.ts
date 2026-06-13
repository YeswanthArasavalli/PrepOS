import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcHealthV2, calcHealthReadiness } from "../lib/formulas-v2";

export interface HealthV2Data {
  daily: number;
  weekly: number;
  monthly: number;
  readiness: number;
  components: {
    wake: number;
    sleep: number;
    steps: number;
    water: number;
    exercise: number;
    strength: number;
  };
  breakdown: {
    label: string;
    value: number;
    weight: number;
    score: number;
  }[];
}

export function useHealthV2() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Fetch health logs
  const { data: healthLogs } = useQuery({
    queryKey: ["health_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("health_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false })
        .limit(30);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!uid,
  });

  // Calculate health metrics
  const calculateHealth = (): HealthV2Data => {
    if (!Array.isArray(healthLogs) || healthLogs.length === 0) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        readiness: 0,
        components: {
          wake: 0,
          sleep: 0,
          steps: 0,
          water: 0,
          exercise: 0,
          strength: 0,
        },
        breakdown: [],
      };
    }

    // Daily (today)
    const today = new Date().toISOString().split("T")[0];
    const todayLog = healthLogs.find(log => log.log_date === today);
    const daily = todayLog ? calcHealthV2(todayLog) : 0;

    // Weekly (last 7 days)
    const weeklyLogs = healthLogs.slice(0, 7);
    const weekly = weeklyLogs.length > 0
      ? Math.round(weeklyLogs.reduce((sum, log) => sum + calcHealthV2(log), 0) / weeklyLogs.length)
      : 0;

    // Monthly (last 30 days)
    const monthly = healthLogs.length > 0
      ? Math.round(healthLogs.reduce((sum, log) => sum + calcHealthV2(log), 0) / healthLogs.length)
      : 0;

    // Readiness (weekly average)
    const readiness = calcHealthReadiness(weeklyLogs);

    // Components (weekly averages)
    const avgComponent = (key: keyof typeof weeklyLogs[0]) => {
      const sum = weeklyLogs.reduce((acc, log) => acc + (log[key] as number || 0), 0);
      return Math.round((sum / weeklyLogs.length) * 100);
    };

    const components = {
      wake: avgComponent('wake'),
      sleep: avgComponent('sleep'),
      steps: avgComponent('steps'),
      water: avgComponent('water'),
      exercise: avgComponent('exercise'),
      strength: avgComponent('strength'),
    };

    // Breakdown with weights
    const breakdown = [
      { label: "Wake (5AM)", value: components.wake, weight: 20, score: Math.round(components.wake * 0.2) },
      { label: "Sleep (10PM)", value: components.sleep, weight: 20, score: Math.round(components.sleep * 0.2) },
      { label: "Steps (10K)", value: components.steps, weight: 20, score: Math.round(components.steps * 0.2) },
      { label: "Water (3L)", value: components.water, weight: 15, score: Math.round(components.water * 0.15) },
      { label: "Exercise", value: components.exercise, weight: 15, score: Math.round(components.exercise * 0.15) },
      { label: "Strength", value: components.strength, weight: 10, score: Math.round(components.strength * 0.1) },
    ];

    return {
      daily,
      weekly,
      monthly,
      readiness,
      components,
      breakdown,
    };
  };

  const health = calculateHealth();

  // Save health log
  const saveHealthLogMutation = useMutation({
    mutationFn: async (log: {
      wake: number;
      sleep: number;
      water: number;
      exercise: number;
      steps: number;
      strength: number;
    }) => {
      const healthScore = calcHealthV2(log);
      const { error } = await supabase.from("health_logs").upsert({
        user_id: uid,
        log_date: new Date().toISOString().split("T")[0],
        ...log,
        health_score: healthScore,
      }, { onConflict: "user_id,log_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health_logs", uid] });
      qc.invalidateQueries({ queryKey: ["health_v2", uid] });
    },
  });

  return {
    ...health,
    saveHealthLog: (log: Parameters<typeof saveHealthLogMutation.mutate>[0]) => 
      saveHealthLogMutation.mutate(log),
  };
}