// app/admin/dashboard/page.tsx
// This file serves as the main Admin Dashboard. It fetches aggregated daily 
// statistics from the SystemDailySnapshot table for high performance, calculates 
// system compliance rates, and provides the structural UI layout for the frontend.

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  // Double security check
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Get today's midnight UTC date for the Snapshot lookup
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Format date for the Chart Footer (e.g., "Sunday, 28 March")
  const formattedDate = `${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today)}, ${today.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today)}`;

  // 2. Fetch the Daily Snapshot
  let snapshot 

  // 3. Fallback: If cron hasn't run yet today, create a blank snapshot structure
  if (!snapshot) {
    snapshot = {
      date: today,
      totalStudents: 0,
      totalTeachers: 0,
      totalSessionsScheduled: 0,
      sessionsCompleted: 0,
      delegatedSessions: 0,
      studentsPresentToday: 0,
      overallAttendanceRatio: 0,
      id: "fallback",
      updatedAt: new Date(),
    };
  }

  // 4. Mock DB Connection Data (Placeholder for Qadir's UI)
  const dbConnections = { active: 21, max: 36 }; 

  // Calculate Compliance Rate (Completed / Scheduled)
  const complianceRate = snapshot.totalSessionsScheduled > 0 
    ? Math.round((snapshot.sessionsCompleted / snapshot.totalSessionsScheduled) * 100) 
    : 0;

  return (
    <div className="space-y-8 p-4 bg-[#1c1c1e] text-white min-h-screen"> 
      
      {/* HEADER & CHART AREA */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          {/* THE SETTINGS BUTTON (Hexagon Placeholder) linking to Settings */}
          <Link 
            href="/admin/settings" 
            className="w-8 h-8 rounded-md border border-gray-500 flex items-center justify-center hover:bg-gray-700 transition"
            aria-label="Settings"
          >
            {/* Qadir: Drop the Hexagon SVG here. (This span is just a temporary line) */}
            <span className="block w-4 h-px bg-gray-300 transform -rotate-45"></span>
          </Link>
        </div>
        
        {/* Chart Card */}
        <div className="border border-gray-700 rounded-xl bg-gray-800 flex flex-col justify-between h-56 p-4">
          
          {/* Chart Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Metrics</span>
            {/* Toggle 1D 2D 3D */}
            <div className="flex bg-gray-700 rounded-lg p-0.5 space-x-1">
              <button className="px-3 py-1 text-xs rounded-md bg-gray-500 text-white font-medium">1D</button>
              <button className="px-3 py-1 text-xs rounded-md text-gray-400 hover:bg-gray-600 transition">2D</button>
              <button className="px-3 py-1 text-xs rounded-md text-gray-400 hover:bg-gray-600 transition">3D</button>
            </div>
          </div>

          {/* Chart Body (Center) */}
          <div className="flex-1 flex items-center justify-center">
            {/* Qadir: Insert Recharts/Chart.js component here later */}
            <p className="text-gray-400 text-sm">No data currently</p>
          </div>

          {/* Chart Footer (Date) */}
          <div className="pt-3 border-t border-gray-700/50">
            <p className="text-[11px] text-gray-400">{formattedDate}</p>
          </div>
          
        </div>
      </div>

      {/* AT A GLANCE WIDGETS */}
      <div>
        <h2 className="text-lg text-gray-400 mb-3">At a Glance</h2>
        <div className="grid grid-cols-2 gap-4">
          
          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-xs text-gray-400">DB Connection</p>
            <h3 className="text-2xl font-bold mt-1">
              {dbConnections.active} <span className="text-sm text-gray-500">/{dbConnections.max}</span>
            </h3>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-xs text-gray-400">Active Users</p>
            <h3 className="text-2xl font-bold mt-1">
              {snapshot.studentsPresentToday} <span className="text-sm text-gray-500">/{snapshot.totalStudents}</span>
            </h3>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-xs text-gray-400">Students Present</p>
            <h3 className="text-2xl font-bold mt-1">
              {snapshot.overallAttendanceRatio}% <span className="text-sm text-gray-500">| {snapshot.studentsPresentToday}</span>
            </h3>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-xs text-gray-400">Classes Conducted</p>
            <h3 className="text-2xl font-bold mt-1">{snapshot.sessionsCompleted}</h3>
          </div>

        </div>
      </div>

      {/* SYSTEM SECTION */}
      <div>
        <h2 className="text-lg text-gray-400 mb-3">System</h2>
        <div className="flex items-center gap-6">
          
          {/* Circular Chart Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex items-center justify-center">
              <span className="text-xl font-bold">{complianceRate}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Compliance Rate</p>
          </div>

          {/* Status Indicators */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <p>Cron is Active</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <p>All System normal</p>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}