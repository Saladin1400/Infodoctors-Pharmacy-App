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

interface AuthInterfaceProps {
  role?: 'patient' | 'pharmacist' | 'admin';
  onAuthSuccess: (token: string, user: any) => void;
  onLogout?: () => void;
  currentUser?: any;
}

export default function AuthInterface({ role = 'patient', onAuthSuccess, onLogout, currentUser }: AuthInterfaceProps) {
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
        throw new Error(data.error || "فشل تسجيل الدخول التلقائي");
      }

      setSuccess(`تم تسجيل الدخول كـ (${targetRole === 'patient' ? "مريض" : targetRole === 'pharmacist' ? "صيدلي" : "أدمن"}) بنجاح!`);
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
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      setSuccess("تم تسجيل الدخول بنجاح! جاري تحميل الجلسة الموثقة...");
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
    if (registerRole === 'patient' && !nationalId) {
      setError("الرقم القومي مطلوب لتسجيل حساب مريض");
      setIsLoading(false);
      return;
    }
    if (registerRole === 'pharmacist' && !licenseNumber) {
      setError("رقم ترخيص مزاولة المهنة مطلوب لحساب الصيدلي");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        email,
        password,
        role: registerRole,
        fullName,
        nationalId: registerRole === 'patient' ? nationalId : undefined,
        licenseNumber: registerRole === 'pharmacist' ? licenseNumber : undefined,
        securityQuestion,
        securityAnswer
      };

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب المهني");
      }

      setSuccess("تم إنشاء حسابك المعتمد بنجاح وتوليد رمز جلسة JWT!");
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
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل البحث عن الحساب");
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
        throw new Error(data.error || "فشل إعادة تعيين كلمة المرور");
      }

      setSuccess("تمت إعادة تعيين كلمة مرورك بأمان! يرجى تسجيل الدخول.");
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
    <div className="w-full font-sans text-right" style={{ direction: "rtl" }}>
      {/* If already logged in, show elegant session widget */}
      {currentUser ? (
        <div className="bg-slate-900 border border-teal-900/60 p-4 rounded-3xl text-slate-200 shadow-xl space-y-3.5">
          <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-2xl border border-slate-900">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-teal-400 flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              <span>مؤمن بـ JWT</span>
            </span>
            <div className="flex items-center space-x-2 space-x-reverse text-right">
              <Fingerprint className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white">جلسة نشطة موثقة</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">الاسم الكامل:</span>
              <span className="font-bold text-white">{currentUser.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">البريد الإلكتروني:</span>
              <span className="font-mono text-white text-[11px]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-950/40">
              <span className="text-slate-400">صلاحية النظام:</span>
              <span className="bg-teal-900/40 text-teal-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                {currentUser.role === 'patient' ? "مريض معتمد" : currentUser.role === 'pharmacist' ? "صيدلي إكلينيكي" : "مدير نظام (Admin)"}
              </span>
            </div>
            
            {currentUser.nationalId ? (
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">الرقم القومي:</span>
                <span className="font-mono text-teal-400">{currentUser.nationalId}</span>
              </div>
            ) : currentUser.licenseNumber ? (
              <div className="flex justify-between py-1 border-b border-slate-950/40">
                <span className="text-slate-400">مزاولة المهنة:</span>
                <span className="font-mono text-teal-400">{currentUser.licenseNumber}</span>
              </div>
            ) : null}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-2 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-350 hover:text-white rounded-2xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse"
            >
              <span>تسجيل الخروج وإنهاء جلسة JWT</span>
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
              {role === 'patient' ? "بوابة دخول المريض الرقمية" : role === 'pharmacist' ? "بوابة تدقيق الصيدلي الإكلينيكي" : "بوابة مدير النظام الإكلينيكي"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {view === 'login' ? "سجل دخولك فورا لتنشيط منبهات الأدوية وجلسة المتابعة" : 
               view === 'register' ? "أنشئ حساباً جديداً متكاملاً مع تشفير الجلسات" : "استرداد آمن بأسئلة الأمان المقاومة للاختراق"}
            </p>
          </div>

          {/* Flash Feedback */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100/80 rounded-2xl text-[10.5px] text-rose-700 flex items-center space-x-2 space-x-reverse font-medium text-right">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10.5px] text-emerald-700 flex items-center space-x-2 space-x-reverse font-medium text-right">
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
                className="space-y-3.5 text-right"
              >
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">البريد الإلكتروني المعتمد</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@mail.eg"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black outline-none focus:border-teal-600 focus:bg-white text-right font-sans text-slate-950 placeholder:text-slate-500 shadow-xs"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور السرية</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black outline-none focus:border-teal-600 focus:bg-white text-right font-sans text-slate-950 placeholder:text-slate-500 shadow-xs"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(null); }}
                    className="text-xs text-teal-800 hover:text-teal-950 font-black transition-colors cursor-pointer focus:outline-none underline"
                  >
                    نسيت كلمة المرور؟ استرداد الحساب
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                  >
                    {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>تسجيل الدخول الآمن (JWT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAutoLogin(role || 'patient')}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-400 text-emerald-950 font-black rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse"
                  >
                    <span>⚡ تعبئة تلقائية ودخول مباشر ({role === 'pharmacist' ? "صيدلي" : role === 'admin' ? "أدمن" : "مريض"})</span>
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
                className="space-y-3 text-right"
              >
                {/* ROLE SELECTION COMPONENT: patient, pharmacist, admin */}
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1.5">اختر فئة وصلاحية المستخدم</label>
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
                      مريض (Patient)
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
                      صيدلي (Pharmacist)
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
                      مدير (Admin)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">الاسم ثلاثي أو رباعي</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل الاسم الحقيقي المتطابق مع الهوية"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">البريد الإلكتروني المعتمد</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.eg"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                {registerRole === 'patient' && (
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">الرقم القومي (14 رقم)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                        placeholder="29505202712345"
                        className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right font-mono shadow-xs"
                      />
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                )}

                {registerRole === 'pharmacist' && (
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">رقم ترخيص مزاولة المهنة (نقابة الصيادلة)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="LIC-12345"
                        className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right font-mono shadow-xs"
                      />
                      <ShieldAlert className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                )}

                {registerRole === 'admin' && (
                  <div className="bg-amber-100 p-3 rounded-2xl border-2 border-amber-300 text-right">
                    <span className="text-xs text-amber-950 font-black uppercase block">مدير نظام مؤمن بالكامل (Admin)</span>
                    <p className="text-[11px] text-amber-900 font-bold leading-tight mt-0.5">لا يتطلب حساب المشرف إدخال رقم قومي أو ترخيص مزاولة رعاية صحية.</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 خانات على الأقل"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <div className="bg-slate-100 p-3 rounded-2xl border-2 border-slate-300 space-y-2">
                  <div className="text-xs text-teal-950 font-black flex items-center justify-between">
                    <span>حماية مضافة (استرداد بمستند الأمان)</span>
                    <span className="text-[10px] bg-teal-200 text-teal-950 px-1.5 py-0.5 rounded font-black">سؤال الأمان</span>
                  </div>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-950 outline-none cursor-pointer"
                  >
                    <option value="ما هو اسم مدينتك المفضلة؟">ما هو اسم مدينتك المفضلة؟</option>
                    <option value="ما اسم أول حيوان أليف قمت ببيعه أو تربيته؟">ما اسم أول حيوان أليف تربيته؟</option>
                    <option value="ما هي علامة تجارية لأول سيارة تملكها؟">ما هي علامة تجارية لأول سيارة؟</option>
                    <option value="ما هو اسم مدرستك الابتدائية؟">ما هو اسم مدرستك الابتدائية؟</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="إجابة الأمان الذكية السرية"
                    className="w-full p-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 text-right shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>تسجيل حساب معتمد فوري</span>
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
                className="space-y-3.5 text-right"
              >
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">البريد الإلكتروني المفقود</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="أدخل بريدك المعياري للبحث في النظام"
                      className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>جلب سؤال الأمان للتحقق</span>
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
                className="space-y-3.5 text-right"
              >
                <div className="bg-teal-100 p-3.5 rounded-2xl border-2 border-teal-300 text-teal-950 mb-1">
                  <span className="text-xs text-teal-900 font-black block">سؤال الأمان المسجل:</span>
                  <p className="text-xs font-black mt-0.5 text-right text-slate-950">{fetchedQuestion}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">إجابة سؤال الأمان</label>
                  <input
                    type="text"
                    required
                    value={resetAnswer}
                    onChange={(e) => setResetAnswer(e.target.value)}
                    placeholder="إجابتك المسجلة مسبقاً"
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-black text-slate-950 placeholder:text-slate-500 outline-none focus:border-teal-600 focus:bg-white text-right shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-rose-700/20"
                >
                  {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>تأكيد الإجابة وإعادة تعيين كلمة المرور</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Selector Switch Footer */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-right text-[11px] leading-none" style={{ direction: "rtl" }}>
            {view === 'login' ? (
              <p className="text-slate-500">
                ليس لديك حساب؟{" "}
                <button 
                  onClick={() => { setView('register'); setError(null); }}
                  className="text-teal-600 font-extrabold hover:underline cursor-pointer focus:outline-none"
                >
                  سجل الآن مجاناً
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                لديك حساب بالفعل؟{" "}
                <button 
                  onClick={() => { setView('login'); setError(null); }}
                  className="text-teal-600 font-extrabold hover:underline cursor-pointer focus:outline-none"
                >
                  سجل الدخول فوراً
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
              <span>⚡ تجربة تعبئة تلقائية ({view === 'register' ? (registerRole === 'patient' ? "مريض" : registerRole === 'pharmacist' ? "صيدلي" : "أدمن") : (role === 'pharmacist' ? "صيدلي" : "مريض")})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
