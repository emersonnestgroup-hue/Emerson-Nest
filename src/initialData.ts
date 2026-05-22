/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Student, Meeting, Payment, Homework, OnlineCourse } from './types';

// Helper function to generate an 8-character code:
// Starts with the first uppercase letters of the first name (commencement du prénom) 
// accompanied by safe unique figures (random unique numbers) to reach exactly 8 characters.
export function generate8CharID(firstName: string, prefixRole: 'DIR' | 'PRO' | 'PAR' | 'EL' | 'VIC' | 'STF'): string {
  // Clean first name
  const cleanName = firstName.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
  const namePart = cleanName.substring(0, Math.min(3, cleanName.length));
  // Guarantee we have at least 2 char name part
  const finalNamePart = namePart.length >= 2 ? namePart : (namePart + 'X');
  
  // Choose random numerical digits to fill up to exactly 8 characters
  const neededDigits = 8 - finalNamePart.length;
  let digits = '';
  for (let i = 0; i < neededDigits; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  
  return `${finalNamePart}${digits}`;
}

export const INITIAL_USERS: User[] = [
  {
    id: "DIR94721",
    lastName: "Dupont",
    firstName: "Jean-Luc",
    email: "jeanluc.dupont@ecole.fr",
    role: "director",
    status: "approved",
    phoneNumber: "06 12 34 56 78",
    password: "directeur123",
    createdAt: "2025-09-01T08:00:00Z"
  },
  {
    id: "VIC48291",
    lastName: "Morel",
    firstName: "Emeline",
    email: "emeline.morel@ecole.fr",
    role: "vice-director",
    status: "approved",
    phoneNumber: "06 98 76 54 32",
    password: "vice123",
    createdAt: "2025-09-01T08:30:00Z"
  },
  {
    id: "SOP58194",
    lastName: "Bernard",
    firstName: "Sophie",
    email: "sophie.bernard@ecole.fr",
    role: "teacher",
    status: "approved",
    phoneNumber: "07 11 22 33 44",
    password: "sophie123",
    createdAt: "2025-09-03T10:00:00Z",
    teacherSubject: "Mathématiques"
  },
  {
    id: "MAR41829",
    lastName: "Dubois",
    firstName: "Marc",
    email: "marc.dubois@ecole.fr",
    role: "teacher",
    status: "approved",
    phoneNumber: "07 22 33 44 55",
    password: "marc123",
    createdAt: "2025-09-04T11:00:00Z",
    teacherSubject: "Physique-Chimie"
  },
  {
    id: "LUC29103",
    lastName: "Martin",
    firstName: "Lucie",
    email: "lucie.martin@ecole.fr",
    role: "teacher",
    status: "approved",
    phoneNumber: "07 33 44 55 66",
    password: "lucie123",
    createdAt: "2025-09-10T14:30:00Z",
    teacherSubject: "Français & Littérature"
  },
  {
    id: "PAS82710",
    lastName: "Petit",
    firstName: "Pascal",
    email: "pascal.petit@ecole.fr",
    role: "teacher",
    status: "pending", // Pending approval by director
    phoneNumber: "06 44 55 66 77",
    password: "pascal123",
    createdAt: "2026-05-18T09:15:00Z",
    teacherSubject: "SVT (Sciences)"
  },
  {
    id: "KAR77412",
    lastName: "Belkacem",
    firstName: "Karim",
    email: "karim.belkacem@gmail.com",
    role: "parent",
    status: "approved",
    phoneNumber: "06 55 66 77 88",
    password: "karim123",
    createdAt: "2025-09-02T16:20:00Z",
    associatedStudentIds: ["YAS84920"]
  },
  {
    id: "ISA93201",
    lastName: "Roux",
    firstName: "Isabelle",
    email: "isabelle.roux@yahoo.fr",
    role: "parent",
    status: "approved",
    phoneNumber: "06 77 88 99 00",
    password: "isa123",
    createdAt: "2025-09-03T09:40:00Z",
    associatedStudentIds: ["THO29184"]
  },
  {
    id: "LOU54321",
    lastName: "Gérard",
    firstName: "Louise",
    email: "louise.gerard@telecom.fr",
    role: "parent",
    status: "pending", // Waiting for registration approval
    phoneNumber: "06 33 22 11 00",
    password: "louise123",
    createdAt: "2026-05-20T11:00:00Z"
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "YAS84920",
    firstName: "Yasmine",
    lastName: "Belkacem",
    className: "Terminale S",
    parentId: "KAR77412",
    grades: [
      {
        id: "G1",
        subject: "Mathématiques",
        score: 16.5,
        coefficient: 3,
        date: "2026-03-12",
        title: "Contrôle d'Analyse",
        comment: "Excellent travail, rigueur exemplaire.",
        gradedBy: "SOPHIE BERNARD"
      },
      {
        id: "G2",
        subject: "Physique-Chimie",
        score: 14,
        coefficient: 3,
        date: "2026-03-22",
        title: "Travaux Pratiques Optique",
        comment: "Bonne manipulation, rapport très clair.",
        gradedBy: "MARC DUBOIS"
      },
      {
        id: "G3",
        subject: "Français & Littérature",
        score: 18,
        coefficient: 2,
        date: "2026-04-10",
        title: "Rédac: Réalisme Littéraire",
        comment: "Style remarquable. Très mature.",
        gradedBy: "LUCIE MARTIN"
      },
      {
        id: "G4",
        subject: "Mathématiques",
        score: 15,
        coefficient: 2,
        date: "2026-05-15",
        title: "Calcul Matriciel",
        comment: "Très sérieux.",
        gradedBy: "SOPHIE BERNARD"
      }
    ],
    attendance: [
      { id: "A1", date: "2026-02-14", status: "present", justified: true },
      { id: "A2", date: "2026-03-05", status: "absent", justified: true, comment: "Consultation médicale médicale d'urgence" },
      { id: "A3", date: "2026-04-12", status: "late", justified: false, comment: "Panne de réveil" }
    ]
  },
  {
    id: "THO29184",
    firstName: "Thomas",
    lastName: "Roux",
    className: "Première S",
    parentId: "ISA93201",
    grades: [
      {
        id: "G5",
        subject: "Mathématiques",
        score: 11.5,
        coefficient: 3,
        date: "2026-03-14",
        title: "Évaluation Géométrie",
        comment: "En progrès. Poursuivez vos efforts.",
        gradedBy: "SOPHIE BERNARD"
      },
      {
        id: "G6",
        subject: "Physique-Chimie",
        score: 12,
        coefficient: 3,
        date: "2026-03-24",
        title: "Devoir Électrocinétique",
        comment: "Méthode comprise mais erreurs d'inattention.",
        gradedBy: "MARC DUBOIS"
      },
      {
        id: "G7",
        subject: "Français & Littérature",
        score: 13.5,
        coefficient: 2,
        date: "2026-04-15",
        title: "Oral de Français blanc",
        comment: "Bonne présentation orale, structure solide.",
        gradedBy: "LUCIE MARTIN"
      }
    ],
    attendance: [
      { id: "A4", date: "2026-02-10", status: "present", justified: true },
      { id: "A5", date: "2026-04-02", status: "present", justified: true },
      { id: "A6", date: "2026-05-11", status: "absent", justified: false, comment: "Absence non signalée à l'appel" }
    ]
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "M1",
    title: "Conseil de Classe Terminale S",
    date: "2026-06-15",
    time: "18:00",
    targetAudience: "Terminale S",
    description: "Orientation post-bac et bilan du 3ème trimestre en présence des délégués élèves et parents d'élèves.",
    location: "Salle plénière (Ailes Nord)"
  },
  {
    id: "M2",
    title: "Assemblée Générale de l'APE",
    date: "2026-06-22",
    time: "19:30",
    targetAudience: "all",
    description: "Réunion pour organiser la kermesse de fin d'année et l'évaluation budgétaire de l'association des parents d'élèves.",
    location: "Auditorium Principal"
  },
  {
    id: "M3",
    title: "Réunion Trimestrielle Parents-Direction",
    date: "2026-06-05",
    time: "17:00",
    targetAudience: "all",
    description: "Échanges bilatéraux sur la transition digitale et le niveau de satisfaction des infrastructures.",
    location: "Visioconférence (Lien communiqué par mail)"
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "P1",
    parentId: "KAR77412",
    studentId: "YAS84920",
    studentName: "Yasmine Belkacem",
    amount: 1200,
    date: "2025-09-10",
    month: "Septembre (Trimestre 1)",
    status: "paid",
    cardNumberMasked: "**** **** **** 4821",
    paymentMethod: "Carte Bancaire"
  },
  {
    id: "P2",
    parentId: "KAR77412",
    studentId: "YAS84920",
    studentName: "Yasmine Belkacem",
    amount: 1200,
    date: "2026-01-15",
    month: "Janvier (Trimestre 2)",
    status: "paid",
    cardNumberMasked: "**** **** **** 4821",
    paymentMethod: "Carte Bancaire"
  },
  {
    id: "P3",
    parentId: "KAR77412",
    studentId: "YAS84920",
    studentName: "Yasmine Belkacem",
    amount: 1200,
    date: "2026-05-01",
    month: "Avril (Trimestre 3)",
    status: "pending",
  },
  {
    id: "P4",
    parentId: "ISA93201",
    studentId: "THO29184",
    studentName: "Thomas Roux",
    amount: 1100,
    date: "2025-09-12",
    month: "Septembre (Trimestre 1)",
    status: "paid",
    cardNumberMasked: "**** **** **** 9084",
    paymentMethod: "Carte Bancaire"
  },
  {
    id: "P5",
    parentId: "ISA93201",
    studentId: "THO29184",
    studentName: "Thomas Roux",
    amount: 1100,
    date: "2026-01-20",
    month: "Janvier (Trimestre 2)",
    status: "paid",
    cardNumberMasked: "**** **** **** 9084",
    paymentMethod: "Carte Bancaire"
  },
  {
    id: "P6",
    parentId: "ISA93201",
    studentId: "THO29184",
    studentName: "Thomas Roux",
    amount: 1100,
    date: "2026-05-02",
    month: "Avril (Trimestre 3)",
    status: "overdue"
  }
];

export const INITIAL_HOMEWORK: Homework[] = [
  {
    id: "H1",
    className: "Terminale S",
    subject: "Mathématiques",
    title: "DM de Probabilités Continues",
    description: "Exercices 12, 14 et 15 pages 234. Rédiger les démonstrations de convergence sur feuille double.",
    dueDate: "2026-05-29",
    teacherId: "SOP58194",
    teacherName: "Sophie Bernard"
  },
  {
    id: "H2",
    className: "Terminale S",
    subject: "Physique-Chimie",
    title: "Synthèse sur la Spectroscopie",
    description: "Rappeler le principe d'un spectromètre de masse et estimer la déviation de l'isotope du carbone.",
    dueDate: "2026-06-02",
    teacherId: "MAR41829",
    teacherName: "Marc Dubois"
  },
  {
    id: "H3",
    className: "Première S",
    subject: "Français & Littérature",
    title: "Lecture linéaire: Les Contemplations",
    description: "Analyser le poème V 'Elle avait pris ce pli' de Victor Hugo. Prévoir un axe critique sur le deuil.",
    dueDate: "2026-05-31",
    teacherId: "LUC29103",
    teacherName: "Lucie Martin"
  }
];

export const INITIAL_COURSES: OnlineCourse[] = [
  {
    id: "C1",
    title: "Approfondissement: Intégrale de Riemann",
    subject: "Mathématiques",
    className: "Terminale S",
    scheduledDate: "2026-05-27",
    scheduledTime: "14:00",
    link: "https://scola.zoom.us/j/math-session-riemann",
    teacherId: "SOP58194",
    teacherName: "Sophie Bernard",
    description: "Rapprochement des sommes de Darboux et mise en application pratique sur des fonctions discontinues."
  },
  {
    id: "C2",
    title: "Cours d'Électrodynamique",
    subject: "Physique-Chimie",
    className: "Première S",
    scheduledDate: "2026-05-28",
    scheduledTime: "09:30",
    link: "https://scola.zoom.us/j/physic-electrodyn",
    teacherId: "MAR41829",
    teacherName: "Marc Dubois",
    description: "Correction des exercices préparatoires sur les champs de forces électrostatiques."
  }
];

export interface SystemDatabase {
  users: User[];
  students: Student[];
  meetings: Meeting[];
  payments: Payment[];
  homeworks: Homework[];
  courses: OnlineCourse[];
}

export function loadDatabase(): SystemDatabase {
  try {
    const data = localStorage.getItem('scola_database');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Could not parse database", e);
  }
  // Fallback to initial
  const db: SystemDatabase = {
    users: INITIAL_USERS,
    students: INITIAL_STUDENTS,
    meetings: INITIAL_MEETINGS,
    payments: INITIAL_PAYMENTS,
    homeworks: INITIAL_HOMEWORK,
    courses: INITIAL_COURSES
  };
  saveDatabase(db);
  return db;
}

export function saveDatabase(db: SystemDatabase): void {
  try {
    localStorage.setItem('scola_database', JSON.stringify(db));
  } catch (e) {
    console.error("Could not save to localStorage", e);
  }
}
