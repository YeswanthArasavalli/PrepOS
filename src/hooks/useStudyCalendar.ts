import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface StudyCalendarDay {
  id: string;
  calendar_date: string;
  day_type: "study" | "mock" | "revision" | "rest" | "missed";
  study_hours: number;
  mocks_done: number;
  health_score: number;
  execution_score: number;
  notes?: string;
}

export function useStudyCalendar() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  const { data: calendarDays = [], isLoading } = useQuery({
    queryKey: ["study_calendar", uid],
    queryFn: async () => {
      const prepStart = profile?.prep_start_date || "2026-06-13";
      const { data } = await supabase.from("study_calendar")
        .select("*")
        .eq("user_id", uid)
        .gte("calendar_date", prepStart)
        .order("calendar_date", { ascending: false });
      return (data as StudyCalendarDay[]) || [];
    },
    enabled: !!uid && !!profile,
    staleTime: 10 * 60 * 1000,
  });

  const { data: recoveryPlan } = useQuery({
    queryKey: ["recovery_plan", uid],
    queryFn: async () => {
      const prepStart = profile?.prep_start_date || "2026-06-13";
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.rpc("adaptive_recovery_plan", {
        p_user_id: uid,
        p_from_date: prepStart,
        p_to_date: today,
      });
      return data;
    },
    enabled: !!uid && !!profile,
  });

  const upsertDayMutation = useMutation({
    mutationFn: async (day: Omit<StudyCalendarDay, "id">) => {
      const { error } = await supabase.from("study_calendar").upsert({
        ...day,
        user_id: uid,
      }, { onConflict: "user_id,calendar_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_calendar", uid] });
      qc.invalidateQueries({ queryKey: ["recovery_plan", uid] });
    },
  });

  const markDayAsMissedMutation = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from("study_calendar").upsert({
        user_id: uid,
        calendar_date: date,
        day_type: "missed",
        study_hours: 0,
        mocks_done: 0,
        health_score: 0,
        execution_score: 0,
      }, { onConflict: "user_id,calendar_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study_calendar", uid] });
      qc.invalidateQueries({ queryKey: ["recovery_plan", uid] });
    },
  });

  const checkAndMarkMissedDays = async () => {
    const prepStart = new Date(profile?.prep_start_date || "2026-06-13");
    const today = new Date();
    const currentDate = new Date(prepStart);
    
    while (currentDate < today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      
      const { data: existing } = await supabase.from("study_calendar")
        .select("id")
        .eq("user_id", uid)
        .eq("calendar_date", dateStr)
        .single();
      
      if (!existing) {
        const { data: healthLog } = await supabase.from("health_logs")
          .select("id")
          .eq("user_id", uid)
          .eq("log_date", dateStr)
          .single();
        
        if (!healthLog) {
          await markDayAsMissedMutation.mutateAsync(dateStr);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return calendarDays.filter((day) => {
      const dayDate = new Date(day.calendar_date);
      return dayDate >= firstDay && dayDate <= lastDay;
    });
  };

  const getStats = () => {
    const totalDays = calendarDays.length;
    const studyDays = calendarDays.filter((d) => d.day_type === "study").length;
    const mockDays = calendarDays.filter((d) => d.day_type === "mock").length;
    const missedDays = calendarDays.filter((d) => d.day_type === "missed").length;
    const restDays = calendarDays.filter((d) => d.day_type === "rest").length;
    const avgHealth = calendarDays.reduce((sum, d) => sum + (d.health_score || 0), 0) / Math.max(totalDays, 1);
    const avgExecution = calendarDays.reduce((sum, d) => sum + (d.execution_score || 0), 0) / Math.max(totalDays, 1);

    return {
      totalDays,
      studyDays,
      mockDays,
      missedDays,
      restDays,
      avgHealth: Math.round(avgHealth),
      avgExecution: Math.round(avgExecution),
    };
  };

  return {
    calendarDays,
    isLoading,
    upsertDay: (day: Omit<StudyCalendarDay, "id">) => upsertDayMutation.mutate(day),
    markDayAsMissed: (date: string) => markDayAsMissedMutation.mutate(date),
    checkAndMarkMissedDays,
    recoveryPlan,
    missedDays: recoveryPlan?.missed_days || 0,
    isRecoveryMode: (recoveryPlan?.missed_days || 0) >= 2,
    recoveryType: recoveryPlan?.type || "normal",
    recommendations: recoveryPlan?.recommendations || [],
    getMonthData,
    getStats,
  };
}