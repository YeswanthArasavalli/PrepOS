import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface EventTrigger {
  id: string;
  event_id: string;
  label: string;
  icon: string;
  effects: { exam: string; delta: number; note: string }[];
  actions: string[];
  occurred: boolean;
  triggered_at?: string;
}

export const EVENT_DEFINITIONS: EventTrigger[] = [
  {
    id: "coal_clear",
    event_id: "coal_clear",
    label: "Coal India — Cleared",
    icon: "✅",
    effects: [
      { exam: "Coal India", delta: -15, note: "Reduce to 5% maintenance" },
      { exam: "SSC CGL", delta: 8, note: "Redirect effort" },
      { exam: "UGC NET", delta: 7, note: "Increase depth" }
    ],
    actions: [
      "Switch CS study to NET depth only",
      "Maintain Coal mock 3x/month",
      "Boost Quant+English for CGL Tier 2"
    ],
    occurred: false
  },
  {
    id: "coal_fail",
    event_id: "coal_fail",
    label: "Coal India — Failed",
    icon: "❌",
    effects: [
      { exam: "Coal India", delta: 10, note: "Increase for next attempt" }
    ],
    actions: [
      "Identify weak CS units from mock analysis",
      "Increase OS+DBMS+Networks to 70% of CS time",
      "Plan next cycle"
    ],
    occurred: false
  },
  {
    id: "coal_post",
    event_id: "coal_post",
    label: "Coal India — Postponed",
    icon: "⏳",
    effects: [
      { exam: "Coal India", delta: -5, note: "Less urgency" },
      { exam: "SSC CGL", delta: 3, note: "Use freed time" },
      { exam: "UPSC JAD", delta: 2, note: "Bonus time" }
    ],
    actions: [
      "Maintain CS 3x/week",
      "Prioritize SSC full mocks",
      "Add JAD telecom if bandwidth allows"
    ],
    occurred: false
  },
  {
    id: "ssc_t1_clear",
    event_id: "ssc_t1_clear",
    label: "SSC Tier 1 — Cleared",
    icon: "✅",
    effects: [
      { exam: "SSC CGL", delta: 15, note: "Double down on Tier 2" },
      { exam: "Coal India", delta: -10, note: "Reduce temporarily" }
    ],
    actions: [
      "Tier 2 mode: Quant advanced + English advanced",
      "Reduce reasoning to maintenance",
      "2x English per week now"
    ],
    occurred: false
  },
  {
    id: "ssc_t1_fail",
    event_id: "ssc_t1_fail",
    label: "SSC Tier 1 — Failed",
    icon: "❌",
    effects: [
      { exam: "SSC CGL", delta: 20, note: "Emergency rebuild" },
      { exam: "UGC NET", delta: -10, note: "Temporary reduction" }
    ],
    actions: [
      "Full P1 review: %, Ratio, Avg, Series, Analogy",
      "100 PYQs daily for 2 weeks",
      "Deep error pattern analysis"
    ],
    occurred: false
  },
  {
    id: "net_qual",
    event_id: "net_qual",
    label: "UGC NET — Qualified",
    icon: "✅",
    effects: [
      { exam: "UGC NET", delta: -20, note: "Maintenance only" },
      { exam: "SSC CGL", delta: 10, note: "More time" },
      { exam: "UPSC JAD", delta: 10, note: "JAD boost" }
    ],
    actions: [
      "NET maintenance: 1 mock/month",
      "JRF attempt next cycle",
      "Focus SSC + JAD fully"
    ],
    occurred: false
  },
  {
    id: "jad_clear",
    event_id: "jad_clear",
    label: "UPSC JAD — Written Cleared",
    icon: "✅",
    effects: [
      { exam: "UPSC JAD", delta: -20, note: "Interview prep only" },
      { exam: "SSC CGL", delta: 10, note: "Keep active" }
    ],
    actions: [
      "Start interview prep immediately",
      "Technical mock interviews (Telecom + CS)",
      "POLNET + Govt systems awareness"
    ],
    occurred: false
  }
];

export function useEventEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Fetch triggered events
  const { data: triggeredEvents } = useQuery({
    queryKey: ["events", uid],
    queryFn: async () => {
      const { data } = await supabase.from("events")
        .select("*")
        .eq("user_id", uid)
        .eq("occurred", true);
      return data || [];
    },
    enabled: !!uid,
  });

  const triggeredIds = new Set(triggeredEvents?.map(e => e.event_id) || []);

  // Merge definitions with triggered status
  const events = EVENT_DEFINITIONS.map(event => ({
    ...event,
    occurred: triggeredIds.has(event.event_id),
    triggered_at: triggeredEvents?.find(e => e.event_id === event.event_id)?.occurred_at
  }));

  // Trigger event mutation
  const triggerEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("events").upsert({
        user_id: uid,
        event_id: eventId,
        occurred: true,
        occurred_at: new Date().toISOString(),
      }, { onConflict: "user_id,event_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", uid] });
      qc.invalidateQueries({ queryKey: ["adaptive_allocations", uid] });
    },
  });

  // Get active event effects
  const getActiveEffects = () => {
    const activeEvents = events.filter(e => e.occurred);
    const effects: { exam: string; totalDelta: number; notes: string[] }[] = [];
    
    activeEvents.forEach(event => {
      event.effects.forEach(effect => {
        const existing = effects.find(e => e.exam === effect.exam);
        if (existing) {
          existing.totalDelta += effect.delta;
          existing.notes.push(effect.note);
        } else {
          effects.push({
            exam: effect.exam,
            totalDelta: effect.delta,
            notes: [effect.note]
          });
        }
      });
    });
    
    return effects;
  };

  return {
    events,
    triggeredCount: triggeredIds.size,
    triggerEvent: (eventId: string) => triggerEventMutation.mutate(eventId),
    getActiveEffects,
    hasActiveEvents: triggeredIds.size > 0,
  };
}