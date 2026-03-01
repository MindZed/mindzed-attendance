"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
  try {
    // 1. Verify User Session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "Unauthorized access. Please log in again." };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 2. Basic Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "All fields are required." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match." };
    }
    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters long." };
    }

    // 3. Fetch User from DB (We need the hashed password)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, hashedPassword: true }
    });

    if (!user || !user.hashedPassword) {
      return { error: "User record or password not found." };
    }

    // 4. Verify Current Password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isPasswordValid) {
      return { error: "Incorrect current password." };
    }

    // 5. Hash New Password & Update
    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: newHashedPassword },
    });

    return { success: "Password updated successfully!" };
  } catch (error) {
    console.error("Password Update Error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}