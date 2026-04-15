"use client";

import { CheckCircle2, CircleDot, Clock3, TriangleAlert } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  pendingClassActions,
  subjectRingMetrics,
  teacherDefaulters,
  todayAgenda,
} from "./mock-data";

const CRITICAL_ATTENDANCE_THRESHOLD = 50;

const statusMeta = {
  SCHEDULED: {
    icon: Clock3,
    toneClass: "text-mz-text-primary",
    label: "Scheduled",
  },
  ACTIVE: {
    icon: CircleDot,
    toneClass: "text-mz-warning",
    label: "Active",
  },
  COMPLETED: {
    icon: CheckCircle2,
    toneClass: "text-mz-success-deep",
    label: "Completed",
  },
  CANCELLED: {
    icon: TriangleAlert,
    toneClass: "text-mz-danger",
    label: "Cancelled",
  },
} as const;

export function BaseTeacherView() {
  return (
    <div className="grid gap-6">
      <section className="border border-mz-text-primary/15 bg-mz-bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Module Completion</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-mz-text-primary/70">Today</p>
        </div>

        <div className="dashboard-scroll flex gap-4 overflow-x-auto pb-2">
          {subjectRingMetrics.map((metric) => {
            const data = [
              { name: "progress", value: metric.progressPercent },
              { name: "remaining", value: 100 - metric.progressPercent },
            ];

            return (
              <article
                key={metric.id}
                className="min-w-[172px] border border-mz-text-primary/15 bg-mz-bg-primary p-3"
              >
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={26}
                        outerRadius={34}
                        strokeWidth={0}
                      >
                        <Cell fill="var(--color-mz-success)" />
                        <Cell fill="var(--color-mz-bg-secondary)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm font-semibold text-mz-text-primary">{metric.subjectCode}</p>
                <p className="text-xs text-mz-text-primary/75">{metric.subjectName}</p>
                <p className="mt-1 text-lg font-bold leading-none text-mz-text-primary">{metric.progressPercent}%</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <div className="border border-mz-text-primary/15 bg-mz-bg-primary p-4">
          <h3 className="mb-4 text-base font-semibold tracking-tight">Today&apos;s Agenda</h3>
          <ul className="space-y-3">
            {todayAgenda.map((item) => {
              const meta = statusMeta[item.status];
              const Icon = meta.icon;
              return (
                <li key={item.id} className="grid grid-cols-[96px_1fr] items-start gap-3 border-l-2 border-mz-text-primary/15 pl-3">
                  <p className="text-xs font-medium text-mz-text-primary/80">
                    {item.startTime} - {item.endTime}
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{item.className}</p>
                    <p className="text-xs text-mz-text-primary/75">{item.subjectCode}</p>
                    <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${meta.toneClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border border-mz-text-primary/15 bg-mz-bg-primary p-4">
          <h3 className="mb-4 text-base font-semibold tracking-tight">Quick Actions &amp; Class Status</h3>
          <ul className="space-y-3">
            {pendingClassActions.map((item) => (
              <li key={item.id} className="border border-mz-text-primary/15 p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{item.className}</p>
                    <p className="text-xs text-mz-text-primary/75">{item.subjectCode}</p>
                  </div>
                  <span className="text-xs text-mz-text-primary/70">Waiting since {item.waitingSince}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 border border-mz-text-primary bg-mz-warning px-3 py-1.5 text-xs font-semibold text-mz-text-primary transition hover:opacity-90">
                    Mark Attendance
                  </button>
                  <button className="flex-1 border border-mz-text-primary px-3 py-1.5 text-xs font-semibold text-mz-text-primary transition hover:bg-mz-bg-secondary">
                    Delegate to CR
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border border-mz-text-primary/15 bg-mz-bg-primary p-4">
        <h3 className="mb-4 text-base font-semibold tracking-tight">
          Critical Defaulters (&lt; {CRITICAL_ATTENDANCE_THRESHOLD}%)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-mz-bg-secondary text-left text-xs uppercase tracking-[0.14em] text-mz-text-primary/75">
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Roll No.</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {teacherDefaulters.map((row) => (
                <tr key={row.id} className="border-b border-mz-text-primary/10">
                  <td className="px-3 py-2 font-medium">{row.studentName}</td>
                  <td className="px-3 py-2 text-mz-text-primary/80">{row.rollNumber}</td>
                  <td className="px-3 py-2 text-mz-text-primary/80">{row.className}</td>
                  <td className="px-3 py-2 text-mz-text-primary/80">{row.subjectCode}</td>
                  <td className="px-3 py-2 text-right font-bold text-mz-danger">{row.attendancePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
