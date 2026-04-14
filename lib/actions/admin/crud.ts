// lib/actions/admin/crud.ts
// This Server Action handles the secure creation of new users from the Admin Dashboard.
// It uses Prisma nested writes to atomically create the base User account alongside
// their specific role profiles (TeacherProfile or StudentProfile) in a single transaction.

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type BulkStudentUserInput = {
  name: string;
  email: string;
  rollNumber: string;
  semester: string | number;
};

export type BulkTeacherUserInput = {
  name: string;
  email: string;
  employeeId: string;
  designation?: string;
  isHod?: string | boolean;
};

export type BulkUserPayload = {
  users: BulkStudentUserInput[] | BulkTeacherUserInput[];
  role: "STUDENT" | "TEACHER";
  classId?: string;
};

type BulkValidationRow =
  | {
      sourceRowNumber: number;
      role: "STUDENT";
      name: string;
      email: string;
      rollNumber: string;
      semester: number;
    }
  | {
      sourceRowNumber: number;
      role: "TEACHER";
      name: string;
      email: string;
      employeeId: string;
      designation?: string;
      isHod: boolean;
    };

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizeBoolean(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value;

  const normalizedValue = normalizeString(value).toLowerCase();
  return ["true", "1", "yes", "y"].includes(normalizedValue);
}

function normalizeSemester(value: string | number) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function getReadablePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "Some users could not be created because one or more unique fields already exist.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred while creating users.";
}

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
      const designation = (formData.get("designation") as string) || "Faculty";
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

