import { getAdmins } from "@/lib/actions/users";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminsPage() {
  const { data: admins, error } = await getAdmins();

  if (error) redirect("/settings"); // Redirect if they try to bypass UI

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8" /> System Administrators
        </h1>
        <p className="mt-2 text-sm text-gray-500">Users with full access to the MindZed platform.</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {admins?.map((admin) => (
              <tr key={admin.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{admin.name}</td>
                <td className="px-6 py-4">{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}