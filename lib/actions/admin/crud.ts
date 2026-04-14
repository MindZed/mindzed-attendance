// lib/actions/admin/crud.ts
// This Server Action handles the secure creation of new users from the Admin Dashboard.
// It uses Prisma nested writes to atomically create the base User account alongside
// their specific role profiles (TeacherProfile or StudentProfile) in a single transaction.

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSystemUser(formData: FormData) {
  try {
    // 1. Security Check: Only Root Admins can perform this action
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized. Only System Administrators can create users." };
    }

    // 2. Extract Common Data
    const role = formData.get("role") as UserRole;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!role || !name || !email || !password) {
      return { error: "Name, email, password, and role are required fields." };
    }

    // 3. Check for existing email to prevent duplicates
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "A user with this email address already exists." };
    }

    // 4. Hash the temporary password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Dynamic Database Insertion based on Role
    if (role === UserRole.ADMIN) {
      // Create purely a User record
      await prisma.user.create({
        data: { name, email, hashedPassword, role: UserRole.ADMIN },
      });

    } else if (role === UserRole.TEACHER) {
      // Extract Teacher-specific data
      const designation = formData.get("designation") as string || "Faculty";
      const isHod = formData.get("isHod") === "true";

      // Nested Write: Create User AND TeacherProfile simultaneously
      await prisma.user.create({
        data: {
          name, 
          email, 
          hashedPassword, 
          role: UserRole.TEACHER,
          teacherProfile: {
            create: { designation, isHod },
          },
        },
      });

    } else if (role === UserRole.STUDENT) {
      // Extract Student-specific data
      const rollNumber = formData.get("rollNumber") as string;
      const currentSemester = parseInt(formData.get("semester") as string) || 1;
      const classId = formData.get("classId") as string;

      if (!rollNumber || !classId) return { error: "Roll Number and Class assignment are required for students." };

      // Nested Write: Create User AND StudentProfile simultaneously
      await prisma.user.create({
        data: {
          name, 
          email, 
          hashedPassword, 
          role: UserRole.STUDENT,
          studentProfile: {
            create: { rollNumber, currentSemester, classId },
          },
        },
      });
    } else {
      return { error: "Invalid role specified." };
    }

    // 6. Refresh the data table on the frontend
    revalidatePath("/(desktop-dashboards)/admin/users", "page");
    
    return { success: true, message: `${role} account created successfully!` };

  } catch (error) {
    console.error("User Creation Error:", error);
    return { error: "An unexpected error occurred while creating the user." };
  }
}