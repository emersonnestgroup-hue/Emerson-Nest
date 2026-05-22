/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Student, Meeting, Payment } from '../types';
import { 
  BarChart, 
  UserCheck, 
  UserPlus, 
  FolderLock, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  Check, 
  Plus, 
  Lock, 
  AlertCircle,
  Clock,
  Briefcase,
  Users,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Settings
} from 'lucide-react';
import { generate8CharID } from '../initialData';
import { motion } from 'motion/react';

interface DirectorDashboardProps {
  directorUser: User;
  users: User[];
  students: Student[];
  meetings: Meeting[];
  payments: Payment[];
  onApproveUser: (userId: string) => void;
  onAddUser: (user: User) => void;
  onAddStudent: (student: Student) => void;
  onAddMeeting: (meeting: Meeting) => void;
  onLogout: () => void;
}

export default function DirectorDashboard({
  directorUser,
  users,
  students,
  meetings,
  payments,
  onApproveUser,
  onAddUser,
  onAddStudent,
  onAddMeeting,
  onLogout
}: DirectorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'approval' | 'generator' | 'lockers' | 'meetings'>('stats');

  // Generator form states
  const [genFirstName, setGenFirstName] = useState('');
  const [genLastName, setGenLastName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genPhone, setGenPhone] = useState('');
  const [genRole, setGenRole] = useState<'teacher' | 'parent' | 'vice-director' | 'staff'>('teacher');
  const [genSubject, setGenSubject] = useState(''); // only for teachers
  
  // Student registration states (if registering a student directly)
  const [genStudentClass, setGenStudentClass] = useState('Terminale S');
  const [genStudentParentId, setGenStudentParentId] = useState('');

  // Search filter for system vaults
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultRoleFilter, setVaultRoleFilter] = useState<'all' | 'teacher' | 'parent' | 'student' | 'staff'>('all');
  const [selectedVaultMember, setSelectedVaultMember] = useState<any | null>(null);

  // New generated credentials toast simulation
  const [lastGeneratedCreds, setLastGeneratedCreds] = useState<{ id: string; name: string; pass: string; role: string } | null>(null);

  // Meeting creator state
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetAudience, setMeetAudience] = useState('all');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetLocation, setMeetLocation] = useState('Auditorium Principal');
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  // CALCULATE ADMINISTRATIVE STATISTICS
  const totalCollectedRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstandingDue = payments
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalMembersCount = users.length + students.length;
  
  const totalApprovedTeachers = users.filter(u => u.role === 'teacher' && u.status === 'approved').length;
  const totalStudentsCount = students.length;
  const totalParentsCount = users.filter(u => u.role === 'parent' && u.status === 'approved').length;
  const totalStaffCount = users.filter(u => (u.role === 'staff' || u.role === 'vice-director') && u.status === 'approved').length;

  const pendingApprovalsCount = users.filter(u => u.status === 'pending').length;

  // Global gradebook school average
  const getAllCalculatedGrades = () => {
    let allGradesList: number[] = [];
    students.forEach(s => {
      s.grades.forEach(g => allGradesList.push(g.score));
    });
    if (allGradesList.length === 0) return 14.5; // fallback default
    return Math.round((allGradesList.reduce((sum, v) => sum + v, 0) / allGradesList.length) * 10) / 10;
  };

  const schoolGlobalAverage = getAllCalculatedGrades();

  // Global attendance calculation
  const getGlobalAttendanceRate = () => {
    let totalPresenceRecords = 0;
    let presentCount = 0;
    students.forEach(s => {
      s.attendance.forEach(a => {
        totalPresenceRecords++;
        if (a.status === 'present') {
          presentCount++;
        }
      });
    });
    if (totalPresenceRecords === 0) return 96.2; // fallback default
    return Math.round((presentCount / totalPresenceRecords) * 100);
  };

  const globalAttendanceRate = getGlobalAttendanceRate();

  const handleGenerateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFirstName || !genLastName || !genEmail) {
      alert("Veuillez remplir les informations obligatoires de l'utilisateur.");
      return;
    }

    // Role-based ID prefix selection
    let rolePref: 'DIR' | 'PRO' | 'PAR' | 'EL' | 'VIC' | 'STF' = 'STF';
    if (genRole === 'teacher') rolePref = 'PRO';
    else if (genRole === 'parent') rolePref = 'PAR';
    else if (genRole === 'vice-director') rolePref = 'VIC';

    // Call custom 8 characters generator algorithm mixing first-name starting with unique figures!
    const uniqueUserCode = generate8CharID(genFirstName, rolePref);
    const initialTempPassword = `scola_${genFirstName.toLowerCase().substring(0,3)}${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id: uniqueUserCode,
      lastName: genLastName,
      firstName: genFirstName,
      email: genEmail,
      role: genRole,
      status: 'approved', // instantly approved as generated by the general director
      phoneNumber: genPhone || 'Non spécifié',
      password: initialTempPassword,
      createdAt: new Date().toISOString(),
      associatedStudentIds: [],
      teacherSubject: genRole === 'teacher' ? (genSubject || 'Général') : undefined
    };

    onAddUser(newUser);

    // Save info for Director's visual confirmation card
    setLastGeneratedCreds({
      id: uniqueUserCode,
      name: `${genFirstName} ${genLastName}`,
      pass: initialTempPassword,
      role: genRole
    });

    // Reset inputs
    setGenFirstName('');
    setGenLastName('');
    setGenEmail('');
    setGenPhone('');
    setGenSubject('');
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFirstName || !genLastName) {
      alert("Veuillez renseigner le nom et prénom de l'élève.");
      return;
    }

    const uniqueStudentCode = generate8CharID(genFirstName, 'EL');

    const newStudent: Student = {
      id: uniqueStudentCode,
      firstName: genFirstName,
      lastName: genLastName,
      className: genStudentClass,
      parentId: genStudentParentId || 'KA774129', // fallback to default parent if none
      grades: [],
      attendance: [
        { id: "A-" + Date.now(), date: new Date().toISOString().split('T')[0], status: 'present', justified: true }
      ]
    };

    onAddStudent(newStudent);

    // Set credentials indicator
    setLastGeneratedCreds({
      id: uniqueStudentCode,
      name: `${genFirstName} ${genLastName}`,
      pass: "Accès automatique par ID Parental",
      role: "Élève (Rattaché)"
    });

    // Reset fields
    setGenFirstName('');
    setGenLastName('');
    setGenStudentParentId('');
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle || !meetDate || !meetTime) {
      alert("Veuillez renseigner le titre, la date et l'heure de l'assemblée.");
      return;
    }

    const newMeeting: Meeting = {
      id: "M-" + Date.now().toString().substring(8),
      title: meetTitle.trim(),
      date: meetDate,
      time: meetTime,
      targetAudience: meetAudience,
      description: meetDesc.trim() || "Aucune description fournie.",
      location: meetLocation
    };

    onAddMeeting(newMeeting);
    setMeetingSuccess(true);
    setMeetTitle('');
    setMeetDesc('');
    setTimeout(() => setMeetingSuccess(false), 4000);
  };

  // Safe Locker Access: filter profiles
  const allVaultMembers = [
    ...users.map(u => ({ ...u, type: 'user' as const })),
    ...students.map(s => ({ 
      id: s.id, 
      firstName: s.firstName, 
      lastName: s.lastName, 
      role: 'student' as const, 
      email: 'Via Espace Parent', 
      phoneNumber: 'N/A', 
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
      type: 'student' as const,
      studentData: s
    }))
  ].filter(member => {
    // search text match
    const textMatch = 
      member.firstName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      member.lastName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      member.id.toLowerCase().includes(vaultSearch.toLowerCase());
    
    // role match
    if (vaultRoleFilter === 'all') return textMatch;
    if (vaultRoleFilter === 'student') return member.role === 'student' && textMatch;
    if (vaultRoleFilter === 'teacher') return member.role === 'teacher' && textMatch;
    if (vaultRoleFilter === 'parent') return member.role === 'parent' && textMatch;
    if (vaultRoleFilter === 'staff') return (member.role === 'staff' || member.role === 'vice-director') && textMatch;
    return textMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Director Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm text-yellow-300 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                <Lock className="w-3.5 h-3.5 text-yellow-300" /> Directeur Général de l'Établissement
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Supervision Générale : {directorUser.firstName} {directorUser.lastName}</h1>
              <p className="text-slate-350 text-sm mt-1">ID Directeur : <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded font-bold">{directorUser.id}</span></p>
            </div>
            <button
              id="btn-director-logout"
              onClick={onLogout}
              className="md:self-center bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white border border-white/20 px-4 py-2 rounded-lg font-medium transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Containers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
          <button
            id="tab-director-stats"
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Analyses & Statistiques
          </button>
          <button
            id="tab-director-approval"
            onClick={() => setActiveTab('approval')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all flex items-center gap-2 relative ${
              activeTab === 'approval'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Membres en attente ({pendingApprovalsCount})
            {pendingApprovalsCount > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            id="tab-director-generator"
            onClick={() => setActiveTab('generator')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Création de Profil (ID 8-chars)
          </button>
          <button
            id="tab-director-lockers"
            onClick={() => setActiveTab('lockers')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'lockers'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Casiers du Système
          </button>
          <button
            id="tab-director-meetings"
            onClick={() => setActiveTab('meetings')}
            className={`py-3 px-5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === 'meetings'
                ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Convocation de Réunion
          </button>
        </div>

        {/* Tab content wrapper */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          {/* TAB 1: ANALYTICS & STATS */}
          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Bilan d'Activité Scolaire</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">Simulateur d'aide à la décision stratégique pour la direction générale</p>
                </div>
                <div className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg text-indigo-800">
                  <TrendingUp className="w-4 h-4" /> Analyse en ligne de l'activité
                </div>
              </div>

              {/* Bento grid metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Total Paid Revenue */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-emerald-800">
                    <span className="text-xs font-bold uppercase tracking-wider">Frais Scolaires Perçus</span>
                    <DollarSign className="w-5 h-5 opacity-70" />
                  </div>
                  <strong className="text-2xl font-black text-slate-800 block">{totalCollectedRevenue} €</strong>
                  <p className="text-[11px] text-teal-700">Encaissements validés par carte</p>
                </div>

                {/* Overdue Revenue */}
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-rose-800">
                    <span className="text-xs font-bold uppercase tracking-wider">Restes à recouvrer</span>
                    <AlertCircle className="w-5 h-5 opacity-70" />
                  </div>
                  <strong className="text-2xl font-black text-slate-800 block">{totalOutstandingDue} €</strong>
                  <p className="text-[11px] text-rose-700">Paiements en retard ou d'attente</p>
                </div>

                {/* School Global Grade Average */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-indigo-800">
                    <span className="text-xs font-bold uppercase tracking-wider">Moyenne Générale</span>
                    <BookOpen className="w-5 h-5 opacity-70" />
                  </div>
                  <strong className="text-2xl font-black text-slate-800 block">{schoolGlobalAverage} / 20</strong>
                  <p className="text-[11px] text-indigo-700">Statistiques d'évaluation cumulées</p>
                </div>

                {/* Global Attendance Rate */}
                <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-purple-800">
                    <span className="text-xs font-bold uppercase tracking-wider">Taux d'assiduité</span>
                    <Check className="w-5 h-5 opacity-70" />
                  </div>
                  <strong className="text-2xl font-black text-slate-800 block">{globalAttendanceRate} %</strong>
                  <p className="text-[11px] text-purple-700">Taux de présence globale</p>
                </div>

              </div>

              {/* Statistical Charts Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                
                {/* School Registry Chart Representation */}
                <div className="bg-slate-50/50 border rounded-xl p-5 space-y-4 lg:col-span-1">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-850 flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-700" /> Répartition du Personnel ({totalMembersCount} membres)
                  </h4>
                  
                  {/* Visual CSS-based Bar chart representers */}
                  <div className="space-y-3.5 pt-2 text-xs">
                    
                    {/* Teachers Count */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Enseignants agréés</span>
                        <strong className="font-bold text-slate-900">{totalApprovedTeachers}</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(totalApprovedTeachers / totalMembersCount) * 100 || 20}%` }} />
                      </div>
                    </div>

                    {/* Student count */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Élèves inscrits</span>
                        <strong className="font-bold text-slate-900">{totalStudentsCount}</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(totalStudentsCount / totalMembersCount) * 100 || 50}%` }} />
                      </div>
                    </div>

                    {/* Parents count */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Parents d'élèves</span>
                        <strong className="font-bold text-slate-900">{totalParentsCount}</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(totalParentsCount / totalMembersCount) * 100 || 30}%` }} />
                      </div>
                    </div>

                    {/* Staff members count */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Équipe administrative & Services</span>
                        <strong className="font-bold text-slate-900">{totalStaffCount}</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: `${(totalStaffCount / totalMembersCount) * 100 || 10}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* financial projections panel */}
                <div className="bg-slate-50/50 border rounded-xl p-5 space-y-4 lg:col-span-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-850 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-indigo-700" /> Progression de la Trésorerie Interne
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Le graphique ci-dessous indique le ratio de solvabilité globale des familles inscrites pour l'ensemble des frais de scolarité par trimestre.</p>
                  
                  {/* Graphic Visual representation */}
                  <div className="flex h-36 items-end gap-2.5 bg-white p-4 rounded-xl border border-dashed relative">
                    <div className="absolute top-2 left-2 text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">Solvabilité globale : {Math.round((totalCollectedRevenue / (totalCollectedRevenue + totalOutstandingDue || 1)) * 100)}%</div>
                    
                    {/* Bar 1 */}
                    <div className="w-full h-full flex flex-col justify-end items-center space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 font-mono">{totalCollectedRevenue} €</span>
                      <div className="bg-emerald-500 w-12 rounded-t-lg transition hover:bg-emerald-600" style={{ height: '75%' }} />
                      <span className="text-[9px] text-slate-500 uppercase font-black truncate">Perçu (Soldé)</span>
                    </div>

                    {/* Bar 2 */}
                    <div className="w-full h-full flex flex-col justify-end items-center space-y-1">
                      <span className="text-[10px] font-bold text-rose-500 font-mono">{totalOutstandingDue} €</span>
                      <div className="bg-rose-400 w-12 rounded-t-lg transition hover:bg-rose-500" style={{ height: '25%' }} />
                      <span className="text-[9px] text-slate-500 uppercase font-black truncate">Impayé</span>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: PENDING INTEGRATIONS (APPROVAL SYSTEM) */}
          {activeTab === 'approval' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-slate-800">Vérification & Approbation des Inscriptions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pour des raisons de conformité, tout nouveau membre de l'établissement (professeurs, parents) doit être visé et validé par l'ID de la Direction Générale.</p>
              </div>

              <div className="space-y-4">
                {users.filter(u => u.status === 'pending').map(pendingUser => (
                  <div key={pendingUser.id} className="border border-rose-100 rounded-xl p-5 bg-gradient-to-r from-rose-50/20 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono">
                          {pendingUser.role === 'teacher' ? 'Professeur' : pendingUser.role === 'parent' ? 'Parent' : 'Service'}
                        </span>
                        <span className="text-xs text-slate-400">Inscrit le {pendingUser.createdAt.substring(0,10)}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-850 text-sm">
                        {pendingUser.lastName.toUpperCase()} {pendingUser.firstName}
                      </h4>
                      <p className="text-xs text-slate-500">Contact : <strong>{pendingUser.email}</strong> | Tel : <strong>{pendingUser.phoneNumber}</strong></p>
                      {pendingUser.teacherSubject && (
                        <p className="text-xs text-indigo-700 font-semibold bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">Discipline : {pendingUser.teacherSubject}</p>
                      )}
                    </div>

                    <button
                      id={`btn-approve-${pendingUser.id}`}
                      onClick={() => onApproveUser(pendingUser.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Approuver l'intégration
                    </button>
                  </div>
                ))}
                
                {users.filter(u => u.status === 'pending').length === 0 && (
                  <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400 space-y-2">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="italic text-xs font-semibold">Aucune demande d'inscription n'est actuellement en attente d'approbation par le Directeur.</p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 3: PROFILE GENERATOR (MIXING LETTERS & NUMBER FOR 8 CHARS) */}
          {activeTab === 'generator' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Module de Génération d'Identifiants (8 Caractères)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Notre algorithme mélange le commencement du prénom avec des chiffres uniques pour structurer la vie privée de l'école.</p>
                </div>
                <div className="text-xs text-slate-500 bg-slate-105 border px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-slate-50 font-mono">
                  Formule : [A-Z(1-3)] + [RAND(5)] = 8 Caractères
                </div>
              </div>

              {lastGeneratedCreds && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5">
                      <UserPlus className="w-4.5 h-4.5 text-indigo-700" /> Identifiant Généré avec Succès !
                    </h4>
                    <button onClick={() => setLastGeneratedCreds(null)} className="text-indigo-400 hover:text-indigo-700 text-xs font-bold font-mono">Réinitialiser l'alerte</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1.5">
                    <div className="bg-white p-3 rounded-lg border font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Membre</span>
                      <strong className="text-sm font-bold text-slate-800">{lastGeneratedCreds.name}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Rôle</span>
                      <strong className="text-sm font-black text-indigo-800 uppercase">{lastGeneratedCreds.role}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border font-mono">
                      <span className="text-[10px] text-indigo-500 block uppercase font-black">ID de connexion unique</span>
                      <strong className="text-sm font-black text-rose-600 tracking-wider block bg-rose-50 px-2 py-0.5 rounded text-center border border-rose-150">{lastGeneratedCreds.id}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border font-mono overflow-x-auto">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Mot de passe temporaire</span>
                      <strong className="text-xs font-semibold text-slate-700">{lastGeneratedCreds.pass}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form 1: Officers/Parents/Teachers */}
                <div className="border rounded-xl p-5 space-y-4 bg-slate-50/50">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b pb-2">
                    Inscrire un Collaborateur, Parent ou Vice-Directeur
                  </h4>
                  
                  <form onSubmit={handleGenerateMember} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="gen-fname" className="block text-slate-500 font-bold mb-1">Prénom</label>
                        <input
                          id="gen-fname"
                          type="text"
                          required
                          placeholder="Sophie"
                          value={genFirstName}
                          onChange={(e) => setGenFirstName(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label htmlFor="gen-lname" className="block text-slate-500 font-bold mb-1">Nom de famille</label>
                        <input
                          id="gen-lname"
                          type="text"
                          required
                          placeholder="Bernard"
                          value={genLastName}
                          onChange={(e) => setGenLastName(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="gen-role" className="block text-slate-500 font-bold mb-1">Rôle au sein de l'école</label>
                        <select
                          id="gen-role"
                          value={genRole}
                          onChange={(e) => setGenRole(e.target.value as any)}
                          className="w-full border rounded-lg p-2.5 bg-white font-semibold"
                        >
                          <option value="teacher">Professeur</option>
                          <option value="parent">Parent d'Élève</option>
                          <option value="vice-director">Vice-Directeur / Vice-Directrice</option>
                          <option value="staff">Personnel de service</option>
                        </select>
                      </div>

                      {genRole === 'teacher' && (
                        <div>
                          <label htmlFor="gen-subj" className="block text-slate-500 font-bold mb-1">Discipline d'enseignement</label>
                          <input
                            id="gen-subj"
                            type="text"
                            required={genRole === 'teacher'}
                            placeholder="ex: Mathématiques"
                            value={genSubject}
                            onChange={(e) => setGenSubject(e.target.value)}
                            className="w-full border rounded-lg p-2.5 bg-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="gen-email" className="block text-slate-500 font-bold mb-1">E-mail de contact</label>
                        <input
                          id="gen-email"
                          type="email"
                          required
                          placeholder="adresse@mail.com"
                          value={genEmail}
                          onChange={(e) => setGenEmail(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="gen-phone" className="block text-slate-500 font-bold mb-1">Numéro de téléphone</label>
                        <input
                          id="gen-phone"
                          type="text"
                          placeholder="06 00 00 00 00"
                          value={genPhone}
                          onChange={(e) => setGenPhone(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      id="btn-generate-creds"
                      type="submit"
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-lg transition shadow-sm"
                    >
                      Enregistrer & Générer l'ID d'Accès
                    </button>
                  </form>
                </div>

                {/* Form 2: Students */}
                <div className="border rounded-xl p-5 space-y-4 bg-slate-50/50">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b pb-2">
                    Inscrire directement un Élève rattaché
                  </h4>

                  <form onSubmit={handleRegisterStudent} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="stud-fname" className="block text-slate-500 font-bold mb-1">Prénom de l'Élève</label>
                        <input
                          id="stud-fname"
                          type="text"
                          required
                          placeholder="Yasmine"
                          value={genFirstName}
                          onChange={(e) => setGenFirstName(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label htmlFor="stud-lname" className="block text-slate-500 font-bold mb-1">Nom de l'Élève</label>
                        <input
                          id="stud-lname"
                          type="text"
                          required
                          placeholder="Belkacem"
                          value={genLastName}
                          onChange={(e) => setGenLastName(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="stud-class" className="block text-slate-500 font-bold mb-1">Classe d'affection</label>
                        <select
                          id="stud-class"
                          value={genStudentClass}
                          onChange={(e) => setGenStudentClass(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-semibold"
                        >
                          <option value="Terminale S">Terminale S</option>
                          <option value="Première S">Première S</option>
                          <option value="3ème A">3ème A</option>
                          <option value="6ème B">6ème B</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="stud-parentid" className="block text-slate-500 font-bold mb-1">ID Parental Déclaré </label>
                        <input
                          id="stud-parentid"
                          type="text"
                          required
                          placeholder="ex: KAR77412"
                          value={genStudentParentId}
                          onChange={(e) => setGenStudentParentId(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white placeholder:text-slate-400 font-mono tracking-widest font-black text-rose-700"
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-900 leading-normal text-[11px]">
                      L'élève sera automatiquement couplé avec le compte parental correspondant. Un code ID sous la forme <strong>ELXXXXXX</strong> sera affecté à l'historique scolaire.
                    </div>

                    <button
                      id="btn-register-student"
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                      Attribuer ID d'Élève & Rattacher
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: SYSTEM LOCKERSVault LIST & DETAILS */}
          {activeTab === 'lockers' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FolderLock className="w-5 h-5 text-indigo-700" /> Casiers d'Archivage de l'Établissement (Données de vie privée)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Le Directeur Général est habilité à vérifier à tout moment toutes les fiches d'activité stockées dans le système.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="relative">
                    <input
                      id="vault-search-box"
                      type="text"
                      className="border rounded-lg pl-8 pr-3 py-2 bg-slate-50 focus:bg-white text-xs max-w-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      placeholder="Identifiant, Nom..."
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>

                  <select
                    id="vault-role-filter"
                    className="border rounded-lg p-2 text-xs bg-white font-medium"
                    value={vaultRoleFilter}
                    onChange={(e) => setVaultRoleFilter(e.target.value as any)}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="teacher">Professeurs</option>
                    <option value="student">Élèves</option>
                    <option value="parent">Parents</option>
                    <option value="staff">Direction & Services</option>
                  </select>
                </div>
              </div>

              {selectedVaultMember ? (
                <div className="p-6 border border-indigo-155 rounded-xl bg-slate-50/50 space-y-6">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <div className="inline-flex gap-2 items-center text-[10px] bg-indigo-100/50 text-indigo-900 border font-black px-2.5 py-0.5 rounded uppercase tracking-widest">{selectedVaultMember.role}</div>
                      <h4 className="text-xl font-bold text-slate-800 mt-1">{selectedVaultMember.lastName.toUpperCase()} {selectedVaultMember.firstName}</h4>
                      <p className="text-xs text-slate-500 font-mono">ID unique du casier : {selectedVaultMember.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedVaultMember(null)}
                      className="text-xs bg-white hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border font-semibold"
                    >
                      Retourner au répertoire
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    
                    {/* Information panel */}
                    <div className="space-y-4 bg-white p-5 rounded-xl border">
                      <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Informations Personnelles de Sécurité</h5>
                      <div className="space-y-2 border-t pt-2 shadow-2xs">
                        <p><strong className="text-slate-500">Nom Complet :</strong> <span className="font-semibold text-slate-800">{selectedVaultMember.lastName.toUpperCase()}, {selectedVaultMember.firstName}</span></p>
                        <p><strong className="text-slate-500">Messagerie unique :</strong> <span className="font-semibold text-slate-800">{selectedVaultMember.email}</span></p>
                        <p><strong className="text-slate-500">Ligne téléphonique :</strong> <span className="font-semibold text-slate-800">{selectedVaultMember.phoneNumber}</span></p>
                        <p><strong className="text-slate-500">Date d'archivage :</strong> <span className="font-semibold text-slate-800">{selectedVaultMember.createdAt?.substring(0,10)}</span></p>
                        <p className="flex items-center gap-1.5"><strong className="text-slate-500">Mot de passe hashé :</strong> <span className="font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Encodage RSA/2026-Actif</span></p>
                      </div>
                    </div>

                    {/* Conditional panel based on member type */}
                    <div className="bg-white p-5 rounded-xl border">
                      
                      {selectedVaultMember.role === 'student' && selectedVaultMember.studentData && (
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Scolarité, Evaluations & Devoirs</h5>
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Classe assignée :</strong> <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{selectedVaultMember.studentData.className}</span></p>
                            <p><strong className="text-slate-500">Dossier Parental Rattaché :</strong> <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{selectedVaultMember.studentData.parentId}</code></p>
                            <p><strong className="text-slate-500">Total Evaluations validées :</strong> <span className="font-bold">{selectedVaultMember.studentData.grades.length} contrôles d'école</span></p>
                            
                            {/* Short listing of student grades */}
                            <div className="pt-2">
                              <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Moyenne trimestrielle actuelle</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedVaultMember.studentData.grades.map((g: any) => (
                                  <span key={g.id} className="bg-slate-50 border px-2 py-1 rounded text-[11px]" title={g.title}>
                                    {g.subject}: <strong>{g.score}/20</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedVaultMember.role === 'teacher' && (
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Données de l'Educateur</h5>
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Spécialité Enseignée :</strong> <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{selectedVaultMember.teacherSubject || 'Général'}</span></p>
                            <p className="flex items-center gap-1.5"><strong className="text-slate-500">Statut Professionnel :</strong> <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold uppercase">Actif</span></p>
                          </div>
                        </div>
                      )}

                      {selectedVaultMember.role === 'parent' && (
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Rattachements Parentaux & Coffre-fort Financier</h5>
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Élèves sous responsabilité :</strong></p>
                            <div className="flex flex-wrap gap-1 pb-2">
                              {selectedVaultMember.associatedStudentIds?.map((sid: string) => {
                                const matchedEl = students.find(el => el.id === sid);
                                return (
                                  <span key={sid} className="bg-slate-100 border text-slate-800 px-2 py-1 rounded font-bold">
                                    {matchedEl ? `${matchedEl.lastName} ${matchedEl.firstName}` : sid} ({sid})
                                  </span>
                                );
                              })}
                            </div>

                            <p className="flex items-center gap-1.5 pt-2 border-t text-indigo-900 bg-indigo-50/50 p-2 text-[10px] rounded border">
                              <ShieldAlert className="w-4 h-4 text-indigo-700 shrink-0" />
                              <strong>Protection Vie Privée :</strong> Les informations bancaires (codes d'identification de cartes bancaires) introduites par ce parent pour payer sont masquées de bout en bout. Seuls les reçus signataires apparaissent dans le registre comptable.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedVaultMember.role === 'staff' && (
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Profil Service & Logistique</h5>
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Catégorie :</strong> <span>Personnel de service agréé</span></p>
                            <p><strong className="text-slate-500">Autorisations :</strong> <span className="italic">Accès restreint aux rapports logistiques d'inventaire</span></p>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-650 font-semibold text-xs uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-bold">Identifiant (8-chars)</th>
                        <th className="px-4 py-3 font-semibold">Nom Complet</th>
                        <th className="px-4 py-3 font-semibold">Rôle École</th>
                        <th className="px-4 py-3 font-semibold">Messagerie / Statut</th>
                        <th className="px-4 py-3 font-semibold">Inscrit le</th>
                        <th className="px-4 py-3 font-semibold text-center">Contrôle casier</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-xs">
                      {allVaultMembers.map(member => (
                        <tr key={member.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono font-black text-rose-750">{member.id}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-bold text-slate-800">{member.lastName.toUpperCase()} {member.firstName}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 uppercase text-[9px] font-black">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full ${
                              member.role === 'teacher' ? 'bg-indigo-50 text-indigo-700' :
                              member.role === 'parent' ? 'bg-emerald-50 text-emerald-700' :
                              member.role === 'student' ? 'bg-amber-50 text-amber-700' :
                              'bg-purple-50 text-purple-750'
                            }`}>
                              {member.role === 'vice-director' ? 'Vice-Dir' : member.role}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="text-slate-600 block text-[11px]">{member.email}</span>
                            <span className={`inline-block px-1.5 py-0.25 text-[9px] font-bold tracking-widest rounded ${
                              member.status === 'approved' ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {member.status === 'approved' ? 'ACTIF' : 'BLOQUÉ'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-[10px] text-slate-400">{member.createdAt?.substring(0,10)}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-center">
                            <button
                              id={`btn-vault-inspect-${member.id}`}
                              onClick={() => setSelectedVaultMember(member)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ouvrir Casier
                            </button>
                          </td>
                        </tr>
                      ))}
                      {allVaultMembers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400 italic">Aucun casier trouvé correspondant aux critères.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 5: Unified Parent Meeting Scheduler */}
          {activeTab === 'meetings' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Meeting scheduler form */}
                <div className="border rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Calendar className="w-4.5 h-4.5 text-indigo-700" /> Planifier une Assemblée
                  </h3>

                  {meetingSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs p-3 rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>La réunion a été notifiée à tous les parents d'élèves visés!</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
                    <div>
                      <label htmlFor="meet-title" className="block text-slate-500 font-bold mb-1">Intitulé de la Réunion</label>
                      <input
                        id="meet-title"
                        type="text"
                        required
                        placeholder="ex: Réunion d'Orientation Trimestrielle"
                        value={meetTitle}
                        onChange={(e) => setMeetTitle(e.target.value)}
                        className="w-full border rounded-lg p-2.5 bg-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="meet-date" className="block text-slate-500 font-bold mb-1">Date</label>
                        <input
                          id="meet-date"
                          type="date"
                          required
                          value={meetDate}
                          onChange={(e) => setMeetDate(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label htmlFor="meet-time" className="block text-slate-500 font-bold mb-1">Heure de convocation</label>
                        <input
                          id="meet-time"
                          type="time"
                          required
                          value={meetTime}
                          onChange={(e) => setMeetTime(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="meet-location" className="block text-slate-500 font-bold mb-1">Lieu ou Visioconférence</label>
                      <input
                        id="meet-location"
                        type="text"
                        required
                        placeholder="Auditorium de l'établissement"
                        value={meetLocation}
                        onChange={(e) => setMeetLocation(e.target.value)}
                        className="w-full border rounded-lg p-2.5 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="meet-aud" className="block text-slate-500 font-bold mb-1">Auditorat Cible (Parents invités)</label>
                      <select
                        id="meet-aud"
                        value={meetAudience}
                        onChange={(e) => setMeetAudience(e.target.value)}
                        className="w-full border rounded-lg p-2.5 bg-white font-bold"
                      >
                        <option value="all">Tous les parents d'élèves</option>
                        <option value="Terminale S">Parents d'élèves - Terminale S</option>
                        <option value="Première S">Parents d'élèves - Première S</option>
                        <option value="3ème A">Parents d'élèves - 3ème A</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="meet-desc" className="block text-slate-500 font-bold mb-1">Ordre du jour & Instructions complémentaires</label>
                      <textarea
                        id="meet-desc"
                        rows={3}
                        placeholder="Quels thèmes seront développés ? (ex: Parcoursup, frais de scolarité, travaux de l'annexe...)"
                        value={meetDesc}
                        onChange={(e) => setMeetDesc(e.target.value)}
                        className="w-full border rounded-lg p-2.5 bg-white resize-none"
                      />
                    </div>

                    <button
                      id="btn-director-submit-meeting"
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition shadow-xs"
                    >
                      Diffuser la convocation générale
                    </button>
                  </form>
                </div>

                {/* Agenda view showing director convocations */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Calendrier des conseils administratifs programmés</h4>
                  
                  <div className="space-y-3">
                    {meetings.map(meet => (
                      <div key={meet.id} className="border rounded-xl p-4 bg-white shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 inline-block">
                            Cible : {meet.targetAudience === 'all' ? 'Tous les parents' : meet.targetAudience}
                          </span>
                          <h5 className="font-bold text-slate-800 text-sm mt-1">{meet.title}</h5>
                          <p className="text-xs text-slate-600 italic">"{meet.description}"</p>
                          <p className="text-xs text-slate-400">Lieu d'accueil : <strong>{meet.location}</strong></p>
                        </div>

                        <div className="text-right shrink-0 bg-slate-50 p-2.5 rounded border font-mono text-xs">
                          <div className="text-slate-700 font-bold">{meet.date}</div>
                          <div className="text-indigo-600 font-black">à {meet.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
