// app/(mobile-pwa)/teacher/components/current-class-card.tsx
// This component displays the current class information for a teacher, including course details, time, room, and attendance percentage. It also includes a button to slide for attendance.
// The component is designed to be used in a mobile PWA for teachers, providing a clear and concise overview of the current class and allowing for easy interaction to manage attendance.

'use client';

import { Users } from 'lucide-react';

interface CurrentClassCardProps {
  className: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  room: string;
  year: string;
  attendancePercentage: number;
  onSlideAttendance?: () => void;
}

export function CurrentClassCard({
  className,
  courseCode,
  courseName,
  startTime,
  endTime,
  room,
  year,
  attendancePercentage,
  onSlideAttendance,
}: CurrentClassCardProps) {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">Current Classes</h2>
      
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        {/* Time and Status */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-700">
              {startTime} - {endTime}
            </span>
          </div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            Live
          </span>
        </div>

        {/* Course Code */}
        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">{courseCode}</p>

        {/* Course Name */}
        <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">{courseName}</h3>

        {/* Room and Year Info */}
        <p className="text-xs text-gray-600 mb-4">
          {className} - {year} {room}
        </p>

        {/* Attendance Ring and Button */}
        <div className="flex items-center justify-between gap-3">
          {/* Circular Progress Ring */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45 * (attendancePercentage / 100)} ${2 * Math.PI * 45}`}
                strokeLinecap="round"
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">
                {attendancePercentage}%
              </span>
            </div>
          </div>

          {/* Slide for Attendance Button */}
          <button
            onClick={onSlideAttendance}
            className="flex-1 bg-linear-to-r from-cyan-400 to-teal-400 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-2.5 px-3 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <Users className="w-4 h-4" />
            Slide for Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
