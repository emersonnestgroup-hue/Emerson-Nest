/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolRole = 'director' | 'teacher' | 'parent' | 'vice-director' | 'staff';

export interface User {
  id: string; // 8-character generated code (e.g. LE123456)
  lastName: string;
  firstName: string;
  email: string;
  role: SchoolRole;
  status: 'pending' | 'approved';
  phoneNumber: string;
  password?: string; // Private custom password
  createdAt: string;
  associatedStudentIds?: string[]; // For parents (which students are theirs)
  teacherSubject?: string; // For teachers
}

export interface Grade {
  id: string;
  subject: string;
  score: number; // For example out of 20
  coefficient: number;
  date: string;
  title: string; // "Contrôle N°1", "Examen Trimestriel", etc.
  comment?: string;
  gradedBy: string; // Teacher name / ID
}

export interface Attendance {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  justified: boolean;
  comment?: string;
}

export interface Student {
  id: string; // 8-character unique code e.g. EL837261
  firstName: string;
  lastName: string;
  className: string; // e.g., "Terminale S", "Première G", "3ème A"
  parentId: string; // ID parental
  grades: Grade[];
  attendance: Attendance[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  targetAudience: 'all' | string; // 'all' or class name e.g. "Terminale S"
  description: string;
  location: string;
}

export interface Payment {
  id: string;
  parentId: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month: string; // Month name or e.g., "Frais de Scolarité T1"
  status: 'paid' | 'pending' | 'overdue';
  cardNumberMasked?: string; // Safe masked credit card **** **** **** 4821
  paymentMethod?: string; // "Carte Bancaire"
}

export interface Homework {
  id: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
  teacherName: string;
}

export interface OnlineCourse {
  id: string;
  title: string;
  subject: string;
  className: string;
  scheduledDate: string;
  scheduledTime: string;
  link: string; // Virtual link or code
  teacherId: string;
  teacherName: string;
  description?: string;
}
