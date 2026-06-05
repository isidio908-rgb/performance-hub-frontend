import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  height?: string;
}

export function LoadingCards({ count = 4, height = "h-28" }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-xl bg-muted/40`} />
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-border/60">
      <div className="border-b border-border/60 bg-muted/40 px-3 py-2.5">
        <Skeleton className="h-3 w-32 bg-muted-foreground/20" />
      </div>
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="h-4 w-4 rounded-full bg-muted/60" />
            <Skeleton className="h-3 flex-1 bg-muted/60" />
            <Skeleton className="h-3 w-16 bg-muted/60" />
            <Skeleton className="h-3 w-20 bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
