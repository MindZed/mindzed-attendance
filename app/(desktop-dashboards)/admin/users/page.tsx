// app/(desktop-dashboards)/admin/users/page.tsx
// This Client Component acts as the master control room for Root Admins.
// It features a tabbed interface for viewing different user roles and a 
// dynamic modal form that adjusts its input fields based on the role being created.

"use client";

import { useState } from "react";
import { Plus, X, Shield, BookOpen, GraduationCap, Users, Loader2 } from "lucide-react";
import { createSystemUser } from "@/lib/actions/admin/crud"; // ADDED: Import the backend action

type RoleTab = "ADMIN" | "TEACHER" | "STUDENT";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>("ADMIN");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<RoleTab>("STUDENT");
  
  // ADDED: State for loading and messages
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const mockClasses = [
    { id: "1", name: "B.Tech CSE", batch: "2024-2028" },
    { id: "2", name: "B.Tech ECE", batch: "2024-2028" },
  ];

  // ADDED: Form submission handler
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setMessage(null);

    // Force the role into the form data just to be safe
    formData.set("role", newUserRole);

    const result = await createSystemUser(formData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.message || "User created!" });
      // Close modal after 2 seconds on success
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 2000);
    }
    
    setIsLoading(false);
  }

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

      {/* Content Area */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-[#0a0a0a] text-center text-gray-500">
        <p>The {activeTab.toLowerCase()} data table will be rendered here.</p>
      </div>

      {/* DYNAMIC CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ADDED: Alert Message Box */}
            {message && (
              <div className={`mx-6 mt-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                {message.text}
              </div>
            )}

            {/* ADDED: action={handleSubmit} to the form */}
            <form action={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
                <select 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value as RoleTab)}
                  name="role" // ADDED NAME
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                >
                  <option value="STUDENT" className="bg-white dark:bg-neutral-800">Student</option>
                  <option value="TEACHER" className="bg-white dark:bg-neutral-800">Teacher / Faculty</option>
                  <option value="ADMIN" className="bg-white dark:bg-neutral-800">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  {/* ADDED NAME */}
                  <input type="text" name="name" required placeholder="John Doe" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  {/* ADDED NAME */}
                  <input type="email" name="email" required placeholder="john@university.edu" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Temporary Password</label>
                  {/* ADDED NAME */}
                  <input type="password" name="password" required placeholder="••••••••" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" />
                </div>
              </div>

              {newUserRole === "TEACHER" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl space-y-4 border border-blue-100 dark:border-blue-900">
                  <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Faculty Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                    {/* ADDED NAME */}
                    <input type="text" name="designation" placeholder="e.g., Assistant Professor" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    {/* ADDED NAME AND VALUE */}
                    <input type="checkbox" name="isHod" value="true" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grant Head of Department (HOD) Privileges</span>
                  </label>
                </div>
              )}

              {newUserRole === "STUDENT" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl space-y-4 border border-green-100 dark:border-green-900">
                  <h3 className="text-xs font-bold text-green-800 dark:text-green-400 uppercase tracking-wider">Academic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Roll Number</label>
                      {/* ADDED NAME */}
                      <input type="text" name="rollNumber" placeholder="e.g., CS24001" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                      {/* ADDED NAME */}
                      <input type="number" name="semester" min="1" max="8" placeholder="1" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign to Class/Batch</label>
                    {/* ADDED NAME */}
                    <select name="classId" className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none">
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
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? "Creating..." : `Create ${newUserRole.charAt(0) + newUserRole.slice(1).toLowerCase()} Account`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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