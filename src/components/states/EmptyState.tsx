import { Inbox } from "lucide-react";
import type { ReactNode, ComponentType } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: Props) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      {action && <CardContent>{action}</CardContent>}
    </Card>
  );
}
