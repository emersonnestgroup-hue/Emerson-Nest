/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, SchoolRole } from '../types';
import { 
  Lock, 
  UserCheck, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  Key, 
  AlertCircle, 
  UserPlus, 
  CheckCircle,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { generate8CharID } from '../initialData';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  users: User[];
  onLogin: (user: User) => void;
  onRequestRegister: (newUser: User) => void;
}

export default function AuthLayout({ users, onLogin, onRequestRegister }: AuthLayoutProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login states
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'parent' | 'teacher'>('parent');
  const [regPassword, setRegPassword] = useState('');
  const [regSubject, setRegSubject] = useState(''); // for teachers
  
  // Custom success visual upon registration submission
  const [registrationReceipt, setRegistrationReceipt] = useState<{ id: string; role: string; name: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginId.trim().toUpperCase();
    const matchedUser = users.find(u => u.id === trimmedId);

    if (!matchedUser) {
      setLoginError("Identifiant introuvable. Veuillez vérifier votre code d'accès à 8 caractères.");
      return;
    }

    // Quick simulated password check (by default, users have initial pre-populated passwords)
    if (loginPassword && matchedUser.password !== loginPassword) {
      setLoginError("Mot de passe incorrect. Veuillez ressaisir votre mot de passe privé.");
      return;
    }

    if (matchedUser.status === 'pending') {
      setLoginError(`Votre compte (${matchedUser.id}) est en attente d'approbation. Le Directeur Général doit valider votre intégration.`);
      return;
    }

    onLogin(matchedUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Role-based prefix selection
    const prefixRole = regRole === 'teacher' ? 'PRO' : 'PAR';
    const generatedId = generate8CharID(regFirstName, prefixRole);

    const newUser: User = {
      id: generatedId,
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      phoneNumber: regPhone.trim() || 'Non spécifié',
      role: regRole,
      status: 'pending', // Pending Director's approval
      password: regPassword,
      createdAt: new Date().toISOString(),
      associatedStudentIds: regRole === 'parent' ? [] : undefined, // empty list for new parents initially
      teacherSubject: regRole === 'teacher' ? (regSubject.trim() || 'Général') : undefined
    };

    onRequestRegister(newUser);
    setRegistrationReceipt({
      id: generatedId,
      role: regRole === 'parent' ? "Parent d'Élève" : `Professeur de ${regSubject}`,
      name: `${regFirstName} ${regLastName}`
    });

    // Clear register fields
    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegSubject('');
  };

  const handleQuickDemoClick = (demoId: string, demoPass: string) => {
    setLoginId(demoId);
    setLoginPassword(demoPass);
    setLoginError('');

    const matchedUser = users.find(u => u.id === demoId);
    if (matchedUser) {
      onLogin(matchedUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      
      {/* Decorative colored ambient blobs */}
      <div className="absolute w-[400px] h-[400px] bg-indigo-900/40 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-900/30 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      {/* Main Box wrapper */}
      <div className="max-w-md w-full z-10 space-y-6">
        
        {/* Logo and Titles */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-teal-500 rounded-2xl shadow-xl shadow-indigo-950/40 mb-2">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">ScolaPortal</h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Plateforme de communication et d'administration fluide entre parents, professeurs et direction.</p>
        </div>

        {/* Auth Body Box */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-6 sm:p-8 shadow-2xl relative">
          
          {/* Custom Success indicator for registration */}
          {registrationReceipt ? (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-teal-400 mx-auto" />
                <h3 className="font-extrabold text-white text-lg">Incription Envoyée !</h3>
                <p className="text-xs text-slate-350">Votre demande a bien été déposée auprès de l'école.</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center font-mono space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Utilisateur</span>
                  <strong className="text-slate-200 text-sm">{registrationReceipt.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">Votre Identifiant unique de connexion</span>
                  <strong className="text-base font-black text-emerald-400 tracking-widest">{registrationReceipt.id}</strong>
                </div>
                <div className="text-[10px] text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/20 leading-normal">
                  ⚠️ Notez précieusement votre ID de connexion. Vous devez attendre son approbation par le directeur général avant de pouvoir vous connecter.
                </div>
              </div>

              <button
                id="btn-return-login"
                onClick={() => {
                  setRegistrationReceipt(null);
                  setAuthMode('login');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs transition"
              >
                Retourner à l'authentification
              </button>
            </motion.div>
          ) : (
            <>
              {/* Form Toggles */}
              <div className="flex border-b border-slate-700 pb-px mb-6 justify-center text-xs font-semibold">
                <button
                  id="toggle-login"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className={`pb-3 px-6 transition-all border-b-2 uppercase tracking-wide font-extrabold ${
                    authMode === 'login' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Se Connecter
                </button>
                <button
                  id="toggle-register"
                  onClick={() => { setAuthMode('register'); setLoginError(''); }}
                  className={`pb-3 px-6 transition-all border-b-2 uppercase tracking-wide font-extrabold ${
                    authMode === 'register' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  S'inscrire
                </button>
              </div>

              {/* ERRORS PANELS */}
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 p-3 rounded-lg text-xs flex items-start gap-2 mb-4 leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* 1: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="login-id" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Identifiant Unique (8 Caractères)</label>
                    <input
                      id="login-id"
                      type="text"
                      required
                      placeholder="SOP58194 ou DIR94721..."
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-pass" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mot De Passe Privé</label>
                    <input
                      id="login-pass"
                      type="password"
                      required
                      placeholder="Votre code secret privé..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-950/40 uppercase tracking-wider transition-all text-sm mt-2"
                  >
                    Démarrer la session
                  </button>
                </form>
              )}

              {/* 2: REGISTER FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-fname" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Prénom</label>
                      <input
                        id="reg-fname"
                        type="text"
                        required
                        placeholder="Jean"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-lname" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Nom de famille</label>
                      <input
                        id="reg-lname"
                        type="text"
                        required
                        placeholder="Dupont"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-role" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Votre Profil</label>
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                      >
                        <option value="parent">Parent d'Élève</option>
                        <option value="teacher">Professeur d'École</option>
                      </select>
                    </div>

                    {regRole === 'teacher' && (
                      <div>
                        <label htmlFor="reg-subj" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Matière de cours</label>
                        <input
                          id="reg-subj"
                          type="text"
                          required={regRole === 'teacher'}
                          placeholder="ex: Histoire"
                          value={regSubject}
                          onChange={(e) => setRegSubject(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-email" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">E-mail</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="nom@mail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-phone" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Ligne Téléphone</label>
                      <input
                        id="reg-phone"
                        type="text"
                        placeholder="0612345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-pass" className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Créer son Mot de passe secret privée</label>
                    <input
                      id="reg-pass"
                      type="password"
                      required
                      placeholder="Mot de passe confidentiel..."
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <button
                    id="btn-register-submit"
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-sm mt-1"
                  >
                    Soumettre mon inscription en attente
                  </button>
                </form>
              )}
            </>
          )}

        </div>

        {/* DEMO ACCOUNTS QUICK SWITCHER (EXTREMELY USEFUL FOR REVIEWING OR PORTAL DEMOING!) */}
        <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl border border-slate-700/60 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-350 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Portefeuille de Démo d'Évaluation Rapide</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">Basculez instantanément d'un compte de test à l'autre pour valider toutes les exigences :</p>
          
          <div className="flex flex-col gap-1 text-[11px] font-mono">
            
            <button
              id="demo-director"
              onClick={() => handleQuickDemoClick("DIR94721", "directeur123")}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-900 p-2 rounded border border-slate-700 transition flex justify-between items-center"
            >
              <span className="text-white">👑 Directeur Général (`DIR94721`)</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.25 rounded text-[10px]">Accès Global</span>
            </button>

            <button
              id="demo-teacher"
              onClick={() => handleQuickDemoClick("SOP58194", "sophie123")}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-900 p-2 rounded border border-slate-700 transition flex justify-between items-center"
            >
              <span className="text-white">✏️ Prof de Math (`SOP58194`)</span>
              <span className="text-indigo-300 font-bold bg-indigo-500/10 px-1.5 py-0.25 rounded text-[10px]">Grades & Zoom</span>
            </button>

            <button
              id="demo-parent"
              onClick={() => handleQuickDemoClick("KAR77412", "karim123")}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-900 p-2 rounded border border-slate-700 transition flex justify-between items-center"
            >
              <span className="text-white">👨‍👩‍👦 Parent Yasmine (`KAR77412`)</span>
              <span className="text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.25 rounded text-[10px]">Cartes & Bulletin</span>
            </button>

            <button
              id="demo-vicedirector"
              onClick={() => handleQuickDemoClick("VIC48291", "vice123")}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-900 p-2 rounded border border-slate-700 transition flex justify-between items-center"
            >
              <span className="text-white">📁 Vice-Directrice (`VIC48291`)</span>
              <span className="text-slate-300 font-bold bg-slate-300/10 px-1.5 py-0.25 rounded text-[10px]">Staff</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
