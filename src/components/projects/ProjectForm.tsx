import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { AttributionModel, Client, CreateProjectInput, Project } from "@/types";

const ATTRIBUTION_OPTIONS: { value: AttributionModel; label: string }[] = [
  { value: "FIRST_TOUCH", label: "First touch" },
  { value: "LAST_TOUCH", label: "Last touch" },
  { value: "LINEAR", label: "Linear" },
  { value: "POSITION_BASED_40_20_40", label: "Position based 40/20/40" },
  { value: "TIME_DECAY", label: "Time decay" },
];

interface Props {
  clients: Client[];
  defaultClientId?: string | null;
  initial?: Project;
  submitting?: boolean;
  onSubmit: (input: CreateProjectInput) => void;
  onCancel?: () => void;
}

export function ProjectForm({
  clients,
  defaultClientId,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: Props) {
  const [clientId, setClientId] = useState(initial?.clientId ?? defaultClientId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [attribution, setAttribution] = useState<AttributionModel | "">(
    initial?.attributionModel ?? "",
  );
  const [windowDays, setWindowDays] = useState<string>(
    initial?.attributionWindowDays?.toString() ?? "",
  );
  const [timeoutMin, setTimeoutMin] = useState<string>(
    initial?.sessionTimeoutMinutes?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Nome deve ter ao menos 2 caracteres.");
      return;
    }
    setError(null);
    onSubmit({
      clientId,
      name: name.trim(),
      domain: domain.trim() || undefined,
      attributionModel: (attribution || undefined) as AttributionModel | undefined,
      attributionWindowDays: windowDays ? Number(windowDays) : undefined,
      sessionTimeoutMinutes: timeoutMin ? Number(timeoutMin) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Cliente *</Label>
        <Select value={clientId} onValueChange={(v) => setClientId(v)} disabled={!!initial}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            {clients.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Crie um cliente primeiro
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-name">Nome *</Label>
        <Input
          id="proj-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-domain">Domínio</Label>
        <Input
          id="proj-domain"
          value={domain ?? ""}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="exemplo.com"
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <Label>Modelo de atribuição</Label>
        <Select value={attribution} onValueChange={(v) => setAttribution(v as AttributionModel)}>
          <SelectTrigger>
            <SelectValue placeholder="Padrão do backend" />
          </SelectTrigger>
          <SelectContent>
            {ATTRIBUTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="proj-window">Janela (dias)</Label>
          <Input
            id="proj-window"
            type="number"
            min={1}
            max={365}
            value={windowDays}
            onChange={(e) => setWindowDays(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proj-timeout">Timeout (min)</Label>
          <Input
            id="proj-timeout"
            type="number"
            min={1}
            max={1440}
            value={timeoutMin}
            onChange={(e) => setTimeoutMin(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? "Salvar" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
