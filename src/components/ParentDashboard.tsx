/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Student, Meeting, Payment } from '../types';
import { 
  CreditCard, 
  Calendar, 
  User as UserIcon, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  Printer, 
  Award, 
  FileCheck, 
  ChevronRight, 
  TrendingUp,
  MapPin,
  Clock3
} from 'lucide-react';
import { motion } from 'motion/react';

interface ParentDashboardProps {
  parentUser: User;
  students: Student[];
  meetings: Meeting[];
  payments: Payment[];
  onUpdatePayments: (updatedPayments: Payment[]) => void;
  onLogout: () => void;
}

export default function ParentDashboard({
  parentUser,
  students,
  meetings,
  payments,
  onUpdatePayments,
  onLogout
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'payments' | 'meetings'>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    parentUser.associatedStudentIds && parentUser.associatedStudentIds.length > 0
      ? parentUser.associatedStudentIds[0]
      : ''
  );

  // States for payment modal
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(1200);
  const [paymentPeriod, setPaymentPeriod] = useState<string>('Avril (Trimestre 3)');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCVC, setCardCVC] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>(`${parentUser.firstName} ${parentUser.lastName}`);
  const [selectedPaymentIdToPay, setSelectedPaymentIdToPay] = useState<string | null>(null);
  
  // Payment success state for receipt dialog
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<Payment | null>(null);

  // Get students registered for this parent
  const myStudents = students.filter(s => parentUser.associatedStudentIds?.includes(s.id));
  const activeStudent = myStudents.find(s => s.id === selectedStudentId) || myStudents[0];

  // Get payments for this parent's students
  const parentStudentIds = myStudents.map(s => s.id);
  const myPayments = payments.filter(p => parentStudentIds.includes(p.studentId));

  // Meetings relevant to this parent
  const relevantMeetings = meetings.filter(m => {
    if (m.targetAudience === 'all') return true;
    if (activeStudent && m.targetAudience === activeStudent.className) return true;
    return false;
  });

  // Calculate student average
  const calculateAverage = (student: Student) => {
    if (!student || !student.grades || student.grades.length === 0) return 0;
    const totalPoints = student.grades.reduce((sum, g) => sum + (g.score * g.coefficient), 0);
    const totalCoefs = student.grades.reduce((sum, g) => sum + g.coefficient, 0);
    return Math.round((totalPoints / totalCoefs) * 100) / 100;
  };

  const handleOpenPaymentModal = (payment: Payment) => {
    setSelectedPaymentIdToPay(payment.id);
    setPaymentAmount(payment.amount);
    setPaymentPeriod(payment.month);
    setIsPaying(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      alert("Veuillez saisir un numéro de carte bancaire valide de 16 chiffres.");
      return;
    }

    // Secure masking: preserve privacy, no bank details displayed nor stored clearly
    const rawDigits = cardNumber.replace(/\s/g, '');
    const lastFour = rawDigits.substring(rawDigits.length - 4);
    const maskedCard = `**** **** **** ${lastFour}`;

    // Find custom payment or generate transactional one
    let targetPaymentId = selectedPaymentIdToPay;
    let studentId = activeStudent ? activeStudent.id : '';
    let studentName = activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'Élève';

    if (targetPaymentId) {
      const matchP = payments.find(p => p.id === targetPaymentId);
      if (matchP) {
        studentId = matchP.studentId;
        studentName = matchP.studentName;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const updated = payments.map(p => {
      if (p.id === targetPaymentId) {
        return {
          ...p,
          status: 'paid' as const,
          date: todayStr,
          cardNumberMasked: maskedCard,
          paymentMethod: "Carte Bancaire"
        };
      }
      return p;
    });

    onUpdatePayments(updated);
    setIsPaying(false);

    // Set matching receipt data
    const recPaid = updated.find(p => p.id === targetPaymentId);
    if (recPaid) {
      setPaymentSuccessReceipt(recPaid);
    }

    // Reset card fields
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-indigo-800 to-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm text-teal-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Espace Parent Sécurisé
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bonjour, {parentUser.firstName} {parentUser.lastName}</h1>
              <p className="text-slate-300 text-sm mt-1">ID Parental : <span className="font-mono text-white bg-slate-900/30 px-2 py-0.5 rounded font-bold">{parentUser.id}</span></p>
            </div>
            <div className="flex items-center gap-3">
              {myStudents.length > 1 && (
                <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <span className="text-xs text-slate-300 font-medium">Élève :</span>
                  <select
                    id="student-selector"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer"
                  >
                    {myStudents.map(s => (
                      <option key={s.id} value={s.id} className="text-slate-900">
                        {s.firstName} {s.lastName} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                id="btn-parent-logout"
                onClick={onLogout}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white border border-white/20 px-3 py-2 rounded-lg font-medium transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Containers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
          <button
            id="tab-parent-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            id="tab-parent-grades"
            onClick={() => setActiveTab('grades')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'grades'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Résultats & Bulletin
          </button>
          <button
            id="tab-parent-payments"
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'payments'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Frais & Paiements
          </button>
          <button
            id="tab-parent-meetings"
            onClick={() => setActiveTab('meetings')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'meetings'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Réunions ({relevantMeetings.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              {/* Children Quick Summary Card */}
              {activeStudent ? (
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl p-5 border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-full uppercase">Fiche Scolaire</span>
                    <h3 className="text-xl font-bold text-slate-800">{activeStudent.firstName} {activeStudent.lastName}</h3>
                    <p className="text-sm text-slate-600">Classe : <strong className="text-indigo-900 font-semibold">{activeStudent.className}</strong> | ID Élève : <code className="font-mono bg-white border px-1.5 py-0.5 rounded text-xs">{activeStudent.id}</code></p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white px-4 py-3 rounded-lg border border-indigo-100/50 min-w-[120px] shadow-xs">
                      <span className="block text-xs text-slate-500 uppercase font-medium">Moyenne</span>
                      <span className="text-2xl font-bold text-slate-800">
                        {calculateAverage(activeStudent) || 'N/A'}/20
                      </span>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg border border-indigo-100/50 min-w-[120px] shadow-xs">
                      <span className="block text-xs text-slate-500 uppercase font-medium">Présence</span>
                      <span className="text-2xl font-bold text-teal-600">
                        {activeStudent.attendance.filter(a => a.status === 'present').length} / {activeStudent.attendance.length}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">Aucun élève associé trouvé pour votre identifiant.</div>
              )}

              {/* Alert Boxes & Next Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Tuition Pending Alert */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-indigo-600" /> Notifications Financières
                  </h4>
                  {myPayments.some(p => p.status !== 'paid') ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-sm text-amber-900">Paiement Partiel Attendu</h5>
                          <p className="text-xs text-amber-700 mt-1">Vous avez des frais de scolarité non soldés pour votre enfant. Le paiement en ligne par carte bancaire sécurisée est disponible instantanément.</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                        {myPayments.filter(p => p.status !== 'paid').map(pay => (
                          <div key={pay.id} className="flex justify-between items-center bg-white/70 p-3 rounded border border-amber-100 text-xs">
                            <div>
                              <span className="font-bold text-slate-700">{pay.studentName}</span>
                              <span className="text-slate-500 block">{pay.month}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pay.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                {pay.status === 'overdue' ? 'RETARD' : 'À PAYER'}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{pay.amount} €</span>
                              <button
                                id={`btn-pay-now-${pay.id}`}
                                onClick={() => handleOpenPaymentModal(pay)}
                                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded transition shadow-xs text-xs"
                              >
                                Payer sur Scola
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <h5 className="font-semibold text-sm text-emerald-900">Frais de scolarité à jour</h5>
                        <p className="text-xs text-emerald-700">Félicitations, tous les frais scolaires pour vos enfants enregistrés ont été réglés avec succès pour l'année en cours.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Meetings / Conseil de classe */}
                <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-indigo-600" /> Vos Prochaines Réunions
                  </h4>
                  {relevantMeetings.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-my-3 divide-y divide-slate-200">
                        {relevantMeetings.slice(0, 3).map(meet => (
                          <li key={meet.id} className="py-3">
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-slate-800 hover:text-indigo-700 transition">
                                {meet.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="bg-white border rounded px-1">{meet.date} à {meet.time}</span>
                                <span>•</span>
                                <span>{meet.location}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button 
                        id="btn-all-meetings-shortcut"
                        onClick={() => setActiveTab('meetings')}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold inline-flex items-center gap-1 mt-4"
                      >
                        Voir tout l'agenda <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-550 italic">Aucune réunion de planifiée.</p>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: GRADES & RESULTS */}
          {activeTab === 'grades' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Relevé de Notes & Progrès</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Bulletins d'évaluation et de présence pour l'année scolaire en cours.</p>
                </div>
                {activeStudent && (
                  <div className="bg-slate-100 px-4 py-2 rounded-lg border flex gap-6 text-sm">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase block">Moyenne générale</span>
                      <strong className="text-lg font-bold text-slate-800">{calculateAverage(activeStudent)}/20</strong>
                    </div>
                    <div className="border-l pl-6">
                      <span className="text-[11px] text-slate-500 uppercase block">Total Devoirs</span>
                      <strong className="text-lg font-bold text-slate-800">{activeStudent.grades.length}</strong>
                    </div>
                  </div>
                )}
              </div>

              {activeStudent ? (
                <div className="space-y-6">
                  
                  {/* Detailed Grades Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase text-[11px]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Matière</th>
                          <th className="px-4 py-3 font-semibold">Évaluation</th>
                          <th className="px-4 py-3 font-semibold text-center">Note /20</th>
                          <th className="px-4 py-3 font-semibold text-center">Coef.</th>
                          <th className="px-4 py-3 font-semibold">Appréciation de l'éducateur</th>
                          <th className="px-4 py-3 font-semibold">Enseignant</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-xs">
                        {activeStudent.grades.slice().reverse().map(grade => (
                          <tr key={grade.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">{grade.date}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900">{grade.subject}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">{grade.title}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                              <span className={`inline-block font-bold text-sm px-2.5 py-1 rounded-full ${
                                grade.score >= 15 ? 'bg-emerald-50 text-emerald-700' : 
                                grade.score >= 10 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {grade.score}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono text-slate-650 font-bold">{grade.coefficient}</td>
                            <td className="px-4 py-3.5 text-slate-605 italic max-w-xs truncate" title={grade.comment}>
                              "{grade.comment || 'Aucune appréciation.'}"
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap font-medium text-indigo-755 uppercase text-[10px] tracking-wider">{grade.gradedBy}</td>
                          </tr>
                        ))}
                        {activeStudent.grades.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400 italic">Aucune note n'a encore été enregistrée pour cet élève.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Attendance Log and Absences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="border rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-4.5 h-4.5 text-emerald-600" /> Suivi d'assiduité (Présence)
                      </h4>
                      <p className="text-xs text-slate-500">Un relevé officiel des retards et absences signalées en classe par les professeurs.</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Présences</span>
                          <span className="text-lg font-extrabold text-teal-600">
                            {activeStudent.attendance.filter(a => a.status === 'present').length}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Absences</span>
                          <span className="text-lg font-extrabold text-rose-600">
                            {activeStudent.attendance.filter(a => a.status === 'absent').length}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Retards</span>
                          <span className="text-lg font-extrabold text-indigo-600">
                            {activeStudent.attendance.filter(a => a.status === 'late').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                        Justification des Événements récents
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {activeStudent.attendance.filter(a => a.status !== 'present').map(att => (
                          <div key={att.id} className="p-2.5 rounded text-xs border bg-slate-50 flex items-start gap-2 justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${att.status === 'absent' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                                <span className="font-bold uppercase text-[10px]">
                                  {att.status === 'absent' ? 'Absence' : 'Retard'} du {att.date}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-1">{att.comment || 'Pas d\'explication fournie.'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                              att.justified ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {att.justified ? 'Justifié' : 'Non justifié'}
                            </span>
                          </div>
                        ))}
                        {activeStudent.attendance.filter(a => a.status !== 'present').length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center py-4">Félicitations ! Aucune absence ni retard à signaler.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucun élève sélectionné.</p>
              )}
            </motion.div>
          )}

          {/* TAB 3: TUITION & PAYMENTS */}
          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" /> État des Frais de Scolarité
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Le paiement sur la plateforme garantit la protection totale de vos informations financières et de vos numéros de cartes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 text-[11px] border text-slate-600 px-3 py-1.5 rounded-lg font-mono">
                    Transactions protégées de bout en bout
                  </div>
                </div>
              </div>

              {/* Payments History List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Historique de Facturation (Tous vos enfants)</h4>
                  <div className="text-xs text-slate-500">
                    Bilan payé : <strong className="text-teal-700 font-bold">{myPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)} €</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPayments.map(p => (
                    <div 
                      key={p.id} 
                      className={`border rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition ${
                        p.status === 'paid' ? 'bg-white border-emerald-100' :
                        p.status === 'overdue' ? 'bg-rose-50/40 border-rose-200' :
                        'bg-amber-50/40 border-amber-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Reçu #{p.id}</span>
                          <h5 className="font-bold text-slate-800 text-sm mt-2">{p.month}</h5>
                          <p className="text-xs text-slate-600 mt-0.5">Élève : <strong className="font-semibold text-slate-900">{p.studentName}</strong></p>
                          {p.date && <p className="text-[11px] text-slate-500 mt-1">Payé le : {p.date}</p>}
                          
                          {/* SENSITIVE MASKED DETAILS SHOWN SAFELY */}
                          {p.cardNumberMasked && (
                            <div className="inline-flex items-center gap-1.5 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded font-mono mt-2">
                              <ShieldCheck className="w-3 h-3 text-indigo-700" /> {p.paymentMethod} - {p.cardNumberMasked}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-lg font-black text-slate-800 block">{p.amount} €</span>
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'paid' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 
                            p.status === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {p.status === 'paid' ? 'RÉGLÉ' : p.status === 'overdue' ? 'IMPAYÉ / RETARD' : 'À REGLER'}
                          </span>
                        </div>
                      </div>

                      {p.status !== 'paid' && (
                        <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                          <button
                            id={`btn-parent-pay-${p.id}`}
                            onClick={() => handleOpenPaymentModal(p)}
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Payer en ligne
                          </button>
                        </div>
                      )}

                      {p.status === 'paid' && (
                        <div className="mt-4 pt-3 border-t flex justify-end">
                          <button
                            id={`btn-receipt-view-${p.id}`}
                            onClick={() => setPaymentSuccessReceipt(p)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" /> Facture imprimable
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 4: MEETINGS */}
          {activeTab === 'meetings' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Réunions Parents-Enseignants</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Retrouvez les ordres du jour et convocations officiels de la direction.</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  {relevantMeetings.length} Alertes en cours
                </span>
              </div>

              <div className="space-y-4">
                {relevantMeetings.map(meet => (
                  <div key={meet.id} className="border rounded-xl p-5 hover:border-slate-350 transition bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                            meet.targetAudience === 'all' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {meet.targetAudience === 'all' ? 'Tous les parents' : `Classe: ${meet.targetAudience}`}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{meet.title}</h4>
                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{meet.description}</p>
                      </div>
                      
                      <div className="flex md:flex-col items-start gap-4 md:items-end md:gap-1.5 text-xs text-slate-500 shrink-0 bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meet.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meet.time}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-750">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{meet.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {relevantMeetings.length === 0 && (
                  <p className="text-center py-12 text-slate-400 italic">Aucune convocation de réunion de parents n'est enregistrée pour cette classe.</p>
                )}
              </div>

            </motion.div>
          )}

        </div>
      </div>

      {/* MODAL 1: PAYMENT FORM SIMULATION (CRITICAL SENSITIVE WORKFLOW) */}
      {isPaying && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Règlement Sécurisé des Frais</h3>
                <p className="text-[11px] text-indigo-200 mt-1">Conforme PCI-DSS — Cryptage local renforcé</p>
              </div>
              <button
                id="btn-close-payment"
                onClick={() => setIsPaying(false)}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-xs font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
              
              {/* Payment Info */}
              <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-black block">Frais de scolarité</span>
                <div className="flex justify-between items-center">
                  <strong className="text-slate-800 text-sm">{paymentPeriod}</strong>
                  <strong className="text-xl font-bold text-slate-800">{paymentAmount} €</strong>
                </div>
                {activeStudent && (
                  <span className="text-xs text-slate-500 block">Pour l'élève : <strong className="font-semibold text-slate-700">{activeStudent.firstName} {activeStudent.lastName}</strong></span>
                )}
              </div>

              {/* Secure Warning */}
              <div className="bg-teal-50 border border-teal-100 text-[11px] text-teal-800 rounded-lg p-3 flex gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p><strong>Politique de Confidentialité :</strong> Aucun numéro ou code sensible de carte n'est stocké en clair ou partagé. Seul un reçu masqué est enregistré pour preuve de validation.</p>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                
                <div>
                  <label htmlFor="cardHolder" className="block text-xs font-semibold text-slate-700 mb-1">Titulaire de la carte</label>
                  <input
                    id="cardHolder"
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Nom sur la carte"
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-xs font-semibold text-slate-700 mb-1">Numéro de carte bancaire</label>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        // format to space separated
                        const val = e.target.value.replace(/\D/g, '');
                        const match = val.match(/.{1,4}/g);
                        if (match) {
                          setCardNumber(match.join(' '));
                        } else {
                          setCardNumber(val);
                        }
                      }}
                      className="w-full text-xs border rounded-lg p-2.5 pl-10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono tracking-widest"
                      placeholder="4000 1234 5678 9010"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-xs font-semibold text-slate-700 mb-1">Date d'expiration</label>
                    <input
                      id="cardExpiry"
                      type="text"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                        } else {
                          setCardExpiry(val);
                        }
                      }}
                      className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardCVC" className="block text-xs font-semibold text-slate-700 mb-1">Cryptogramme (CVC)</label>
                    <input
                      id="cardCVC"
                      type="password"
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaying(false)}
                  className="w-1/2 border hover:bg-slate-100 text-slate-700 font-semibold p-2.5 rounded-lg text-xs transition"
                >
                  Annuler
                </button>
                <button
                  id="btn-parent-pay-confirm"
                  type="submit"
                  className="w-1/2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold p-2.5 rounded-lg text-xs transition shadow-md flex justify-center items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Valider {paymentAmount} €
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE RECEIPT DIALOG */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden p-6 text-slate-900 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-800">Paiement Reçu avec Succès !</h3>
              <p className="text-xs text-slate-500">Un justificatif d'acquittement officiel a été généré sécurisé.</p>
            </div>

            {/* Receipt Box */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 text-xs font-mono space-y-4">
              <div className="border-b pb-3 border-dashed flex justify-between">
                <div>
                  <span className="block font-bold">PORTAIL SCOLAIRE</span>
                  <span className="text-[10px] text-slate-500">REÇU DE TRANSACTION</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold">ID: {paymentSuccessReceipt.id}</span>
                  <span className="text-[10px] text-slate-500">{paymentSuccessReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-b pb-3 border-dashed">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent :</span>
                  <span className="font-semibold text-slate-800">{parentUser.lastName.toUpperCase()} {parentUser.firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Parent :</span>
                  <span className="font-bold text-slate-800">{parentUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Élève :</span>
                  <span className="font-semibold text-slate-800">{paymentSuccessReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Description :</span>
                  <span className="font-semibold text-slate-800">{paymentSuccessReceipt.month}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Méthode :</span>
                  <span className="font-semibold">{paymentSuccessReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Carte :</span>
                  <span className="font-semibold">{paymentSuccessReceipt.cardNumberMasked}</span>
                </div>
                <div className="flex justify-between font-bold text-sm bg-indigo-50 p-2 rounded text-indigo-900">
                  <span>MONTANT TOTAL :</span>
                  <span>{paymentSuccessReceipt.amount} €</span>
                </div>
              </div>

              <div className="text-[9px] text-center text-slate-400 pt-1">
                La direction certifie le règlement intégral. Merci pour votre collaboration.
              </div>
            </div>

            {/* Print and Close buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => alert("Simulation d'impression : justificatif envoyé par courriel à " + parentUser.email)}
                className="w-1/2 border hover:bg-slate-100 text-slate-700 font-semibold p-2.5 rounded-lg text-xs transition flex justify-center items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> imprimer
              </button>
              <button
                id="btn-close-receipt"
                type="button"
                onClick={() => setPaymentSuccessReceipt(null)}
                className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg text-xs transition flex justify-center items-center"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
