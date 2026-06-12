import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "signal" | "warning" | "critical";
  className?: string;
};

const accentClass = {
  default: "text-primary",
  signal: "text-emerald-700",
  warning: "text-amber-700",
  critical: "text-red-700",
} as const;

export function KpiCard({ label, value, hint, accent = "default", className }: KpiCardProps) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/90 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardContent className="pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "font-display mt-2 text-3xl font-medium tracking-tight tabular-nums",
            accentClass[accent],
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
