import React, { useState } from 'react';
import { 
  Heart, Pill, Calendar, Shield, Camera, 
  MessageSquare, User, Clock, CheckCircle2, AlertCircle,
  PlusCircle, Sparkles, ChevronLeft, Settings, Moon, Sun,
  Globe, KeyRound, Lock, Phone, MapPin, Mail
} from 'lucide-react';

export default function PatientApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'meds' | 'consults' | 'profile' | 'settings'>('home');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Personal info state
  const [fullName, setFullName] = useState('أحمد محمود سليمان');
  const [phonePrimary, setPhonePrimary] = useState('01012345678');
  const [phoneBackup, setPhoneBackup] = useState('01198765432');
  const [email, setEmail] = useState('ahmed.patient@infodoctors.eg');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('مدينة نصر');
  const [district, setDistrict] = useState('الحي السابع');
  const [addressDetails, setAddressDetails] = useState('شارع الطيران - عمارة 14');
  const [personalMsg, setPersonalMsg] = useState('');

  // Password change state
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

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalMsg(language === 'ar' ? 'تم تحديث البيانات الشخصية والعنوان بنجاح!' : 'Personal profile and address updated successfully!');
    setTimeout(() => setPersonalMsg(''), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      setPasswordMsg({ 
        type: 'error', 
        text: language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية أولاً' : 'Please enter current password' 
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ 
        type: 'error', 
        text: language === 'ar' ? 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' : 'New password must be at least 6 characters' 
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ 
        type: 'error', 
        text: language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' 
      });
      return;
    }

    setPasswordMsg({ 
      type: 'success', 
      text: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح وحفظ الجلسة الآمنة!' : 'Password updated successfully!' 
    });
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const upcomingMeds = [
    { name: 'كونكور 5 مجم (Concor 5mg)', time: '08:00 صباحاً', status: 'تم التناول', icon: Pill, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { name: 'جلوكوفاج 1000 مجم (Glucophage)', time: '02:00 ظهراً', status: 'الموعد القادم', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'أوميجا 3 بلس (Omega 3 Plus)', time: '09:00 مساءً', status: 'مجدول', icon: Pill, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  ];

  const isRtl = language === 'ar';

  return (
    <div 
      dir={isRtl ? "rtl" : "ltr"} 
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* HEADER */}
      <header className={`p-4 sticky top-0 z-20 border-b ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isRtl ? 'تطبيق المريض - InfoDoctors' : 'Patient App - InfoDoctors'}
              </h1>
              <p className="text-[11px] text-teal-500 font-medium">
                {isRtl ? 'ملفك الطبي النشط • متابعة صيدلانية إكلينيكية مباشرة' : 'Active Medical Record • Clinical Pharmacy Care'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
              activeTab === 'settings' 
                ? 'bg-teal-600 text-white border-teal-500' 
                : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title={isRtl ? "الإعدادات" : "Settings"}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto w-full p-4 space-y-4 flex-1">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* HERO CARD */}
            <div className={`border rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-3 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-teal-900/60 via-slate-900 to-slate-900 border-teal-500/30'
                : 'bg-gradient-to-br from-teal-50 via-white to-teal-50/40 border-teal-200'
            }`}>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/40 rounded-full text-[10px] font-bold">
                  {isRtl ? 'مؤشر الأمان الدوائي: 100% ✓' : 'Drug Safety Index: 100% ✓'}
                </span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{fullName}</h2>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {isRtl ? 'خطة العلاج الحالية تم تدقيقها ضد التفاعلات الدوائية والحساسية' : 'Current regimen verified against interactions and allergies'}
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <button className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>{isRtl ? 'رفع روشتة جديدة (DUR)' : 'Upload Prescription (DUR)'}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {isRtl ? 'الإعدادات' : 'Settings'}
                </button>
              </div>
            </div>

            {/* MEDICATION SCHEDULE */}
            <div className={`border rounded-3xl p-4 space-y-3 shadow-lg ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xs font-black flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Pill className="w-4 h-4 text-teal-500" />
                  {isRtl ? 'جدول الجرعات اليومي' : 'Daily Dose Schedule'}
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{isRtl ? 'اليوم' : 'Today'}</span>
              </div>

              <div className="space-y-2">
                {upcomingMeds.map((med, idx) => {
                  const Icon = med.icon;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                        theme === 'dark' 
                          ? 'bg-slate-950/60 border-slate-800/80 hover:border-teal-500/40' 
                          : 'bg-slate-50 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${med.bg} ${med.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{med.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{med.time}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        med.status === 'تم التناول' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {med.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CLINICAL SAFETY SUMMARY */}
            <div className={`p-4 border rounded-3xl flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {isRtl ? 'الاستشارات السريرية السابقة' : 'Past Clinical Consultations'}
                  </h4>
                  <p className="text-[10px] text-slate-400">{isRtl ? '3 تقارير معتمدة وموقعة رقمياً' : '3 digitally signed reports'}</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}

        {/* TAB 2: MEDS */}
        {activeTab === 'meds' && (
          <div className={`p-5 rounded-3xl border space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-black text-teal-500 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              {isRtl ? 'خزانة الأدوية والروشتات الرقمية' : 'Digital Medicine Cabinet'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl ? 'قائمة بكافة الأدوية المصرح بها والجرعات المعتمدة من الصيدلي الإكلينيكي.' : 'All medications verified and approved by clinical pharmacists.'}
            </p>
          </div>
        )}

        {/* TAB 3: CONSULTS */}
        {activeTab === 'consults' && (
          <div className={`p-5 rounded-3xl border space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-black text-teal-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {isRtl ? 'استشاراتي والعيادة الافتراضية' : 'My Consultations & Virtual Clinic'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl ? 'سجل المحادثات والجلسات المباشرة مع استشاري الرعاية الصيدلانية.' : 'Direct communication sessions and chat records.'}
            </p>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className={`p-5 rounded-3xl border space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-black text-lg flex items-center justify-center">
                {fullName[0]}
              </div>
              <div>
                <h3 className="text-sm font-black">{fullName}</h3>
                <p className="text-xs text-slate-400">{phonePrimary} • {governorate}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>{isRtl ? 'الانتقال إلى تبويب الإعدادات الكامل' : 'Go to Full Settings Tab'}</span>
            </button>
          </div>
        )}

        {/* TAB 5: COMPLETE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Header Banner */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-teal-900 to-slate-900 border-teal-700/50 text-white' 
                : 'bg-gradient-to-r from-teal-700 to-teal-900 border-teal-600 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    {isRtl ? 'إعدادات تطبيق المريض' : 'Patient App Settings'}
                  </h3>
                  <p className="text-[11px] text-teal-200">
                    {isRtl ? 'تخصيص اللغة، الثيم، كلمة السر، والبيانات الشخصية' : 'Language, Theme, Password & Profile Customization'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
                v4.0
              </span>
            </div>

            {/* 1. SECTOR: LANGUAGE SELECTION */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="text-xs font-black flex items-center gap-2 border-b border-slate-800/20 pb-2">
                <Globe className="w-4 h-4 text-teal-500" />
                <span>{isRtl ? 'اختيار اللغة (عربي / إنجليزي)' : 'Language Selection (AR / EN)'}</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    language === 'ar'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🇬🇧 English (English)</span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. SECTOR: THEME SELECTION */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="text-xs font-black flex items-center gap-2 border-b border-slate-800/20 pb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? 'اختيار الوضع (نهاري / ليلي)' : 'Theme Mode (Light / Dark)'}</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    theme === 'light'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black'
                      : theme === 'dark' ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>{isRtl ? 'الوضع النهاري ☀️' : 'Light Mode ☀️'}</span>
                  {theme === 'light' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Moon className="w-4 h-4 text-teal-300" />
                  <span>{isRtl ? 'الوضع الليلي 🌙' : 'Dark Mode 🌙'}</span>
                  {theme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. SECTOR: EDIT PERSONAL DATA & ADDRESS */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="text-xs font-black flex items-center gap-2 border-b border-slate-800/20 pb-2">
                <User className="w-4 h-4 text-teal-500" />
                <span>{isRtl ? 'تعديل البيانات الشخصية (الهاتف والعنوان)' : 'Edit Personal Profile (Phone & Address)'}</span>
              </h4>

              {personalMsg && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{personalMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePersonalInfo} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'الاسم الكامل للمريض:' : 'Full Name:'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isRtl ? 'رقم الهاتف الأساسي:' : 'Primary Phone:'}
                    </label>
                    <input
                      type="tel"
                      value={phonePrimary}
                      onChange={(e) => setPhonePrimary(e.target.value)}
                      required
                      className={`w-full rounded-xl px-3 py-2 border font-mono font-bold focus:outline-none focus:border-teal-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isRtl ? 'رقم الهاتف الاحتياطي:' : 'Backup Phone:'}
                    </label>
                    <input
                      type="tel"
                      value={phoneBackup}
                      onChange={(e) => setPhoneBackup(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 border font-mono font-bold focus:outline-none focus:border-teal-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isRtl ? 'المحافظة:' : 'Governorate:'}
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className={`w-full rounded-xl px-2 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      {governorates.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isRtl ? 'المدينة:' : 'City:'}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full rounded-xl px-2.5 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isRtl ? 'الحي:' : 'District:'}
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full rounded-xl px-2.5 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isRtl ? 'العنوان بالتفصيل:' : 'Detailed Address:'}
                  </label>
                  <input
                    type="text"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-none focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ البيانات الشخصية والعنوان ✓' : 'Save Profile & Address ✓'}</span>
                </button>
              </form>
            </div>

            {/* 4. SECTOR: CHANGE PASSWORD */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h4 className="text-xs font-black flex items-center gap-2 border-b border-slate-800/20 pb-2">
                <KeyRound className="w-4 h-4 text-teal-500" />
                <span>{isRtl ? 'تعديل كلمة السر' : 'Change Password'}</span>
              </h4>

              {passwordMsg && (
                <div className={`p-2.5 border text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in ${
                  passwordMsg.type === 'success' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                }`}>
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
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

                <div className="grid grid-cols-2 gap-2">
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

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isRtl ? 'تحديث كلمة السر 🔒' : 'Update Password 🔒'}</span>
                </button>
              </form>
            </div>

          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <footer className={`p-2 sticky bottom-0 z-20 border-t ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <nav className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'home', label: isRtl ? 'الرئيسية' : 'Home', icon: Heart },
            { id: 'meds', label: isRtl ? 'أدويتي' : 'Meds', icon: Pill },
            { id: 'consults', label: isRtl ? 'الاستشارات' : 'Consults', icon: MessageSquare },
            { id: 'profile', label: isRtl ? 'حسابي' : 'Profile', icon: User },
            { id: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  isActive ? 'text-teal-500 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
