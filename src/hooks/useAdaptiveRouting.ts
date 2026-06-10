import { useQuery } from "@tanstack/react-query";
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
  const uid = user?.id ?? "";

  // Fetch subject readiness
  const { data: subjectReadiness } = useQuery({
    queryKey: ["subject_readiness", uid],
    queryFn: async () => {
      if (!profile) return [];
      return [
        { name: "Quant", readiness: (profile.score_quant || 2) * 11, baseAllocation: 28 },
        { name: "Reasoning", readiness: (profile.score_reasoning || 2) * 11, baseAllocation: 15 },
        { name: "English", readiness: (profile.score_english || 3) * 11, baseAllocation: 15 },
        { name: "GK", readiness: (profile.score_gk || 2) * 11, baseAllocation: 20 },
        { name: "Technical", readiness: (profile.score_cs || 1) * 11, baseAllocation: 22 },
      ];
    },
    enabled: !!uid && !!profile,
  });

  // Calculate adaptive routing with null safety
  const allocations = subjectReadiness && subjectReadiness.length > 0 
    ? calcAdaptiveRouting(subjectReadiness) 
    : [];
  
  const normalized = normalizeAllocations(allocations);
  
  // Ensure normalized is always an array
  const safeNormalized = Array.isArray(normalized) ? normalized : [];

  // Get subject color
  const getSubjectColor = (readiness: number): string => {
    if (readiness >= 80) return "#1A8F68";
    if (readiness >= 50) return "#B06B0F";
    return "#C94B2A";
  };

  const allocationsWithColor = safeNormalized.map(a => ({
    ...a,
    color: getSubjectColor(a.currentReadiness)
  }));

  return {
    allocations: allocationsWithColor,
    totalAllocation: allocationsWithColor.reduce((sum, a) => sum + a.adjustedAllocation, 0),
    weakSubjects: allocationsWithColor.filter(a => a.currentReadiness < 50),
    strongSubjects: allocationsWithColor.filter(a => a.currentReadiness > 80),
  };
}