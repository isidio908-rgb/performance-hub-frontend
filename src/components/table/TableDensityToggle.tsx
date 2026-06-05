import { Rows3, Rows2 } from "lucide-react";
import { useTableDensity, type TableDensity } from "@/hooks/useTableDensity";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/** Toggle Compacta / Confortável persistido em localStorage. */
export function TableDensityToggle({ className }: Props) {
  const { density, setDensity } = useTableDensity();

  return (
    <div
      role="group"
      aria-label="Densidade da tabela"
      className={cn(
        "inline-flex h-9 items-center rounded-md border bg-card/60 p-0.5 shadow-sm",
        className,
      )}
    >
      <DensityButton
        active={density === "comfortable"}
        onClick={() => setDensity("comfortable")}
        label="Confortável"
        icon={<Rows2 className="h-3.5 w-3.5" />}
      />
      <DensityButton
        active={density === "compact"}
        onClick={() => setDensity("compact")}
        label="Compacta"
        icon={<Rows3 className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function DensityButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Densidade ${label}`}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[5px] px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export type { TableDensity };
