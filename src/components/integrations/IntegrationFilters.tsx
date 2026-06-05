import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface IntegrationFilterValues {
  provider: string;
  status: string;
}

const PROVIDERS = ["META_PIXEL", "META_CAPI", "GOOGLE_ADS", "GA4", "WEBHOOK", "CUSTOM"] as const;

const STATUSES = ["PENDING", "DELIVERED", "FAILED", "RETRY"] as const;

interface Props {
  value: IntegrationFilterValues;
  onChange: (v: IntegrationFilterValues) => void;
}

/** Slot de filtros de integrações para uso dentro de FilterBar. */
export function IntegrationFilters({ value, onChange }: Props) {
  return (
    <>
      <Select
        value={value.provider || "__all"}
        onValueChange={(v) => onChange({ ...value, provider: v === "__all" ? "" : v })}
      >
        <SelectTrigger className="h-9 w-full sm:w-[200px]" aria-label="Filtrar por provider">
          <SelectValue placeholder="Todos os providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os providers</SelectItem>
          {PROVIDERS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.status || "__all"}
        onValueChange={(v) => onChange({ ...value, status: v === "__all" ? "" : v })}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px]" aria-label="Filtrar por status">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os status</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
