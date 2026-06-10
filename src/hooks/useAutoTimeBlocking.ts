import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface TimeBlock {
  time: string;
  activity: string;
  subject?: string;
  duration: string;
  type: 'study' | 'health' | 'break' | 'revision';
}

export function useAutoTimeBlocking() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  // Fetch user profile for wake/sleep times
  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      return data;
    },
    enabled: !!uid,
  });

  // Fetch today's priorities for intelligent scheduling
  const { data: revisionLog } = useQuery({
    queryKey: ["revision_log", uid],
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

  // Generate intelligent daily timetable
  const generateTimetable = (): TimeBlock[] => {
    const wakeTime = profile?.wake_time || "05:00";
    const sleepTime = profile?.sleep_time || "21:30";
    
    const blocks: TimeBlock[] = [];
    
    // Fixed health blocks (non-negotiable)
    blocks.push({ time: wakeTime, activity: "Wake Up + Freshen Up", duration: "15 min", type: "health" });
    blocks.push({ time: "05:15", activity: "Morning Walk 3km", duration: "45 min", type: "health" });
    blocks.push({ time: "06:00", activity: "Breakfast + Bath", duration: "60 min", type: "health" });
    
    // Morning slot (5AM-12PM) - Quant/Reasoning (fresh mind)
    blocks.push({ time: "07:00", activity: "Quant/Arithmetic", subject: "Quant", duration: "120 min", type: "study" });
    blocks.push({ time: "09:00", activity: "Reasoning", subject: "Reasoning", duration: "90 min", type: "study" });
    blocks.push({ time: "10:30", activity: "Break + Snack", duration: "30 min", type: "break" });
    blocks.push({ time: "11:00", activity: "English Grammar/Vocab", subject: "English", duration: "90 min", type: "study" });
    
    // Afternoon slot (12PM-5PM) - Technical/GK
    blocks.push({ time: "12:00", activity: "Lunch + Rest", duration: "60 min", type: "break" });
    blocks.push({ time: "14:00", activity: "Technical/CS", subject: "CS", duration: "120 min", type: "study" });
    blocks.push({ time: "16:00", activity: "GK/Current Affairs", subject: "GK", duration: "60 min", type: "study" });
    blocks.push({ time: "17:00", activity: "Evening Break", duration: "60 min", type: "break" });
    
    // Evening slot (5PM-9PM) - Mock/Practice
    blocks.push({ time: "18:00", activity: "Mock Test OR PYQ Practice", duration: "120 min", type: "study" });
    blocks.push({ time: "20:00", activity: "Dinner + Family", duration: "60 min", type: "break" });
    
    // Night slot (9PM-10PM) - Revision (best for retention)
    blocks.push({ time: "21:00", activity: "Revision Session", duration: "30 min", type: "revision" });
    blocks.push({ time: "21:30", activity: "Sleep", duration: "8 hours", type: "health" });
    
    // Add revision blocks if there are pending revisions
    const overdueRevisions = (revisionLog || []).filter(r => new Date(r.due_at) < new Date());
    if (overdueRevisions.length > 0) {
      // Insert revision block after lunch for overdue topics
      blocks.splice(5, 0, {
        time: "13:00",
        activity: `Priority Revision: ${overdueRevisions[0]?.topic_name || "Overdue Topics"}`,
        subject: overdueRevisions[0]?.subject,
        duration: "60 min",
        type: "revision"
      });
    }
    
    return blocks;
  };

  const blocks = generateTimetable();

  return {
    blocks,
    wakeTime: profile?.wake_time || "05:00",
    sleepTime: profile?.sleep_time || "21:30",
    totalStudyHours: blocks.filter(b => b.type === 'study' || b.type === 'revision').reduce((acc, b) => {
      const hours = parseInt(b.duration) / 60;
      return acc + hours;
    }, 0),
    totalHealthBlocks: blocks.filter(b => b.type === 'health').length,
    hasOverdueRevisions: blocks.some(b => b.type === 'revision'),
  };
}