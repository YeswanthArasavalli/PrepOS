import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcRevisionPriority } from "../lib/formulas-v2";

export interface RevisionItem {
  topicId: string;
  topicName: string;
  subject: string;
  dueDate: string;
  overdueDays: number;
  priority: number;
  revisionCycle: number;
  status: 'overdue' | 'due-today' | 'due-tomorrow' | 'upcoming';
}

export interface RevisionQueueData {
  dueToday: RevisionItem[];
  dueTomorrow: RevisionItem[];
  overdue: RevisionItem[];
  upcoming: RevisionItem[];
  totalDebt: number;
  revisionScore: number;
  highestPriority: RevisionItem | null;
}

export function useRevisionCommand() {
  const { user } = useAuth();
  const qc = useQueryClient();
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

  // Calculate revision queue
  const calculateQueue = (): RevisionQueueData => {
    if (!revisionLog || revisionLog.length === 0) {
      return {
        dueToday: [],
        dueTomorrow: [],
        overdue: [],
        upcoming: [],
        totalDebt: 0,
        revisionScore: 0,
        highestPriority: null,
      };
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];

    const queue: RevisionItem[] = revisionLog.map(log => {
      const dueDate = new Date(log.due_at);
      const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
      const priority = calcRevisionPriority(overdueDays, 0);
      
      let status: RevisionItem['status'];
      if (overdueDays > 0) status = 'overdue';
      else if (log.due_at.split("T")[0] === today) status = 'due-today';
      else if (log.due_at.split("T")[0] === tomorrow) status = 'due-tomorrow';
      else status = 'upcoming';

      return {
        topicId: log.topic_id,
        topicName: log.topic_name,
        subject: log.subject,
        dueDate: log.due_at,
        overdueDays: Math.max(0, overdueDays),
        priority,
        revisionCycle: log.revision_count || 0,
        status,
      };
    });

    // Categorize
    const dueToday = queue.filter(item => item.status === 'due-today');
    const dueTomorrow = queue.filter(item => item.status === 'due-tomorrow');
    const overdue = queue.filter(item => item.status === 'overdue').sort((a, b) => b.overdueDays - a.overdueDays);
    const upcoming = queue.filter(item => item.status === 'upcoming');

    // Calculate metrics
    const totalDebt = overdue.length;
    const completedRevisions = revisionLog.reduce((sum, log) => sum + (log.revision_count || 0), 0);
    const totalRevisionsNeeded = revisionLog.length * 5; // 5 revision cycles
    const revisionScore = Math.round((completedRevisions / Math.max(totalRevisionsNeeded, 1)) * 100);

    // Highest priority item
    const highestPriority = [...overdue, ...dueToday].sort((a, b) => a.priority - b.priority)[0] || null;

    return {
      dueToday,
      dueTomorrow,
      overdue,
      upcoming,
      totalDebt,
      revisionScore,
      highestPriority,
    };
  };

  const queue = calculateQueue();

  // Mark revision complete
  const markRevisionCompleteMutation = useMutation({
    mutationFn: async ({ topicId, topicName, subject }: { topicId: string; topicName: string; subject: string }) => {
      const existing = revisionLog?.find(log => log.topic_id === topicId);
      const gaps = [1, 3, 7, 15, 30];
      const revCount = existing?.revision_count || 0;
      const nextDays = gaps[Math.min(revCount, gaps.length - 1)];
      const dueAt = new Date(Date.now() + nextDays * 86400000).toISOString();
      const now = new Date().toISOString();
      const prevDates: string[] = existing?.revision_dates || [];

      const { error } = await supabase.from("revision_log").upsert({
        user_id: uid,
        topic_id: topicId,
        topic_name: topicName,
        subject,
        done_at: existing?.done_at || now,
        due_at: dueAt,
        revision_count: revCount + 1,
        revision_dates: [...prevDates, now],
      }, { onConflict: "user_id,topic_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revision_log", uid] });
      qc.invalidateQueries({ queryKey: ["revision_queue", uid] });
    },
  });

  return {
    ...queue,
    markRevisionComplete: ({ topicId, topicName, subject }: Parameters<typeof markRevisionCompleteMutation.mutate>[0]) =>
      markRevisionCompleteMutation.mutate({ topicId, topicName, subject }),
    isDebtFree: queue.totalDebt === 0,
    needsAttention: queue.overdue.length > 0 || queue.dueToday.length > 0,
  };
}