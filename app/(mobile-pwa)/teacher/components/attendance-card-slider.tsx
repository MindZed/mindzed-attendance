// app/(mobile-pwa)/teacher/components/attendance-card-slider.tsx
// This component implements a swipeable card interface for marking student attendance.
// It allows teachers to swipe right to mark present, left to mark absent, and has buttons for marking late or undoing the last action.

'use client';

import { useRef, useState } from 'react';
import { Student, AttendanceStatus } from '../data/mock-students';
import { Check, X, Clock, Undo2 } from 'lucide-react';

interface AttendanceCardSliderProps {
  students: Student[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => void;
  onConfirmSummary?: () => void;
}

export function AttendanceCardSlider({
  students,
  onMarkAttendance,
  onConfirmSummary,
}: AttendanceCardSliderProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const currentStudent = students[currentIndex];
  const isCompletionCard = currentIndex >= students.length;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX;
    setCurrentX(newX);
    
    const diffX = newX - startX;
    if (diffX > 20) {
      setDragDirection('right');
    } else if (diffX < -20) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newX = e.touches[0].clientX;
    setCurrentX(newX);
    
    const diffX = newX - startX;
    if (diffX > 20) {
      setDragDirection('right');
    } else if (diffX < -20) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const handleEndDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diffX = currentX - startX;
    const threshold = 60; // minimum swipe distance

    if (isCompletionCard) {
      if (Math.abs(diffX) > threshold) {
        onConfirmSummary?.();
      }
      setCurrentX(startX);
      setDragDirection(null);
      return;
    }

    // Right swipe - Present
    if (diffX > threshold) {
      handleMarkAttendance('present');
    }
    // Left swipe - Absent
    else if (diffX < -threshold) {
      handleMarkAttendance('absent');
    }

    setCurrentX(startX);
    setDragDirection(null);
  };

  const handleMarkAttendance = (status: AttendanceStatus) => {
    if (!currentStudent) return;
    onMarkAttendance(currentStudent.id, status);

    // Move to next card
    setCurrentIndex((prev) => Math.min(prev + 1, students.length));
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleButtonClick = (status: AttendanceStatus) => {
    handleMarkAttendance(status);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 px-4 py-6">
      {/* Swipe Instruction */}
      <p className="text-xs text-gray-500 text-center">Swipe the card to mark Attendance</p>

      {/* Card Container */}
      <div className="relative w-full max-w-xs h-80">
        {currentStudent ? (
          <div
            ref={cardRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEndDrag}
            className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${isDragging ? currentX - startX : 0}px) rotateZ(${isDragging ? (currentX - startX) * 0.05 : 0}deg)`,
              opacity: isDragging ? 0.95 : 1,
              transition: isDragging ? 'none' : 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Swipe Direction Indicators */}
            {dragDirection === 'right' && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 animate-pulse">
                <Check className="w-4 h-4" />
              </div>
            )}
            {dragDirection === 'left' && (
              <div className="absolute top-4 left-4 bg-red-500 text-white rounded-full p-2 animate-pulse">
                <X className="w-4 h-4" />
              </div>
            )}
            {/* Roll Number - Large */}
            <div className="text-5xl font-black text-gray-900 mb-1">
              {String(currentStudent.rollNumber).padStart(2, '0')}
            </div>

            {/* Course ID */}
            <p className="text-xs text-gray-600 font-medium mb-6">
              {currentStudent.courseId}
            </p>

            {/* Student Name */}
            <h3 className="text-base font-bold text-gray-900 text-center mb-6 leading-snug max-w-xs">
              {currentStudent.name}
            </h3>

            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 mb-4">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
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
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeDasharray={`${
                    2 * Math.PI * 45 * (currentStudent.currentAttendancePercentage / 100)
                  } ${2 * Math.PI * 45}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {currentStudent.currentAttendancePercentage}%
                </span>
              </div>
            </div>

            {/* Card Counter */}
            <p className="text-xs text-gray-500 mt-4">
              {currentIndex + 1} / {students.length}
            </p>
          </div>
        ) : (
          <div
            ref={cardRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEndDrag}
            className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${isDragging ? currentX - startX : 0}px) rotateZ(${isDragging ? (currentX - startX) * 0.05 : 0}deg)`,
              opacity: isDragging ? 0.95 : 1,
              transition: isDragging ? 'none' : 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {dragDirection && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 animate-pulse">
                <Check className="w-4 h-4" />
              </div>
            )}
            <p className="text-2xl font-black text-gray-900 mb-2 text-center">Marking done</p>
            <p className="text-sm text-gray-500 text-center">
              Swipe this card to view attendance summary
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-3 text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-700">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-700">Previous</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
          <span className="text-gray-700">Late</span>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompletionCard && (
        <div className="flex gap-4 w-full justify-center px-4">
          <button
            onClick={() => handleButtonClick('absent')}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            title="Mark Absent"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className="w-14 h-14 rounded-full bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            title="Undo Last Mark"
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleButtonClick('late')}
            className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            title="Mark Late"
          >
            <Clock className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleButtonClick('present')}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            title="Mark Present"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
