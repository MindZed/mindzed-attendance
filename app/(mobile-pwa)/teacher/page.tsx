'use client';

import { useState } from 'react';
import { TeacherHeader } from './components/teacher-header';
import { CurrentClassCard } from './components/current-class-card';
import { UpcomingClassesSection, UpcomingClass } from './components/upcoming-classes-section';
import { BottomNavigation } from './components/bottom-navigation';
// TODO: Replace with real data from your API/database
const mockTeacherData = {
  name: 'Prof. Moumita',
  classesLeft: 5,
};

const mockCurrentClass = {
  className: '8. Tech CSE',
  courseCode: 'CSE/CSCI',
  courseName: 'Database Management System',
  startTime: '11:00 AM',
  endTime: '12:30 AM',
  room: 'RB606',
  year: '3rd Year',
  attendancePercentage: 57,
};

const mockUpcomingClasses: UpcomingClass[] = [
  {
    id: '1',
    courseName: 'Embedded System',
    startTime: '12:00 PM',
    courseCode: 'B Tech CSE',
    year: '3rd Year',
    attendancePercentage: 51,
  },
  {
    id: '2',
    courseName: 'Database Management System',
    startTime: '1:00 PM',
    courseCode: 'B Tech CSE',
    year: '2nd Year',
    attendancePercentage: 56,
  },
];

export default function TeacherDashboard() {
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  const handleSlideAttendance = () => {
    setIsAttendanceOpen(true);
    // TODO: Implement attendance slide action
    console.log('Opening attendance slide for:', mockCurrentClass.courseName);
  };

  const handleCloseAttendance = () => {
    setIsAttendanceOpen(false);
  };

  return (
    <main className="w-full max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <TeacherHeader 
        teacherName={mockTeacherData.name}
        classesLeft={mockTeacherData.classesLeft}
      />

      {/* Current Class */}
      <CurrentClassCard
        {...mockCurrentClass}
        onSlideAttendance={handleSlideAttendance}
      />

      {/* Upcoming Classes */}
      <UpcomingClassesSection classes={mockUpcomingClasses} />

      {/* Attendance Modal/Slide - TODO: Implement attendance interface */}
      {isAttendanceOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-3 text-gray-900">Take Attendance</h2>
            <p className="text-sm text-gray-600 mb-6">
              {mockCurrentClass.courseName}
            </p>
            <button
              onClick={handleCloseAttendance}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </main>
  );
}
