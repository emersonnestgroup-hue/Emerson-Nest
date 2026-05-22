/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Student, Homework, OnlineCourse, Grade } from '../types';
import {
  BookOpen,
  Plus,
  Video,
  FileSpreadsheet,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Users,
  Send,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  teacherUser: User;
  students: Student[];
  homeworks: Homework[];
  courses: OnlineCourse[];
  onAddGrade: (studentId: string, grade: Grade) => void;
  onAddHomework: (homework: Homework) => void;
  onAddCourse: (course: OnlineCourse) => void;
  onLogout: () => void;
}

export default function TeacherDashboard({
  teacherUser,
  students,
  homeworks,
  courses,
  onAddGrade,
  onAddHomework,
  onAddCourse,
  onLogout
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'grades' | 'homework' | 'courses'>('grades');
  
  // Grade Entry State
  const [gradeStudentId, setGradeStudentId] = useState<string>('');
  const [gradeScore, setGradeScore] = useState<number>(14);
  const [gradeCoef, setGradeCoef] = useState<number>(2);
  const [gradeTitle, setGradeTitle] = useState<string>('');
  const [gradeComment, setGradeComment] = useState<string>('');
  const [gradeSuccessMessage, setGradeSuccessMessage] = useState<string>('');

  // Homework Entry State
  const [hwClass, setHwClass] = useState<string>('Terminale S');
  const [hwTitle, setHwTitle] = useState<string>('');
  const [hwDesc, setHwDesc] = useState<string>('');
  const [hwDueDate, setHwDueDate] = useState<string>('');
  const [hwSuccessMessage, setHwSuccessMessage] = useState<string>('');

  // Online Course Entry State
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseClass, setCourseClass] = useState<string>('Terminale S');
  const [courseDate, setCourseDate] = useState<string>('');
  const [courseTime, setCourseTime] = useState<string>('');
  const [courseDesc, setCourseDesc] = useState<string>('');
  const [liveStreamingCourse, setLiveStreamingCourse] = useState<OnlineCourse | null>(null);
  const [courseSuccessMessage, setCourseSuccessMessage] = useState<string>('');

  // Available classes at the school
  const classesList = ['Terminale S', 'Première S', '3ème A', '6ème B'];

  // Current teacher's subjects and actions
  const teacherSubject = teacherUser.teacherSubject || "Enseignement Général";

  // Filter students based on role or context
  // Simple check: show students matching classes
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Terminale S');
  const filteredStudents = students.filter(s => s.className === selectedClassFilter);

  // Filter homeworks by this teacher
  const myHomeworks = homeworks.filter(h => h.teacherId === teacherUser.id);
  
  // Filter courses by this teacher
  const myCourses = courses.filter(c => c.teacherId === teacherUser.id);

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeStudentId) {
      alert("Veuillez sélectionner un élève.");
      return;
    }
    if (gradeScore < 0 || gradeScore > 20) {
      alert("La note doit être comprise entre 0 et 20.");
      return;
    }

    const newGrade: Grade = {
      id: "G-" + Date.now().toString().substring(8),
      subject: teacherSubject,
      score: Number(gradeScore),
      coefficient: Number(gradeCoef),
      date: new Date().toISOString().split('T')[0],
      title: gradeTitle.trim() || "Évaluation continue",
      comment: gradeComment.trim(),
      gradedBy: `${teacherUser.firstName} ${teacherUser.lastName}`.toUpperCase()
    };

    onAddGrade(gradeStudentId, newGrade);
    
    // Clear and Toast
    const studentObj = students.find(s => s.id === gradeStudentId);
    setGradeSuccessMessage(`La note de ${newGrade.score}/20 a bien été attribuée à ${studentObj?.firstName} ${studentObj?.lastName}.`);
    
    // reset form fields
    setGradeTitle('');
    setGradeComment('');
    setTimeout(() => setGradeSuccessMessage(''), 4000);
  };

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDueDate) {
      alert("Veuillez saisir le titre et la date d'échéance.");
      return;
    }

    const newHw: Homework = {
      id: "H-" + Date.now().toString().substring(8),
      className: hwClass,
      subject: teacherSubject,
      title: hwTitle.trim(),
      description: hwDesc.trim(),
      dueDate: hwDueDate,
      teacherId: teacherUser.id,
      teacherName: `${teacherUser.firstName} ${teacherUser.lastName}`
    };

    onAddHomework(newHw);
    setHwSuccessMessage(`Le devoir "${newHw.title}" a été programmé pour la classe ${newHw.className}.`);
    
    // reset
    setHwTitle('');
    setHwDesc('');
    setHwDueDate('');
    setTimeout(() => setHwSuccessMessage(''), 4000);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDate || !courseTime) {
      alert("Veuillez remplir le titre, la date et l'heure du cours.");
      return;
    }

    const newCourse: OnlineCourse = {
      id: "C-" + Date.now().toString().substring(8),
      title: courseTitle.trim(),
      subject: teacherSubject,
      className: courseClass,
      scheduledDate: courseDate,
      scheduledTime: courseTime,
      link: `https://scola.zoom.us/j/${teacherUser.id.toLowerCase()}-${Date.now().toString().substring(9)}`,
      teacherId: teacherUser.id,
      teacherName: `${teacherUser.firstName} ${teacherUser.lastName}`,
      description: courseDesc.trim()
    };

    onAddCourse(newCourse);
    setCourseSuccessMessage(`Le cours en ligne "${newCourse.title}" a bien été planifié.`);
    
    // reset
    setCourseTitle('');
    setCourseDate('');
    setCourseTime('');
    setCourseDesc('');
    setTimeout(() => setCourseSuccessMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Teacher Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" /> Classe de {teacherSubject}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Espace Enseignant : M./Mme {teacherUser.firstName} {teacherUser.lastName}</h1>
              <p className="text-slate-300 text-sm mt-1">Identifiant de connexion : <span className="font-mono text-white bg-slate-900/30 px-2 py-0.5 rounded font-bold">{teacherUser.id}</span></p>
            </div>
            <button
              id="btn-teacher-logout"
              onClick={onLogout}
              className="md:self-center bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white border border-white/20 px-4 py-2 rounded-lg font-medium transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tab Heads */}
        <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
          <button
            id="tab-teacher-grades"
            onClick={() => setActiveTab('grades')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'grades'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Saisie de Notes & Bulletins
          </button>
          <button
            id="tab-teacher-homework"
            onClick={() => setActiveTab('homework')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'homework'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Gestion des Devoirs ({myHomeworks.length})
          </button>
          <button
            id="tab-teacher-courses"
            onClick={() => setActiveTab('courses')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'courses'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Cours en Ligne ({myCourses.length})
          </button>
        </div>

        {/* Tab body */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          {/* TAB 1: GRADES & NOTEWORK */}
          {activeTab === 'grades' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Score entry card */}
                <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-700" /> Saisir une évaluation
                  </h3>

                  {gradeSuccessMessage && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs p-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{gradeSuccessMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleGradeSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="select-class-grade" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Classe ciblée</label>
                      <select
                        id="select-class-grade"
                        value={selectedClassFilter}
                        onChange={(e) => {
                          setSelectedClassFilter(e.target.value);
                          setGradeStudentId(''); // reset student
                        }}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white font-medium"
                      >
                        {classesList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="select-student-grade" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sélectionner l'Élève</label>
                      <select
                        id="select-student-grade"
                        required
                        value={gradeStudentId}
                        onChange={(e) => setGradeStudentId(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white font-medium"
                      >
                        <option value="">-- Choisir un élève --</option>
                        {filteredStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.lastName.toUpperCase()} {student.firstName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="grade-title" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Intitulé du devoir</label>
                      <input
                        id="grade-title"
                        type="text"
                        required
                        placeholder="ex: Évaluation d'Analyse"
                        value={gradeTitle}
                        onChange={(e) => setGradeTitle(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="grade-val" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Note (sur 20)</label>
                        <input
                          id="grade-val"
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          required
                          value={gradeScore}
                          onChange={(e) => setGradeScore(Number(e.target.value))}
                          className="w-full text-xs border rounded-lg p-2.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="grade-coef-val" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Coefficient</label>
                        <input
                          id="grade-coef-val"
                          type="number"
                          min="1"
                          max="10"
                          required
                          value={gradeCoef}
                          onChange={(e) => setGradeCoef(Number(e.target.value))}
                          className="w-full text-xs border rounded-lg p-2.5 bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="grade-comment" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Commentaire pédagogique (appréciation)</label>
                      <textarea
                        id="grade-comment"
                        rows={3}
                        placeholder="Remarques constructives sur l'acquisition des compétences..."
                        value={gradeComment}
                        onChange={(e) => setGradeComment(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white resize-none"
                      />
                    </div>

                    <button
                      id="btn-teacher-submit-grade"
                      type="submit"
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Enregistrer la note
                    </button>
                  </form>
                </div>

                {/* Live student directory with average */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border">
                    <span className="text-xs font-bold text-slate-700">Liste des élèves — {selectedClassFilter}</span>
                    <span className="text-xs text-slate-500">{filteredStudents.length} élèves inscrits</span>
                  </div>

                  <div className="space-y-3">
                    {filteredStudents.map(student => {
                      const totalGrades = student.grades.filter(g => g.subject === teacherSubject);
                      
                      // Calculate average of teacher's subject
                      let subjectAverage = 'N/A';
                      if (totalGrades.length > 0) {
                        const scoreSum = totalGrades.reduce((sum, g) => sum + (g.score * g.coefficient), 0);
                        const coefSum = totalGrades.reduce((sum, g) => sum + g.coefficient, 0);
                        subjectAverage = `${Math.round((scoreSum / coefSum) * 100) / 100}/20`;
                      }

                      return (
                        <div key={student.id} className="border rounded-xl p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-2xs transition">
                          <div className="space-y-1">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">Ref: {student.id}</span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{student.lastName.toUpperCase()} {student.firstName}</h4>
                            <p className="text-xs text-slate-500">Moyenne dans votre matière : <strong className="text-slate-800 font-bold">{subjectAverage}</strong></p>
                          </div>

                          <div className="space-y-2 w-full sm:w-auto">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Historique de vos notes</span>
                            <div className="flex flex-wrap gap-1">
                              {totalGrades.map(g => (
                                <span key={g.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-150 rounded text-xs text-indigo-800 font-bold" title={`${g.title} (coef ${g.coefficient}) - ${g.comment || ''}`}>
                                  {g.score}
                                </span>
                              ))}
                              {totalGrades.length === 0 && (
                                <span className="text-xs text-slate-400 italic">Aucune note attribuée par vous.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <p className="text-center py-12 text-slate-400 italic bg-slate-50 border border-dashed rounded-lg">Aucun élève inscrit dans cette classe ({selectedClassFilter}).</p>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: HOMEWORK PLANNER */}
          {activeTab === 'homework' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* New Homework Form */}
                <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <ClipboardList className="w-4.5 h-4.5 text-indigo-700" /> Publier un devoir
                  </h3>

                  {hwSuccessMessage && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs p-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{hwSuccessMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleHomeworkSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="hw-class" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sélectionner la classe</label>
                      <select
                        id="hw-class"
                        value={hwClass}
                        onChange={(e) => setHwClass(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white font-medium"
                      >
                        {classesList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="hw-title" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Matière assurée</label>
                      <input
                        type="text"
                        disabled
                        value={teacherSubject}
                        className="w-full text-xs border rounded-lg p-2.5 bg-slate-100 text-slate-500 font-bold"
                      />
                    </div>

                    <div>
                      <label htmlFor="hw-title-val" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Titre du Devoir / Sujet</label>
                      <input
                        id="hw-title-val"
                        type="text"
                        required
                        placeholder="ex: DM d'Entraînement N°2"
                        value={hwTitle}
                        onChange={(e) => setHwTitle(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="hw-duedate" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date d'échéance (Rendu)</label>
                      <input
                        id="hw-duedate"
                        type="date"
                        required
                        value={hwDueDate}
                        onChange={(e) => setHwDueDate(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label htmlFor="hw-desc" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Consignes et exercices à faire</label>
                      <textarea
                        id="hw-desc"
                        rows={4}
                        placeholder="Rédiger ici les exercices du manuel de cours, pages théoriques ou liens associés..."
                        value={hwDesc}
                        onChange={(e) => setHwDesc(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white resize-none"
                      />
                    </div>

                    <button
                      id="btn-publish-homework"
                      type="submit"
                      className="w-full bg-indigo-750 hover:bg-indigo-850 bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Programmer le Devoir
                    </button>
                  </form>
                </div>

                {/* Published Homework List */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Devoirs enregistrés pour vos classes</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myHomeworks.map(hw => (
                      <div key={hw.id} className="border rounded-xl p-4 bg-white hover:border-slate-350 transition flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold text-indigo-755 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                              {hw.className}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Posté</span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm mt-3">{hw.title}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-3">{hw.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs">
                          <span className="text-slate-500 inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> À rendre le : <strong className="text-slate-800 font-bold">{hw.dueDate}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                    {myHomeworks.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-slate-400 italic bg-slate-50 border border-dashed rounded-lg">
                        Vous n'avez pas encore programmé de devoirs en ligne.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: ONLINE VIRTUAL CLASSROOMS */}
          {activeTab === 'courses' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to schedule a course */}
                <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Video className="w-4.5 h-4.5 text-indigo-700" /> Planifier un cours en ligne
                  </h3>

                  {courseSuccessMessage && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs p-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{courseSuccessMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleCourseSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="course-title" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sujet du Cours / Chapitre</label>
                      <input
                        id="course-title"
                        type="text"
                        required
                        placeholder="ex: Calcul Intégral et Limites"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="course-class-val" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Classe ciblée</label>
                        <select
                          id="course-class-val"
                          value={courseClass}
                          onChange={(e) => setCourseClass(e.target.value)}
                          className="w-full text-xs border rounded-lg p-2.5 bg-white font-semibold"
                        >
                          {classesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="course-subject-val" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Discipline</label>
                        <input
                          id="course-subject-val"
                          type="text"
                          disabled
                          value={teacherSubject}
                          className="w-full text-xs border rounded-lg p-2.5 bg-slate-100 text-slate-500 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="course-date" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date estimée</label>
                        <input
                          id="course-date"
                          type="date"
                          required
                          value={courseDate}
                          onChange={(e) => setCourseDate(e.target.value)}
                          className="w-full text-xs border rounded-lg p-2.5 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label htmlFor="course-time" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Heure de début</label>
                        <input
                          id="course-time"
                          type="time"
                          required
                          value={courseTime}
                          onChange={(e) => setCourseTime(e.target.value)}
                          className="w-full text-xs border rounded-lg p-2.5 bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="course-desc" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description (Ordre du jour)</label>
                      <textarea
                        id="course-desc"
                        rows={3}
                        placeholder="Quels concepts seront abordés durant la visioconférence ?"
                        value={courseDesc}
                        onChange={(e) => setCourseDesc(e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 bg-white resize-none"
                      />
                    </div>

                    <button
                      id="btn-schedule-session"
                      type="submit"
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Planifier la visioconférence
                    </button>
                  </form>
                </div>

                {/* List of Scheduled courses & simulator */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Vos visioconférences planifiées</h4>
                  
                  <div className="space-y-3">
                    {myCourses.map(course => (
                      <div key={course.id} className="border rounded-xl p-4 bg-white hover:border-indigo-150 border-slate-200 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                              {course.className}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">Session Zoom Scola</span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm mt-1">{course.title}</h5>
                          {course.description && <p className="text-xs text-slate-500 italic">"{course.description}"</p>}
                          
                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {course.scheduledDate}
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {course.scheduledTime}
                            </span>
                          </div>
                        </div>

                        <button
                          id={`btn-live-stream-${course.id}`}
                          onClick={() => setLiveStreamingCourse(course)}
                          className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all self-end md:self-auto shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" /> Démarrer le Direct
                        </button>
                      </div>
                    ))}
                    {myCourses.length === 0 && (
                      <p className="text-center py-12 text-slate-400 italic bg-slate-50 border border-dashed rounded-lg">Vous n'avez pas programmé de visioconférences scolaires.</p>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </div>
      </div>

      {/* VISIOPLAY / LIVE STREAM SIMULATOR MODAL */}
      {liveStreamingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-slate-950 text-white rounded-2xl max-w-2xl w-full border border-slate-800 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Top Toolbar */}
            <div className="bg-slate-900 px-5 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse shadow-rose-500 shadow-xs" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-500">En direct sur Scola</span>
              </div>
              <h3 className="font-bold text-sm text-slate-200">
                {liveStreamingCourse.title} ({liveStreamingCourse.className})
              </h3>
              <button 
                id="btn-close-live-stream"
                onClick={() => setLiveStreamingCourse(null)} 
                className="text-slate-400 hover:text-white text-xs bg-slate-800 rounded px-2.5 py-1"
              >
                Quitter
              </button>
            </div>

            {/* Video Body */}
            <div className="aspect-video bg-slate-900 relative flex items-center justify-center border-b border-slate-800">
              {/* Virtual Camera Indicator */}
              <div className="text-center space-y-4 p-8">
                <Video className="w-16 h-16 mx-auto text-indigo-400" />
                <h4 className="font-bold text-base text-slate-350">Diffusion de votre caméra pédagogique activée...</h4>
                <p className="text-xs text-slate-550 max-w-md mx-auto">Vos élèves connectés de la classe <strong>{liveStreamingCourse.className}</strong> voient et entendent votre cours en temps réel.</p>
                <div className="inline-flex gap-2 text-[11px] bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 font-mono text-indigo-300">
                  <span>Lien d'intégration :</span>
                  <a href={liveStreamingCourse.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-white inline-flex items-center gap-1">
                    Ouvrir Zoom <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-xs text-[10px] px-2.5 py-1 rounded inline-flex items-center gap-1.5 border border-slate-800">
                <Users className="w-3 h-3 text-emerald-400" /> 18 Élèves présents en ligne
              </div>
            </div>

            {/* Simulated Live Chat */}
            <div className="p-4 bg-slate-900/60 max-h-44 overflow-y-auto space-y-2 text-xs">
              <div className="flex gap-2">
                <strong className="text-slate-405 font-bold uppercase text-[10px] tracking-wider text-indigo-400 font-mono">YASMINE (Terminale S) :</strong>
                <span className="text-slate-300">Bonjour Monsieur Dubois! J'ai préparé les questions sur l'intégrale de Riemann.</span>
              </div>
              <div className="flex gap-2">
                <strong className="text-slate-405 font-bold uppercase text-[10px] tracking-wider text-indigo-400 font-mono">THOMAS (Première S) :</strong>
                <span className="text-slate-300">Est-ce que le support PDF sera disponible sur l'espace d'orientation ?</span>
              </div>
              <div className="flex gap-2">
                <strong className="text-slate-401 font-bold uppercase text-[10px] tracking-wider text-green-400 font-mono">VOUS (Professeur) :</strong>
                <span className="text-slate-300">Oui, je vais le publier à la fin de cette visioconférence.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
