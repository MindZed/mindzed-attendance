import { getPermittedClasses, getStudentsByClass } from "@/lib/actions/users";
import { Users, GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentsPage({ searchParams }: { searchParams: { classId?: string } }) {
  const classId = searchParams.classId;

  // VIEW 1: SELECT A CLASS
  if (!classId) {
    const { data: classes, error } = await getPermittedClasses();
    if (error || !classes) redirect("/settings");

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Users className="w-8 h-8" /> Select a Class
          </h1>
          <p className="mt-2 text-sm text-gray-500">Choose a batch to view its students.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link 
              href={`/users/students?classId=${cls.id}`} 
              key={cls.id}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-all group"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:underline underline-offset-4">{cls.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Batch: {cls.batch}</p>
            </Link>
          ))}
          {classes.length === 0 && (
            <p className="text-sm text-gray-500">You are not assigned as a coordinator to any classes.</p>
          )}
        </div>
      </div>
    );
  }

  // VIEW 2: SHOW STUDENTS FOR SELECTED CLASS
  const { data: students, error } = await getStudentsByClass(classId);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-red-500">
        <p>{error}</p>
        <Link href="/users/students" className="text-black dark:text-white underline mt-4 block">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/users/students" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <GraduationCap className="w-8 h-8" /> Student Roster
        </h1>
        <p className="mt-2 text-sm text-gray-500">Viewing {students?.length} students.</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4">Roll Number</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Semester</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((student) => (
              <tr key={student.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{student.rollNumber}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.user.name}</td>
                <td className="px-6 py-4 text-center w-24">{student.currentSemester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}