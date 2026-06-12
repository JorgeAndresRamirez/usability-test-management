import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SESSION_STATUS_BADGE_CLASS,
  SESSION_STATUS_LABELS,
  TEST_STATUS_BADGE_CLASS,
  TEST_STATUS_LABELS,
} from "@/lib/status-badges";

type TestStatusBadgeProps = {
  status: keyof typeof TEST_STATUS_LABELS | string;
  className?: string;
};

type SessionStatusBadgeProps = {
  status: keyof typeof SESSION_STATUS_LABELS | string;
  className?: string;
};

export function TestStatusBadge({ status, className }: TestStatusBadgeProps) {
  const key = status as keyof typeof TEST_STATUS_LABELS;
  return (
    <Badge
      variant="outline"
      className={cn(
        TEST_STATUS_BADGE_CLASS[key] ?? "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
    >
      {TEST_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const key = status as keyof typeof SESSION_STATUS_LABELS;
  return (
    <Badge
      variant="outline"
      className={cn(
        SESSION_STATUS_BADGE_CLASS[key] ?? "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
    >
      {SESSION_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
