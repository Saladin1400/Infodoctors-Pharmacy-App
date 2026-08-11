/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { 
  Phone, Users, BarChart3, Pill, ShieldAlert, Sparkles, 
  Lock, LogOut, ArrowRight, ShieldCheck, CheckCircle2,
  ChevronRight, KeyRound, AlertCircle, X, Sliders, Globe
} from "lucide-react";
import MobilePatientSimulator from "./components/MobilePatientSimulator";
import PharmacistWorkspace from "./components/PharmacistWorkspace";
import AdminPanel from "./components/AdminPanel";
import { PatientProfile } from "./types";
import { DEFAULT_PATIENTS } from "./defaultData";
import { useLanguage, LanguageSwitcher } from "./LanguageContext";

export default function App() {
  const { t, language, isRtl, dir } = useLanguage();

  // Active Portal router: 'gateway' | 'patient' | 'pharmacist' | 'admin'
  const [activePortal, setActivePortal] = useState<'gateway' | 'patient' | 'pharmacist' | 'admin'>('gateway');

  // Platform detection: Check if running inside Capacitor native mobile app (Android/iOS)
  const checkIsNativeMobile = (): boolean => {
    if (typeof window !== "undefined") {
      const cap = (window as any).Capacitor;
      if (cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) {
        return true;
      }
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("platform") === "mobile") return true;
      if (urlParams.get("platform") === "web") return false;
    }
    return false;
  };

  const [isMobile, setIsMobile] = useState<boolean>(checkIsNativeMobile);
  const [footerClicks, setFooterClicks] = useState<number>(0);

  useEffect(() => {
    const native = checkIsNativeMobile();
    setIsMobile(native);

    // On mobile platform: restrict active portal to 'patient' or 'gateway'
    if (native && (activePortal === 'pharmacist' || activePortal === 'admin')) {
      setActivePortal('patient');
    }
  }, []);

  // Secret Admin Access triggers for Web Browser version
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Check URL query parameters (e.g., ?admin=true or ?portal=admin)
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true" || params.get("portal") === "admin") {
        setShowAdminPinModal(true);
      }
    }

    // 2. Keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminPinModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  
  // Real patient records fetched from custom API
  const [patients, setPatients] = useState<PatientProfile[]>(DEFAULT_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>("29010151234567");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // JWT Authentication states
  const [patientUser, setPatientUser] = useState<any>(null);
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [pharmacistUser, setPharmacistUser] = useState<any>(null);
  const [pharmacistToken, setPharmacistToken] = useState<string | null>(null);

  // Admin Security modal states
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminPinError, setAdminPinError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Stats indicator inside the main workspace
  const [updatesCounter, setUpdatesCounter] = useState(0);

  useEffect(() => {
    // Sync patient session
    const pToken = localStorage.getItem("patient_jwt_token");
    const pUser = localStorage.getItem("patient_user");
    if (pToken && pUser) {
      try {
        setPatientToken(pToken);
        const parsedUser = JSON.parse(pUser);
        setPatientUser(parsedUser);
        if (parsedUser.nationalId) {
          setActivePatientId(parsedUser.nationalId);
        }
      } catch (e) {
        console.error("Error loading cached patient JWT:", e);
      }
    }

    // Sync pharmacist session
    const phToken = localStorage.getItem("pharmacist_jwt_token");
    const phUser = localStorage.getItem("pharmacist_user");
    if (phToken && phUser) {
      try {
        setPharmacistToken(phToken);
        setPharmacistUser(JSON.parse(phUser));
      } catch (e) {
        console.error("Error loading cached pharmacist JWT:", e);
      }
    }
  }, []);

  // Determine starting portal based on cached auth or user selection
  useEffect(() => {
    if (pharmacistUser && activePortal === 'gateway') {
      setActivePortal('pharmacist');
    } else if (patientUser && activePortal === 'gateway') {
      setActivePortal('patient');
    }
  }, [pharmacistUser, patientUser]);

  const handlePatientAuthSuccess = (token: string, user: any) => {
    setPatientToken(token);
    setPatientUser(user);
    localStorage.setItem("patient_jwt_token", token);
    localStorage.setItem("patient_user", JSON.stringify(user));
    if (user.nationalId) {
      setActivePatientId(user.nationalId);
    }
    setActivePortal('patient');
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePatientLogout = () => {
    setPatientToken(null);
    setPatientUser(null);
    localStorage.removeItem("patient_jwt_token");
    localStorage.removeItem("patient_user");
    setActivePortal('gateway');
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePharmacistAuthSuccess = (token: string, user: any) => {
    setPharmacistToken(token);
    setPharmacistUser(user);
    localStorage.setItem("pharmacist_jwt_token", token);
    localStorage.setItem("pharmacist_user", JSON.stringify(user));
    setActivePortal('pharmacist');
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePharmacistLogout = () => {
    setPharmacistToken(null);
    setPharmacistUser(null);
    localStorage.removeItem("pharmacist_jwt_token");
    localStorage.removeItem("pharmacist_user");
    setActivePortal('gateway');
    setUpdatesCounter(prev => prev + 1);
  };

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const res = await fetch("/api/v1/records");
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        if (data.length > 0 && !activePatientId) {
          setActivePatientId(data[0].nationalId);
        }
      }
    } catch (err) {
      console.error("Error loading patient records:", err);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [updatesCounter]);

  const handleAdminAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdminPinError(null);
    if (adminPinInput === "1234" || adminPinInput.toLowerCase() === "admin") {
      setIsAdminAuthenticated(true);
      setShowAdminPinModal(false);
      setAdminPinInput("");
      setActivePortal('admin');
    } else {
      setAdminPinError("رمز الأمان الخاص بالإدارة غير صحيح. (الرمز الافتراضي: 1234)");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Top Header Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md py-3.5 px-6 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4" style={{ direction: dir }}>
          
          {/* Main Brand Title & Logo */}
          <div 
            onClick={() => setActivePortal('gateway')}
            className={`flex items-center gap-3 cursor-pointer group ${isRtl ? 'flex-row' : 'flex-row'}`}
          >
            <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{isRtl ? "إنفو دكتورز" : "Info Doctors"}</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono border border-teal-500/30">
                  {activePortal === 'pharmacist' 
                    ? t('portal.pharmacist', 'مكتب الدكتور الصيدلي') 
                    : activePortal === 'patient' 
                      ? t('portal.patient', 'تطبيق المستخدم') 
                      : activePortal === 'admin' 
                        ? t('portal.admin', 'لوحة الإدارة') 
                        : (isRtl ? 'منصة الرعاية الصحية' : 'Healthcare Platform')}
                </span>
              </h1>
              <p className="text-[10.5px] text-slate-400 font-medium">
                {isRtl ? "منظومة الرعاية الصيدلانية الموحدة والخدمات الطبية بمصر" : "Unified Clinical Pharmacy & Medical Care System in Egypt"}
              </p>
            </div>
          </div>

          {/* User Status / Portal Actions */}
          <div className="flex items-center gap-3 text-xs">
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Active User Indicator */}
            {activePortal === 'pharmacist' && pharmacistUser && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-200">{isRtl ? `د. ${pharmacistUser.fullName || "الصيدلي الإكلينيكي"}` : `Dr. ${pharmacistUser.fullName || "Clinical Pharmacist"}`}</span>
                <span className="text-[10px] text-slate-400">({pharmacistUser.licenseNumber || "LIC-12345"})</span>
              </div>
            )}

            {activePortal === 'patient' && patientUser && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="font-bold text-slate-200">{isRtl ? `المريض: ${patientUser.fullName || "أحمد علي"}` : `Patient: ${patientUser.fullName || "Ahmed Ali"}`}</span>
              </div>
            )}

            {activePortal === 'admin' && (
              <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-3 py-1.5 rounded-2xl font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? "جلسة مدير النظام نشطة" : "Active Admin Session"}</span>
              </div>
            )}

            {/* Portal Navigation & Actions */}
            <div className="flex items-center gap-2">
              {activePortal !== 'gateway' && (
                <button
                  onClick={() => setActivePortal('gateway')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1 text-xs cursor-pointer focus:outline-none"
                >
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                  <span>{t('portal.switch', 'تبديل البوابة')}</span>
                </button>
              )}

              {/* Admin Session Indicator (shown ONLY when admin is currently authenticated & active) */}
              {activePortal === 'admin' && (
                <button
                  onClick={() => setActivePortal('admin')}
                  className="bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/50 text-indigo-300 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer focus:outline-none"
                  title={isRtl ? "لوحة الإدارة" : "Admin Panel"}
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('portal.admin', 'لوحة الإدارة')}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Body Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* GATEWAY LANDING VIEW */}
        {activePortal === 'gateway' && (
          <div className="space-y-8 max-w-5xl mx-auto py-6" style={{ direction: "rtl" }}>
            
            {/* Gateway Hero Banner */}
            <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-teal-50 text-teal-800 px-3 py-1 rounded-full text-xs font-black border border-teal-200/60">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>اختر البوابة للبدء مباشرة</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                أهلاً بك في منصة الرعاية الصحية
              </h2>
              <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                تطبيق متكامل يتيح للمرضى حجز الاستشارات ورفع الملفات، ويمنح الصيادلة أدوات التدقيق الدوائي بالذكاء الاصطناعي (DUR) وإصدار التقارير المعتمدة، مع لوحة إدارة مركزية.
              </p>
            </div>

            {/* Portal Cards Grid (Filtered according to platform: Mobile vs Web) */}
            <div className={`grid grid-cols-1 ${isMobile ? 'max-w-md mx-auto' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-6`}>
              
              {/* Card 1: Patient Portal (Always Visible on Mobile & Web) */}
              <div className="bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">بوابة الجمهور</span>
                    <h3 className="text-lg font-black text-slate-900 mt-1 text-center">تطبيق المستخدم</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    من خلال هذه البوابة يمكن للمريض تسجيل حساب جديد، إضافة المرافقين، حجز استشارات OTC، تتبع منبهات الأدوية، واستلام التقارير الطبية المعتمدة.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActivePortal('patient')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-teal-600/15 cursor-pointer focus:outline-none"
                  >
                    <span>الدخول لبوابة المستخدم</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>

                  {patientUser && (
                    <div className="text-[10.5px] text-teal-700 font-bold bg-teal-50 p-2 rounded-xl border border-teal-100 flex items-center justify-between px-3">
                      <span>جلسة نشطة: {patientUser.fullName || patientUser.email}</span>
                      <button 
                        onClick={handlePatientLogout}
                        className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer text-[10px]"
                      >
                        تسجيل الخروج ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Pharmacist Workspace (Visible on WEB only, hidden on Native Mobile) */}
              {!isMobile && (
                <div className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">مختصي الصيدلة الإكلينيكية</span>
                      <h3 className="text-lg font-black text-slate-900 mt-1 text-center">مكتب الدكتور الصيدلي</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      مساحة عمل الصيدلي لفحص الروشتات وطابور الاستشارات المباشرة، إجراء الفحص الآلي للتعارضات الدوائية والحساسية بالذكاء الاصطناعي، وتوثيق التقارير.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActivePortal('pharmacist')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-emerald-600/15 cursor-pointer focus:outline-none"
                    >
                      <span>الدخول إلى المكتب</span>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>

                    {pharmacistUser && (
                      <div className="text-[10.5px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100 flex items-center justify-between px-3">
                        <span>جلسة نشطة: د. {pharmacistUser.fullName || pharmacistUser.email}</span>
                        <button 
                          onClick={handlePharmacistLogout}
                          className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer text-[10px]"
                        >
                          تسجيل الخروج ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ACTIVE PORTAL: PATIENT APP */}
        {activePortal === 'patient' && (
          <div className="w-full flex justify-center py-2">
            <MobilePatientSimulator 
              activePatientId={activePatientId}
              setActivePatientId={setActivePatientId}
              onServiceCreated={() => setUpdatesCounter(prev => prev + 1)}
              patients={patients}
              onReloadPatients={() => setUpdatesCounter(prev => prev + 1)}
              currentUser={patientUser}
              onAuthSuccess={handlePatientAuthSuccess}
              onLogout={handlePatientLogout}
            />
          </div>
        )}

        {/* ACTIVE PORTAL: PHARMACIST WORKSPACE */}
        {activePortal === 'pharmacist' && (
          <div className="w-full">
            <PharmacistWorkspace 
              onReportIssued={() => setUpdatesCounter(prev => prev + 1)}
              patients={patients}
              currentUser={pharmacistUser}
              onAuthSuccess={handlePharmacistAuthSuccess}
              onLogout={handlePharmacistLogout}
            />
          </div>
        )}

        {/* ACTIVE PORTAL: ADMIN PANEL */}
        {activePortal === 'admin' && (
          <div className="w-full">
            <AdminPanel />
          </div>
        )}

      </main>

      {/* ADMIN PASSCODE AUTHENTICATION MODAL */}
      {showAdminPinModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[2500] p-4 text-right" style={{ direction: "rtl" }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-extrabold text-white">التحقق من صلاحية الإدارة</h3>
                <p className="text-[10px] text-slate-400">صفحة الأدمن مخصصة للمالك ومشرفي المنصة فقط</p>
              </div>
              <button 
                onClick={() => { setShowAdminPinModal(false); setAdminPinError(null); }}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 w-6 h-6 rounded-lg flex items-center justify-center focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">رمز أمان الأدمن (Admin Passcode):</label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="أدخل رمز الدخول (الرمز الافتراضي: 1234)"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-mono outline-none focus:border-indigo-500 focus:bg-slate-950 text-right"
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {adminPinError && (
                <div className="bg-rose-950/60 border border-rose-800/80 p-2.5 rounded-xl text-rose-300 text-[11px] font-bold flex items-center space-x-2 space-x-reverse">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{adminPinError}</span>
                </div>
              )}

              <div className="flex space-x-2 space-x-reverse pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md focus:outline-none"
                >
                  تأكيد ودخول الأدمن ➔
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdminPinModal(false); setAdminPinError(null); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs transition-all focus:outline-none"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Primary Footer */}
      <footer className="bg-slate-900 border-t border-slate-850 py-5 text-center text-slate-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 font-sans text-center md:text-right">
            حقوق الطبع والنشر © 2026 InfoDoctors. منصة العيادة والتدقيق الصيدلاني المعتمدة للالتزام العلاجي.
          </p>
          <div className="flex items-center gap-2">
            {/* Secret Footer Lock Trigger for Admin Login */}
            <button
              onClick={() => {
                const next = footerClicks + 1;
                setFooterClicks(next);
                if (next >= 3) {
                  setShowAdminPinModal(true);
                  setFooterClicks(0);
                }
              }}
              type="button"
              className="text-slate-600 hover:text-slate-400 transition-colors p-1 rounded cursor-pointer text-[10px] flex items-center gap-1 focus:outline-none"
              title="InfoDoctors Secure Platform"
            >
              <Lock className="w-3 h-3 text-slate-700 hover:text-slate-500" />
              <span className="font-mono text-slate-700 hover:text-slate-500">v2.6-sys</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
