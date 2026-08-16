import React, { useState } from 'react';
import { 
  Stethoscope, ShieldAlert, CheckCircle2, FileSignature, 
  Search, AlertTriangle, Eye, Video, Sparkles, Filter, 
  Pill, Clock, UserCheck, ShieldCheck, ChevronDown,
  Settings, Moon, Sun, Globe, KeyRound, Lock, Phone, Mail, MapPin, AlertCircle
} from 'lucide-react';

export default function PharmacistWorkspaceApp() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'settings'>('workspace');
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<'all' | 'dur' | 'otc'>('all');
  const [activeAuditId, setActiveAuditId] = useState<string>('REV-104');
  
  // Settings States
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Contact & Profile
  const [phone, setPhone] = useState('01099887766');
  const [email, setEmail] = useState('dr.sara.menshawy@infodoctors.eg');
  const [address, setAddress] = useState('شارع التسعين الشمالي - مجمع العيادات التخصصية');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Internal-Medicine', 'Endocrinology']);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 
    'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 
    'السويس', 'البحر الأحمر', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 
    'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'مطروح', 'البحيرة'
  ];

  const allSpecialties = [
    { key: 'Cardiology', ar: 'أمراض القلب والأوعية الدموية', en: 'Cardiology' },
    { key: 'Endocrinology', ar: 'الغدد الصماء والسكري', en: 'Endocrinology' },
    { key: 'Internal-Medicine', ar: 'الأمراض الباطنية والجهاز الهضمي', en: 'Internal Medicine' },
    { key: 'Pediatrics', ar: 'طب الأطفال وحديثي الولادة', en: 'Pediatrics' },
    { key: 'OB-GYN', ar: 'النساء والتوليد ورعاية الحوامل', en: 'OB-GYN' },
    { key: 'Nephrology', ar: 'أمراض الكلى وضغط الدم', en: 'Nephrology' },
    { key: 'Oncology', ar: 'الأورام والعلاج الكيميائي', en: 'Oncology' },
    { key: 'Critical-Care', ar: 'العناية المركزة والطوارئ', en: 'Critical Care' },
  ];

  const toggleSpecialty = (key: string) => {
    if (selectedSpecialties.includes(key)) {
      if (selectedSpecialties.length === 1) {
        alert(language === 'ar' ? 'يجب اختيار تخصص واحد على الأقل' : 'At least one specialty required');
        return;
      }
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== key));
    } else {
      if (selectedSpecialties.length >= 4) {
        alert(language === 'ar' ? 'الحد الأقصى للتخصصات هو 4 تخصصات فقط طبقاً للوائح الإدارة!' : 'Maximum 4 specialties allowed!');
        return;
      }
      setSelectedSpecialties([...selectedSpecialties, key]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(language === 'ar' ? 'تم حفظ وتحديث بيانات التواصل والتخصصات بنجاح!' : 'Profile & Specialties updated successfully!');
    setTimeout(() => setProfileMsg(''), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      setPasswordMsg({ type: 'error', text: language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter current password' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: language === 'ar' ? 'كلمة المرور يجب ألا تقل عن 6 أحرف' : 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }

    setPasswordMsg({ type: 'success', text: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح وحفظ الجلسة الآمنة!' : 'Password updated successfully!' });
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const pendingRequests = [
    { id: 'REV-104', patient: 'أحمد محمود', age: 34, specialty: 'أمراض باطنة', priority: 'عاجل (DUR)', time: 'منذ 5 د', status: 'قيد التدقيق', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'OTC-209', patient: 'سارة إبراهيم', age: 28, specialty: 'صيدلة عامة', priority: 'عادي', time: 'منذ 15 د', status: 'في الانتظار', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'REV-102', patient: 'محمود عبد الفتاح', age: 62, specialty: 'أمراض كلى وضغط', priority: 'عاجل (تعديل جرعة)', time: 'منذ 25 د', status: 'قيد التدقيق', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  ];

  const isRtl = language === 'ar';

  return (
    <div 
      dir={isRtl ? "rtl" : "ltr"} 
      className={`min-h-screen font-sans p-4 sm:p-6 lg:p-8 transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* HEADER */}
      <header className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b ${
        theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 border border-teal-400/30">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {isRtl ? 'مساحة عمل الصيدلي الإكلينيكي - InfoDoctors' : 'Clinical Pharmacist Workspace - InfoDoctors'}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-mono">
                v4.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isRtl 
                ? 'منصة التدقيق السريري الذكي ومراجعة التفاعلات الدوائية وإصدار التقارير الرقمية' 
                : 'Smart clinical prescription audit, drug-interaction review & digital reporting platform'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tab Toggle */}
          <div className={`p-1 rounded-2xl border flex gap-1 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'workspace' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isRtl ? 'مكتب العمل والحالات' : 'Workspace & Cases'}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isRtl ? 'الإعدادات' : 'Settings'}</span>
            </button>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300">د. سارة المنشاوي</span>
          </div>
        </div>
      </header>

      {/* TAB 1: WORKSPACE */}
      {activeTab === 'workspace' && (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 animate-in fade-in duration-200">
          {/* LEFT COLUMN: QUEUE */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`border rounded-3xl p-4 shadow-xl space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xs font-black flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Clock className="w-4 h-4 text-teal-500" />
                  {isRtl ? 'طابور الحالات الواردة (DUR & OTC)' : 'Incoming Cases Queue'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-500 text-[10px] font-bold">
                  3 {isRtl ? 'طلبات' : 'Cases'}
                </span>
              </div>

              {/* FILTER BUTTONS */}
              <div className={`flex gap-1 p-1 rounded-xl border text-[11px] font-bold ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {(['all', 'dur', 'otc'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedQueueFilter(mode)}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedQueueFilter === mode 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {mode === 'all' ? (isRtl ? 'الكل' : 'All') : mode === 'dur' ? (isRtl ? 'مراجعة DUR' : 'DUR Audit') : (isRtl ? 'استشارات OTC' : 'OTC Consult')}
                  </button>
                ))}
              </div>

              {/* REQUEST LIST */}
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setActiveAuditId(req.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      activeAuditId === req.id
                        ? theme === 'dark' ? 'bg-slate-800/90 border-teal-500 shadow-md' : 'bg-teal-50 border-teal-500 shadow-md'
                        : theme === 'dark' ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-mono font-bold text-teal-500">{req.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${req.badge}`}>
                        {req.priority}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{req.patient} ({req.age} سنة)</h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">{req.specialty} • {req.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE AUDIT BENCH */}
          <div className="lg:col-span-8 space-y-4">
            <div className={`border rounded-3xl p-6 shadow-xl space-y-5 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-teal-500 font-bold">CASE REF: {activeAuditId}</span>
                  <h2 className={`text-base font-black mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    أحمد محمود سليمان - تدقيق وصفة طبية (DUR Pre-Audit)
                  </h2>
                  <p className="text-xs text-slate-400">تاريخ الرفع: اليوم 12:40 م • تشخيص: ارتفاع ضغط الدم والسكري النوع الثاني</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer">
                    <Video className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isRtl ? 'فتح عيادة الفيديو' : 'Open Video'}</span>
                  </button>
                  <button className="flex-1 sm:flex-none px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 cursor-pointer">
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'اعتماد التقرير السريري' : 'Sign Report'}</span>
                  </button>
                </div>
              </div>

              {/* SAFETY PRE-CHECK SUMMARY */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-500 font-black">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تنبيه التداخل الدوائي التلقائي (Gemini DUR Pre-Audit):</span>
                </div>
                <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                  يوجد تعارض محتمل بين دواء الضغط الموصوف ومكملات البوتاسيوم. يوصى بمراجعة تحليل وظائف الكلى وضبط الجرعة وفقاً لإرشادات هيئة الدواء المصرية (EDA).
                </p>
              </div>

              {/* DRUG REGIMEN TABLE */}
              <div className="space-y-2">
                <h3 className={`text-xs font-black flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Pill className="w-4 h-4 text-teal-500" />
                  {isRtl ? 'الأدوية المسجلة بالروشتة الطبية' : 'Prescribed Medications'}
                </h3>
                <div className={`border rounded-2xl p-3 space-y-2 text-xs ${
                  theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/20">
                    <div>
                      <span className="font-bold">1. Concor 5mg (Bisoprolol)</span>
                      <span className="text-[10px] text-slate-400 block">قرص واحد صباحاً بعد الإفطار</span>
                    </div>
                    <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">آمن ✓</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/20">
                    <div>
                      <span className="font-bold">2. Glucophage 1000mg (Metformin)</span>
                      <span className="text-[10px] text-slate-400 block">قرص مرتين يومياً مع الوجبات</span>
                    </div>
                    <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">آمن ✓</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <span className="font-bold">3. Spironolactone 25mg</span>
                      <span className="text-[10px] text-slate-400 block">قرص ظهراً (يتطلب مراقبة شوارد الدم)</span>
                    </div>
                    <span className="text-amber-500 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">تنبيه ⚠️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === 'settings' && (
        <main className="max-w-4xl mx-auto space-y-5 mt-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-teal-500/30' 
              : 'bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 border-teal-500 text-white'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black">
                  {isRtl ? 'إعدادات مساحة عمل الصيدلي' : 'Pharmacist Workspace Settings'}
                </h2>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-teal-100'}`}>
                  {isRtl 
                    ? 'تخصيص اللغة والثيم، وتعديل بيانات التواصل والعنوان، وإدارة التخصصات حتى 4، وتغيير كلمة السر.' 
                    : 'Configure Language, Theme, Contact details, Specialties up to 4, and Password.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-black/30 px-3 py-1 rounded-full border border-white/10">
              Pharmacist Portal
            </span>
          </div>

          {/* 1. SECTOR: LANGUAGE & THEME PREFERENCES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/20">
                <Globe className="w-4 h-4 text-teal-500" />
                <h3 className="text-xs font-black">{isRtl ? 'اختيار اللغة' : 'Language'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    language === 'ar'
                      ? 'bg-teal-600 text-white border-teal-500'
                      : theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🇪🇬 العربية (العربية)</span>
                  {language === 'ar' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    language === 'en'
                      ? 'bg-teal-600 text-white border-teal-500'
                      : theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Theme Mode */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/20">
                <Sun className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black">{isRtl ? 'اختيار الوضع (نهاري / ليلي)' : 'Theme Mode'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    theme === 'light'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{isRtl ? 'نهاري ☀️' : 'Light ☀️'}</span>
                  {theme === 'light' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-teal-600 text-white border-teal-500'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Moon className="w-4 h-4 text-teal-300" />
                  <span>{isRtl ? 'ليلي 🌙' : 'Dark 🌙'}</span>
                  {theme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. SECTOR: EDIT PROFILE, CONTACT & SPECIALTIES */}
          <div className={`p-5 rounded-3xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/20">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-500" />
                <h3 className="text-xs font-black">
                  {isRtl ? 'تعديل التليفون، الإيميل، العنوان والتخصصات' : 'Edit Contact, Address & Specialties'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                {isRtl ? `تحديد حتى 4 تخصصات (${selectedSpecialties.length}/4)` : `Up to 4 specialties (${selectedSpecialties.length}/4)`}
              </span>
            </div>

            {profileMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'رقم هاتف التواصل:' : 'Phone Number:'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-mono font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'المحافظة / النطاق الجغرافي:' : 'Governorate / Region:'}
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {governorates.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'العنوان بالتفصيل:' : 'Full Clinic/Pharmacy Address:'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* SPECIALTIES SELECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-800/20">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    {isRtl ? 'التخصصات السريرية (حتى 4 تخصصات فقط):' : 'Clinical Specialties (Max 4):'}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedSpecialties.length}/4
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allSpecialties.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec.key);
                    return (
                      <button
                        key={spec.key}
                        type="button"
                        onClick={() => toggleSpecialty(spec.key)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all text-right flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400 shadow-sm'
                            : theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300'
                        }`}
                      >
                        <span className="truncate">{isRtl ? spec.ar : spec.en}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ بيانات التواصل والتخصصات ✓' : 'Save Profile & Specialties ✓'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. SECTOR: CHANGE PASSWORD */}
          <div className={`p-5 rounded-3xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/20">
              <KeyRound className="w-4 h-4 text-teal-500" />
              <h3 className="text-xs font-black">{isRtl ? 'تعديل كلمة السر' : 'Change Password'}</h3>
            </div>

            {passwordMsg && (
              <div className={`p-3 border text-xs font-bold rounded-xl flex items-center gap-2 ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-xl text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {isRtl ? 'كلمة المرور الحالية:' : 'Current Password:'}
                </label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full rounded-xl px-3 py-2 border font-mono focus:outline-none focus:border-teal-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'كلمة المرور الجديدة:' : 'New Password:'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-mono focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'تأكيد كلمة المرور:' : 'Confirm Password:'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-mono focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isRtl ? 'تحديث كلمة المرور 🔒' : 'Update Password 🔒'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      )}
    </div>
  );
}
