import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface DailyTask {
  id: string;
  title: string;
  type: "study" | "revision" | "health" | "mock" | "recovery";
  priority: 1 | 2 | 3;
  scheduled_time?: string;
  topic_id?: string;
  subject?: string;
  completed: boolean;
  carried_from?: string;
  recovery_days?: number;
}

export interface DailyPlan {
  id: string;
  plan_date: string;
  tasks: DailyTask[];
  study_hours_target: number;
  health_target: Record<string, number>;
  completion_pct: number;
  is_generated: boolean;
}

export function useDailyPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";
  const today = new Date().toISOString().split("T")[0];

  // Fetch daily plan from database (not RPC)
  const { data: dailyPlan, isLoading, refetch } = useQuery({
    queryKey: ["daily_plan", uid, today],
    queryFn: async () => {
      const { data } = await supabase.from("daily_plans")
        .select("*")
        .eq("user_id", uid)
        .eq("plan_date", today)
        .single();
      return data || null;
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { data: plan } = await supabase.from("daily_plans")
        .select("tasks").eq("user_id", uid).eq("plan_date", today).single();
      
      const tasks = ((plan?.tasks as any[]) || []).map((t) => 
        t.id === taskId ? { ...t, completed } : t
      );
      
      const completionPct = Math.round(
        (tasks.filter((t) => t.completed).length / Math.max(tasks.length, 1)) * 100
      );
      
      const { error } = await supabase.from("daily_plans").update({ 
        tasks, 
        completion_pct: completionPct 
      }).eq("user_id", uid).eq("plan_date", today);

      if (error) throw error;
      return { taskId, completed };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_plan", uid] });
      qc.invalidateQueries({ queryKey: ["study_calendar", uid] });
    },
  });

  const addCustomTaskMutation = useMutation({
    mutationFn: async (task: Omit<DailyTask, "id">) => {
      const { data: plan } = await supabase.from("daily_plans")
        .select("tasks").eq("user_id", uid).eq("plan_date", today).single();
      
      const newTask = { ...task, id: crypto.randomUUID() };
      const tasks = [...((plan?.tasks as any[]) || []), newTask];
      
      const { error } = await supabase.from("daily_plans").update({ 
        tasks,
        is_generated: false 
      }).eq("user_id", uid).eq("plan_date", today);

      if (error) throw error;
      return newTask;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_plan", uid] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { data: plan } = await supabase.from("daily_plans")
        .select("tasks").eq("user_id", uid).eq("plan_date", today).single();
      
      const tasks = ((plan?.tasks as any[]) || []).filter((t) => t.id !== taskId);
      
      const { error } = await supabase.from("daily_plans").update({ tasks })
        .eq("user_id", uid).eq("plan_date", today);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_plan", uid] }),
  });

  const carryForwardMutation = useMutation({
    mutationFn: async (fromDate: string) => {
      const { data: oldPlan } = await supabase.from("daily_plans")
        .select("tasks").eq("user_id", uid).eq("plan_date", fromDate).single();
      
      const incompleteTasks = ((oldPlan?.tasks as any[]) || [])
        .filter((t) => !t.completed)
        .map((t) => ({ ...t, carried_from: fromDate }));
      
      const { data: currentPlan } = await supabase.from("daily_plans")
        .select("tasks").eq("user_id", uid).eq("plan_date", today).single();
      
      const mergedTasks = [...((currentPlan?.tasks as any[]) || []), ...incompleteTasks];
      
      const { error } = await supabase.from("daily_plans").update({ 
        tasks: mergedTasks 
      }).eq("user_id", uid).eq("plan_date", today);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_plan", uid] }),
  });

  const regeneratePlanMutation = useMutation({
    mutationFn: async () => {
      // Just regenerate from existing data, no RPC needed
      const { error } = await supabase.from("daily_plans").delete()
        .eq("user_id", uid).eq("plan_date", today);
      
      if (error) throw error;
      
      // Create empty plan for today
      const { data: newPlan } = await supabase.from("daily_plans").insert({
        user_id: uid,
        plan_date: today,
        tasks: [],
        study_hours_target: 8,
        health_target: { wake: 1, sleep: 1, water: 3, exercise: 1, steps: 10000 },
        completion_pct: 0,
        is_generated: false,
      }).select().single();
      
      return newPlan;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_plan", uid] }),
  });

  return {
    dailyPlan,
    isLoading,
    updateTask: (taskId: string, completed: boolean) => 
      updateTaskMutation.mutate({ taskId, completed }),
    addCustomTask: (task: Omit<DailyTask, "id">) => 
      addCustomTaskMutation.mutate(task),
    deleteTask: (taskId: string) => 
      deleteTaskMutation.mutate(taskId),
    carryForwardUnfinished: (fromDate: string) => 
      carryForwardMutation.mutate(fromDate),
    regeneratePlan: () => 
      regeneratePlanMutation.mutate(),
    refetch,
  };
}