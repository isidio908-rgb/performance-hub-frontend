import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EVENT_TYPES = [
  "PageView",
  "ViewContent",
  "Lead",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "WhatsAppClick",
  "FormSubmit",
] as const;

interface Props {
  type: string;
  search: string;
  onTypeChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function EventsFilters({ type, search, onTypeChange, onSearchChange }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por URL, nome ou visitorId..."
          className="pl-8"
        />
      </div>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os tipos</SelectItem>
          {EVENT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
