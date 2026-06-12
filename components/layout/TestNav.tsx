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
    <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1">
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
              "rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
