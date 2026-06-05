import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AttributionModel } from "@/types";

// Fallback visual: usado apenas quando o backend retornar lista vazia em
// /analytics/attribution-models. Backend permanece source of truth.
export const FALLBACK_MODELS: AttributionModel[] = [
  "FIRST_TOUCH",
  "LAST_TOUCH",
  "LINEAR",
  "POSITION_BASED_40_20_40",
  "TIME_DECAY",
];

const LABELS: Record<string, string> = {
  FIRST_TOUCH: "First Touch",
  LAST_TOUCH: "Last Touch",
  LINEAR: "Linear",
  POSITION_BASED_40_20_40: "Posicional 40/20/40",
  TIME_DECAY: "Time Decay",
};

interface Props {
  value: AttributionModel | undefined;
  onChange: (v: AttributionModel) => void;
  models: AttributionModel[];
  isFallback?: boolean;
}

export function AttributionModelSelect({ value, onChange, models, isFallback }: Props) {
  const list = models.length > 0 ? models : FALLBACK_MODELS;
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">
        Modelo de atribuição
        {isFallback && (
          <span className="ml-2 text-[10px] uppercase text-warning-foreground/80">(fallback)</span>
        )}
      </Label>
      <Select value={value ?? list[0]} onValueChange={(v) => onChange(v as AttributionModel)}>
        <SelectTrigger className="h-9 w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {list.map((m) => (
            <SelectItem key={m} value={m}>
              {LABELS[m] ?? m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
