import { Badge } from "@/components/ui/badge";

const MAP: Record<string, string> = {
  PageView: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ViewContent: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Lead: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  AddToCart: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  InitiateCheckout: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Purchase: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  WhatsAppClick: "bg-green-500/15 text-green-400 border-green-500/30",
  FormSubmit: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

export function EventTypeBadge({ type }: { type: string }) {
  const cls = MAP[type] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cls}>
      {type}
    </Badge>
  );
}
