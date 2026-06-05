import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
  icon?: LucideIcon;
  variant?: "default" | "primary" | "muted";
  className?: string;
}

export function NextBestActionCard({
  title,
  description,
  actionLabel,
  to,
  icon: Icon,
  variant = "primary",
  className,
}: Props) {
  return (
    <Card
      className={cn(
        variant === "primary" && "border-primary/40 bg-primary/5",
        variant === "muted" && "bg-muted/40",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm">
          <Link to={to}>
            {actionLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
