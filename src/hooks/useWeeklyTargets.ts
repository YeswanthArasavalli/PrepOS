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
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Prep start date: June 13, 2026
  const PREP_START_DATE = profile?.prep_start_date || "2026-06-13";

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
    const prepStart = new Date(PREP_START_DATE);
    const now = new Date();
    
    // If before prep start, use prep start week
    if (now < prepStart) {
      const monday = new Date(prepStart);
      const dayOfWeek = monday.getDay();
      const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const start = new Date(monday.setDate(diff));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      };
    }
    
    // Use current week
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

  const currentWeek = Array.isArray(weeklyTargets) ? weeklyTargets.find((t) => {
    const now = new Date();
    const start = new Date(t.week_start);
    const end = new Date(t.week_end);
    return now >= start && now <= end;
  }) : undefined;

  return {
    weeklyTargets,
    isLoading,
    createWeeklyTarget: (target: Omit<WeeklyTarget, "id" | "success_score">) =>
      createWeeklyTargetMutation.mutate(target),
    updateWeeklyTarget: (id: string, updates: Partial<WeeklyTarget>) =>
      updateWeeklyTargetMutation.mutate({ id, updates }),
    calculateSuccess: (weekStart: string) =>
      calculateSuccessMutation.mutate(weekStart),
    getCurrentWeekRange,
    currentWeek,
  };
}