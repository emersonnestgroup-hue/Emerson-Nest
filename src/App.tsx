/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadDatabase, saveDatabase, SystemDatabase } from './initialData';
import { User, Student, Meeting, Payment, Grade, Homework, OnlineCourse } from './types';
import AuthLayout from './components/AuthLayout';
import ParentDashboard from './components/ParentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import DirectorDashboard from './components/DirectorDashboard';
import { GraduationCap, Lock, LogOut, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [db, setDb] = useState<SystemDatabase>(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Synchronize dynamic updates back to localStorage database
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // Handle session persistence on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('scola_current_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        // Verify user still exists in the local database
        const freshUser = db.users.find(u => u.id === parsed.id);
        if (freshUser && freshUser.status === 'approved') {
          setCurrentUser(freshUser);
        } else {
          localStorage.removeItem('scola_current_session');
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }, [db.users]);

  // LOGIN & LOGOUT Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('scola_current_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('scola_current_session');
  };

  // REGISTRATIONS & APPROVALS WORKFLOWS
  const handleRequestRegister = (newUser: User) => {
    setDb(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const handleApproveUser = (userId: string) => {
    setDb(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'approved' as const };
        }
        return u;
      });

      // If approved, verify and optionally link students if necessary
      return {
        ...prev,
        users: updatedUsers
      };
    });
  };

  // ADMINISTRATOR ACTIONS
  const handleAddUserByAdmin = (newUser: User) => {
    setDb(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const handleAddStudentByAdmin = (newStudent: Student) => {
    setDb(prev => {
      // Create tuition payment schedule for the newly enrolled student
      const basicPayments: Payment[] = [
        {
          id: `P-${Date.now()}-T1`,
          parentId: newStudent.parentId,
          studentId: newStudent.id,
          studentName: `${newStudent.firstName} ${newStudent.lastName}`,
          amount: 1150,
          date: "",
          month: "Septembre (Trimestre 1)",
          status: "pending"
        },
        {
          id: `P-${Date.now()}-T2`,
          parentId: newStudent.parentId,
          studentId: newStudent.id,
          studentName: `${newStudent.firstName} ${newStudent.lastName}`,
          amount: 1150,
          date: "",
          month: "Janvier (Trimestre 2)",
          status: "pending"
        }
      ];

      // Couple with parent profile too
      const updatedUsers = prev.users.map(u => {
        if (u.id === newStudent.parentId && u.associatedStudentIds) {
          return {
            ...u,
            associatedStudentIds: [...u.associatedStudentIds, newStudent.id]
          };
        }
        return u;
      });

      return {
        ...prev,
        students: [...prev.students, newStudent],
        payments: [...prev.payments, ...basicPayments],
        users: updatedUsers
      };
    });
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    setDb(prev => ({
      ...prev,
      meetings: [...prev.meetings, newMeeting]
    }));
  };

  const handleUpdatePayments = (updatedPayments: Payment[]) => {
    setDb(prev => ({
      ...prev,
      payments: updatedPayments
    }));
  };

  // EDUCATOR / TEACHER ACTIONS
  const handleAddGrade = (studentId: string, grade: Grade) => {
    setDb(prev => {
      const updatedStudents = prev.students.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            grades: [...s.grades, grade]
          };
        }
        return s;
      });
      return {
        ...prev,
        students: updatedStudents
      };
    });
  };

  const handleAddHomework = (homework: Homework) => {
    setDb(prev => ({
      ...prev,
      homeworks: [...prev.homeworks, homework]
    }));
  };

  const handleAddCourse = (course: OnlineCourse) => {
    setDb(prev => ({
      ...prev,
      courses: [...prev.courses, course]
    }));
  };

  // RENDER SELECTION ENGINE
  if (!currentUser) {
    return (
      <AuthLayout 
        users={db.users} 
        onLogin={handleLogin} 
        onRequestRegister={handleRequestRegister} 
      />
    );
  }

  // ACTIVE PARENT FLOW
  if (currentUser.role === 'parent') {
    return (
      <ParentDashboard
        parentUser={currentUser}
        students={db.students}
        meetings={db.meetings}
        payments={db.payments}
        onUpdatePayments={handleUpdatePayments}
        onLogout={handleLogout}
      />
    );
  }

  // ACTIVE TEACHER FLOW
  if (currentUser.role === 'teacher') {
    return (
      <TeacherDashboard
        teacherUser={currentUser}
        students={db.students}
        homeworks={db.homeworks}
        courses={db.courses}
        onAddGrade={handleAddGrade}
        onAddHomework={handleAddHomework}
        onAddCourse={handleAddCourse}
        onLogout={handleLogout}
      />
    );
  }

  // ACTIVE DIRECTOR FLOW
  if (currentUser.role === 'director') {
    return (
      <DirectorDashboard
        directorUser={currentUser}
        users={db.users}
        students={db.students}
        meetings={db.meetings}
        payments={db.payments}
        onApproveUser={handleApproveUser}
        onAddUser={handleAddUserByAdmin}
        onAddStudent={handleAddStudentByAdmin}
        onAddMeeting={handleAddMeeting}
        onLogout={handleLogout}
      />
    );
  }

  // BACKUP RENDER FOR VICE-DIRECTOR / OTHER STAFF OFFICERS
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      <div className="bg-gradient-to-r from-teal-800 to-indigo-900 text-white shadow-md py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Administration Collégiale</span>
            <h1 className="text-2xl font-bold mt-1">Espace Administrative : {currentUser.firstName} {currentUser.lastName}</h1>
            <p className="text-xs text-slate-300 mt-1">ID : <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-white">{currentUser.id}</span></p>
          </div>
          <button 
            id="btn-vice-logout"
            onClick={handleLogout} 
            className="bg-white/10 hover:bg-white/20 text-xs px-3 py-2 rounded-lg font-medium"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Vice director welcoming and helper information */}
        <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
            <ShieldAlert className="w-5 h-5 text-indigo-700" /> Bureau du Vice-Directeur Administratif
          </h2>
          <p className="text-xs text-slate-600 leading-normal">
            En tant que Vice-Directeur/trice, vous bénéficiez d'un accès de collaboration. Cet espace est configuré pour l'élaboration logistique et de soutien. Toutes les validations financières et approbations de membres sont centralisées sous l'ID du Directeur Général (<strong>DIR94721</strong>).
          </p>
        </div>

        {/* Quick static view of school listings for planning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-3xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-500">Membres Actifs Répertoriés</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span>Élèves inscrits :</span>
                <strong className="text-slate-900">{db.students.length}</strong>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Enseignants :</span>
                <strong className="text-slate-900">{db.users.filter(u => u.role === 'teacher').length}</strong>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Parents d'Élèves :</span>
                <strong className="text-slate-900">{db.users.filter(u => u.role === 'parent').length}</strong>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-white shadow-3xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-500">Activités Logistiques</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span>Assemblée Conseil :</span>
                <strong className="text-slate-900">{db.meetings.length} réunions</strong>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Visioconférences :</span>
                <strong className="text-slate-900">{db.courses.length} en direct</strong>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Total Devoirs :</span>
                <strong className="text-slate-900">{db.homeworks.length} publiés</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Informative advice container */}
        <div className="bg-yellow-50 border border-yellow-250 p-4 rounded-xl flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800 leading-normal">
            <strong>Besoin de superviser l'ensemble des casiers du système ou valider des membres ?</strong><br />
            Utilisez notre sésame d'évaluation rapide à l'écran de bienvenue et connectez-vous avec le profil <strong>Directeur Général Jean-Luc Dupont</strong> (ID: <code className="bg-black/10 px-1 py-0.5 rounded font-bold font-mono">DIR94721</code> / Mot de passe: <code className="bg-black/10 px-1 py-0.5 rounded font-bold font-mono">directeur123</code>).
          </div>
        </div>

      </div>
    </div>
  );
}
