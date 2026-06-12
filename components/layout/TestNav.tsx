"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type TestNavProps = {
  testId: string;
  sessionId?: string | null;
};

const tabs = (testId: string, sessionId?: string | null) => [
  { label: "Configuración", href: `/tests/${testId}` },
  { label: "Constructor", href: `/tests/${testId}/setup` },
  {
    label: "Ejecución",
    href: sessionId ? `/tests/${testId}/sessions/${sessionId}/run` : null,
  },
  { label: "Reportes", href: `/tests/${testId}/reports` },
];

export function TestNav({ testId, sessionId }: TestNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="animate-fade-up mb-8 border-b border-border/80"
      aria-label="Secciones del proyecto"
    >
      <div className="flex gap-1 overflow-x-auto sm:gap-2">
        {tabs(testId, sessionId).map((tab) => {
          if (!tab.href) return null;

          const isActive = (() => {
            if (tab.label === "Configuración") return pathname === `/tests/${testId}`;
            if (tab.label === "Constructor") return pathname.includes("/setup");
            if (tab.label === "Ejecución") return pathname.includes("/run");
            if (tab.label === "Reportes") return pathname.includes("/reports");
            return false;
          })();

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "relative px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary sm:inset-x-4"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
