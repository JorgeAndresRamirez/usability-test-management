import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
              TU
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Test de Usabilidad
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-slate-600 hover:text-slate-900",
              )}
            >
              Proyectos
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto max-w-6xl px-6 py-10", className)}>{children}</main>
    </div>
  );
}
