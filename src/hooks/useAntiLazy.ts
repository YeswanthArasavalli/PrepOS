import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcStreak, getRecoveryMode } from "../lib/formulas-v2";

export interface StreakData {
  type: string;
  current: number;
  longest: number;
  icon: string;
  label: string;
}

export function useAntiLazy() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Fetch health logs for streak calculation
  const { data: healthLogs } = useQuery({
    queryKey: ["health_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("health_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch existing streaks
  const { data: existingStreaks } = useQuery({
    queryKey: ["streaks", uid],
    queryFn: async () => {
      const { data } = await supabase.from("streaks")
        .select("*")
        .eq("user_id", uid);
      return data || [];
    },
    enabled: !!uid,
  });

  // Calculate streaks from health logs
  const calculateStreaks = () => {
    if (!healthLogs) return [];

    const streaks: StreakData[] = [
      {
        type: "wake",
        current: calcStreak((healthLogs || []).map(h => ({ 
          date: h.log_date, 
          completed: h.wake >= 1 
        })), "wake"),
        longest: (existingStreaks || []).find(s => s.streak_type === "wake")?.longest_streak || 0,
        icon: "🌅",
        label: "5AM Wake"
      },
      {
        type: "sleep",
        current: calcStreak((healthLogs || []).map(h => ({ 
          date: h.log_date, 
          completed: h.sleep >= 1 
        })), "sleep"),
        longest: (existingStreaks || []).find(s => s.streak_type === "sleep")?.longest_streak || 0,
        icon: "😴",
        label: "Sleep"
      },
      {
        type: "water",
        current: calcStreak((healthLogs || []).map(h => ({ 
          date: h.log_date, 
          completed: h.water >= 0.9 
        })), "water"),
        longest: (existingStreaks || []).find(s => s.streak_type === "water")?.longest_streak || 0,
        icon: "💧",
        label: "Water"
      },
      {
        type: "steps",
        current: calcStreak((healthLogs || []).map(h => ({ 
          date: h.log_date, 
          completed: h.steps >= 0.9 
        })), "steps"),
        longest: (existingStreaks || []).find(s => s.streak_type === "steps")?.longest_streak || 0,
        icon: "🏃",
        label: "Steps"
      },
      {
        type: "exercise",
        current: calcStreak((healthLogs || []).map(h => ({ 
          date: h.log_date, 
          completed: h.exercise >= 1 
        })), "exercise"),
        longest: (existingStreaks || []).find(s => s.streak_type === "exercise")?.longest_streak || 0,
        icon: "💪",
        label: "Exercise"
      },
    ];

    return streaks;
  };

  const streaks = calculateStreaks();

  // Calculate missed days
  const missedDays = healthLogs && healthLogs.length > 0
    ? 30 - healthLogs.length
    : 30;

  const recoveryMode = getRecoveryMode(missedDays);

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: async ({ type, current, longest }: { type: string; current: number; longest: number }) => {
      const { error } = await supabase.from("streaks").upsert({
        user_id: uid,
        streak_type: type,
        current_streak: current,
        longest_streak: longest,
        last_activity: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,streak_type" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["streaks", uid] });
    },
  });

  // Save all streaks
  const saveStreaks = () => {
    streaks.forEach(streak => {
      updateStreakMutation.mutate({
        type: streak.type,
        current: streak.current,
        longest: streak.longest
      });
    });
  };

  // Get recovery recommendations
  const getRecoveryRecommendations = () => {
    switch (recoveryMode) {
      case "rebuild":
        return {
          title: "REBUILD MODE",
          message: "10+ days inactive. Start from zero. Just 1 thing today.",
          actions: [
            "Complete 1 topic only",
            "Maintain health routine",
            "No new topics for 3 days",
            "Focus on P1 topics only"
          ],
          color: "red"
        };
      case "emergency":
        return {
          title: "EMERGENCY MODE",
          message: "5+ days missed. Emergency reset required.",
          actions: [
            "Pause new topics for 2 days",
            "Only P1 topics: %, Ratio, Average",
            "Reduce GK to flashcards (15 min)",
            "Maintain 5AM wake + walk"
          ],
          color: "orange"
        };
      case "recovery":
        return {
          title: "RECOVERY MODE",
          message: "2-4 days missed. Catch up gradually.",
          actions: [
            "Complete 1 missed topic",
            "Maintain health routine",
            "No new topics today",
            "System will redistribute workload"
          ],
          color: "amber"
        };
      default:
        return {
          title: "NORMAL MODE",
          message: "Keep the momentum. Log health daily.",
          actions: [],
          color: "green"
        };
    }
  };

  return {
    streaks,
    recoveryMode,
    missedDays,
    saveStreaks,
    getRecoveryRecommendations,
    isRecovering: recoveryMode !== "normal",
  };
}