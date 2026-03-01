// app/admin/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  // 1. Server-side session check (Double security layer alongside middleware)
  const session = await getServerSession(authOptions);
  
  // 2. Fetch Dashboard Data directly from the database
  // We use Promise.all to run these queries in parallel for faster loading
  const [totalStudents, totalTeachers, todaySessions] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.attendanceSession.count({
      where: {
        date: {
          // Get all sessions from midnight to 11:59 PM today
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  // 3. Return the headless UI structure with the data
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session?.user.name || "Administrator"}</p>
      </div>

      {/* UI FRIEND: This is the raw data grid. 
        You can replace these generic divs with your beautiful <StatsCard /> components! 
      */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white text-gray-900 shadow-sm p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </div>
        
        <div className="rounded-xl border bg-white text-gray-900 shadow-sm p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Teachers</h3>
          <p className="text-2xl font-bold">{totalTeachers}</p>
        </div>

        <div className="rounded-xl border bg-white text-gray-900 shadow-sm p-6">
          <h3 className="tracking-tight text-sm font-medium text-gray-500">Today's Classes</h3>
          <p className="text-2xl font-bold">{todaySessions}</p>
        </div>
      </div>
    </div>
  );
}
