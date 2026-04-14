'use client';

interface AttendanceSummaryProps {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export function AttendanceSummary({
  totalCount,
  presentCount,
  absentCount,
  lateCount,
}: AttendanceSummaryProps) {
  const attendancePercentage =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const dash = circumference * (attendancePercentage / 100);

  return (
    <div className="mt-8 mx-4 p-6 bg-white rounded-3xl shadow-sm">
      <h3 className="text-sm text-gray-700 mb-4 font-medium">Summary</h3>

      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={circleRadius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={circleRadius}
              fill="none"
              stroke="#6dd3bf"
              strokeWidth="8"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-[#6dd3bf]">{attendancePercentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-center gap-10">
        <div className="text-center">
          <p className="text-6xl font-black text-black leading-none">{presentCount}</p>
          <p className="text-4xl text-black mt-1">Present</p>
        </div>
        <div className="text-center">
          <p className="text-6xl font-black text-red-400 leading-none">{absentCount}</p>
          <p className="text-4xl text-red-400 mt-1">Absent</p>
        </div>
      </div>

      {lateCount > 0 && (
        <p className="text-center text-xs text-amber-500 mt-3">
          Late marked: {lateCount}
        </p>
      )}
    </div>
  );
}
