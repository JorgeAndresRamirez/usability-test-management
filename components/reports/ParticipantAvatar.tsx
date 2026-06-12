import { cn } from "@/lib/utils";
import { getParticipantInitials, getParticipantPalette } from "@/lib/participant-identity";

type ParticipantAvatarProps = {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

export function ParticipantAvatar({ code, size = "md", className }: ParticipantAvatarProps) {
  const palette = getParticipantPalette(code);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border font-semibold",
        palette.bg,
        palette.text,
        palette.border,
        sizeClasses[size],
        className,
      )}
      title={code}
    >
      {getParticipantInitials(code)}
    </span>
  );
}
