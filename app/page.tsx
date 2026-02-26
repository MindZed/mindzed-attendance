// app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 1. The Traffic Controller Logic
  if (session?.user) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin");
      case "TEACHER":
        redirect("/teacher");
      case "STUDENT":
        redirect("/student");
      default:
        // Fallback just in case
        break;
    }
  }

  // 2. What users see if they are NOT logged in
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to the Attendance PWA</h1>
        <p className="text-gray-500">You are currently not logged in.</p>
        
        <a 
          href="/login" 
          className="inline-block rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    </main>
  );
}