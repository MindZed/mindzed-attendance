// lib/actions/admin/classes.ts
// This file handles the CRUD operations for Academic Classes/Batches.

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

// 1. Create a new Class
export async function createClass(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized. Only Admins can manage classes." };
    }

    const course = formData.get("course") as string;
    const name = formData.get("name") as string;
    const batch = formData.get("batch") as string;

    if (!course || !name || !batch) {
      return { error: "Course, Stream Name, and Batch are required." };
    }

    await prisma.class.create({
      data: { course, name, batch },
    });

    // Refresh the page data
    revalidatePath("/(desktop-dashboards)/admin/classes", "page");
    return { success: true, message: "Class created successfully!" };
  } catch (error) {
    console.error("Failed to create class:", error);
    return { error: "An error occurred while creating the class." };
  }
}

// 2. Fetch all Classes for Tables and Dropdowns
export async function getClasses() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized." };

    const classes = await prisma.class.findMany({
      orderBy: [
        { course: 'asc' },
        { batch: 'desc' },
        { name: 'asc' }
      ]
    });

    return { data: classes };
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return { error: "Failed to load classes." };
  }
}

// ==========================================
// UPDATE CLASS
// ==========================================
export async function updateClass(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) return { error: "Unauthorized." };

    const id = formData.get("id") as string;
    const course = formData.get("course") as string;
    const name = formData.get("name") as string;
    const batch = formData.get("batch") as string;

    if (!id || !course || !name || !batch) return { error: "Missing required fields." };

    await prisma.class.update({
      where: { id },
      data: { course, name, batch },
    });

    return { success: true, message: "Class updated successfully!" };
  } catch (error) {
    console.error("Update Class Error:", error);
    return { error: "Failed to update class." };
  }
}

// ==========================================
// DELETE CLASS
// ==========================================
export async function deleteClass(classId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) return { error: "Unauthorized." };

    await prisma.class.delete({
      where: { id: classId }
    });

    return { success: true, message: "Class deleted successfully." };
  } catch (error) {
    console.error("Delete Class Error:", error);
    return { error: "Cannot delete class. Ensure no students are currently assigned to it." };
  }
}