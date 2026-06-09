import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface SetupItem {
  id: string;
  item_id: string;
  label: string;
  is_complete: boolean;
  completed_at?: string;
}

export function useSetupChecklist() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  const { data: setupItems = [], isLoading } = useQuery({
    queryKey: ["setup_checklist", uid],
    queryFn: async () => {
      const { data } = await supabase.from("setup_checklist")
        .select("*")
        .eq("user_id", uid)
        .order("item_id");
      return (data as SetupItem[]) || [];
    },
    enabled: !!uid,
    staleTime: 30 * 60 * 1000,
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, isComplete }: { itemId: string; isComplete: boolean }) => {
      const { error } = await supabase.from("setup_checklist").upsert({
        user_id: uid,
        item_id: itemId,
        is_complete: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      }, { onConflict: "user_id,item_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["setup_checklist", uid] }),
  });

  const completionPct = setupItems.length > 0
    ? Math.round((setupItems.filter((i) => i.is_complete).length / setupItems.length) * 100)
    : 0;

  const isSetupComplete = completionPct === 100;

  const canAccessMainApp = () => {
    const prepStart = new Date(profile?.prep_start_date || "2026-06-13");
    const today = new Date();
    return today >= prepStart || isSetupComplete;
  };

  return {
    setupItems,
    isLoading,
    toggleItem: (itemId: string, isComplete: boolean) =>
      toggleItemMutation.mutate({ itemId, isComplete }),
    completionPct,
    isSetupComplete,
    canAccessMainApp,
    remainingItems: setupItems.filter((i) => !i.is_complete).length,
  };
}