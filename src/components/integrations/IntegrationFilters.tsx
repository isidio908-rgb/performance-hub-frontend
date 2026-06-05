import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface IntegrationFilterValues {
  provider: string;
  status: string;
}

interface Props {
  value: IntegrationFilterValues;
  onChange: (v: IntegrationFilterValues) => void;
}

export function IntegrationFilters({ value, onChange }: Props) {
  const hasFilter = !!value.provider || !!value.status;
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Provider</Label>
        <Input
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value })}
          placeholder="META_CAPI, GA4, ..."
          className="h-9 w-[200px]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Input
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
          placeholder="PENDING, FAILED, ..."
          className="h-9 w-[200px]"
        />
      </div>
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ provider: "", status: "" })}
          className="sm:ml-auto"
        >
          <X className="mr-1 h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  );
}
