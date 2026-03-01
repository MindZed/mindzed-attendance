import { getTeachers } from "@/lib/actions/users";
import { Building, Award } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const { data: teachers, error } = await getTeachers();

  if (error) redirect("/settings");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Building className="w-8 h-8" /> Faculty Directory
        </h1>
        <p className="mt-2 text-sm text-gray-500">Manage department teachers and HODs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teachers?.map((teacher) => (
          <div key={teacher.id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{teacher.name}</h3>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
              {teacher.teacherProfile?.isHod && (
                <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> HOD
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {teacher.teacherProfile?.designation || "Faculty Member"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}