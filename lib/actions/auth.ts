// lib/actions/auth.ts

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

/**
 * Checks if the database is empty to determine if the 
 * "First-Run" Admin registration should be active.
 */
export async function getSystemStatus() {
  try {
    const userCount = await prisma.user.count();
    return {
      isFirstRun: userCount === 0,
    };
  } catch (error) {
    console.error("Failed to fetch system status:", error);
    return { isFirstRun: false };
  }
}

/**
 * Creates the very first user as a Super Admin.
 * Only executes if no users exist in the database.
 */
export async function registerFirstAdmin(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "All fields are required" };
    }

    // Secondary safety check: Ensure no users exist before granting ADMIN role
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return { error: "System already initialized. Registration disabled." };
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the Admin User
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: UserRole.ADMIN, // Force high-level authorization
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Failed to create admin account" };
  }
}