// app/(desktop-dashboards)/admin/classes/page.tsx
// This is the main page for managing classes in the admin dashboard. It allows administrators to create, edit, and delete classes (academic batches) that students can be assigned to.
// The page features a header with a title and description, a button to add new classes, and a data table that lists existing classes with options to edit or delete them. Modals are used for both creating/editing classes and confirming deletions, providing a smooth user experience. The page also handles loading states and displays success/error messages based on the outcomes of actions.

"use client";

import { useState, useEffect } from "react";
import { Plus, X, BookA, Loader2, Calendar, Trash2, Edit, AlertTriangle } from "lucide-react";
import { createClass, getClasses, updateClass, deleteClass } from "@/lib/actions/admin/classes";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  useEffect(() => { loadClasses(); }, []);

  async function loadClasses() {
    setIsFetching(true);
    const result = await getClasses();
    if (result.data) setClasses(result.data);
    setIsFetching(false);
  }

  function handleCreateClick() {
    setEditingClass(null);
    setIsModalOpen(true);
  }

  function handleEditClick(cls: any) {
    setEditingClass(cls);
    setIsModalOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setMessage(null);

    let result;
    if (editingClass) {
      formData.set("id", editingClass.id);
      result = await updateClass(formData);
    } else {
      result = await createClass(formData);
    }

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.message || "Success!" });
      loadClasses();
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setEditingClass(null);
      }, 1500);
    }
    
    setIsLoading(false);
  }

  async function confirmDelete() {
    if (!classToDelete) return;
    setIsLoading(true);
    
    const result = await deleteClass(classToDelete);
    if (result.success) {
      setClassToDelete(null);
      loadClasses();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <BookA className="w-8 h-8" /> Class Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create academic batches before assigning students to them.
          </p>
        </div>
        
        <button onClick={handleCreateClick} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
          <Plus className="w-5 h-5" /> Add Class
        </button>
      </div>

      {/* Data Table Area */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {isFetching ? (
          <div className="p-12 flex justify-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No classes found. Click "Add Class" to get started.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Stream / Branch</th>
                <th className="px-6 py-4 font-medium">Academic Batch</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{cls.course}</td>
                  <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">{cls.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {cls.batch}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(cls)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setClassToDelete(cls.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATION / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingClass ? "Edit Class" : "Create New Class"}</h2>
              <button onClick={() => {setIsModalOpen(false); setEditingClass(null);}} className="text-gray-400 hover:text-gray-700 transition"><X className="w-6 h-6" /></button>
            </div>

            {message && (
              <div className={`mx-6 mt-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <form action={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course (Degree/Program)</label>
                <input type="text" name="course" defaultValue={editingClass?.course} required placeholder="e.g., B.Tech, MBA, MCA" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stream / Branch Name</label>
                <input type="text" name="name" defaultValue={editingClass?.name} required placeholder="e.g., CSE, Mechanical" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Academic Batch</label>
                <input type="text" name="batch" defaultValue={editingClass?.batch} required placeholder="e.g., 2024-2028" className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 dark:border-neutral-800">
                <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? "Saving..." : (editingClass ? "Save Changes" : "Create Class")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Class?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure? Ensure no students are assigned to this class before deleting.</p>
            <div className="flex gap-3">
              <button onClick={() => setClassToDelete(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium">Cancel</button>
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