import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TrackingKeyCopy({ trackingKey }: { trackingKey?: string }) {
  const [copied, setCopied] = useState(false);

  if (!trackingKey) {
    return <span className="text-xs text-muted-foreground">Sem tracking key</span>;
  }

  async function handleCopy() {
    if (!trackingKey) return;
    await navigator.clipboard.writeText(trackingKey);
    setCopied(true);
    toast.success("Tracking key copiada");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md border bg-muted/40 py-0.5 pl-2 pr-1 font-mono text-xs">
      <KeyRound className="h-3 w-3 text-muted-foreground" />
      <span className="max-w-[180px] truncate">{trackingKey}</span>
      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}
