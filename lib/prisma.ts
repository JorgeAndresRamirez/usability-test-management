import { PrismaClient } from "@/lib/generated/prisma/client";

// Bump when the Prisma schema changes to invalidate the dev singleton after `prisma generate`.
const PRISMA_CACHE_KEY = "synthesis-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaCacheKey: string | undefined;
};

function withPgbouncerIfNeeded(url: string, usedDirectUrl: boolean): string {
  if (url.includes("pgbouncer=true")) return url;

  // Prisma Dev pools even the TCP port (51214); prisma+postgres URLs always need this.
  const needsPgbouncer =
    url.startsWith("prisma+postgres://") || usedDirectUrl;

  if (!needsPgbouncer) return url;

  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}pgbouncer=true`;
}

function getDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL;
  const url = direct ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL or DIRECT_URL must be set");
  }
  return withPgbouncerIfNeeded(url, Boolean(direct));
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaCacheKey !== PRISMA_CACHE_KEY
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaCacheKey = PRISMA_CACHE_KEY;
}
