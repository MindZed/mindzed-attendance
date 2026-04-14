'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { mockStudents, AttendanceStatus } from '../data/mock-students';
import { AttendanceCardSlider } from '../components/attendance-card-slider';

interface StudentAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);

  // Mock course data
  const courseData = {
    code: 'CSE-3RD',
    name: 'B. Tech - CSE',
    year: '3rd Year',
    courseTitle: 'Database Management System',
  };

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex((record) => record.studentId === studentId);
      if (existingIndex > -1) {
        // Update existing record
        const updated = [...prev];
        updated[existingIndex] = { studentId, status };
        return updated;
      }
      // Add new record
      return [...prev, { studentId, status }];
    });
  };

  // Calculate absentees
  const absentees = attendanceRecords.filter((r) => r.status === 'absent');
  const absentCount = absentees.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const absentRollNumbers = absentees.map((r) => {
    const student = mockStudents.find((s) => s.id === r.studentId);
    return student?.rollNumber;
  }).filter(Boolean);

  return (
    <main className="overflow-hidden w-full max-w-md mx-auto bg-linear-to-b from-gray-900 to-gray-800 min-h-screen pb-8">
      {/* Header with Close Button */}
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">📚</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{courseData.name}</h1>
              <p className="text-xs text-gray-400">{courseData.year}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 ml-10">{courseData.courseTitle}</p>
        </div>
        <button className="text-white hover:text-gray-300 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Absentees Count Section */}
      <div className="bg-white mx-4 mt-4 rounded-2xl p-4">
        <h2 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Absentees
        </h2>
        {absentRollNumbers.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-bold text-red-700 leading-relaxed">
              {absentRollNumbers.join(', ')}
            </p>
            <p className="text-xs text-red-500 mt-1">
              {absentCount} Absent • {presentCount} Present
            </p>
          </div>
        )}
        {absentRollNumbers.length === 0 && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600">
              No absences marked yet
            </p>
          </div>
        )}
        <div className="flex gap-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-red-500">
              {String(absentCount).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-300">
              {String(mockStudents.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Card Slider */}
      <AttendanceCardSlider students={mockStudents} onMarkAttendance={handleMarkAttendance} />

      {/* Completion Message */}
      {attendanceRecords.length === mockStudents.length && (
        <div className="mt-8 mx-4 p-6 bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-xl font-bold text-emerald-700 mb-2">
            ✓ Call List Complete!
          </p>
          <p className="text-sm text-emerald-600">
            All {mockStudents.length} students have been marked
          </p>
        </div>
      )}
    </main>
  );
}
