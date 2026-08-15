/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Mail, User, ShieldCheck, AlertCircle, Check, 
  RotateCw, KeyRound, Fingerprint, ShieldAlert, FileText, CheckCircle2
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface AuthInterfaceProps {
  role?: 'patient' | 'pharmacist' | 'admin';
  onAuthSuccess: (token: string, user: any) => void;
  onLogout?: () => void;
  currentUser?: any;
}

export default function AuthInterface({ role = 'patient', onAuthSuccess, onLogout, currentUser }: AuthInterfaceProps) {
  const { t, isRtl, dir } = useLanguage();
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset-submit'>('login');
  
  // Fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("ما هو اسم مدينتك المفضلة؟");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Registration Role Selection (Required: patient, pharmacist, admin)
  const [registerRole, setRegisterRole] = useState<'patient' | 'pharmacist' | 'admin'>(role);

  // Sync prop role
  useEffect(() => {
    if (role) {
      setRegisterRole(role);
    }
  }, [role]);

  // Reset workflow state
  const [fetchedQuestion, setFetchedQuestion] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  
  // UI status states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill standard test cases (Patient, Pharmacist, Admin)
  const handlePrefill = (type: 'patient' | 'pharmacist' | 'admin') => {
    setError(null);
    setSuccess(null);
    if (type === 'patient') {
      setEmail("ahmed.aly@mail.eg");
      setPassword("123456");
      setFullName("أحمد محمد علي");
      setNationalId("29010151234567");
      setSecurityAnswer("القاهرة");
    } else if (type === 'pharmacist') {
      setEmail("pharmacist@clinical.eg");
      setPassword("123456");
      setFullName("د. أميرة أحمد");
      setLicenseNumber("LIC-12345");
      setSecurityAnswer("فلافي");
    } else if (type === 'admin') {
      setEmail("admin@hospital.eg");
      setPassword("123456");
      setFullName("أدمن النظام المركزي");
      setSecurityAnswer("أحمر");
    }
  };

  const handleQuickAutoLogin = async (targetRole: 'patient' | 'pharmacist' | 'admin') => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const targetEmail = targetRole === 'patient' ? "ahmed.aly@mail.eg" : targetRole === 'pharmacist' ? "pharmacist@clinical.eg" : "admin@hospital.eg";
    const targetPass = "123456";

    setEmail(targetEmail);
    setPassword(targetPass);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل تسجيل الدخول التلقائي" : "Automatic login failed"));
      }

      setSuccess(isRtl ? `تم تسجيل الدخول كـ (${targetRole === 'patient' ? "مريض" : targetRole === 'pharmacist' ? "صيدلي" : "أدمن"}) بنجاح!` : `Logged in as (${targetRole}) successfully!`);
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        setIsLoading(false);
      }, 400);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setNationalId("");
    setLicenseNumber("");
    setSecurityAnswer("");
    setNewPassword("");
    setError(null);
    setSuccess(null);
  };

  // JWT Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل تسجيل الدخول" : "Login failed"));
      }

      setSuccess(isRtl ? "تم تسجيل الدخول بنجاح! جاري تحميل الجلسة الموثقة..." : "Login successful! Loading session...");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // JWT Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Dynamic validations
    if (password.length < 6) {
      setError(isRtl ? "كلمة المرور يجب أن تكون 6 خانات على الأقل" : "Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (registerRole === 'patient' && (!nationalId || nationalId.length !== 14)) {
      setError(isRtl ? "الرقم القومي المصري للمريض يجب أن يتكون من 14 رقماً صحيحاً" : "Egyptian National ID must be 14 digits");
      setIsLoading(false);
      return;
    }

    if (registerRole === 'pharmacist' && !licenseNumber) {
      setError(isRtl ? "يرجى كتابة رقم ترخيص مزاولة المهنة للصيدلي" : "Please provide professional license number");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        email,
        password,
        fullName,
        role: registerRole,
        securityQuestion,
        securityAnswer
      };

      if (registerRole === 'patient') {
        payload.nationalId = nationalId;
      } else if (registerRole === 'pharmacist') {
        payload.licenseNumber = licenseNumber;
      }

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل إنشاء الحساب" : "Account creation failed"));
      }

      setSuccess(isRtl ? "تم إنشاء الحساب بنجاح! تسجيل الدخول التلقائي..." : "Account created successfully! Auto logging in...");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        setIsLoading(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Password Reset - Request Security Question
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل البحث عن الحساب" : "Account search failed"));
      }

      setFetchedQuestion(data.securityQuestion);
      setView('reset-submit');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Password Reset - Submit Security Question Response & New Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          answer: resetAnswer,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل إعادة تعيين كلمة المرور" : "Password reset failed"));
      }

      setSuccess(isRtl ? "تمت إعادة تعيين كلمة مرورك بأمان! يرجى تسجيل الدخول." : "Password reset successfully! Please log in.");
      setTimeout(() => {
        setView('login');
        clearForm();
        setIsLoading(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full font-sans ${isRtl ? 'text-right' : 'text-left'}`} style={{ direction: dir }}>
      {/* If already logged in, show elegant session widget */}
      {currentUser ? (
        <div className="bg-slate-900 border border-teal-900/60 p-4 rounded-3xl text-slate-200 shadow-xl space-y-3.5">
          <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-2xl border border-slate-900">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-teal-400 flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              <span>JWT Secured</span>
            </span>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Fingerprint className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white">{t('portal.active_session', 'جلسة نشطة موثقة')}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">{isRtl ? "الاسم الكامل:" : "Full Name:"}</span>
              <span className="font-bold text-white">{currentUser.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">{isRtl ? "البريد الإلكتروني:" : "Email:"}</span>
              <span className="font-mono text-white text-[11px]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">{isRtl ? "صلاحية النظام:" : "System Role:"}</span>
              <span className="bg-teal-900/40 text-teal-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                {currentUser.role === 'patient' ? (isRtl ? "مريض معتمد" : "Verified Patient") : currentUser.role === 'pharmacist' ? (isRtl ? "صيدلي إكلينيكي" : "Clinical Pharmacist") : (isRtl ? "مدير نظام (Admin)" : "System Admin")}
              </span>
            </div>
            
            {currentUser.nationalId ? (
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">{isRtl ? "الرقم القومي:" : "National ID:"}</span>
                <span className="font-mono text-teal-400">{currentUser.nationalId}</span>
              </div>
            ) : currentUser.licenseNumber ? (
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">{isRtl ? "مزاولة المهنة:" : "License No:"}</span>
                <span className="font-mono text-teal-400">{currentUser.licenseNumber}</span>
              </div>
            ) : null}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-2 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-350 hover:text-white rounded-2xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse"
            >
              <span>{isRtl ? "تسجيل الخروج وإنهاء جلسة JWT" : "Sign Out & Terminate JWT Session"}</span>
            </button>
          )}
        </div>
      ) : (
        /* Show Authentication forms based on active view state */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="text-center pb-2 border-b border-slate-100 flex flex-col items-center">
            <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-2">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">
              {role === 'patient' ? (isRtl ? "بوابة دخول المريض الرقمية" : "Patient Digital Portal") : role === 'pharmacist' ? (isRtl ? "بوابة تدقيق الصيدلي الإكلينيكي" : "Clinical Pharmacist Workspace") : (isRtl ? "بوابة مدير النظام الإكلينيكي" : "System Administrator Portal")}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {view === 'login' ? (isRtl ? "سجل دخولك فورا لتنشيط منبهات الأدوية وجلسة المتابعة" : "Log in to access your digital pillbox and consultations") : 
               view === 'register' ? (isRtl ? "أنشئ حساباً جديداً متكاملاً مع تشفير الجلسات" : "Create a new encrypted healthcare account") : (isRtl ? "استرداد آمن بأسئلة الأمان المقاومة للاختراق" : "Secure recovery with security question")}
            </p>
          </div>

          {/* Flash Feedback */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100/80 rounded-2xl text-[10.5px] text-rose-700 flex items-center space-x-2 space-x-reverse font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10.5px] text-emerald-700 flex items-center space-x-2 space-x-reverse font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form wrapper with animations */}
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleLogin} 
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{t('auth.email', 'البريد الإلكتروني المعتمد')}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@mail.eg"
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black outline-none focus:border-teal-600 focus:bg-white font-sans text-slate-950 placeholder:text-slate-500 shadow-xs`}
                    />
                    <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{t('auth.password', 'كلمة المرور السرية')}</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black outline-none focus:border-teal-600 focus:bg-white font-sans text-slate-950 placeholder:text-slate-500 shadow-xs`}
                    />
                    <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(null); }}
                    className="text-xs text-teal-800 hover:text-teal-950 font-black transition-colors cursor-pointer focus:outline-none underline"
                  >
                    {isRtl ? "نسيت كلمة المرور؟ استرداد الحساب" : "Forgot password? Recover account"}
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                  >
                    {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{t('auth.login_btn', 'تسجيل الدخول الآمن (JWT)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAutoLogin(role || 'patient')}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-400 text-emerald-950 font-black rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse"
                  >
                    <span>⚡ {isRtl ? `تعبئة تلقائية ودخول مباشر (${role === 'pharmacist' ? "صيدلي" : role === 'admin' ? "أدمن" : "مريض"})` : `Quick Demo Login (${role})`}</span>
                  </button>
                </div>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRegister} 
                className="space-y-3"
              >
                {/* ROLE SELECTION COMPONENT: patient, pharmacist, admin */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">{isRtl ? "اختر فئة وصلاحية المستخدم" : "Select User Role"}</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 border-2 border-slate-300 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('patient')}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        registerRole === 'patient' 
                          ? 'bg-teal-700 text-white shadow-md' 
                          : 'text-slate-900 hover:bg-white bg-slate-200/80'
                      }`}
                    >
                      {isRtl ? "مريض (Patient)" : "Patient"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('pharmacist')}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        registerRole === 'pharmacist' 
                          ? 'bg-teal-700 text-white shadow-md' 
                          : 'text-slate-900 hover:bg-white bg-slate-200/80'
                      }`}
                    >
                      {isRtl ? "صيدلي (Pharmacist)" : "Pharmacist"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('admin')}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        registerRole === 'admin' 
                          ? 'bg-teal-700 text-white shadow-md' 
                          : 'text-slate-900 hover:bg-white bg-slate-200/80'
                      }`}
                    >
                      {isRtl ? "مدير (Admin)" : "Admin"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{t('auth.name', 'الاسم الكامل')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isRtl ? "أدخل الاسم الحقيقي المتطابق مع الهوية" : "Enter full name"}
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs`}
                    />
                    <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{t('auth.email', 'البريد الإلكتروني المعتمد')}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.eg"
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs`}
                    />
                    <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                {registerRole === 'patient' && (
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">{isRtl ? "الرقم القومي (14 رقم)" : "National ID (14 digits)"}</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                        placeholder="29505202712345"
                        className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white font-mono shadow-xs`}
                      />
                      <FileText className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                    </div>
                  </div>
                )}

                {registerRole === 'pharmacist' && (
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">{isRtl ? "رقم ترخيص مزاولة المهنة (نقابة الصيادلة)" : "Professional License Number"}</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="LIC-12345"
                        className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white font-mono shadow-xs`}
                      />
                      <ShieldAlert className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                    </div>
                  </div>
                )}

                {registerRole === 'admin' && (
                  <div className="bg-amber-100 p-3 rounded-2xl border-2 border-amber-300">
                    <span className="text-xs text-amber-950 font-black uppercase block">{isRtl ? "مدير نظام مؤمن بالكامل (Admin)" : "System Administrator (Admin)"}</span>
                    <p className="text-[11px] text-amber-900 font-bold leading-tight mt-0.5">{isRtl ? "لا يتطلب حساب المشرف إدخال رقم قومي أو ترخيص مزاولة رعاية صحية." : "Administrator accounts do not require a national ID or pharmacy license."}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{t('auth.password', 'كلمة المرور الجديدة')}</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRtl ? "6 خانات على الأقل" : "Minimum 6 characters"}
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs`}
                    />
                    <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                <div className="bg-slate-100 p-3 rounded-2xl border-2 border-slate-300 space-y-2">
                  <div className="text-xs text-teal-950 font-black flex items-center justify-between">
                    <span>{isRtl ? "حماية مضافة (استرداد بمستند الأمان)" : "Additional Security (Recovery Question)"}</span>
                    <span className="text-[10px] bg-teal-200 text-teal-950 px-1.5 py-0.5 rounded font-black">{isRtl ? "سؤال الأمان" : "Security Question"}</span>
                  </div>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-950 outline-none cursor-pointer"
                  >
                    <option value="ما هو اسم مدينتك المفضلة؟">{isRtl ? "ما هو اسم مدينتك المفضلة؟" : "What is your favorite city?"}</option>
                    <option value="ما اسم أول حيوان أليف قمت ببيعه أو تربيته؟">{isRtl ? "ما اسم أول حيوان أليف تربيته؟" : "What was the name of your first pet?"}</option>
                    <option value="ما هي علامة تجارية لأول سيارة تملكها؟">{isRtl ? "ما هي علامة تجارية لأول سيارة؟" : "What was the brand of your first car?"}</option>
                    <option value="ما هو اسم مدرستك الابتدائية؟">{isRtl ? "ما هو اسم مدرستك الابتدائية؟" : "What was the name of your primary school?"}</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder={isRtl ? "إجابة الأمان الذكية السرية" : "Secret security answer"}
                    className="w-full p-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{t('auth.register_btn', 'تسجيل حساب معتمد فوري')}</span>
                </button>
              </motion.form>
            )}

            {view === 'forgot' && (
              <motion.form 
                key="forgot-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetRequest} 
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{isRtl ? "البريد الإلكتروني المفقود" : "Registered Email"}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={isRtl ? "أدخل بريدك المعياري للبحث في النظام" : "Enter email to locate account"}
                      className={`w-full ${isRtl ? 'pl-3 pr-10' : 'pr-3 pl-10'} py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs`}
                    />
                    <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>{isRtl ? "جلب سؤال الأمان للتحقق" : "Fetch Security Question"}</span>
                </button>
              </motion.form>
            )}

            {view === 'reset-submit' && (
              <motion.form 
                key="reset-submit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetSubmit} 
                className="space-y-3.5"
              >
                <div className="bg-teal-100 p-3.5 rounded-2xl border-2 border-teal-300 text-teal-950 mb-1">
                  <span className="text-xs text-teal-900 font-black block">{isRtl ? "سؤال الأمان المسجل:" : "Registered Security Question:"}</span>
                  <p className="text-xs font-black mt-0.5 text-slate-950">{fetchedQuestion}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{isRtl ? "إجابة سؤال الأمان" : "Security Question Answer"}</label>
                  <input
                    type="text"
                    required
                    value={resetAnswer}
                    onChange={(e) => setResetAnswer(e.target.value)}
                    placeholder={isRtl ? "إجابتك المسجلة مسبقاً" : "Your registered answer"}
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">{isRtl ? "كلمة المرور الجديدة" : "New Password"}</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRtl ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-rose-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>{isRtl ? "تأكيد الإجابة وإعادة تعيين كلمة المرور" : "Confirm Answer & Reset Password"}</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Selector Switch Footer */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] leading-none" style={{ direction: dir }}>
            {view === 'login' ? (
              <p className="text-slate-500">
                {isRtl ? "ليس لديك حساب؟ " : "Don't have an account? "}
                <button 
                  onClick={() => { setView('register'); setError(null); }}
                  className="text-teal-600 font-extrabold hover:underline cursor-pointer focus:outline-none"
                >
                  {isRtl ? "سجل الآن مجاناً" : "Register now"}
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                {isRtl ? "لديك حساب بالفعل؟ " : "Already have an account? "}
                <button 
                  onClick={() => { setView('login'); setError(null); }}
                  className="text-teal-600 font-extrabold hover:underline cursor-pointer focus:outline-none"
                >
                  {isRtl ? "سجل الدخول فوراً" : "Log in directly"}
                </button>
              </p>
            )}

            {/* Quick Helper Pre-Fill Button */}
            <button
              onClick={() => {
                if (view === 'login') {
                  handleQuickAutoLogin(role || 'patient');
                } else {
                  handlePrefill(view === 'register' ? registerRole : (role || 'patient'));
                }
              }}
              className="text-[10px] bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 space-x-reverse focus:outline-none"
            >
              <span>⚡ {isRtl ? `تجربة تعبئة تلقائية (${view === 'register' ? (registerRole === 'patient' ? "مريض" : registerRole === 'pharmacist' ? "صيدلي" : "أدمن") : (role === 'pharmacist' ? "صيدلي" : "مريض")})` : `Demo Fill (${role})`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
