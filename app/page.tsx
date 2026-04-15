// app/page.tsx
// This file serves as the root entry point (/) for the application. 
// It acts as a "Traffic Controller", securely checking the user's session 
// and automatically redirecting them to their respective role-based dashboard 
// (Admin, Teacher, or Student). If unauthenticated, it prompts them to log in.
// We will put the check here about the device, which will be used in the dashboard to determine which features to show or hide. Always block student if opened via laptop or desktop.

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 1. Device Detection Logic
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

  // 2. The Traffic Controller Logic
  if (session?.user) {
    switch (session.user.role) {
      case "ADMIN":
        // Admin goes straight to desktop dashboard
        redirect("/admin/dashboard");
        break;

      case "TEACHER":
        // Teacher split routing
        if (isMobile) {
          redirect("/teacher");         // Matches app/(mobile-pwa)/teacher/page.tsx
        } else {
          redirect("/teacher-desktop"); // Matches app/(desktop-dashboards)/teacher-desktop/page.tsx
        }
        break;

      case "STUDENT":
        // Student Desktop Block
        if (!isMobile) {
          return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
              <div className="text-center space-y-4 max-w-md bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
                  📱
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mobile Device Required</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Students can only access the attendance portal via a smartphone. Please log in using your mobile device.
                </p>
                <Link
                  href="/api/auth/signout"
                  className="inline-block mt-4 rounded-md bg-black dark:bg-white px-6 py-2.5 text-white dark:text-black font-medium hover:scale-95 transition-transform"
                >
                  Sign Out
                </Link>
              </div>
            </main>
          );
        }
        // Student allowed through on mobile
        redirect("/student"); // Matches app/(mobile-pwa)/student/page.tsx
        break;

      default:
        break;
    }
  }

  // 3. Not logged in UI
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to the Attendance PWA</h1>
        <p className="text-gray-500 dark:text-gray-400">You are currently not logged in.</p>

        <Link
          href="/login"
          className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}