import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "../env.js";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

if (isDevelopment) {
  globalForPrisma.prisma = prisma;
}

