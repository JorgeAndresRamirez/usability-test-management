import { AppShell } from "@/components/layout/AppShell";

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
