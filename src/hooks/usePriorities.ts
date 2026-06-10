import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface PriorityTask {
  id: string;
  title: string;
  type: 'revision' | 'weak' | 'mock' | 'health' | 'study';
  priority: 1 | 2 | 3;
  reason: string;
  estimatedMinutes: number;
  topicId?: string;
  subject?: string;
  priorityScore?: number;
  priorityComponents?: {
    weakness: number;
    revision: number;
    exam: number;
    mock: number;
  };
}

export function usePriorities() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  // Fetch revision log
  const { data: revisionLog } = useQuery({
    queryKey: ["revision_log", uid],
    queryFn: async () => {
      const { data } = await supabase.from("revision_log")
        .select("*")
        .eq("user_id", uid)
        .order("due_at", { ascending: true });
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch error logs
  const { data: errorLogs } = useQuery({
    queryKey: ["error_logs", uid],
    queryFn: async () => {
      const { data } = await supabase.from("error_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch mock scores
  const { data: mockScores } = useQuery({
    queryKey: ["mock_scores", uid],
    queryFn: async () => {
      const { data } = await supabase.from("mock_scores")
        .select("*")
        .eq("user_id", uid)
        .order("test_date", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!uid,
  });

  // Fetch profile for exam priorities
  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      return data;
    },
    enabled: !!uid,
  });

  // Calculate priority score using weighted formula
  const calculatePriorityScore = (params: {
    weaknessScore: number; // 0-100
    revisionUrgency: number; // 0-100
    examPriority: number; // 0-100
    mockUrgency: number; // 0-100
  }): number => {
    const { weaknessScore, revisionUrgency, examPriority, mockUrgency } = params;
    
    // Weighted formula: 40% Weakness + 30% Revision + 20% Exam Priority + 10% Mock
    const score = (
      weaknessScore * 0.40 +
      revisionUrgency * 0.30 +
      examPriority * 0.20 +
      mockUrgency * 0.10
    );
    
    return Math.round(score * 10) / 10; // Round to 1 decimal
  };

  // Generate today's top 5 priorities
  const generatePriorities = (): PriorityTask[] => {
    const priorities: PriorityTask[] = [];
    const now = new Date();

    // 1. Add overdue revisions (highest priority - 30% weight)
    const overdueRevisions = revisionLog?.filter(r => new Date(r.due_at) < now) || [];
    overdueRevisions.slice(0, 2).forEach((rev, i) => {
      const overdueDays = Math.floor((now.getTime() - new Date(rev.due_at).getTime()) / 86400000);
      const revisionUrgency = Math.min(100, 50 + overdueDays * 10); // 50 base + 10 per overdue day
      
      // Calculate weakness from error logs
      const errorCount = errorLogs?.filter(e => e.subject === rev.subject).length || 0;
      const weaknessScore = Math.min(100, errorCount * 15); // 15 points per error
      
      // Exam priority based on profile
      let examPriority = 50;
      if (profile) {
        if (rev.subject === 'Quant' || rev.subject === 'Reasoning' || rev.subject === 'English' || rev.subject === 'GK') {
          examPriority = profile.target_exam === 'ssc_cgl' ? 90 : 60;
        } else if (rev.subject === 'CS') {
          examPriority = profile.target_exam === 'coal_india' || profile.target_exam === 'upsc_jad' ? 90 : 40;
        }
      }
      
      // Mock urgency based on days since last mock
      const lastMock = mockScores?.[0];
      const daysSinceLastMock = lastMock 
        ? Math.floor((now.getTime() - new Date(lastMock.test_date).getTime()) / 86400000)
        : 999;
      const mockUrgency = daysSinceLastMock > 7 ? 80 : 30;
      
      const priorityScore = calculatePriorityScore({ weaknessScore, revisionUrgency, examPriority, mockUrgency });
      
      priorities.push({
        id: `rev-${i}`,
        title: `Revise: ${rev.topic_name}`,
        type: 'revision',
        priority: 1,
        reason: `Overdue by ${overdueDays} days`,
        estimatedMinutes: 45,
        topicId: rev.topic_id,
        subject: rev.subject,
        priorityScore,
        priorityComponents: { weakness: weaknessScore, revision: revisionUrgency, exam: examPriority, mock: mockUrgency },
      });
    });

    // 2. Add weak subject practice (40% weight - highest)
    if (errorLogs && errorLogs.length > 0) {
      const errorCounts: Record<string, number> = {};
      errorLogs.forEach(log => {
        errorCounts[log.subject] = (errorCounts[log.subject] || 0) + 1;
      });
      
      const topErrorSubject = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topErrorSubject && priorities.length < 5) {
        const weaknessScore = Math.min(100, topErrorSubject[1] * 20); // 20 points per error
        const revisionUrgency = 30; // Not revision, so low
        let examPriority = 50;
        if (profile) {
          if (['Quant', 'Reasoning', 'English', 'GK'].includes(topErrorSubject[0])) {
            examPriority = profile.target_exam === 'ssc_cgl' ? 85 : 55;
          } else if (topErrorSubject[0] === 'CS') {
            examPriority = ['coal_india', 'upsc_jad'].includes(profile.target_exam || '') ? 85 : 35;
          }
        }
        const lastMock = mockScores?.[0];
        const daysSinceLastMock = lastMock 
          ? Math.floor((now.getTime() - new Date(lastMock.test_date).getTime()) / 86400000)
          : 999;
        const mockUrgency = daysSinceLastMock > 7 ? 70 : 20;
        
        const priorityScore = calculatePriorityScore({ weaknessScore, revisionUrgency, examPriority, mockUrgency });
        
        priorities.push({
          id: 'weak-practice',
          title: `${topErrorSubject[0]} PYQs (20 questions)`,
          type: 'weak',
          priority: 1,
          reason: `Most errors in last 14 days (${topErrorSubject[1]} errors)`,
          estimatedMinutes: 60,
          subject: topErrorSubject[0],
          priorityScore,
          priorityComponents: { weakness: weaknessScore, revision: revisionUrgency, exam: examPriority, mock: mockUrgency },
        });
      }
    }

    // 3. Add health tasks (non-negotiable)
    if (priorities.length < 5) {
      priorities.push({
        id: 'health-walk',
        title: 'Morning Walk 3km',
        type: 'health',
        priority: 1,
        reason: 'Health V2: 20% weight',
        estimatedMinutes: 45,
        priorityScore: 75, // Fixed high priority for health
        priorityComponents: { weakness: 0, revision: 0, exam: 100, mock: 0 },
      });
    }

    if (priorities.length < 5) {
      priorities.push({
        id: 'health-exercise',
        title: 'Exercise + Strength',
        type: 'health',
        priority: 1,
        reason: 'Health V2: 25% weight',
        estimatedMinutes: 30,
        priorityScore: 70,
        priorityComponents: { weakness: 0, revision: 0, exam: 100, mock: 0 },
      });
    }

    // 4. Add mock if none taken recently (10% weight)
    const lastMock = mockScores?.[0];
    const daysSinceLastMock = lastMock 
      ? Math.floor((now.getTime() - new Date(lastMock.test_date).getTime()) / 86400000)
      : 999;
    
    if (daysSinceLastMock > 7 && priorities.length < 5) {
      const mockUrgency = 90; // Very high since overdue
      const weaknessScore = 40; // Moderate
      const revisionUrgency = 20; // Low
      const examPriority = profile?.target_exam === 'ssc_cgl' ? 80 : 50;
      const priorityScore = calculatePriorityScore({ weaknessScore, revisionUrgency, examPriority, mockUrgency });
      
      priorities.push({
        id: 'mock-task',
        title: 'Full Mock Test',
        type: 'mock',
        priority: 2,
        reason: `No mock in ${daysSinceLastMock} days (target: 7 days)`,
        estimatedMinutes: 120,
        priorityScore,
        priorityComponents: { weakness: weaknessScore, revision: revisionUrgency, exam: examPriority, mock: mockUrgency },
      });
    }

    // 5. Fill remaining with study tasks
    while (priorities.length < 5) {
      priorities.push({
        id: `study-${priorities.length}`,
        title: 'Study Session',
        type: 'study',
        priority: 3,
        reason: 'Daily study requirement',
        estimatedMinutes: 90,
        priorityScore: 40,
        priorityComponents: { weakness: 30, revision: 20, exam: 50, mock: 30 },
      });
    }

    // Sort by priority score (descending) and return top 5
    return priorities
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 5);
  };

  const priorities = generatePriorities();

  return {
    priorities,
    topPriority: priorities[0],
    hasOverdueRevisions: revisionLog?.some(r => new Date(r.due_at) < new Date()) || false,
    weakSubjects: errorLogs ? 
      Object.entries(
        errorLogs.reduce((acc: Record<string, number>, log) => {
          acc[log.subject] = (acc[log.subject] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1]).slice(0, 3)
      : [],
  };
}