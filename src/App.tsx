/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Phone, Users, BarChart3, Pill, Settings, ShieldAlert, Sparkles, 
  HelpCircle, CheckCircle2, Heart, HeartPulse
} from "lucide-react";
import MobilePatientSimulator from "./components/MobilePatientSimulator";
import PharmacistWorkspace from "./components/PharmacistWorkspace";
import AdminPanel from "./components/AdminPanel";
import { PatientProfile } from "./types";

export default function App() {
  // Navigation tabs for the prototype reviewer
  const [activeTab, setActiveTab] = useState<'patient' | 'pharmacist' | 'admin'>('patient');
  
  // Real patient records fetched from custom API
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>("29010151234567");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // JWT Authentication states
  const [patientUser, setPatientUser] = useState<any>(null);
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [pharmacistUser, setPharmacistUser] = useState<any>(null);
  const [pharmacistToken, setPharmacistToken] = useState<string | null>(null);

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

  const handlePatientAuthSuccess = (token: string, user: any) => {
    setPatientToken(token);
    setPatientUser(user);
    localStorage.setItem("patient_jwt_token", token);
    localStorage.setItem("patient_user", JSON.stringify(user));
    if (user.nationalId) {
      setActivePatientId(user.nationalId);
    }
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePatientLogout = () => {
    setPatientToken(null);
    setPatientUser(null);
    localStorage.removeItem("patient_jwt_token");
    localStorage.removeItem("patient_user");
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePharmacistAuthSuccess = (token: string, user: any) => {
    setPharmacistToken(token);
    setPharmacistUser(user);
    localStorage.setItem("pharmacist_jwt_token", token);
    localStorage.setItem("pharmacist_user", JSON.stringify(user));
    setUpdatesCounter(prev => prev + 1);
  };

  const handlePharmacistLogout = () => {
    setPharmacistToken(null);
    setPharmacistUser(null);
    localStorage.removeItem("pharmacist_jwt_token");
    localStorage.removeItem("pharmacist_user");
    setUpdatesCounter(prev => prev + 1);
  };

  // Stats indicator inside the main workspace
  const [updatesCounter, setUpdatesCounter] = useState(0);

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const res = await fetch("/api/v1/records");
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        // Set default to Ahmed Aly if present
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      
      {/* Top Main Branding Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-xs py-4 px-6 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 space-x-reverse justify-end" style={{ direction: "rtl" }}>
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Pill className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-right">
              <h1 className="text-base font-black tracking-tight text-teal-800">إنفو دكتورز لـ دكتور الصيدلية</h1>
              <p className="text-[10.5px] text-slate-400 font-medium">المنصة الإكلينيكية الموحدة للخدمات الصيدلانية المدفوعة مسبقاً بمصر</p>
            </div>
          </div>

          {/* Prototype Interface Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin' 
                  ? 'bg-indigo-650 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ direction: "rtl" }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>لوحة المدراء والتحكم (Admin Panel)</span>
            </button>
            <button
              onClick={() => setActiveTab('pharmacist')}
              className={`flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pharmacist' 
                  ? 'bg-teal-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ direction: "rtl" }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>مستودع تدقيق الصيدلي (Pharmacist)</span>
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'patient' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ direction: "rtl" }}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>تطبيق المريض (Mobile Simulator)</span>
            </button>
          </div>

          {/* Quick Stats Header Indicator */}
          <div className="hidden lg:flex items-center space-x-3 space-x-reverse text-right bg-slate-50 p-2 px-3 rounded-2xl border border-slate-200" style={{ direction: "rtl" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="text-[11px] text-slate-500 leading-tight">
              أنظمة ساب مدمجة: <strong className="text-slate-700">مكتملة</strong>
              <p className="text-[9.5px] text-slate-405">تغييرات سريعة في البيئة المبرمجة</p>
            </div>
          </div>

        </div>
      </header>

      {/* Primary Workstation Dashboard Core */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT ORCHESTRATOR SIDEBAR (Guidance notes for the client evaluating) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-right" style={{ direction: "rtl" }}>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded font-bold uppercase">البروتوتايب والسيناريوهات</span>
              <h2 className="text-md font-bold text-slate-850 mt-1">دليل تجربة الرفع والـ DDI</h2>
              <p className="text-[11px] text-slate-500">تم دمج سيناريوهين طبيين معقدين بالمستند لإظهار فاعلية التدقيق الصيدلاني:</p>
            </div>

            <div className="space-y-3 shrink-0">
              
              {/* Scenario Item 1 */}
              <div 
                className={`p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                  activePatientId === "29010151234567" 
                    ? "bg-slate-50 border-teal-500 shadow-sm"
                    : "border-slate-100 bg-white hover:bg-slate-50"
                }`}
                onClick={() => {
                  setActivePatientId("29010151234567");
                  setActiveTab('patient');
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded">حساسية ضد الأسبرين</span>
                  <h4 className="font-bold text-xs text-slate-800">أحمد محمد علي</h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">مصاب بضغط مرتفع. إذا قمت كصيدلي بطلب مراجعة روشتة عظام تحتوى على الأسبرين، سيفحص الذكاء الاصطناعي تفاعلات الحساسية ويطلق تنبيهاً أحمر خطيراً!</p>
              </div>

              {/* Scenario Item 2 */}
              <div 
                className={`p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                  activePatientId === "29505202712345" 
                    ? "bg-slate-50 border-teal-500 shadow-sm"
                    : "border-slate-100 bg-white hover:bg-slate-50"
                }`}
                onClick={() => {
                  setActivePatientId("29505202712345");
                  setActiveTab('patient');
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">حامل بالأسبوع السلوكي</span>
                  <h4 className="font-bold text-xs text-slate-800">سارة ممدوح</h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">تسأل عن أدوية الصداع والبرد البروفين والكلارينيز. سيفحص الذكاء الاصطناعي ويطلق تحذيراً لعدم أمان الأدوية أثناء الحمل مع التوصية بالبنادول الآمن.</p>
              </div>

            </div>

            {/* Quick Audit explanation banner */}
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl space-y-1">
              <span className="text-emerald-800 text-[11px] font-bold block">🛡️ تدقيق آمن معتمد</span>
              <p className="text-[10px] text-emerald-700 leading-normal">
                كل عملية سداد لخدمة بالـ Mobile Patient App تقوم بتحديث طابور العمليات (Triage) للصيادلة وتنعكس المفاصل المالية مباشرة في Admin Panel.
              </p>
            </div>
          </div>

          {/* RIGHT AREA: Active selected Tab layout */}
          <div className="lg:col-span-9">
            
            {activeTab === 'patient' && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-150/40 border border-slate-200 p-4 rounded-3xl">
                
                {/* Visual Simulator explanation left */}
                <div className="flex-1 text-right max-w-[420px]" style={{ direction: "rtl" }}>
                  <span className="text-[10.5px] bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full">المنتج 2: محاكي تطبيق المريض الموبايل Flutter</span>
                  <h3 className="text-lg font-black text-slate-850 mt-2 mb-2">الراحة التامة والخدمات السريرية في مصر</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    يمكن للمريض رفع الملف، وإضافة المرافقين (التابعين)، وطلب الاستشارة، وتجربتها في الحال. عند تأكيد الحجز ستسمع جرس التنبيه وتتحول الحالة للصيدلي لتوفير العناية.
                  </p>
                  
                  <div className="space-y-3.5 pt-2 border-t border-slate-200">
                    <div className="flex items-start space-x-2.5 space-x-reverse justify-end">
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-800 block">إيقاف المخاطر بشكل قبلي</strong>
                        علبة الدواء الرقمية توقظك للامتثال السلوكي والتحذير ضد فصام الأيض.
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5 space-x-reverse justify-end">
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-800 block">سجل تاريخي شامل</strong>
                        بمجرد أن يوقع الصيدلي التقرير، ستتسلمه فوراً في التطبيق الرقمي.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smartphone Simulator */}
                <div className="shrink-0">
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

              </div>
            )}

            {activeTab === 'pharmacist' && (
              <PharmacistWorkspace 
                onReportIssued={() => setUpdatesCounter(prev => prev + 1)}
                patients={patients}
                currentUser={pharmacistUser}
                onAuthSuccess={handlePharmacistAuthSuccess}
                onLogout={handlePharmacistLogout}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel />
            )}

          </div>

        </div>

      </main>

      {/* Primary footer */}
      <footer className="bg-slate-900 border-t border-slate-850 py-5 text-center text-slate-405 text-xs mt-auto">
        <p className="text-slate-500 font-sans">
          حقوق الطبع والنشر © 2026 InfoDoctors. منصة العيادة والتدقيق الصيدلاني المعتمدة للالتزام العلاجي.
        </p>
      </footer>

    </div>
  );
}
