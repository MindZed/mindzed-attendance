'use client';

import { UpcomingClassCard } from './upcoming-class-card';

export interface UpcomingClass {
  id: string;
  courseName: string;
  startTime: string;
  courseCode: string;
  year: string;
  attendancePercentage?: number;
}

interface UpcomingClassesSectionProps {
  classes: UpcomingClass[];
}

export function UpcomingClassesSection({ classes }: UpcomingClassesSectionProps) {
  return (
    <div className="px-4 mb-6 pb-20">
      <h2 className="text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">Upcoming Classes</h2>
      
      <div className="space-y-2.5">
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <UpcomingClassCard
              key={classItem.id}
              courseName={classItem.courseName}
              startTime={classItem.startTime}
              courseCode={classItem.courseCode}
              year={classItem.year}
              attendancePercentage={classItem.attendancePercentage}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-gray-500">No upcoming classes</p>
          </div>
        )}
      </div>
    </div>
  );
}
