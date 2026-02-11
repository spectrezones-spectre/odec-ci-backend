import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export const verifyDbConnection = async () => {
  await db.$queryRaw`SELECT 1`;
};

