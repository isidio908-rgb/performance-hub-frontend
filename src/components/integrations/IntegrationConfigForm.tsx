import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type {
  IntegrationConfig,
  IntegrationConfigProvider,
  CreateIntegrationConfigInput,
  UpdateIntegrationConfigInput,
} from "@/api/integrationConfigs";

interface BaseProps {
  projectId: string;
  initial?: IntegrationConfig | null;
  submitting?: boolean;
  onCancel: () => void;
}

interface CreateProps extends BaseProps {
  mode: "create";
  onSubmit: (input: CreateIntegrationConfigInput) => void | Promise<void>;
}

interface EditProps extends BaseProps {
  mode: "edit";
  onSubmit: (input: UpdateIntegrationConfigInput) => void | Promise<void>;
}

type Props = CreateProps | EditProps;

const PROVIDERS: IntegrationConfigProvider[] = [
  "META_PIXEL",
  "GOOGLE_ADS",
  "GA4",
  "WEBHOOK",
  "CUSTOM",
];

export function IntegrationConfigForm(props: Props) {
  const { initial, projectId, submitting, onCancel } = props;

  const [provider, setProvider] = useState<IntegrationConfigProvider>(
    initial?.provider ?? "META_PIXEL",
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [configText, setConfigText] = useState(() =>
    initial?.config ? JSON.stringify(initial.config, null, 2) : "{}",
  );

  useEffect(() => {
    if (!initial) return;
    setProvider(initial.provider);
    setName(initial.name ?? "");
    setStatus(initial.status ?? "ACTIVE");
    setConfigText(initial.config ? JSON.stringify(initial.config, null, 2) : "{}");
  }, [initial]);

  const { parsedConfig, jsonError } = useMemo(() => {
    const trimmed = configText.trim();
    if (!trimmed) return { parsedConfig: undefined, jsonError: null };
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { parsedConfig: parsed as Record<string, unknown>, jsonError: null };
      }
      return { parsedConfig: undefined, jsonError: "JSON deve ser um objeto." };
    } catch (e) {
      return {
        parsedConfig: undefined,
        jsonError: e instanceof Error ? e.message : "JSON inválido",
      };
    }
  }, [configText]);

  const canSubmit = !submitting && !jsonError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (props.mode === "create") {
      void props.onSubmit({
        projectId,
        provider,
        name: name.trim() || undefined,
        status: status || undefined,
        config: parsedConfig,
      });
    } else {
      void props.onSubmit({
        provider,
        name: name.trim() || undefined,
        status: status || undefined,
        config: parsedConfig,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configuração avançada depende do provider e do backend. Use somente campos suportados pela
          sua versão da API.
        </AlertDescription>
      </Alert>

      <div className="grid gap-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={provider} onValueChange={(v) => setProvider(v as IntegrationConfigProvider)}>
          <SelectTrigger id="provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Nome (opcional)</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Pixel Loja Principal"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            <SelectItem value="PAUSED">PAUSED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="config">Configuração (JSON)</Label>
          {jsonError ? (
            <span className="text-[11px] font-medium text-destructive">JSON inválido</span>
          ) : (
            <span className="text-[11px] font-medium text-success">JSON válido</span>
          )}
        </div>
        <div
          className={
            "overflow-hidden rounded-md border bg-muted/30 transition-colors " +
            (jsonError ? "border-destructive/50" : "border-border")
          }
        >
          <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono">config.json</span>
            <span>{configText.length} chars</span>
          </div>
          <Textarea
            id="config"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            rows={10}
            spellCheck={false}
            aria-invalid={!!jsonError}
            aria-describedby="config-help"
            className="rounded-none border-0 bg-transparent font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        {jsonError ? (
          <p id="config-help" className="text-xs text-destructive">
            {jsonError}
          </p>
        ) : (
          <p id="config-help" className="text-xs text-muted-foreground">
            Objeto JSON livre — os campos exigidos variam por provider.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {props.mode === "edit" ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
