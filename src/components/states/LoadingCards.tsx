import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  height?: string;
}

export function LoadingCards({ count = 4, height = "h-28" }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-xl`} />
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}
