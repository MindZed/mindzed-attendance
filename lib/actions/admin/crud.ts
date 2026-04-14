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
      const employeeId = formData.get("employeeId") as string;
      const isHod = formData.get("isHod") === "true";

      if (!employeeId) return { error: "Employee ID is required for teachers." };

      // Nested Write: Create User AND TeacherProfile simultaneously
      await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
          role: UserRole.TEACHER,
          teacherProfile: {
            create: { employeeId, designation, isHod },
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

export async function getUsersByRole(role: UserRole) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized." };
    }

    const users = await prisma.user.findMany({
      where: { role },
      include: {
        teacherProfile: true,
        studentProfile: {
          include: { class: true } // Pull in the class name for students
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { data: users };
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return { error: "Failed to load users." };
  }
}

// ==========================================
// DELETE USER
// ==========================================
export async function deleteSystemUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized." };
    }

    // Prevent Admin from deleting themselves!
    if (session.user.id === userId) {
      return { error: "You cannot delete your own active account." };
    }

    // Thanks to Prisma's 'onDelete: Cascade', this single line deletes 
    // the User AND their Teacher/Student profiles automatically.
    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Failed to delete user." };
  }
}

// ==========================================
// UPDATE USER (Basic Info)
// ==========================================
export async function updateSystemUser(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized." };
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    if (!id || !name || !email) return { error: "Missing required fields." };

    // Update Base User
    await prisma.user.update({
      where: { id },
      data: { name, email }
    });

    // Update Role-Specific Data
    if (role === UserRole.TEACHER) {
      const designation = formData.get("designation") as string;
      const employeeId = formData.get("employeeId") as string;
      const isHod = formData.get("isHod") === "true";
      
      await prisma.teacherProfile.update({
        where: { userId: id },
        data: { employeeId, designation, isHod }
      });
    } else if (role === UserRole.STUDENT) {
      const rollNumber = formData.get("rollNumber") as string;
      const currentSemester = parseInt(formData.get("semester") as string);
      const classId = formData.get("classId") as string;

      await prisma.studentProfile.update({
        where: { userId: id },
        data: { rollNumber, currentSemester, classId }
      });
    }

    return { success: true, message: "User updated successfully." };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "Failed to update user. Email or Roll Number might be in use." };
  }
}