export async function bulkCreateUsers(payload: BulkUserPayload) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.ADMIN) {
      return { error: "Unauthorized. Only System Administrators can create users." };
    }

    if (!payload || !Array.isArray(payload.users) || payload.users.length === 0) {
      return { error: "Please upload at least one valid user record." };
    }

    if (payload.role !== "STUDENT" && payload.role !== "TEACHER") {
      return { error: "Bulk upload is only supported for STUDENT and TEACHER roles." };
    }

    if (payload.role === "STUDENT" && !normalizeString(payload.classId)) {
      return { error: "Class assignment is required for student bulk upload." };
    }

    if (payload.role === "STUDENT") {
      const classExists = await prisma.class.findUnique({
        where: { id: payload.classId! },
        select: { id: true },
      });

      if (!classExists) {
        return { error: "Selected class does not exist." };
      }
    }

    const failedRows: string[] = [];
    const validCandidates: BulkValidationRow[] = [];
    const seenEmails = new Set<string>();
    const seenEmployeeIds = new Set<string>();
    const seenRollNumbers = new Set<string>();

    payload.users.forEach((user, index) => {
      const sourceRowNumber = index + 1;
      const name = normalizeString((user as BulkStudentUserInput | BulkTeacherUserInput).name);
      const email = normalizeEmail((user as BulkStudentUserInput | BulkTeacherUserInput).email);

      if (!name || !email) {
        failedRows.push(`Row ${sourceRowNumber}: name and email are required.`);
        return;
      }

      if (seenEmails.has(email)) {
        failedRows.push(`Row ${sourceRowNumber}: duplicate email "${email}" found in CSV.`);
        return;
      }

      seenEmails.add(email);

      if (payload.role === "STUDENT") {
        const student = user as BulkStudentUserInput;
        const rollNumber = normalizeString(student.rollNumber);
        const semester = normalizeSemester(student.semester);

        if (!rollNumber || semester === null) {
          failedRows.push(`Row ${sourceRowNumber}: rollNumber and a valid semester are required.`);
          return;
        }

        if (seenRollNumbers.has(rollNumber)) {
          failedRows.push(`Row ${sourceRowNumber}: duplicate rollNumber "${rollNumber}" found in CSV.`);
          return;
        }

        seenRollNumbers.add(rollNumber);

        validCandidates.push({
          sourceRowNumber,
          role: "STUDENT",
          name,
          email,
          rollNumber,
          semester,
        });

        return;
      }

      const teacher = user as BulkTeacherUserInput;
      const employeeId = normalizeString(teacher.employeeId);
      const designation = normalizeString(teacher.designation);
      const isHod = normalizeBoolean(teacher.isHod);

      if (!employeeId) {
        failedRows.push(`Row ${sourceRowNumber}: employeeId is required.`);
        return;
      }

      if (seenEmployeeIds.has(employeeId)) {
        failedRows.push(`Row ${sourceRowNumber}: duplicate employeeId "${employeeId}" found in CSV.`);
        return;
      }

      seenEmployeeIds.add(employeeId);

      validCandidates.push({
        sourceRowNumber,
        role: "TEACHER",
        name,
        email,
        employeeId,
        designation: designation || undefined,
        isHod,
      });
    });

    if (validCandidates.length === 0) {
      return {
        error: `No valid rows found. Failed rows: ${failedRows.join(" | ")}`,
        summary: {
          total: payload.users.length,
          successCount: 0,
          failureCount: payload.users.length,
          failedRows,
        },
      };
    }

    const existingEmailsPromise = prisma.user.findMany({
      where: {
        email: {
          in: validCandidates.map((candidate) => candidate.email),
        },
      },
      select: { email: true },
    });

    const existingTeacherProfilesPromise =
      payload.role === "TEACHER"
        ? prisma.teacherProfile.findMany({
            where: {
              employeeId: {
                in: validCandidates
                  .filter((candidate): candidate is Extract<BulkValidationRow, { role: "TEACHER" }> => candidate.role === "TEACHER")
                  .map((candidate) => candidate.employeeId),
              },
            },
            select: { employeeId: true },
          })
        : Promise.resolve([]);

    const existingStudentProfilesPromise =
      payload.role === "STUDENT"
        ? prisma.studentProfile.findMany({
            where: {
              rollNumber: {
                in: validCandidates
                  .filter((candidate): candidate is Extract<BulkValidationRow, { role: "STUDENT" }> => candidate.role === "STUDENT")
                  .map((candidate) => candidate.rollNumber),
              },
            },
            select: { rollNumber: true },
          })
        : Promise.resolve([]);

    const [existingEmails, existingTeacherProfiles, existingStudentProfiles] = await Promise.all([
      existingEmailsPromise,
      existingTeacherProfilesPromise,
      existingStudentProfilesPromise,
    ]);

    const existingEmailSet = new Set(existingEmails.map((user) => normalizeEmail(user.email)));
    const existingEmployeeIdSet = new Set(existingTeacherProfiles.map((profile) => normalizeString(profile.employeeId)));
    const existingRollNumberSet = new Set(existingStudentProfiles.map((profile) => normalizeString(profile.rollNumber)));

    const finalRows = validCandidates.filter((candidate) => {
      if (existingEmailSet.has(candidate.email)) {
        failedRows.push(`Row ${candidate.sourceRowNumber}: email "${candidate.email}" already exists.`);
        return false;
      }

      if (candidate.role === "TEACHER" && existingEmployeeIdSet.has(candidate.employeeId)) {
        failedRows.push(`Row ${candidate.sourceRowNumber}: employeeId "${candidate.employeeId}" already exists.`);
        return false;
      }

      if (candidate.role === "STUDENT" && existingRollNumberSet.has(candidate.rollNumber)) {
        failedRows.push(`Row ${candidate.sourceRowNumber}: rollNumber "${candidate.rollNumber}" already exists.`);
        return false;
      }

      return true;
    });

    if (finalRows.length === 0) {
      return {
        error: `No users were created. Failed rows: ${failedRows.join(" | ")}`,
        summary: {
          total: payload.users.length,
          successCount: 0,
          failureCount: payload.users.length,
          failedRows,
        },
      };
    }

    const tempPassword = "1234";
    // TODO: Replace the dummy password with generateRandomPassword() in production.
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const operations = finalRows.map((candidate) =>
      prisma.user.create({
        data: {
          name: candidate.name,
          email: candidate.email,
          hashedPassword,
          role: payload.role === "STUDENT" ? UserRole.STUDENT : UserRole.TEACHER,
          teacherProfile:
            candidate.role === "TEACHER"
              ? {
                  create: {
                    employeeId: candidate.employeeId,
                    designation: candidate.designation,
                    isHod: candidate.isHod,
                  },
                }
              : undefined,
          studentProfile:
            candidate.role === "STUDENT"
              ? {
                  create: {
                    rollNumber: candidate.rollNumber,
                    currentSemester: candidate.semester,
                    classId: payload.classId!,
                  },
                }
              : undefined,
        },
      })
    );

    await prisma.$transaction(operations);

    // TODO: Call sendWelcomeEmail(email, tempPassword) for each created user in production.

    revalidatePath("/(desktop-dashboards)/admin/users", "page");

    const successCount = finalRows.length;
    const failureCount = payload.users.length - successCount;

    return {
      success: true,
      message: `Bulk upload completed successfully. ${successCount} user(s) created and ${failureCount} row(s) skipped.`,
      summary: {
        total: payload.users.length,
        successCount,
        failureCount,
        failedRows,
      },
    };
  } catch (error) {
    console.error("Bulk Create Users Error:", error);
    return {
      error: getReadablePrismaError(error),
      summary: {
        total: 0,
        successCount: 0,
        failureCount: 0,
        failedRows: [],
      },
    };
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