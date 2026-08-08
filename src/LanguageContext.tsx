import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  dir: "rtl" | "ltr";
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Portals & Gateway
    "app.title": "روشتة - منصة الصيدلة الإكلينيكية الرائدة",
    "app.subtitle": "المنصة الوطنية الموحدة للاستشارات الدوائية والفحص التفاعلي للروشتات في مصر",
    "portal.gateway": "البوابة الرئيسية",
    "portal.patient": "تطبيق المريض",
    "portal.patient_desc": "بوابة الجمهور والمرضى",
    "portal.pharmacist": "مستودع الصيدلي",
    "portal.pharmacist_desc": "مختصي الصيدلة الإكلينيكية",
    "portal.admin": "لوحة التحكم",
    "portal.admin_desc": "الإدارة والمالية",
    "portal.switch": "تبديل البوابة",
    "portal.current": "البوابة الحالية",
    
    // Header & Nav
    "nav.lang": "العربية / English",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.demo_drawer": "خيارات العرض التوضيحي",
    "nav.back_gateway": "العودة للبوابة",
    "nav.admin_access": "دخول الإدارة",
    
    // Auth & Pin Modal
    "auth.admin_title": "التحقق من صلاحية الإدارة",
    "auth.admin_subtitle": "أدخل رمز PIN السري للوصول للوحة التحكم",
    "auth.pin_placeholder": "رمز PIN السري (مثال: 2026)",
    "auth.pin_submit": "تأكيد الدخول",
    "auth.pin_error": "رمز PIN غير صحيح. الرمز الافتراضي هو 2026",
    "auth.cancel": "إلغاء",

    // Common Actions & Labels
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.close": "إغلاق",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.search": "بحث",
    "common.loading": "جاري التحميل...",
    "common.all": "الكل",
    "common.active": "نشط",
    "common.inactive": "غير نشط",
    "common.details": "التفاصيل",
    "common.confirm": "تأكيد",
    "common.success": "تمت العملية بنجاح",
    "common.error": "حدث خطأ ما",
    "common.status": "الحالة",
    "common.date": "التاريخ",
    "common.time": "الوقت",
    "common.actions": "الإجراءات",

    // Patient Simulator Header & Bottom Nav
    "patient.title": "تطبيق المريض الموحد",
    "patient.home": "الرئيسية",
    "patient.services": "الخدمات",
    "patient.prescriptions": "روشتاتي",
    "patient.timetable": "الجدول الزمني",
    "patient.consultations": "الاستشارات",
    "patient.profile": "الملف الشخصي",
    "patient.pharmacists": "دليل الصيادلة",
    "patient.book_otc": "حجز استشارة OTC",
    "patient.book_dur": "طلب مراجعة روشتة DUR",
    "patient.book_mmp": "خطة إدارة الدواء MMP",
    "patient.notifications": "الإشعارات والتنبيهات",
    
    // Pharmacist Workspace Tabs
    "pharmacist.title": "مساحة عمل الصيدلي الإكلينيكي",
    "pharmacist.dashboard": "لوحة التحليلات",
    "pharmacist.prescriptions": "روشتات تحت المراجعة",
    "pharmacist.consultations": "استشارات OTC وقوائم الانتظار",
    "pharmacist.mmp": "خطط إدارة الأدوية MMP",
    "pharmacist.audit": "تدقيق الذكاء الاصطناعي",
    "pharmacist.reports": "سجل التقارير الصادرة",
    "pharmacist.my_profile": "ملفي المهني",
    "pharmacist.online_status": "متصل ومستعد لاستقبال الاستشارات",
    "pharmacist.offline_status": "غير متصل حالياً",

    // Admin Panel Tabs
    "admin.title": "لوحة التحكم المركزية والإدارة",
    "admin.overview": "نظرة عامة والمالية",
    "admin.pharmacists": "إدارة الصيادلة والتراخيص",
    "admin.services": "أسعار الخدمات والعمولات",
    "admin.reports": "تقارير النظام والسلامة",
    "admin.settings": "إعدادات المنصة",
    "admin.total_revenue": "إجمالي الإيرادات",
    "admin.total_consultations": "إجمالي الاستشارات",
    "admin.active_pharmacists": "الصيادلة النشطين",
    "admin.safety_alerts": "تنبيهات السلامة الدوائية",

    // Language Toggle
    "lang.switch_to_en": "English",
    "lang.switch_to_ar": "العربية",
  },
  en: {
    // Portals & Gateway
    "app.title": "Rosheta - Leading Clinical Pharmacy Platform",
    "app.subtitle": "The Unified National Platform for Medication Consultations & Interactive Prescription Screening in Egypt",
    "portal.gateway": "Main Gateway",
    "portal.patient": "Patient App",
    "portal.patient_desc": "Public & Patient Portal",
    "portal.pharmacist": "Pharmacist Workspace",
    "portal.pharmacist_desc": "Clinical Pharmacists Specialists",
    "portal.admin": "Admin Panel",
    "portal.admin_desc": "Management & Finance",
    "portal.switch": "Switch Portal",
    "portal.current": "Current Portal",

    // Header & Nav
    "nav.lang": "English / العربية",
    "nav.login": "Log In",
    "nav.logout": "Log Out",
    "nav.demo_drawer": "Demo Options",
    "nav.back_gateway": "Back to Gateway",
    "nav.admin_access": "Admin Access",

    // Auth & Pin Modal
    "auth.admin_title": "Admin Verification",
    "auth.admin_subtitle": "Enter secret PIN code to access Admin Panel",
    "auth.pin_placeholder": "Secret PIN (e.g. 2026)",
    "auth.pin_submit": "Confirm Login",
    "auth.pin_error": "Incorrect PIN code. Default code is 2026",
    "auth.cancel": "Cancel",

    // Common Actions & Labels
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.all": "All",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.details": "Details",
    "common.confirm": "Confirm",
    "common.success": "Operation successful",
    "common.error": "An error occurred",
    "common.status": "Status",
    "common.date": "Date",
    "common.time": "Time",
    "common.actions": "Actions",

    // Patient Simulator Header & Bottom Nav
    "patient.title": "Unified Patient App",
    "patient.home": "Home",
    "patient.services": "Services",
    "patient.prescriptions": "My Prescriptions",
    "patient.timetable": "Timetable",
    "patient.consultations": "Consultations",
    "patient.profile": "Profile",
    "patient.pharmacists": "Pharmacists Directory",
    "patient.book_otc": "Book OTC Consultation",
    "patient.book_dur": "Request DUR Review",
    "patient.book_mmp": "Medication Plan MMP",
    "patient.notifications": "Notifications & Alerts",

    // Pharmacist Workspace Tabs
    "pharmacist.title": "Clinical Pharmacist Workspace",
    "pharmacist.dashboard": "Analytics Dashboard",
    "pharmacist.prescriptions": "Prescriptions Under Review",
    "pharmacist.consultations": "OTC Consultations & Queues",
    "pharmacist.mmp": "Medication Plans (MMP)",
    "pharmacist.audit": "AI Audit Assist",
    "pharmacist.reports": "Issued Reports History",
    "pharmacist.my_profile": "My Professional Profile",
    "pharmacist.online_status": "Online & Ready for Consultations",
    "pharmacist.offline_status": "Currently Offline",

    // Admin Panel Tabs
    "admin.title": "Central Admin Panel & Management",
    "admin.overview": "Overview & Finance",
    "admin.pharmacists": "Pharmacists & Licenses",
    "admin.services": "Service Prices & Commissions",
    "admin.reports": "System & Safety Reports",
    "admin.settings": "Platform Settings",
    "admin.total_revenue": "Total Revenue",
    "admin.total_consultations": "Total Consultations",
    "admin.active_pharmacists": "Active Pharmacists",
    "admin.safety_alerts": "Drug Safety Alerts",

    // Language Toggle
    "lang.switch_to_en": "English",
    "lang.switch_to_ar": "العربية",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    if (saved === "en" || saved === "ar") return saved;
    return "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  };

  const isRtl = language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string, fallback?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, dir, t }}>
      <div dir={dir} className={isRtl ? "font-sans" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageSwitcher: React.FC<{ className?: string; compact?: boolean }> = ({ className = "", compact = false }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
        language === "ar"
          ? "bg-slate-900 text-amber-400 border-amber-500/30 hover:bg-slate-800"
          : "bg-indigo-900 text-indigo-200 border-indigo-400/30 hover:bg-indigo-800"
      } ${className}`}
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <span className="text-sm">{language === "ar" ? "🌐" : "🌐"}</span>
      <span>{compact ? (language === "ar" ? "EN" : "عربي") : (language === "ar" ? "English" : "العربية")}</span>
    </button>
  );
};
