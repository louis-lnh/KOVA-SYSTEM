import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __kovaPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__kovaPrisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__kovaPrisma = prisma;
}

