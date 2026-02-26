// app/admin/layout.tsx

import { ReactNode } from "react";
import AdminHeader from "@/components/layout/admin-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Our New Mobile-First Top Header */}
      <AdminHeader />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}