// app/(mobile-pwa)/teacher/components/upcoming-class-card.tsx
// This component represents a card for an upcoming class, displaying
// the course name, start time, course code, year, and optionally the attendance percentage.

'use client';

interface UpcomingClassCardProps {
  courseName: string;
  startTime: string;
  courseCode: string;
  year: string;
  attendancePercentage?: number;
}

export function UpcomingClassCard({
  courseName,
  startTime,
  courseCode,
  year,
  attendancePercentage,
}: UpcomingClassCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{courseName}</h3>
        <p className="text-xs text-gray-500 mt-1.5">
          {startTime} • {courseCode} • {year}
        </p>
      </div>

      {/* Attendance percentage badge */}
      {attendancePercentage !== undefined && (
        <div className="ml-3 bg-gray-50 rounded-lg px-3 py-2 text-right shrink-0">
          <p className="text-xs font-bold text-gray-900">{attendancePercentage}%</p>
          <p className="text-xs text-gray-500">Attendance</p>
        </div>
      )}
    </div>
  );
}
