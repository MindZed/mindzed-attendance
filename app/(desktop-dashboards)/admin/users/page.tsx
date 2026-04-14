// app/(desktop-dashboards)/admin/users/page.tsx
// This Client Component acts as the master control room for Root Admins.
// It features a tabbed interface for viewing different user roles and a 
// dynamic modal form that adjusts its input fields based on the role being created.
"use client";

import { useState } from "react";
import { Plus, X, Shield, BookOpen, GraduationCap, Users } from "lucide-react";

type RoleTab = "ADMIN" | "TEACHER" | "STUDENT";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>("ADMIN");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<RoleTab>("STUDENT");

  // Mock data for the Class dropdown (We will fetch this from Prisma later!)
  const mockClasses = [
    { id: "1", name: "B.Tech CSE", batch: "2024-2028" },
    { id: "2", name: "B.Tech ECE", batch: "2024-2028" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8" /> User Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create and manage system administrators, faculty, and students.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New User
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl mb-6 max-w-md">
        <TabButton active={activeTab === "ADMIN"} onClick={() => setActiveTab("ADMIN")} icon={<Shield className="w-4 h-4" />} label="Admins" />
        <TabButton active={activeTab === "TEACHER"} onClick={() => setActiveTab("TEACHER")} icon={<BookOpen className="w-4 h-4" />} label="Teachers" />
        <TabButton active={activeTab === "STUDENT"} onClick={() => setActiveTab("STUDENT")} icon={<GraduationCap className="w-4 h-4" />} label="Students" />
      </div>

      {/* Content Area (Placeholder for the tables we documented earlier) */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-[#0a0a0a] text-center text-gray-500">
        <p>The {activeTab.toLowerCase()} data table will be rendered here.</p>
      </div>

      {/* DYNAMIC CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form className="p-6 space-y-5">
              
              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
                {/* TWEAKED: Added text-gray-900 dark:text-white to the select */}
                <select 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value as RoleTab)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                >
                  {/* TWEAKED: Forced option backgrounds so the dropdown menu is readable */}
                  <option value="STUDENT" className="bg-white dark:bg-neutral-800">Student</option>
                  <option value="TEACHER" className="bg-white dark:bg-neutral-800">Teacher / Faculty</option>
                  <option value="ADMIN" className="bg-white dark:bg-neutral-800">System Administrator</option>
                </select>
              </div>

              {/* Common Fields (Everyone needs these) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  {/* TWEAKED: Added text-gray-900 dark:text-white to inputs */}
                  <input type="text" required placeholder="John Doe" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input type="email" required placeholder="john@university.edu" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Temporary Password</label>
                  <input type="password" required placeholder="••••••••" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
              </div>

              {/* ------------------------------------------------ */}
              {/* DYNAMIC FIELDS: TEACHER ONLY                     */}
              {/* ------------------------------------------------ */}
              {newUserRole === "TEACHER" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl space-y-4 border border-blue-100 dark:border-blue-900">
                  <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Faculty Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                    <input type="text" placeholder="e.g., Assistant Professor" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grant Head of Department (HOD) Privileges</span>
                  </label>
                </div>
              )}

              {/* ------------------------------------------------ */}
              {/* DYNAMIC FIELDS: STUDENT ONLY                     */}
              {/* ------------------------------------------------ */}
              {newUserRole === "STUDENT" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl space-y-4 border border-green-100 dark:border-green-900">
                  <h3 className="text-xs font-bold text-green-800 dark:text-green-400 uppercase tracking-wider">Academic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Roll Number</label>
                      <input type="text" placeholder="e.g., CS24001" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                      <input type="number" min="1" max="8" placeholder="1" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign to Class/Batch</label>
                    {/* TWEAKED: Select visibility setup */}
                    <select className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none">
                      <option value="" className="bg-white dark:bg-neutral-800">Select a class...</option>
                      {mockClasses.map((cls) => (
                        <option key={cls.id} value={cls.id} className="bg-white dark:bg-neutral-800">{cls.name} ({cls.batch})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 mt-6 border-t border-gray-100 dark:border-neutral-800">
                <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Create {newUserRole.charAt(0) + newUserRole.slice(1).toLowerCase()} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist Sub-component for the Tabs
function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
        active 
          ? "bg-white dark:bg-black text-black dark:text-white shadow-sm" 
          : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}