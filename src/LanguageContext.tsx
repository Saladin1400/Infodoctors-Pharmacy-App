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

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Portals & Gateway
    "app.title": "إنفو دكتورز - منصة الصيدلة الإكلينيكية الرائدة",
    "app.subtitle": "المنظومة الوطنية الموحدة للاستشارات الدوائية والفحص التفاعلي للروشتات في مصر",
    "portal.gateway": "البوابة الرئيسية",
    "portal.patient": "تطبيق المستخدم",
    "portal.patient_desc": "بوابة الجمهور والمرضى",
    "portal.pharmacist": "مكتب الدكتور الصيدلي",
    "portal.pharmacist_desc": "مختصي الصيدلة الإكلينيكية",
    "portal.admin": "لوحة الإدارة",
    "portal.admin_desc": "الإدارة والمالية والحوكمة",
    "portal.switch": "تبديل البوابة",
    "portal.current": "البوابة الحالية",
    "portal.welcome_title": "أهلاً بك في منصة الرعاية الصحية",
    "portal.welcome_subtitle": "تطبيق متكامل يتيح للمرضى حجز الاستشارات ورفع الملفات، ويمنح الصيادلة أدوات التدقيق الدوائي بالذكاء الاصطناعي (DUR) وإصدار التقارير المعتمدة، مع لوحة إدارة مركزية.",
    "portal.choose_to_start": "اختر البوابة للبدء مباشرة",
    "portal.patient_card_desc": "من خلال هذه البوابة يمكن للمريض تسجيل حساب جديد، إضافة المرافقين، حجز استشارات OTC، تتبع منبهات الأدوية، واستلام التقارير الطبية المعتمدة.",
    "portal.enter_patient": "الدخول لبوابة المستخدم",
    "portal.pharmacist_card_desc": "مساحة عمل الصيدلي لفحص الروشتات وطابور الاستشارات المباشرة، إجراء الفحص الآلي للتعارضات الدوائية والحساسية بالذكاء الاصطناعي، وتوثيق التقارير.",
    "portal.enter_pharmacist": "الدخول إلى المكتب",
    "portal.active_session": "جلسة نشطة",
    "portal.admin_active_session": "جلسة مدير النظام نشطة",
    
    // Header & Nav
    "nav.lang": "العربية / English",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج ✕",
    "nav.demo_drawer": "خيارات العرض التوضيحي",
    "nav.back_gateway": "العودة للبوابة",
    "nav.admin_access": "دخول الإدارة",
    "nav.platform_name": "منصة الرعاية الصحية",
    "nav.system_footer": "حقوق الطبع والنشر © 2026 InfoDoctors. منصة العيادة والتدقيق الصيدلاني المعتمدة للالتزام العلاجي.",
    
    // Auth & Pin Modal
    "auth.admin_title": "التحقق من صلاحية الإدارة",
    "auth.admin_subtitle": "صفحة الأدمن مخصصة للمالك ومشرفي المنصة فقط",
    "auth.pin_label": "رمز أمان الأدمن (Admin Passcode):",
    "auth.pin_placeholder": "أدخل رمز الدخول (الرمز الافتراضي: 1234)",
    "auth.pin_submit": "تأكيد ودخول الأدمن ➔",
    "auth.pin_error": "رمز الأمان الخاص بالإدارة غير صحيح. (الرمز الافتراضي: 1234)",
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
    "common.refresh": "تحديث البيانات",
    "common.price_egp": "ج.م",
    "common.verified": "معتمد ✓",
    "common.online": "متصل",
    "common.offline": "غير متصل",

    // Patient Simulator Header & Bottom Nav
    "patient.title": "تطبيق المستخدم الموحد",
    "patient.home": "الرئيسية",
    "patient.services": "طلب الخدمات",
    "patient.prescriptions": "روشتاتي",
    "patient.timetable": "مواعيدي والجرعات",
    "patient.agenda": "أجندة المواعيد",
    "patient.consultations": "الاستشارات",
    "patient.profile": "الملف الصحي",
    "patient.pharmacists": "دليل الصيادلة",
    "patient.book_otc": "حجز استشارة OTC",
    "patient.book_dur": "طلب تدقيق روشتة DUR",
    "patient.book_mmp": "خطة إدارة الدواء MMP",
    "patient.notifications": "الإشعارات والتنبيهات",
    "patient.beneficiary": "المريض المستفيد:",
    "patient.specialty_required": "التخصص الصيدلاني المطلوب:",
    "patient.complaint_label": "تفاصيل الشكوى المرضية والأعراض الحالية:",
    "patient.auto_fill_complaint": "⚡ تعبئة الشكوى تلقائياً",
    "patient.complaint_placeholder": "اكتب الشكوى بالتفصيل...",
    "patient.booking_date": "تاريخ الموعد:",
    "patient.booking_time": "توقيت الاستشارة:",
    "patient.proceed_payment_otc": "متابعة الدفع المسبق الآمن (250 ج.م)",
    "patient.proceed_payment_rev": "متابعة الدفع المسبق الآمن (350 ج.م)",
    "patient.dur_banner_title": "مراجعة الروشتة السريرية (DUR)",
    "patient.dur_banner_desc": "ارفع صورة الروشتة الحالية وسيقوم صيدلي إكلينيكي بمطابقتها مع حساسيتك ضد الأدوية ومعايير EDA وبحث التعارضات الطبية.",
    "patient.upload_rx_label": "تحميل صورة الروشتة الطبية:",
    "patient.upload_rx_cta": "التقط صورة بالكاميرا أو اختر روشتة للاختبار",
    "patient.change_scanned_img": "اضغط لتغيير الصورة الممسوحة",
    "patient.digital_mock_badge": "محاكاة ملف رقمي",
    "patient.agenda_title": "أجندة المواعيد والحجوزات القادمة",
    "patient.agenda_desc": "استعراض المواعيد المحجوزة ورابط العيادة الافتراضية المباشرة",
    "patient.confirmed_badge": "مؤكدة ✓",
    "patient.join_meet": "الانضمام للعيادة الافتراضية (Google Meet)",
    "patient.preparing_clinic": "جاري تجهيز رابط العيادة الافتراضية مع الصيدلي...",
    "patient.enter_clinic": "دخول العيادة",
    "patient.rate_pharmacist": "⭐ تقييم استشارة الصيدلي وتوثيق تجربتك",
    "patient.no_appointments": "لا توجد أي مواعيد محجوزة حالياً",
    "patient.no_appointments_sub": "يمكنك حجز استشارة صيدلانية من تبويب \"طلب الخدمات\"",
    "patient.book_now_btn": "احجز موعداً الآن",
    
    // Pharmacist Workspace
    "pharmacist.title": "مكتب الدكتور الصيدلي",
    "pharmacist.dashboard": "لوحة الفحص السريري",
    "pharmacist.prescriptions": "روشتات قيد المراجعة",
    "pharmacist.consultations": "استشارات OTC",
    "pharmacist.mmp": "خطط إدارة الأدوية MMP",
    "pharmacist.audit": "تدقيق الذكاء الاصطناعي",
    "pharmacist.reports": "سجل التقارير الصادرة",
    "pharmacist.my_profile": "ملفي المهني",
    "pharmacist.finance": "الأرباح والمحفظة",
    "pharmacist.online_status": "متصل ومستعد لاستقبال الاستشارات",
    "pharmacist.offline_status": "غير متصل حالياً",
    "pharmacist.stage_received": "تم الاستلام",
    "pharmacist.stage_review": "قيد الفحص",
    "pharmacist.stage_ready": "تقرير جاهز",
    "pharmacist.start_audit_quick": "بدء الفحص السريري ⚡",
    "pharmacist.approve_report_quick": "اعتماد التقرير جاهزاً ✓",
    "pharmacist.reopen_audit_quick": "إعادة فتح للفحص",
    "pharmacist.ai_audit_btn": "تدقيق معايير EDA ذكياً",
    "pharmacist.sign_report_btn": "التوقيع الرقمي وإصدار التقرير الطبي",
    
    // Admin Panel Tabs & Stats
    "admin.title": "لوحة الإدارة",
    "admin.subtitle": "مراقبة إنتاجية الصيادلة، تقارير الحالات والعائدات، وحكامة الحسابات والجودة",
    "admin.badge_supervision": "منظومة الإشراف والتحكم",
    "admin.badge_connected": "● النظام متصل بالوزارة",
    "admin.tab_users": "إدارة الحسابات",
    "admin.tab_cases": "تقارير الحالات",
    "admin.tab_revenue": "تقارير العائدات والأرباح",
    "admin.tab_pharmacists": "تقارير أداء الصيادلة",
    "admin.tab_quality": "تقارير الجودة",
    "admin.total_revenue": "إجمالي المبيعات",
    "admin.pharmacist_share": "حصة الصيادلة (60%)",
    "admin.admin_share": "حصة الإدارة (40%)",
    "admin.total_consultations": "إجمالي الاستشارات",
    "admin.active_pharmacists": "الصيادلة النشطين",
    "admin.safety_alerts": "تنبيهات السلامة الدوائية",
    "admin.freeze_account": "تجميد الحساب",
    "admin.unfreeze_account": "إلغاء التجميد",
    "admin.reset_account": "إعادة ضبط",
    "admin.delete_account": "حذف الحساب",
    "admin.accounts_count": "إجمالي الحسابات",

    // Directory & Reviews
    "dir.title": "دليل الصيدلانيين الإكلينيكيين المعتمدين",
    "dir.subtitle": "تصفح ملفات الصيدلانيين، افحص التراخيص والشهادات وتقييمات المرضى",
    "dir.search_placeholder": "ابحث بالاسم، الترخيص، أو التخصص...",
    "dir.all_specialties": "جميع التخصصات الصيدلانية",
    "dir.all_degrees": "جميع الدرجات العلمية",
    "dir.book_btn": "طلب استشارة مع الصيدلي",
    "dir.view_profile": "عرض الملف المهني والشهادات",
    "dir.rating": "التقييم",
    "dir.reviews_count": "تقييم",
    
    // Language Toggle
    "lang.switch_to_en": "English",
    "lang.switch_to_ar": "العربية",
  },
  en: {
    // Portals & Gateway
    "app.title": "InfoDoctors - Leading Clinical Pharmacy Platform",
    "app.subtitle": "The Unified National Platform for Medication Consultations & Interactive Prescription Screening in Egypt",
    "portal.gateway": "Main Gateway",
    "portal.patient": "Patient App",
    "portal.patient_desc": "Public & Patients Portal",
    "portal.pharmacist": "Pharmacist Workspace",
    "portal.pharmacist_desc": "Clinical Pharmacy Specialists",
    "portal.admin": "Admin Panel",
    "portal.admin_desc": "Management, Finance & Governance",
    "portal.switch": "Switch Portal",
    "portal.current": "Current Portal",
    "portal.welcome_title": "Welcome to the Healthcare Platform",
    "portal.welcome_subtitle": "An integrated application that allows patients to book consultations and upload medical records, while empowering clinical pharmacists with AI-powered DUR audit tools and certified report generation, along with a central administrative dashboard.",
    "portal.choose_to_start": "Choose a portal to start directly",
    "portal.patient_card_desc": "Through this portal, patients can register, add family dependents, book OTC consultations, track medication reminders, and receive certified clinical reports.",
    "portal.enter_patient": "Enter Patient Portal",
    "portal.pharmacist_card_desc": "Workspace for clinical pharmacists to audit prescriptions and live consultation queues, run AI-assisted drug interaction checks, and certify medical reports.",
    "portal.enter_pharmacist": "Enter Workspace",
    "portal.active_session": "Active Session",
    "portal.admin_active_session": "Active Admin Session",

    // Header & Nav
    "nav.lang": "English / العربية",
    "nav.login": "Log In",
    "nav.logout": "Log Out ✕",
    "nav.demo_drawer": "Demo Options",
    "nav.back_gateway": "Back to Gateway",
    "nav.admin_access": "Admin Access",
    "nav.platform_name": "Healthcare Platform",
    "nav.system_footer": "Copyright © 2026 InfoDoctors. Certified Clinical Pharmacy & Medication Adherence Platform.",

    // Auth & Pin Modal
    "auth.admin_title": "Admin Verification",
    "auth.admin_subtitle": "Admin panel is restricted to system administrators & owners",
    "auth.pin_label": "Admin Passcode:",
    "auth.pin_placeholder": "Enter passcode (Default: 1234)",
    "auth.pin_submit": "Confirm & Enter Admin ➔",
    "auth.pin_error": "Incorrect Admin security passcode. (Default: 1234)",
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
    "common.refresh": "Refresh Data",
    "common.price_egp": "EGP",
    "common.verified": "Verified ✓",
    "common.online": "Online",
    "common.offline": "Offline",

    // Patient Simulator Header & Bottom Nav
    "patient.title": "Unified Patient App",
    "patient.home": "Home",
    "patient.services": "Request Services",
    "patient.prescriptions": "My Prescriptions",
    "patient.timetable": "Schedule & Doses",
    "patient.agenda": "Virtual Agenda",
    "patient.consultations": "Consultations",
    "patient.profile": "Health Profile",
    "patient.pharmacists": "Pharmacists Directory",
    "patient.book_otc": "Book OTC Consultation",
    "patient.book_dur": "Request DUR Review",
    "patient.book_mmp": "Medication Plan (MMP)",
    "patient.notifications": "Notifications & Alerts",
    "patient.beneficiary": "Beneficiary Patient:",
    "patient.specialty_required": "Required Specialty:",
    "patient.complaint_label": "Complaint & Symptoms Details:",
    "patient.auto_fill_complaint": "⚡ Auto-Fill Complaint",
    "patient.complaint_placeholder": "Type detailed symptoms and complaint...",
    "patient.booking_date": "Appointment Date:",
    "patient.booking_time": "Consultation Time:",
    "patient.proceed_payment_otc": "Proceed to Secure Prepayment (250 EGP)",
    "patient.proceed_payment_rev": "Proceed to Secure Prepayment (350 EGP)",
    "patient.dur_banner_title": "Clinical Prescription Audit (DUR)",
    "patient.dur_banner_desc": "Upload your prescription image and a clinical pharmacist will screen it for allergy contraindications, EDA standards, and drug interactions.",
    "patient.upload_rx_label": "Upload Prescription Image:",
    "patient.upload_rx_cta": "Capture photo via camera or select a test prescription",
    "patient.change_scanned_img": "Click to replace scanned image",
    "patient.digital_mock_badge": "Digital File Simulation",
    "patient.agenda_title": "Upcoming Agenda & Appointments",
    "patient.agenda_desc": "Review booked slots and join direct virtual clinic links",
    "patient.confirmed_badge": "Confirmed ✓",
    "patient.join_meet": "Join Virtual Clinic (Google Meet)",
    "patient.preparing_clinic": "Preparing virtual clinic session with the pharmacist...",
    "patient.enter_clinic": "Enter Clinic",
    "patient.rate_pharmacist": "⭐ Rate Pharmacist Consultation & Leave Feedback",
    "patient.no_appointments": "No booked appointments found",
    "patient.no_appointments_sub": "You can book a consultation from the \"Request Services\" tab",
    "patient.book_now_btn": "Book an Appointment Now",

    // Pharmacist Workspace
    "pharmacist.title": "Pharmacist Workspace",
    "pharmacist.dashboard": "Clinical Review Board",
    "pharmacist.prescriptions": "Prescriptions Under Review",
    "pharmacist.consultations": "OTC Consultations",
    "pharmacist.mmp": "Medication Plans (MMP)",
    "pharmacist.audit": "AI Audit Assist",
    "pharmacist.reports": "Issued Reports History",
    "pharmacist.my_profile": "My Professional Profile",
    "pharmacist.finance": "Earnings & Wallet",
    "pharmacist.online_status": "Online & Ready for Consultations",
    "pharmacist.offline_status": "Currently Offline",
    "pharmacist.stage_received": "Received",
    "pharmacist.stage_review": "Under Review",
    "pharmacist.stage_ready": "Report Ready",
    "pharmacist.start_audit_quick": "Start Clinical Review ⚡",
    "pharmacist.approve_report_quick": "Approve Report as Ready ✓",
    "pharmacist.reopen_audit_quick": "Re-open for Review",
    "pharmacist.ai_audit_btn": "Smart EDA Audit",
    "pharmacist.sign_report_btn": "Digital Signature & Issue Report",

    // Admin Panel Tabs & Stats
    "admin.title": "Admin Panel",
    "admin.subtitle": "Monitor pharmacist productivity, case reports, revenues, and account governance",
    "admin.badge_supervision": "Supervision & Control System",
    "admin.badge_connected": "● Ministry Integrated",
    "admin.tab_users": "Account Management",
    "admin.tab_cases": "Case Reports",
    "admin.tab_revenue": "Revenues & Profits",
    "admin.tab_pharmacists": "Pharmacist Productivity",
    "admin.tab_quality": "Quality Reports",
    "admin.total_revenue": "Total Sales",
    "admin.pharmacist_share": "Pharmacists Share (60%)",
    "admin.admin_share": "Admin Share (40%)",
    "admin.total_consultations": "Total Consultations",
    "admin.active_pharmacists": "Active Pharmacists",
    "admin.safety_alerts": "Drug Safety Alerts",
    "admin.freeze_account": "Freeze Account",
    "admin.unfreeze_account": "Unfreeze Account",
    "admin.reset_account": "Reset Password",
    "admin.delete_account": "Delete Account",
    "admin.accounts_count": "Total Accounts",

    // Directory & Reviews
    "dir.title": "Certified Clinical Pharmacists Directory",
    "dir.subtitle": "Browse verified pharmacist profiles, licenses, certificates, and patient reviews",
    "dir.search_placeholder": "Search by name, license number, or specialty...",
    "dir.all_specialties": "All Medical Specialties",
    "dir.all_degrees": "All Academic Degrees",
    "dir.book_btn": "Book Consultation with Pharmacist",
    "dir.view_profile": "View Full Profile & Certificates",
    "dir.rating": "Rating",
    "dir.reviews_count": "Reviews",

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
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm border cursor-pointer ${
        language === "ar"
          ? "bg-slate-800 text-teal-300 border-teal-500/40 hover:bg-slate-700"
          : "bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700"
      } ${className}`}
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <span className="text-sm">🌐</span>
      <span>{compact ? (language === "ar" ? "EN" : "عربي") : (language === "ar" ? "English" : "العربية")}</span>
    </button>
  );
};
