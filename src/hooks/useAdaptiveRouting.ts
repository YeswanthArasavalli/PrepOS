import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { calcAdaptiveRouting, normalizeAllocations } from "../lib/formulas-v2";

export interface SubjectAllocation {
  subject: string;
  currentReadiness: number;
  baseAllocation: number;
  adjustedAllocation: number;
  boost: number;
  label: string;
  color: string;
}

export function useAdaptiveRouting() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  // Fetch subject readiness (simplified - would need actual readiness data)
  const { data: subjectReadiness } = useQuery({
    queryKey: ["subject_readiness", uid],
    queryFn: async () => {
      // This would ideally come from readiness calculations
      // For now, using profile scores as proxy
      return [
        { name: "Quant", readiness: (profile?.score_quant || 2) * 11, baseAllocation: 28 },
        { name: "Reasoning", readiness: (profile?.score_reasoning || 2) * 11, baseAllocation: 15 },
        { name: "English", readiness: (profile?.score_english || 3) * 11, baseAllocation: 15 },
        { name: "GK", readiness: (profile?.score_gk || 2) * 11, baseAllocation: 20 },
        { name: "Technical", readiness: (profile?.score_cs || 1) * 11, baseAllocation: 22 },
      ];
    },
    enabled: !!uid && !!profile,
  });

  // Calculate adaptive routing
  const allocations = subjectReadiness ? calcAdaptiveRouting(subjectReadiness) : [];
  const normalized = normalizeAllocations(allocations);

  // Save allocation
  const saveAllocationMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("adaptive_allocations").insert({
        user_id: uid,
        allocation_date: new Date().toISOString().split("T")[0],
        quant_alloc: normalized.find(a => a.subject === "Quant")?.adjustedAllocation || 0,
        reasoning_alloc: normalized.find(a => a.subject === "Reasoning")?.adjustedAllocation || 0,
        english_alloc: normalized.find(a => a.subject === "English")?.adjustedAllocation || 0,
        gk_alloc: normalized.find(a => a.subject === "GK")?.adjustedAllocation || 0,
        technical_alloc: normalized.find(a => a.subject === "Technical")?.adjustedAllocation || 0,
        generated_by: "adaptive_routing_v2",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adaptive_allocations", uid] });
    },
  });

  // Get subject color
  const getSubjectColor = (readiness: number): string => {
    if (readiness >= 80) return "#1A8F68"; // Green
    if (readiness >= 50) return "#B06B0F"; // Amber
    return "#C94B2A"; // Red
  };

  const allocationsWithColor = normalized.map(a => ({
    ...a,
    color: getSubjectColor(a.currentReadiness)
  }));

  return {
    allocations: allocationsWithColor,
    totalAllocation: allocationsWithColor.reduce((sum, a) => sum + a.adjustedAllocation, 0),
    weakSubjects: allocationsWithColor.filter(a => a.currentReadiness < 50),
    strongSubjects: allocationsWithColor.filter(a => a.currentReadiness > 80),
    saveAllocation: () => saveAllocationMutation.mutate(),
  };
}