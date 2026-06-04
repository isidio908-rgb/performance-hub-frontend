import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, normalizeEvents } from "@/api/events";

export function useEvents(projectId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["analytics", "events", projectId],
    queryFn: () => eventsApi.list(projectId!),
    enabled: !!projectId,
    retry: 1,
  });

  const events = useMemo(() => normalizeEvents(query.data), [query.data]);

  return { query, events };
}
