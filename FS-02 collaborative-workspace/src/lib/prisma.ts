import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ||
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

let dbConnectedCache: boolean | null = null;
let lastCheckTime = 0;

export async function isDbConnected(): Promise<boolean> {
  const now = Date.now();
  if (dbConnectedCache !== null && now - lastCheckTime < 15000) {
    return dbConnectedCache;
  }
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 800));
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    dbConnectedCache = true;
    lastCheckTime = now;
    return true;
  } catch (error) {
    dbConnectedCache = false;
    lastCheckTime = now;
    return false;
  }
}
