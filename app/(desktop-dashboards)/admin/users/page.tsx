// app/(desktop-dashboards)/admin/users/page.tsx
// This Client Component acts as the master control room for Root Admins.
// It features a tabbed interface for viewing different user roles and a 
// dynamic modal form that adjusts its input fields based on the role being created.

"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { Plus, X, Shield, BookOpen, GraduationCap, Users, Loader2, Trash2, Edit, AlertTriangle, Upload, Download } from "lucide-react";
import { createSystemUser, getUsersByRole, deleteSystemUser, updateSystemUser, bulkCreateUsers } from "@/lib/actions/admin/crud";
import { getClasses } from "@/lib/actions/admin/classes";

type RoleTab = "ADMIN" | "TEACHER" | "STUDENT";
type UploadMode = "single" | "bulk";

type StudentCsvRow = {
  name: string;
  email: string;
  rollNumber: string;
  semester: string | number;
};

type TeacherCsvRow = {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  isHod: string | boolean;
};

const STUDENT_CSV_HEADERS = ["name", "email", "rollNumber", "semester"] as const;
const TEACHER_CSV_HEADERS = ["name", "email", "employeeId", "designation", "isHod"] as const;

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>("ADMIN");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<RoleTab>("STUDENT");
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkPreviewCount, setBulkPreviewCount] = useState(0);
  const [bulkFileName, setBulkFileName] = useState("");

  // EDIT & DELETE STATES
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const isBulkAllowed = !editingUser && newUserRole !== "ADMIN";
  const shouldShowBulkMode = isBulkAllowed && uploadMode === "bulk";

  const csvTemplate = useMemo(() => {
    if (newUserRole === "STUDENT") {
      return `${STUDENT_CSV_HEADERS.join(",")}\n`;
    }

    if (newUserRole === "TEACHER") {
      return `${TEACHER_CSV_HEADERS.join(",")}\n`;
    }

    return "";
  }, [newUserRole]);

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadUsers(activeTab); }, [activeTab]);

  useEffect(() => {
    if (editingUser) {
      setUploadMode("single");
      return;
    }

    if (newUserRole === "ADMIN") {
      setUploadMode("single");
    }
  }, [editingUser, newUserRole]);

  async function loadClasses() {
    const result = await getClasses();
    if (result.data) setDbClasses(result.data);
  }

  async function loadUsers(role: RoleTab) {
    setIsFetchingUsers(true);
    const result = await getUsersByRole(role);
    if (result.data) setUsers(result.data);
    setIsFetchingUsers(false);
  }

  function resetBulkState() {
    setBulkClassId("");
    setBulkPreviewCount(0);
    setBulkFileName("");
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setUploadMode("single");
    resetBulkState();
    setMessage(null);
  }

  // Handle Opening the Edit Modal
  function handleEditClick(user: any) {
    setEditingUser(user);
    setNewUserRole(user.role);
    setUploadMode("single");
    resetBulkState();
    setIsModalOpen(true);
  }

  // Handle Opening the Create Modal (Resetting state)
  function handleCreateClick() {
    setEditingUser(null);
    setNewUserRole(activeTab);
    setUploadMode("single");
    resetBulkState();
    setMessage(null);
    setIsModalOpen(true);
  }

  function downloadCsvTemplate() {
    if (!csvTemplate) {
      setMessage({ type: "error", text: "CSV template is only available for student or teacher uploads." });
      return;
    }

    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filePrefix = newUserRole === "STUDENT" ? "student" : "teacher";

    link.href = url;
    link.setAttribute("download", `${filePrefix}-bulk-template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function parseBooleanLike(value: string | boolean) {
    if (typeof value === "boolean") return value;
    return String(value).trim().toLowerCase() === "true";
  }

  function hasRequiredHeaders(headers: string[], requiredHeaders: readonly string[]) {
    return requiredHeaders.every((header) => headers.includes(header));
  }

  async function handleBulkFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (newUserRole === "STUDENT" && !bulkClassId) {
      setMessage({ type: "error", text: "Please select a class before uploading a student CSV." });
      event.target.value = "";
      return;
    }

    if (newUserRole !== "STUDENT" && newUserRole !== "TEACHER") {
      setMessage({ type: "error", text: "Bulk upload is only supported for students and teachers." });
      event.target.value = "";
      return;
    }

    setIsLoading(true);
    setMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: async (results) => {
        try {
          const rawHeaders = Array.isArray(results.meta.fields) ? results.meta.fields : [];
          const normalizedHeaders = rawHeaders.map((header) => String(header).trim());
          const requiredHeaders = newUserRole === "STUDENT" ? STUDENT_CSV_HEADERS : TEACHER_CSV_HEADERS;

          if (!hasRequiredHeaders(normalizedHeaders, requiredHeaders)) {
            setMessage({
              type: "error",
              text: `Invalid CSV headers. Required headers: ${requiredHeaders.join(", ")}.`,
            });
            setIsLoading(false);
            event.target.value = "";
            return;
          }

          const rows = (results.data as Record<string, string | boolean | number | null | undefined>[])
            .map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [String(key).trim(), typeof value === "string" ? value.trim() : value])
              )
            );

          if (!rows.length) {
            setMessage({ type: "error", text: "The uploaded CSV is empty." });
            setIsLoading(false);
            event.target.value = "";
            return;
          }

          let normalizedUsers: StudentCsvRow[] | TeacherCsvRow[];

          if (newUserRole === "STUDENT") {
            const invalidRowIndex = rows.findIndex((row) => !row.name || !row.email || !row.rollNumber || !row.semester);

            if (invalidRowIndex !== -1) {
              setMessage({ type: "error", text: `Row ${invalidRowIndex + 2} is missing one or more required student fields.` });
              setIsLoading(false);
              event.target.value = "";
              return;
            }

            normalizedUsers = rows.map((row) => ({
              name: String(row.name),
              email: String(row.email),
              rollNumber: String(row.rollNumber),
              semester: row.semester as string | number,
            }));
          } else {
            const invalidRowIndex = rows.findIndex((row) => !row.name || !row.email || !row.employeeId || row.designation === undefined || row.designation === null || row.isHod === undefined || row.isHod === null);

            if (invalidRowIndex !== -1) {
              setMessage({ type: "error", text: `Row ${invalidRowIndex + 2} is missing one or more required teacher fields.` });
              setIsLoading(false);
              event.target.value = "";
              return;
            }

            normalizedUsers = rows.map((row) => ({
              name: String(row.name),
              email: String(row.email),
              employeeId: String(row.employeeId),
              designation: String(row.designation),
              isHod: parseBooleanLike(row.isHod as string | boolean),
            }));
          }

          const result = await bulkCreateUsers({
            users: normalizedUsers,
            role: newUserRole,
            classId: newUserRole === "STUDENT" ? bulkClassId : undefined,
          });

          if (result?.error) {
            setMessage({ type: "error", text: result.error });
          } else if (result?.success) {
            setBulkPreviewCount(normalizedUsers.length);
            setBulkFileName(file.name);
            setMessage({ type: "success", text: result.message || "Bulk upload completed successfully." });
            loadUsers(activeTab);
            setTimeout(() => {
              closeModal();
            }, 1500);
          }
        } catch {
          setMessage({ type: "error", text: "Failed to process CSV file. Please check the file and try again." });
        } finally {
          setIsLoading(false);
          event.target.value = "";
        }
      },
      error: () => {
        setMessage({ type: "error", text: "Unable to parse the CSV file." });
        setIsLoading(false);
        event.target.value = "";
      },
    });
  }

  // Merged Submit (Handles both Create and Update)
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setMessage(null);
    formData.set("role", newUserRole);

    let result;
    if (editingUser) {
      formData.set("id", editingUser.id);
      result = await updateSystemUser(formData);
    } else {
      result = await createSystemUser(formData);
    }

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.message || "Success!" });
      loadUsers(activeTab);
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
    setIsLoading(false);
  }

  // Handle Deletion Confirmed
  async function confirmDelete() {
    if (!userToDelete) return;
    setIsLoading(true);

    const result = await deleteSystemUser(userToDelete);
    if (result.success) {
      setUserToDelete(null);
      loadUsers(activeTab);
    } else {
      alert(result.error); // Simple fallback alert for delete errors
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8" /> User Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create, update, and remove system users.</p>
        </div>
        <button onClick={handleCreateClick} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
          <Plus className="w-5 h-5" /> Add New User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl mb-6 max-w-md">
        <TabButton active={activeTab === "ADMIN"} onClick={() => setActiveTab("ADMIN")} icon={<Shield className="w-4 h-4" />} label="Admins" />
        <TabButton active={activeTab === "TEACHER"} onClick={() => setActiveTab("TEACHER")} icon={<BookOpen className="w-4 h-4" />} label="Teachers" />
        <TabButton active={activeTab === "STUDENT"} onClick={() => setActiveTab("STUDENT")} icon={<GraduationCap className="w-4 h-4" />} label="Students" />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {isFetchingUsers ? (
          <div className="p-12 flex justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No {activeTab.toLowerCase()}s found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  {activeTab === "TEACHER" && <th className="px-6 py-4 font-medium">Emp ID</th>}
                  {activeTab === "TEACHER" && <th className="px-6 py-4 font-medium">Designation</th>}
                  {activeTab === "STUDENT" && <th className="px-6 py-4 font-medium">Roll No</th>}
                  {activeTab === "STUDENT" && <th className="px-6 py-4 font-medium">Class</th>}
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                      {user.name}
                      {user.teacherProfile?.isHod && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">HOD</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                    {activeTab === "TEACHER" && <td className="px-6 py-4 text-gray-500">{user.teacherProfile?.employeeId || "-"}</td>}
                    {activeTab === "TEACHER" && <td className="px-6 py-4 text-gray-500">{user.teacherProfile?.designation || "-"}</td>}
                    {activeTab === "STUDENT" && <td className="px-6 py-4 text-gray-500 font-mono">{user.studentProfile?.rollNumber || "-"}</td>}
                    {activeTab === "STUDENT" && <td className="px-6 py-4 text-gray-500">{user.studentProfile?.class?.name || "-"}</td>}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setUserToDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingUser ? "Edit User" : "Create New User"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition"><X className="w-6 h-6" /></button>
            </div>

            {message && (
              <div className={`mx-6 mt-6 p-4 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300" : "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-300"}`}>
                {message.text}
              </div>
            )}

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
                <select
                  value={newUserRole}
                  onChange={(e) => {
                    setNewUserRole(e.target.value as RoleTab);
                    setMessage(null);
                    resetBulkState();
                  }}
                  disabled={!!editingUser}
                  name="role"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-lg outline-none disabled:opacity-50"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher / Faculty</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {!editingUser && isBulkAllowed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Mode</label>
                  <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("single");
                        setMessage(null);
                        resetBulkState();
                      }}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${uploadMode === "single" ? "bg-white dark:bg-black text-black dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
                    >
                      Single Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("bulk");
                        setMessage(null);
                      }}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${uploadMode === "bulk" ? "bg-white dark:bg-black text-black dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
                    >
                      Bulk Upload
                    </button>
                  </div>
                </div>
              )}

              {shouldShowBulkMode ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-950/50 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload {newUserRole === "STUDENT" ? "Students" : "Teachers"} CSV</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Use the required headers exactly as provided in the template before uploading.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadCsvTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download CSV Template
                      </button>
                    </div>

                    {newUserRole === "STUDENT" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign uploaded students to class</label>
                        <select
                          value={bulkClassId}
                          onChange={(e) => setBulkClassId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none"
                        >
                          <option value="">Select a class...</option>
                          {dbClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name} ({cls.batch})</option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Class selection is required before uploading a student CSV.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CSV File</label>
                      <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${newUserRole === "STUDENT" && !bulkClassId ? "border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900/50 text-gray-400 cursor-not-allowed" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 cursor-pointer hover:border-black dark:hover:border-white"}`}>
                        <Upload className="w-8 h-8" />
                        <div>
                          <p className="font-medium">Click to choose a CSV file</p>
                          <p className="text-xs mt-1">Accepted format: .csv</p>
                        </div>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleBulkFileUpload}
                          disabled={isLoading || (newUserRole === "STUDENT" && !bulkClassId)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {(bulkFileName || bulkPreviewCount > 0) && (
                      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 text-sm text-gray-600 dark:text-gray-300">
                        {bulkFileName ? <p><span className="font-medium text-gray-900 dark:text-white">Last file:</span> {bulkFileName}</p> : null}
                        {bulkPreviewCount > 0 ? <p className="mt-1"><span className="font-medium text-gray-900 dark:text-white">Rows processed:</span> {bulkPreviewCount}</p> : null}
                      </div>
                    )}

                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-4 text-sm text-blue-700 dark:text-blue-300">
                      Required headers: <span className="font-semibold">{newUserRole === "STUDENT" ? STUDENT_CSV_HEADERS.join(", ") : TEACHER_CSV_HEADERS.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form action={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                      <input type="text" name="name" defaultValue={editingUser?.name} required className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                      <input type="email" name="email" defaultValue={editingUser?.email} required className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Temp Password</label>
                        <input type="password" name="password" required className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                      </div>
                    )}
                  </div>

                  {newUserRole === "TEACHER" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl space-y-4 border border-blue-100 dark:border-blue-900">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Employee ID</label>
                        <input
                          type="text"
                          name="employeeId"
                          defaultValue={editingUser?.teacherProfile?.employeeId}
                          placeholder="e.g., FAC-2024-001"
                          required
                          className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                        <input type="text" name="designation" defaultValue={editingUser?.teacherProfile?.designation} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isHod" value="true" defaultChecked={editingUser?.teacherProfile?.isHod} className="w-5 h-5 rounded border-gray-300 text-black" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grant Head of Department (HOD)</span>
                      </label>
                    </div>
                  )}

                  {newUserRole === "STUDENT" && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl space-y-4 border border-green-100 dark:border-green-900">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Roll Number</label>
                          <input type="text" name="rollNumber" defaultValue={editingUser?.studentProfile?.rollNumber} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                          <input type="number" name="semester" min="1" max="8" defaultValue={editingUser?.studentProfile?.currentSemester || 1} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign to Class</label>
                        <select name="classId" defaultValue={editingUser?.studentProfile?.classId} className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg outline-none">
                          <option value="">Select a class...</option>
                          {dbClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name} ({cls.batch})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-6 border-t border-gray-100 dark:border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {isLoading ? "Saving..." : (editingUser ? "Save Changes" : "Create Account")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All their associated profiles and data will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium">Cancel</button>
              <button onClick={confirmDelete} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium flex justify-center items-center">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${active ? "bg-white dark:bg-black text-black dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}>
      {icon} {label}
    </button>
  );
}