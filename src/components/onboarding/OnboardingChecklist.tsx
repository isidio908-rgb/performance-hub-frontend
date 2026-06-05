import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ArrowRight, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildOnboardingSteps,
  getNextSetupStep,
  getProjectSetupProgress,
  type OnboardingState,
} from "@/utils/onboarding";

interface Props {
  state: OnboardingState;
  className?: string;
}

export function OnboardingChecklist({ state, className }: Props) {
  const steps = buildOnboardingSteps(state);
  const progress = getProjectSetupProgress(state);
  const next = getNextSetupStep(state);
  const allDone = progress === 100;

  return (
    <Card className={cn("border-primary/30 bg-card", className)}>
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">
              {allDone ? "Setup completo" : "Comece por aqui"}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {progress}%
            </Badge>
          </div>
          <CardDescription>
            {allDone
              ? "Todos os passos iniciais foram concluídos."
              : "Conclua os passos para ativar seu projeto."}
          </CardDescription>
          <div className="mt-3">
            <Progress value={progress} />
          </div>
        </div>
        {next && (
          <Button asChild size="sm">
            <Link to={next.to}>
              {next.actionLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/60">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-3 py-2.5">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.done && "text-muted-foreground line-through",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.done && (
                <Button asChild variant="ghost" size="sm">
                  <Link to={step.to}>{step.actionLabel}</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
