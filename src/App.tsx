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
import { useLanguage, LanguageSwitcher } from "./LanguageContext";

export default function App() {
  const { t, language, isRtl, dir } = useLanguage();

  // Active Portal router: 'gateway' | 'patient' | 'pharmacist' | 'admin'
  const [activePortal, setActivePortal] = useState<'gateway' | 'patient' | 'pharmacist' | 'admin'>('gateway');

  
  // Real patient records fetched from custom API
  const [patients, setPatients] = useState<PatientProfile[]>([]);
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

  // Demo Drawer Toggle (Collapsible for testing scenarios)
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

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
                    ? t('portal.pharmacist', 'مستودع الصيدلي') 
                    : activePortal === 'patient' 
                      ? t('portal.patient', 'تطبيق المريض') 
                      : activePortal === 'admin' 
                        ? t('portal.admin', 'لوحة الإدارة') 
                        : (isRtl ? 'المنصة الطبية' : 'Medical Platform')}
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

              {/* Admin Button (Restricted) */}
              {activePortal !== 'admin' && (
                <button
                  onClick={() => {
                    if (isAdminAuthenticated) {
                      setActivePortal('admin');
                    } else {
                      setShowAdminPinModal(true);
                    }
                  }}
                  className="bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/50 text-indigo-300 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer focus:outline-none"
                  title={isRtl ? "دخول لوحة تحكم الإدارة المركزية" : "Enter Admin Panel"}
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('portal.admin', 'لوحة الإدارة')}</span>
                </button>
              )}

              {/* Optional Demo Scenarios Drawer Button */}
              <button
                onClick={() => setShowDemoDrawer(!showDemoDrawer)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-all flex items-center gap-1 text-xs cursor-pointer focus:outline-none"
                title={isRtl ? "تفعيل لوحة الحالات الاختبارية التجريبية" : "Toggle test cases panel"}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{isRtl ? "حالات الاختبار" : "Test Cases"}</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* DEMO DRAWER (Collapsible top banner for reviewers testing specific medical scenarios) */}
      {showDemoDrawer && (
        <div className="bg-amber-950/90 border-b border-amber-800/60 text-amber-100 p-3 px-6 text-right animate-in slide-in-from-top duration-200" style={{ direction: "rtl" }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white block">لوحة الحالات والسيناريوهات التجريبية للتدقيق الإكلينيكي:</strong>
                <span className="text-amber-200/80 text-[11px]">يمكنك الضغط على إحدى الحالات أدناه للتبديل الفوري واستعراض تفاعل الذكاء الاصطناعي مع الحساسية والحمل:</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  setActivePatientId("29010151234567");
                  setActivePortal('patient');
                  setShowDemoDrawer(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  activePatientId === "29010151234567" && activePortal === 'patient'
                    ? "bg-red-600 text-white border-red-400 shadow-sm"
                    : "bg-slate-900/80 text-amber-200 border-amber-800/60 hover:bg-slate-800"
                }`}
              >
                1. أحمد محمد علي (حساسية أسبرين) ⚠️
              </button>

              <button
                onClick={() => {
                  setActivePatientId("29505202712345");
                  setActivePortal('patient');
                  setShowDemoDrawer(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  activePatientId === "29505202712345" && activePortal === 'patient'
                    ? "bg-rose-600 text-white border-rose-400 shadow-sm"
                    : "bg-slate-900/80 text-amber-200 border-amber-800/60 hover:bg-slate-800"
                }`}
              >
                2. سارة ممدوح (حامل - فحص الأدوية) 🤰
              </button>

              <button
                onClick={() => setShowDemoDrawer(false)}
                className="text-slate-400 hover:text-white p-1 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* GATEWAY LANDING VIEW */}
        {activePortal === 'gateway' && (
          <div className="space-y-8 max-w-5xl mx-auto py-6" style={{ direction: "rtl" }}>
            
            {/* Gateway Hero Banner */}
            <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-teal-50 text-teal-800 px-3 py-1 rounded-full text-xs font-black border border-teal-200/60">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>اختر البوابة الطبية للبدء مباشرة</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                أهلاً بك في منصة الرعاية الصيدلانية الموحدة
              </h2>
              <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                تطبيق متكامل يتيح للمرضى حجز الاستشارات ورفع الملفات، ويمنح الصيادلة أدوات التدقيق الدوائي بالذكاء الاصطناعي (DUR) وإصدار التقارير المعتمدة، مع لوحة إدارة مركزية.
              </p>
            </div>

            {/* Portal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Patient Portal */}
              <div className="bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">بوابة الجمهور والمرضى</span>
                    <h3 className="text-lg font-black text-slate-850 mt-1 text-center">تطبيق المريض (Mobile App)</h3>
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
                    <span>الدخول لبوابة المريض</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>

                  {patientUser && (
                    <div className="text-[10.5px] text-center text-teal-700 font-bold bg-teal-50 p-1.5 rounded-xl border border-teal-100">
                      جلسة نشطة: {patientUser.fullName || patientUser.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Pharmacist Workspace */}
              <div className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">مختصي الصيدلة الإكلينيكية</span>
                    <h3 className="text-lg font-black text-slate-850 mt-1 text-center">مستودع الصيدلي (Workspace)</h3>
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
                    <span>الدخول لمستودع الصيدلي</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>

                  {pharmacistUser && (
                    <div className="text-[10.5px] text-center text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-xl border border-emerald-100">
                      جلسة نشطة: د. {pharmacistUser.fullName || pharmacistUser.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Admin Central Panel */}
              <div className="bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group md:col-span-2 lg:col-span-1">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-bold">الإدارة والمالية</span>
                    <h3 className="text-lg font-black text-slate-850 mt-1 text-center">لوحة التحكم (Admin Panel)</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    مخصصة لمالك المنصة والإدارة: متابعة الأداء المالي، تقارير العمولات، اعتماد تراخيص الصيادلة الجدد، وتعديل أسعار الخدمات والحملات التسويقية.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (isAdminAuthenticated) {
                        setActivePortal('admin');
                      } else {
                        setShowAdminPinModal(true);
                      }
                    }}
                    className="w-full bg-slate-900 hover:bg-indigo-950 text-indigo-200 font-extrabold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 space-x-reverse border border-indigo-900 shadow-md cursor-pointer focus:outline-none"
                  >
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>دخول لوحة الإدارة 🔒</span>
                  </button>

                  <div className="text-[10px] text-center text-slate-400">
                    محمية بكلمة مرور المشرف (رمز الدخول الافتراضي: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">1234</code>)
                  </div>
                </div>
              </div>

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
        <p className="text-slate-500 font-sans">
          حقوق الطبع والنشر © 2026 InfoDoctors. منصة العيادة والتدقيق الصيدلاني المعتمدة للالتزام العلاجي.
        </p>
      </footer>

    </div>
  );
}
