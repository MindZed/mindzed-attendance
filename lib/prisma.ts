// lib/prisma.ts
// This file initializes the Prisma ORM client for the application.
// It implements a singleton pattern using a global variable to prevent connection 
// exhaustion during development hot-reloads. It also configures the PrismaPg adapter
// with connection pooling to satisfy Prisma 7's edge-compatible connection requirements.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// In Prisma 7, passing the adapter is the most reliable 
// way to satisfy the "non-empty options" requirement.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;