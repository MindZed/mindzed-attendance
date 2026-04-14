export type AttendanceStatus = 'present' | 'absent' | 'late' | 'previous';

export interface Student {
  id: string;
  rollNumber: number;
  name: string;
  email: string;
  courseId: string;
  currentAttendancePercentage: number;
  status?: AttendanceStatus;
}

export const mockStudents: Student[] = [
  {
    id: 'STU001',
    rollNumber: 47,
    name: 'Md Abdul Kadir Jillani',
    email: 'abdul.kadir@university.edu',
    courseId: 'CSE234047',
    currentAttendancePercentage: 35,
  },
  {
    id: 'STU002',
    rollNumber: 12,
    name: 'Priya Sharma',
    email: 'priya.sharma@university.edu',
    courseId: 'CSE234012',
    currentAttendancePercentage: 88,
  },
  {
    id: 'STU003',
    rollNumber: 25,
    name: 'Rajesh Kumar Singh',
    email: 'rajesh.singh@university.edu',
    courseId: 'CSE234025',
    currentAttendancePercentage: 75,
  },
  {
    id: 'STU004',
    rollNumber: 33,
    name: 'Ananya Patel',
    email: 'ananya.patel@university.edu',
    courseId: 'CSE234033',
    currentAttendancePercentage: 92,
  },
  {
    id: 'STU005',
    rollNumber: 18,
    name: 'Vikram Reddy',
    email: 'vikram.reddy@university.edu',
    courseId: 'CSE234018',
    currentAttendancePercentage: 60,
  },
  {
    id: 'STU006',
    rollNumber: 41,
    name: 'Sarah Khan',
    email: 'sarah.khan@university.edu',
    courseId: 'CSE234041',
    currentAttendancePercentage: 78,
  },
  {
    id: 'STU007',
    rollNumber: 8,
    name: 'Arjun Desai',
    email: 'arjun.desai@university.edu',
    courseId: 'CSE234008',
    currentAttendancePercentage: 85,
  },
  {
    id: 'STU008',
    rollNumber: 29,
    name: 'Divya Gupta',
    email: 'divya.gupta@university.edu',
    courseId: 'CSE234029',
    currentAttendancePercentage: 82,
  },
  {
    id: 'STU009',
    rollNumber: 36,
    name: 'Mohammed Hassan',
    email: 'hassan.mohammed@university.edu',
    courseId: 'CSE234036',
    currentAttendancePercentage: 45,
  },
  {
    id: 'STU010',
    rollNumber: 15,
    name: 'Neha Verma',
    email: 'neha.verma@university.edu',
    courseId: 'CSE234015',
    currentAttendancePercentage: 90,
  },
];
