export type DesktopRole = "TEACHER" | "CC" | "HOD";

export type SessionStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface DashboardUser {
  id: string;
  name: string;
  role: DesktopRole;
  department: string;
  managedClassIds: string[];
}

export interface SubjectRingMetric {
  id: string;
  subjectCode: string;
  subjectName: string;
  progressPercent: number;
}

export interface AgendaSession {
  id: string;
  className: string;
  subjectCode: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
}

export interface PendingClassAction {
  id: string;
  className: string;
  subjectCode: string;
  waitingSince: string;
}

export interface TeacherDefaulterRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;
  subjectCode: string;
  attendancePercent: number;
}

export interface AuditSession {
  id: string;
  className: string;
  subjectCode: string;
  teacherName: string;
  scheduledAt: string;
  expectedStatus: Exclude<SessionStatus, "SCHEDULED" | "ACTIVE">;
}

export interface MacroDefaulterRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;
  department: string;
  batch: string;
  attendancePercent: number;
}

export interface BatchHealthStat {
  id: string;
  label: string;
  attendancePercent: number;
  totalStudents: number;
}

export const mockCurrentUser: DashboardUser = {
  id: "usr-cc-001",
  name: "Prof. Aditi Sharma",
  role: "CC",
  department: "CSE",
  managedClassIds: ["CSE-A-3", "CSE-B-3"],
};

export const subjectRingMetrics: SubjectRingMetric[] = [
  { id: "m1", subjectCode: "CSE301", subjectName: "DBMS", progressPercent: 72 },
  { id: "m2", subjectCode: "CSE351", subjectName: "DBMS Lab", progressPercent: 64 },
  { id: "m3", subjectCode: "CSE305", subjectName: "Operating Systems", progressPercent: 58 },
  { id: "m4", subjectCode: "CSE307", subjectName: "Compiler Design", progressPercent: 43 },
  { id: "m5", subjectCode: "CSE309", subjectName: "Computer Networks", progressPercent: 81 },
];

export const todayAgenda: AgendaSession[] = [
  {
    id: "ag1",
    className: "B.Tech CSE A (3rd Yr)",
    subjectCode: "CSE301",
    startTime: "09:00",
    endTime: "09:50",
    status: "COMPLETED",
  },
  {
    id: "ag2",
    className: "B.Tech CSE B (3rd Yr)",
    subjectCode: "CSE351",
    startTime: "11:00",
    endTime: "12:30",
    status: "ACTIVE",
  },
  {
    id: "ag3",
    className: "B.Tech CSE A (3rd Yr)",
    subjectCode: "CSE307",
    startTime: "14:00",
    endTime: "14:50",
    status: "SCHEDULED",
  },
];

export const pendingClassActions: PendingClassAction[] = [
  {
    id: "p1",
    className: "B.Tech CSE A (3rd Yr)",
    subjectCode: "CSE301",
    waitingSince: "09:55",
  },
  {
    id: "p2",
    className: "B.Tech CSE B (3rd Yr)",
    subjectCode: "CSE351",
    waitingSince: "12:35",
  },
];

export const teacherDefaulters: TeacherDefaulterRecord[] = [
  {
    id: "d1",
    studentName: "Riya Das",
    rollNumber: "CSE/2023/015",
    className: "B.Tech CSE A",
    subjectCode: "CSE301",
    attendancePercent: 48,
  },
  {
    id: "d2",
    studentName: "Arjun Sen",
    rollNumber: "CSE/2023/028",
    className: "B.Tech CSE B",
    subjectCode: "CSE351",
    attendancePercent: 41,
  },
  {
    id: "d3",
    studentName: "Megha Paul",
    rollNumber: "CSE/2023/054",
    className: "B.Tech CSE A",
    subjectCode: "CSE307",
    attendancePercent: 36,
  },
];

export const pendingAuditSessions: AuditSession[] = [
  {
    id: "au1",
    className: "B.Tech CSE A",
    subjectCode: "CSE301",
    teacherName: "Prof. Das",
    scheduledAt: "2026-04-12 09:00",
    expectedStatus: "COMPLETED",
  },
  {
    id: "au2",
    className: "B.Tech CSE C",
    subjectCode: "CSE309",
    teacherName: "Prof. Roy",
    scheduledAt: "2026-04-12 12:00",
    expectedStatus: "CANCELLED",
  },
  {
    id: "au3",
    className: "B.Tech CSE B",
    subjectCode: "CSE307",
    teacherName: "Prof. Saha",
    scheduledAt: "2026-04-13 14:00",
    expectedStatus: "COMPLETED",
  },
];

export const macroDefaulters: MacroDefaulterRecord[] = [
  {
    id: "md1",
    studentName: "Neel Ghosh",
    rollNumber: "CSE/2023/081",
    className: "CSE-A-3",
    department: "CSE",
    batch: "2023-2027",
    attendancePercent: 49,
  },
  {
    id: "md2",
    studentName: "Srishti Pal",
    rollNumber: "CSE/2023/092",
    className: "CSE-B-3",
    department: "CSE",
    batch: "2023-2027",
    attendancePercent: 38,
  },
  {
    id: "md3",
    studentName: "Abir Khan",
    rollNumber: "CSE/2022/041",
    className: "CSE-A-4",
    department: "CSE",
    batch: "2022-2026",
    attendancePercent: 47,
  },
  {
    id: "md4",
    studentName: "Rohan Dutta",
    rollNumber: "ECE/2023/017",
    className: "ECE-A-3",
    department: "ECE",
    batch: "2023-2027",
    attendancePercent: 42,
  },
];

export const batchHealthStats: BatchHealthStat[] = [
  { id: "b1", label: "CSE 2023-2027", attendancePercent: 76, totalStudents: 182 },
  { id: "b2", label: "CSE 2022-2026", attendancePercent: 71, totalStudents: 168 },
  { id: "b3", label: "ECE 2023-2027", attendancePercent: 73, totalStudents: 160 },
  { id: "b4", label: "ME 2023-2027", attendancePercent: 78, totalStudents: 146 },
];
