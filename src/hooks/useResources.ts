import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface Resource {
  id: string;
  name: string;
  type: "book" | "playlist" | "pdf" | "course" | "pyq_bank" | "mock_series";
  subject?: string;
  total_chapters: number;
  completed_chapters: number;
  progress_pct: number;
  status: "not_started" | "in_progress" | "completed";
  url?: string;
  notes?: string;
  is_default: boolean;
}

export function useResources() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id ?? "";

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", uid],
    queryFn: async () => {
      const { data } = await supabase.from("resources")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      return (data as Resource[]) || [];
    },
    enabled: !!uid,
    staleTime: 10 * 60 * 1000,
  });

  const { data: recommendedResources = [] } = useQuery({
    queryKey: ["recommended_resources"],
    queryFn: async () => {
      const { data } = await supabase.from("topic_recommendations")
        .select("*")
        .eq("is_default", true)
        .order("priority", { ascending: true });
      return (data || []) as any[];
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: async (resource: Omit<Resource, "id" | "progress_pct">) => {
      const { error } = await supabase.from("resources").insert({
        ...resource,
        user_id: uid,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", uid] }),
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Resource> }) => {
      const { error } = await supabase.from("resources")
        .update(updates)
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", uid] }),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources")
        .delete()
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", uid] }),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, completed_chapters }: { id: string; completed_chapters: number }) => {
      const resource = Array.isArray(resources) ? resources.find((r) => r.id === id) : undefined;
      if (!resource) throw new Error("Resource not found");

      const status = completed_chapters >= resource.total_chapters
        ? "completed"
        : completed_chapters > 0
        ? "in_progress"
        : "not_started";

      const { error } = await supabase.from("resources")
        .update({ completed_chapters, status })
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", uid] }),
  });

  const addDefaultResourceMutation = useMutation({
    mutationFn: async (recommended: any) => {
      const { error } = await supabase.from("resources").insert({
        user_id: uid,
        name: recommended.resource_name,
        type: recommended.resource_type as any,
        subject: recommended.subject,
        total_chapters: recommended.resource_type === "book" ? 1 : 10,
        completed_chapters: 0,
        status: "not_started",
        url: recommended.resource_url,
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources", uid] });
      qc.invalidateQueries({ queryKey: ["recommended_resources"] });
    },
  });

  return {
    resources,
    recommendedResources,
    isLoading,
    addResource: (resource: Omit<Resource, "id" | "progress_pct">) =>
      addResourceMutation.mutate(resource),
    updateResource: (id: string, updates: Partial<Resource>) =>
      updateResourceMutation.mutate({ id, updates }),
    deleteResource: (id: string) =>
      deleteResourceMutation.mutate(id),
    updateProgress: (id: string, completed_chapters: number) =>
      updateProgressMutation.mutate({ id, completed_chapters }),
    addDefaultResource: (recommended: any) =>
      addDefaultResourceMutation.mutate(recommended),
  };
}