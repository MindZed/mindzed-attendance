"use server";

import { prisma } from "@/lib/prisma";

export async function getClassesForDropdown() {
  try {
    const classes = await prisma.class.findMany({
      select: { id: true, name: true, batch: true },
      orderBy: { name: 'asc' }
    });
    return { data: classes };
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return { error: "Failed to load classes" };
  }
}