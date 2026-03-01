"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// =========================================================
// 1. ADMIN ACTION
// =========================================================
export async function getAdmins() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== UserRole.ADMIN) {
    return { error: "Unauthorized. Admin access required." };
  }

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return { data: admins };
}

// =========================================================
// 2. TEACHER ACTION (Admin + HOD)
// =========================================================
export async function getTeachers() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized." };

  const { id, role } = session.user;
  let isAuthorized = false;

  if (role === UserRole.ADMIN) {
    isAuthorized = true;
  } else if (role === UserRole.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: id },
      select: { isHod: true },
    });
    if (teacherProfile?.isHod) isAuthorized = true;
  }

  if (!isAuthorized) {
    return { error: "Unauthorized. Admin or HOD access required." };
  }

  const teachers = await prisma.user.findMany({
    where: { role: UserRole.TEACHER },
    include: { teacherProfile: true },
    orderBy: { name: "asc" },
  });

  return { data: teachers };
}

// =========================================================
// 3. STUDENT ACTIONS (Admin + HOD + Class Coordinator)
// =========================================================

// A. Fetch classes the current user is allowed to view
export async function getPermittedClasses() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized." };

  const { id, role } = session.user;

  if (role === UserRole.ADMIN) {
    const classes = await prisma.class.findMany({ orderBy: { batch: "desc" } });
    return { data: classes };
  }

  if (role === UserRole.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: id },
      select: { isHod: true, id: true },
    });

    if (teacherProfile?.isHod) {
      // HOD sees all classes
      const classes = await prisma.class.findMany({
        orderBy: { batch: "desc" },
      });
      return { data: classes };
    } else if (teacherProfile) {
      // Regular teacher only sees the class they coordinate
      const classes = await prisma.class.findMany({
        where: { coordinatorId: teacherProfile.id },
      });
      return { data: classes };
    }
  }

  return { error: "Unauthorized. Insufficient permissions." };
}

// B. Fetch students for a specific class (Validating access again to prevent ID spoofing)
export async function getStudentsByClass(classId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized." };

  const { id, role } = session.user;
  let isAuthorized = false;

  if (role === UserRole.ADMIN) {
    isAuthorized = true;
  } else if (role === UserRole.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: id },
      select: {
        isHod: true,
        id: true,
        coordinatedClass: { select: { id: true } },
      },
    });

    if (
      teacherProfile?.isHod ||
      teacherProfile?.coordinatedClass?.id === classId
    ) {
      isAuthorized = true;
    }
  } else if (role === UserRole.STUDENT) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: id },
      select: { classId: true },
    });

    if (studentProfile?.classId === classId) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return { error: "Unauthorized to view this class." };
  }

  const students = await prisma.studentProfile.findMany({
    where: { classId },
    include: { user: true },
    orderBy: { rollNumber: "asc" },
  });

  return { data: students };
}
