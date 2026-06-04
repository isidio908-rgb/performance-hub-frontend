import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Client, CreateClientInput } from "@/types";

interface Props {
  initial?: Client;
  submitting?: boolean;
  onSubmit: (input: CreateClientInput) => void;
  onCancel?: () => void;
}

export function ClientForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [document, setDocument] = useState(initial?.document ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Nome deve ter ao menos 2 caracteres.");
      return;
    }
    setError(null);
    onSubmit({
      name: trimmed,
      document: document.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name">Nome *</Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoFocus
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-document">Documento</Label>
        <Input
          id="client-document"
          value={document ?? ""}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="CNPJ ou CPF"
          maxLength={32}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-notes">Notas</Label>
        <Textarea
          id="client-notes"
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
        />
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
          {initial ? "Salvar" : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}
