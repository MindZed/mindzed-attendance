"use client";

import { useMemo, useState } from "react";
import {
  batchHealthStats,
  macroDefaulters,
  pendingAuditSessions,
  type DashboardUser,
} from "./mock-data";

const healthTone = (value: number) => {
  if (value < 60) return "text-mz-danger";
  if (value < 75) return "text-mz-warning";
  return "text-mz-success";
};

export function AdminView({ user }: { user: DashboardUser }) {
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const scopedDefaulters = useMemo(() => {
    const roleScoped = user.role === "HOD"
      ? macroDefaulters.filter((item) => item.department === user.department)
      : macroDefaulters.filter((item) => user.managedClassIds.includes(item.className));

    return roleScoped.filter((item) => {
      const batchMatch = batchFilter === "ALL" || item.batch === batchFilter;
      const classMatch = classFilter === "ALL" || item.className === classFilter;
      return batchMatch && classMatch;
    });
  }, [batchFilter, classFilter, user]);

  const batchOptions = useMemo(
    () => Array.from(new Set(macroDefaulters.map((item) => item.batch))),
    [],
  );
  const classOptions = useMemo(
    () => Array.from(new Set(macroDefaulters.map((item) => item.className))),
    [],
  );

  return (
    <div className="grid gap-6">
      <section className="border border-mz-dark-border bg-mz-dark-surface p-4">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-mz-dark-text">Pending / Incomplete Sessions Audit</h2>
        <ul className="space-y-2">
          {pendingAuditSessions.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 border border-mz-dark-border bg-[#1a1a1a] p-3 text-sm"
            >
              <p className="font-medium text-mz-dark-text">{item.className} - {item.subjectCode}</p>
              <p className="text-mz-dark-text/75">{item.teacherName}</p>
              <p className="text-mz-dark-text/75">{item.scheduledAt}</p>
              <span className="border border-mz-danger px-2 py-1 text-xs font-semibold text-mz-danger">
                Expected {item.expectedStatus}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-mz-dark-border bg-mz-dark-surface p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-mz-dark-text">Macro Defaulters Radar (&lt; 50%)</h3>
          <div className="flex gap-2">
            <select
              value={batchFilter}
              onChange={(event) => setBatchFilter(event.target.value)}
              className="border border-mz-dark-border bg-[#161616] px-2 py-1 text-xs text-mz-dark-text outline-none"
            >
              <option value="ALL">All Batches</option>
              {batchOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="border border-mz-dark-border bg-[#161616] px-2 py-1 text-xs text-mz-dark-text outline-none"
            >
              <option value="ALL">All Classes</option>
              {classOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-mz-dark-border text-left text-xs uppercase tracking-[0.14em] text-mz-dark-text/70">
                <th className="px-2 py-2">Student</th>
                <th className="px-2 py-2">Roll No.</th>
                <th className="px-2 py-2">Class</th>
                <th className="px-2 py-2">Batch</th>
                <th className="px-2 py-2 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {scopedDefaulters.map((row) => (
                <tr key={row.id} className="border-b border-mz-dark-border/60 text-mz-dark-text/90">
                  <td className="px-2 py-2 font-medium">{row.studentName}</td>
                  <td className="px-2 py-2">{row.rollNumber}</td>
                  <td className="px-2 py-2">{row.className}</td>
                  <td className="px-2 py-2">{row.batch}</td>
                  <td className="px-2 py-2 text-right font-bold text-mz-danger">{row.attendancePercent}%</td>
                </tr>
              ))}
              {scopedDefaulters.length === 0 && (
                <tr>
                  <td className="px-2 py-4 text-center text-mz-dark-text/60" colSpan={5}>
                    No records for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3">
        {batchHealthStats.map((item) => (
          <article key={item.id} className="border border-mz-dark-border bg-mz-dark-surface p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-mz-dark-text/65">{item.label}</p>
            <p className={`mt-2 text-2xl font-bold ${healthTone(item.attendancePercent)}`}>
              {item.attendancePercent}%
            </p>
            <p className="text-xs text-mz-dark-text/70">{item.totalStudents} students</p>
          </article>
        ))}
      </section>
    </div>
  );
}
