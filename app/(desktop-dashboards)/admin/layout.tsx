// app/admin/layout.tsx
// This file acts as the global layout wrapper for all Admin routes.
// It enforces server-side Role-Based Access Control (RBAC) by verifying the session,
// and provides the common UI shell (Header and Content Area) for the admin section.

import { ReactNode } from "react";
import AdminHeader from "@/components/layout/admin-header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  
  // 1. Server-side session and role verification
  const session = await getServerSession(authOptions);
    
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Our Mobile-First Top Header */}
      {/* Qadir: If you end up moving the settings/profile icons directly into the 
          page titles (like we did on the Dashboard), you might not even need this 
          AdminHeader component here eventually! */}
      <AdminHeader />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}