import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="app-canvas flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span
              className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold tracking-tight text-primary-foreground shadow-sm"
              aria-hidden
            >
              <span className="absolute inset-0 rounded-lg bg-primary/20 blur-md transition-opacity group-hover:opacity-80" />
              <span className="relative">TU</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-medium tracking-tight text-foreground">
                Test de Usabilidad
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Moderación · Análisis
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Proyectos
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-6xl flex-1 px-6 py-10", className)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
