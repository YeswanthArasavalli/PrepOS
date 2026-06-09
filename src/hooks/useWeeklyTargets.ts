import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface WeeklyTarget {
  id: string;
  week_start: string;
  week_end: string;
  targets: any[];
  study_hours_target: number;
  mocks_target: number;
  revisions_target: number;
  success_score?: number;
  status: "active" | "completed" | "partial";
}

export function useWeeklyTargets() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  const { data: weeklyTargets = [], isLoading } = useQuery({
    queryKey: ["weekly_targets", uid],
    queryFn: async () => {
      const { data } = await supabase.from("weekly_targets")
        .select("*")
        .eq("user_id", uid)
        .order("week_start", { ascending: false });
      return (data as WeeklyTarget[]) || [];
    },
    enabled: !!uid,
    staleTime: 10 * 60 * 1000,
  });

  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  };

  const createWeeklyTargetMutation = useMutation({
    mutationFn: async (target: Omit<WeeklyTarget, "id" | "success_score">) => {
      const { error } = await supabase.from("weekly_targets").insert({
        ...target,
        user_id: uid,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly_targets", uid] }),
  });

  const updateWeeklyTargetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WeeklyTarget> }) => {
      const { error } = await supabase.from("weekly_targets")
        .update(updates)
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly_targets", uid] }),
  });

  const calculateSuccessMutation = useMutation({
    mutationFn: async (weekStart: string) => {
      const { data, error } = await supabase.rpc("calculate_weekly_success", {
        p_user_id: uid,
        p_week_start: weekStart,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly_targets", uid] }),
  });

  const getOrCreateCurrentWeek = () => {
    const currentWeek = weeklyTargets.find((t) => {
      const now = new Date();
      const start = new Date(t.week_start);
      const end = new Date(t.week_end);
      return now >= start && now <= end;
    });

    if (!currentWeek) {
      const range = getCurrentWeekRange();
      const defaultTargets = [
        { topic_id: "pct", subject: "Quant", planned_days: 3, completed_days: 0, status: "pending" },
        { topic_id: "rat", subject: "Quant", planned_days: 2, completed_days: 0, status: "pending" },
        { topic_id: "avg", subject: "Quant", planned_days: 2, completed_days: 0, status: "pending" },
      ];
      createWeeklyTargetMutation.mutate({
        week_start: range.start,
        week_end: range.end,
        targets: defaultTargets,
        study_hours_target: 56,
        mocks_target: 7,
        revisions_target: 7,
        status: "active",
      });
    }

    return currentWeek;
  };

  return {
    weeklyTargets,
    isLoading,
    createWeeklyTarget: (target: Omit<WeeklyTarget, "id" | "success_score">) =>
      createWeeklyTargetMutation.mutate(target),
    updateWeeklyTarget: (id: string, updates: Partial<WeeklyTarget>) =>
      updateWeeklyTargetMutation.mutate({ id, updates }),
    calculateSuccess: (weekStart: string) =>
      calculateSuccessMutation.mutate(weekStart),
    getOrCreateCurrentWeek,
    currentWeek: getOrCreateCurrentWeek(),
  };
}