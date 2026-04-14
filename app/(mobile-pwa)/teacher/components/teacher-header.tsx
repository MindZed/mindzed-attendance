// app/(mobile-pwa)/teacher/components/teacher-header.tsx
// This component displays a greeting, the teacher's name, and the number of classes left for the day.
// It is designed to be used in the teacher's dashboard of a mobile PWA.

"use client";


interface TeacherHeaderProps {
  teacherName: string;
  classesLeft: number;
}

export function TeacherHeader({
  teacherName,
  classesLeft,
}: TeacherHeaderProps) {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="w-full bg-white px-4 py-5 rounded-b-3xl shadow-sm">
      {/* Greeting and teacher name */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          Good Morning!
        </h1>
        <p className="text-sm text-gray-600 font-medium">{teacherName}</p>
      </div>

      {/* Classes left info */}
      <p className="text-xs text-gray-500">
        Okay, You&apos;ve {classesLeft} classes left today
      </p>
    </div>
  );
}
