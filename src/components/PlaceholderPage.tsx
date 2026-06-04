import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Construction className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Em construção</CardTitle>
            <CardDescription>
              Esta seção será conectada à API nas próximas iterações.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O shell, autenticação e contexto Cliente/Projeto já estão prontos. Esta página é apenas um
          placeholder navegável.
        </CardContent>
      </Card>
    </div>
  );
}
