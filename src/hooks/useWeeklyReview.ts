import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface WeeklyReview {
  weekNumber: number;
  startDate: string;
  endDate: string;
  hoursStudied: number;
  questionsSolved: number;
  pyqsSolved: number;
  mocksTaken: number;
  healthScore: number;
  executionScore: number;
  bestSubject: { name: string; score: number };
  worstSubject: { name: string; score: number };
  mostImprovedTopic: string;
  mostIgnoredTopic: string;
  revisionDebt: number;
  nextWeekFocus: string[];
  summary: string;
}

export function useWeeklyReview() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  // Fetch health logs (last 7 days)
  const { data: healthLogs } = useQuery({
    queryKey: ["health_logs_weekly", uid],
    queryFn: async () => {
      const { data } = await supabase.from("health_logs")
        .select("*")
        .eq("user_id", uid)
        .gte("log_date", new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
        .order("log_date", { ascending: false });
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch week logs (study hours)
  const { data: weekLogs } = useQuery({
    queryKey: ["week_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("week_logs")
        .select("*")
        .eq("user_id", uid)
        .order("week_start", { ascending: false })
        .limit(1);
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch mock scores (last 7 days)
  const { data: mockScores } = useQuery({
    queryKey: ["mock_scores_weekly", uid],
    queryFn: async () => {
      const { data } = await supabase.from("mock_scores")
        .select("*")
        .eq("user_id", uid)
        .gte("test_date", new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
        .order("test_date", { ascending: false });
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch error logs (for subject analysis)
  const { data: errorLogs } = useQuery({
    queryKey: ["error_logs_weekly", uid],
    queryFn: async () => {
      const { data } = await supabase.from("error_logs")
        .select("*")
        .eq("user_id", uid)
        .gte("log_date", new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
        .order("log_date", { ascending: false });
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch revision log (for revision debt)
  const { data: revisionLog } = useQuery({
    queryKey: ["revision_log_weekly", uid],
    queryFn: async () => {
      const { data } = await supabase.from("revision_log")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "pending")
        .order("due_at", { ascending: true });
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch topic progress (for improvement analysis)
  const { data: topicProgress } = useQuery({
    queryKey: ["topic_progress_weekly", uid],
    queryFn: async () => {
      const { data } = await supabase.from("topic_progress")
        .select("*")
        .eq("user_id", uid)
        .order("completed_at", { ascending: false });
      return data || [];
    },
    enabled: !!uid,
  });

  const generateWeeklyReview = (): WeeklyReview | null => {
    if (!weekLogs || weekLogs.length === 0) return null;

    const currentWeek = weekLogs[0];
    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    // Calculate hours studied
    const hoursStudied = currentWeek.total_study_hours || 0;

    // Calculate questions solved (from error logs - each log represents practice session)
    const questionsSolved = (errorLogs?.length || 0) * 20; // Estimate 20 questions per session

    // Calculate PYQs solved
    const pyqsSolved = (errorLogs?.filter(e => e.is_pyq).length || 0) * 20;

    // Mocks taken
    const mocksTaken = mockScores?.length || 0;

    // Health score (average of last 7 days)
    const healthScore = healthLogs && healthLogs.length > 0
      ? Math.round(healthLogs.reduce((acc, log) => {
          const sleepScore = (log.sleep_hours || 0) >= 7 ? 20 : (log.sleep_hours || 0) * 2.86;
          const exerciseScore = (log.exercise_minutes || 0) >= 30 ? 20 : (log.exercise_minutes || 0) * 0.67;
          const waterScore = (log.water_liters || 0) >= 3 ? 20 : (log.water_liters || 0) * 6.67;
          const stepsScore = (log.steps || 0) >= 8000 ? 20 : (log.steps || 0) * 0.0025;
          const mentalScore = (log.mental_health_score || 0) >= 7 ? 20 : (log.mental_health_score || 0) * 2.86;
          return acc + sleepScore + exerciseScore + waterScore + stepsScore + mentalScore;
        }, 0) / healthLogs.length)
      : 0;

    // Execution score (study completion vs planning)
    const plannedHours = currentWeek.planned_study_hours || 0;
    const executionScore = plannedHours > 0
      ? Math.min(100, Math.round((hoursStudied / plannedHours) * 100))
      : 0;

    // Subject analysis from error logs
    const subjectErrors: Record<string, number> = {};
    errorLogs?.forEach(log => {
      subjectErrors[log.subject] = (subjectErrors[log.subject] || 0) + 1;
    });

    const sortedSubjects = Object.entries(subjectErrors)
      .sort((a, b) => a[1] - b[1]); // Ascending (fewer errors = better)

    const bestSubject = sortedSubjects.length > 0
      ? { name: sortedSubjects[0][0], score: 100 - sortedSubjects[0][1] * 5 }
      : { name: "N/A", score: 0 };

    const worstSubject = sortedSubjects.length > 0
      ? { name: sortedSubjects[sortedSubjects.length - 1][0], score: 100 - sortedSubjects[sortedSubjects.length - 1][1] * 5 }
      : { name: "N/A", score: 0 };

    // Most improved topic (recently completed)
    const recentCompletions = topicProgress?.filter(t => 
      t.completed_at && new Date(t.completed_at) >= weekAgo
    ) || [];
    const mostImprovedTopic = recentCompletions.length > 0
      ? recentCompletions[0].topic_name
      : "None";

    // Most ignored topic (not studied this week)
    const studiedTopicIds = new Set(topicProgress
      ?.filter(t => t.last_studied && new Date(t.last_studied) >= weekAgo)
      .map(t => t.topic_id) || []);
    
    const allTopics = topicProgress || [];
    const ignoredTopics = allTopics.filter(t => !studiedTopicIds.has(t.topic_id));
    const mostIgnoredTopic = ignoredTopics.length > 0
      ? ignoredTopics[0].topic_name
      : "None";

    // Revision debt
    const revisionDebt = revisionLog?.filter(r => new Date(r.due_at) < now).length || 0;

    // Next week focus (based on weak areas + upcoming mocks)
    const nextWeekFocus: string[] = [];
    if (worstSubject.name !== "N/A") {
      nextWeekFocus.push(`Improve ${worstSubject.name} (weak area)`);
    }
    if (revisionDebt > 0) {
      nextWeekFocus.push(`Clear ${revisionDebt} overdue revisions`);
    }
    if (mocksTaken < 1) {
      nextWeekFocus.push("Take at least 1 full mock test");
    }
    if (hoursStudied < 35) {
      nextWeekFocus.push("Increase study hours to 35+ per week");
    }
    if (healthScore < 70) {
      nextWeekFocus.push("Improve health habits (sleep, exercise, water)");
    }
    if (nextWeekFocus.length === 0) {
      nextWeekFocus.push("Maintain current momentum");
    }

    // Generate summary
    const summary = `Week ${currentWeek.week_number}: Studied ${hoursStudied}h, took ${mocksTaken} mocks, health score ${healthScore}%. 
      Best: ${bestSubject.name}, Needs work: ${worstSubject.name}. 
      ${revisionDebt > 0 ? `${revisionDebt} revisions overdue. ` : ''}
      Focus next week: ${nextWeekFocus[0]}`;

    return {
      weekNumber: currentWeek.week_number,
      startDate: currentWeek.week_start,
      endDate: new Date(new Date(currentWeek.week_start).getTime() + 6 * 86400000).toISOString().split('T')[0],
      hoursStudied,
      questionsSolved,
      pyqsSolved,
      mocksTaken,
      healthScore,
      executionScore,
      bestSubject,
      worstSubject,
      mostImprovedTopic,
      mostIgnoredTopic,
      revisionDebt,
      nextWeekFocus,
      summary,
    };
  };

  const review = generateWeeklyReview();

  return {
    review,
    hasReview: !!review,
    canExport: !!review,
  };
}