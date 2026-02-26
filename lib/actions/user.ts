// lib/actions/user.ts

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    // 1. Verify the user is logged in
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { error: "Unauthorized. Please log in again." };
    }

    // 2. Fetch the user from the database to get their current hashed password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.hashedPassword) {
      return { error: "User not found or password not set." };
    }

    // 3. Check if the current password provided by the user matches the database
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isPasswordValid) {
      return { error: "Incorrect current password." };
    }

    // 4. Hash the NEW password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password in the database
    await prisma.user.update({
      where: { email: session.user.email },
      data: { hashedPassword: hashedNewPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Update Password Error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}