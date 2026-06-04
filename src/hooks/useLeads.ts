import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadsApi, normalizeLeads } from "@/api/leads";

export function useLeads(projectId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["analytics", "leads", projectId],
    queryFn: () => leadsApi.list(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  const leads = useMemo(() => normalizeLeads(query.data), [query.data]);

  return { query, leads };
}
