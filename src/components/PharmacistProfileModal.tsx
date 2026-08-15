import React, { useState } from "react";
import { 
  X, Award, ShieldCheck, Star, Clock, MapPin, Phone, Mail, FileText, 
  CheckCircle2, Sparkles, MessageSquare, ThumbsUp, Send, User, ChevronRight,
  Briefcase, GraduationCap, Medal, BadgeCheck, Stethoscope, HeartHandshake
} from "lucide-react";
import { PharmacistProfile, PharmacistReview, ApprovedSpecialtiesList } from "../types";
import { useLanguage } from "../LanguageContext";

interface PharmacistProfileModalProps {
  pharmacist: PharmacistProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation?: (pharmacist: PharmacistProfile) => void;
  onAddReview?: (licenseNumber: string, review: Omit<PharmacistReview, 'id' | 'date'>) => void;
  currentPatientName?: string;
}

// Degree labels mapping
export const getDegreeLabel = (degree: string, isRtl: boolean = true): string => {
  if (isRtl) {
    switch (degree?.toLowerCase()) {
      case 'junior':
        return 'صيدلي إكلينيكي مبتدئ (Junior)';
      case 'senior':
        return 'صيدلي إكلينيكي أول (Senior)';
      case 'specialist':
        return 'أخصائي صيدلة إكلينيكية (Specialist)';
      case 'consultant':
        return 'استشاري صيدلة إكلينيكية (Consultant)';
      case 'prime consultant':
      case 'prime_consultant':
        return 'استشاري أول صيدلة إكلينيكية (Prime Consultant)';
      default:
        return 'صيدلي إكلينيكي معتمد';
    }
  } else {
    switch (degree?.toLowerCase()) {
      case 'junior':
        return 'Junior Clinical Pharmacist';
      case 'senior':
        return 'Senior Clinical Pharmacist';
      case 'specialist':
        return 'Clinical Pharmacy Specialist';
      case 'consultant':
        return 'Clinical Pharmacy Consultant';
      case 'prime consultant':
      case 'prime_consultant':
        return 'Prime Consultant Clinical Pharmacist';
      default:
        return 'Certified Clinical Pharmacist';
    }
  }
};

export const getDegreeLabelArabic = (degree: string): string => getDegreeLabel(degree, true);

// Default certificates generator if none present
export const getDefaultCertificates = (specialty: string, degree: string, isRtl: boolean = true): string[] => {
  if (isRtl) {
    const base = [
      "بكالوريوس العلوم الصيدلية (PharmD) - معتمد من وزارة الصحة",
      "ترخيص مزاولة مهنة الصيدلة الإكلينيكية رقم النقابة العامة"
    ];
    if (degree === 'consultant' || degree === 'prime consultant') {
      base.push("شهادة البورد الأمريكي للصيدلة الإكلينيكية (BPS/BCPS)");
      base.push("دبلوم متقدم في تدقيق الروشتات والتفاعلات الدوائية (DUR)");
    } else if (degree === 'Specialist' || degree === 'Senior') {
      base.push("دبلوم الصيدلة المستشفى والإكلينيكية المتقدمة");
      base.push("اعتماد مراجعة وتعديل الخُطط العلاجية (MMP)");
    } else {
      base.push("شهادة تدريب سريري في الاستشارات الدوائية اللاروشتية (OTC)");
    }
    return base;
  } else {
    const base = [
      "Bachelor of Pharmacy (PharmD) - Ministry of Health Certified",
      "Professional Practice Clinical Pharmacy Syndicate License"
    ];
    if (degree === 'consultant' || degree === 'prime consultant') {
      base.push("Board of Pharmacy Specialties Certification (BPS/BCPS)");
      base.push("Advanced Drug Utilization Review (DUR) Diploma");
    } else if (degree === 'Specialist' || degree === 'Senior') {
      base.push("Advanced Hospital & Clinical Pharmacy Diploma");
      base.push("Medication Management Plan (MMP) Specialist Accreditation");
    } else {
      base.push("Clinical OTC Consultation & Patient Care Certificate");
    }
    return base;
  }
};

// Default reviews generator if none present
export const getDefaultReviews = (pharmName: string, isRtl: boolean = true): PharmacistReview[] => {
  if (isRtl) {
    return [
      {
        id: "rev-1",
        patientName: "أحمد صلاح عبد الفتاح",
        rating: 5,
        date: "منذ 3 أيام",
        comment: "دكتور ممتاز جداً! اكتشف تعارض خطير بين دواء الضغط والتيروكسين الذي آخذه بانتظام ونبهني لضرورة فصل الجرعات بفارق 4 ساعات. شكراً جزيلاً للاهتمام والدقة.",
        serviceType: "تدقيق روشتة (DUR)"
      },
      {
        id: "rev-2",
        patientName: "داليا محمود العوضي",
        rating: 5,
        date: "منذ أسبوع",
        comment: "استشارة OTC ممتازة وسريعة، شرح لي الآثار الجانبية والجرعة المناسبة لحالتي بكل وضوح وأمانة.",
        serviceType: "استشارة OTC"
      },
      {
        id: "rev-3",
        patientName: "كريم ممدوح الصاوي",
        rating: 4.8,
        date: "منذ أسبوعين",
        comment: "قام بتنظيم جدول دوائي رائع لوالدتي المصابة بالسكري وضغط الدم، مما حسن التزامها بالجرعات بشكل ملحوظ.",
        serviceType: "خطة MMP"
      }
    ];
  } else {
    return [
      {
        id: "rev-1",
        patientName: "Ahmed S. Abdel-Fattah",
        rating: 5,
        date: "3 days ago",
        comment: "Outstanding clinical pharmacist! Identified a critical drug interaction between my hypertension medicine and thyroxine, advising me to space them 4 hours apart.",
        serviceType: "Prescription DUR"
      },
      {
        id: "rev-2",
        patientName: "Dalia M. El-Awady",
        rating: 5,
        date: "1 week ago",
        comment: "Excellent and speedy OTC consultation. Clearly explained potential side effects and accurate dosing for my situation.",
        serviceType: "OTC Consultation"
      },
      {
        id: "rev-3",
        patientName: "Karim M. El-Sawy",
        rating: 4.8,
        date: "2 weeks ago",
        comment: "Structured an exceptional medication management plan for my diabetic mother, greatly improving her daily adherence.",
        serviceType: "MMP Plan"
      }
    ];
  }
};

export const PharmacistProfileModal: React.FC<PharmacistProfileModalProps> = ({
  pharmacist,
  isOpen,
  onClose,
  onBookConsultation,
  onAddReview,
  currentPatientName = "مريض معتمد"
}) => {
  const { t, isRtl, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'certificates' | 'reviews'>('overview');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [newServiceType, setNewServiceType] = useState<string>("استشارة دوائية OTC");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<PharmacistReview[]>([]);

  React.useEffect(() => {
    if (pharmacist) {
      if (pharmacist.reviews && pharmacist.reviews.length > 0) {
        setLocalReviews(pharmacist.reviews);
      } else {
        setLocalReviews(getDefaultReviews(pharmacist.fullName, isRtl));
      }
    }
  }, [pharmacist, isRtl]);

  if (!isOpen || !pharmacist) return null;

  const specialtyObj = ApprovedSpecialtiesList.find(s => s.key === pharmacist.specialty);
  const specialtyLabel = isRtl ? (specialtyObj?.ar || pharmacist.specialty) : (specialtyObj?.en || pharmacist.specialty);
  const certificates = pharmacist.certificates && pharmacist.certificates.length > 0
    ? pharmacist.certificates
    : getDefaultCertificates(pharmacist.specialty, pharmacist.degree, isRtl);

  const reviewCount = localReviews.length;
  const ratingValue = pharmacist.rating || 4.9;
  const expYears = pharmacist.degree === 'prime consultant' ? 15 : pharmacist.degree === 'consultant' ? 10 : pharmacist.degree === 'Specialist' ? 6 : pharmacist.degree === 'Senior' ? 4 : 2;
  const totalConsultations = expYears * 120 + 45;

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    const newRev: PharmacistReview = {
      id: `rev-${Date.now()}`,
      patientName: currentPatientName || (isRtl ? "مريض معتمد" : "Verified Patient"),
      rating: newRating,
      date: isRtl ? "الآن" : "Just now",
      comment: newComment.trim(),
      serviceType: newServiceType
    };

    setLocalReviews([newRev, ...localReviews]);
    if (onAddReview) {
      onAddReview(pharmacist.licenseNumber, {
        patientName: newRev.patientName,
        rating: newRating,
        comment: newRev.comment,
        serviceType: newServiceType
      });
    }

    setNewComment("");
    setNewRating(5);
    setIsSubmittingReview(false);
    setActiveTab('reviews');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 md:p-6 font-sans ${isRtl ? 'text-right' : 'text-left'}`} style={{ direction: dir }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header Banner with Cover Gradient & Photo */}
        <div className="relative bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 text-white shrink-0">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-10`}
            title={isRtl ? "إغلاق النافذة" : "Close window"}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-2">
            
            {/* Pharmacist Photo Avatar Frame */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-4 border-white/90 shadow-xl overflow-hidden flex items-center justify-center">
                {pharmacist.photoUrl ? (
                  <img
                    src={pharmacist.photoUrl}
                    alt={pharmacist.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white">
                    {pharmacist.fullName?.split(" ")[1]?.[0] || pharmacist.fullName?.[0] || "Dr"}
                  </div>
                )}
              </div>

              {/* Status Indicator Pill */}
              <span className={`absolute -bottom-2 ${isRtl ? 'right-2' : 'left-2'} text-[9.5px] font-black px-2.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1 ${
                pharmacist.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {pharmacist.status === 'online' ? (isRtl ? 'م متاح الآن' : 'Online Now') : (isRtl ? 'غير متصل' : 'Offline')}
              </span>
            </div>

            {/* Pharmacist Headline Specs */}
            <div className={`flex-1 text-center ${isRtl ? 'sm:text-right' : 'sm:text-left'} space-y-1.5`}>
              <div className={`flex flex-wrap items-center justify-center ${isRtl ? 'sm:justify-start' : 'sm:justify-start'} gap-2`}>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isRtl ? "صيدلي إكلينيكي معتمد" : "Verified Clinical Pharmacist"}</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{ratingValue.toFixed(1)} ({reviewCount} {isRtl ? "تقييم" : "reviews"})</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {pharmacist.fullName}
              </h2>

              <p className={`text-xs text-teal-200 font-extrabold flex items-center justify-center ${isRtl ? 'sm:justify-start' : 'sm:justify-start'} gap-1`}>
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>{getDegreeLabel(pharmacist.degree, isRtl)}</span>
              </p>

              <div className={`flex flex-wrap items-center justify-center ${isRtl ? 'sm:justify-start' : 'sm:justify-start'} gap-x-4 gap-y-1 text-[11px] text-slate-300 pt-1`}>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? "التخصص:" : "Specialty:"} <strong className="text-white">{specialtyLabel}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isRtl ? "رقم الترخيص:" : "License:"} <strong className="text-amber-300 font-mono">{pharmacist.licenseNumber}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pharmacist.city}، {pharmacist.governorate}</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Performance Metrics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-4 gap-2 text-center text-slate-800 shrink-0">
          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? "التقييم العام" : "Overall Rating"}</span>
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingValue.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? "سنوات الخبرة" : "Experience"}</span>
            <span className="text-xs font-black text-teal-700">{expYears} {isRtl ? "سنوات" : "Years"}</span>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? "الاستشارات الناجحة" : "Consultations"}</span>
            <span className="text-xs font-black text-indigo-700">+{totalConsultations}</span>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? "سرعة الرد" : "Response Time"}</span>
            <span className="text-xs font-black text-emerald-700">{isRtl ? "فوري (10 دقائق)" : "Fast (<10 mins)"}</span>
          </div>
        </div>

        {/* Tabs Navigation Header */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-4 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRtl ? "نبذة ومؤهلات الملف" : "Overview & Bio"}</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-2.5 px-4 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'certificates' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isRtl ? `الشهادات والاعتمادات (${certificates.length})` : `Certificates (${certificates.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-4 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>{isRtl ? `تقييمات المرضى (${reviewCount})` : `Reviews (${reviewCount})`}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* License & Verification Badge Card */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex items-start space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-teal-950 flex items-center gap-1.5">
                    <span>{isRtl ? "ترخيص مهني موثق ونقابي معتمد" : "Official Syndicate License Verified"}</span>
                    <span className="bg-teal-200/80 text-teal-900 font-mono text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                      {isRtl ? "مفعل وقائم" : "Active"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-teal-850 leading-relaxed">
                    {isRtl ? (
                      <>هذا الصيدلي مرخص رسمياً بموجب ترخيص رقم <strong className="font-mono text-teal-900">{pharmacist.licenseNumber}</strong> الصادر عن نقابة صيدلانيي {pharmacist.country} ووزارة الصحة، ومصرح له بتقديم الاستشارات الصيدلانية السريرية وتدقيق خطط الأدوية.</>
                    ) : (
                      <>Officially licensed with license number <strong className="font-mono text-teal-900">{pharmacist.licenseNumber}</strong> authorized by the Pharmacists Syndicate and Ministry of Health for clinical pharmaceutical consultations and DUR.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Doctor Bio */}
              <div className="space-y-1.5">
                <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>{isRtl ? "عن الصيدلي الإكلينيكي" : "About the Clinical Pharmacist"}</span>
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {pharmacist.bio || (isRtl 
                    ? `متخصص في الصيدلة السريرية بمجال (${specialtyLabel}). يمتلك خبرة عمل تزيد عن ${expYears} سنوات في المستشفيات الجامعية والمراكز الطبية المتقدمة. يركز على سلامة المرضى، اكتشاف التفاعلات الدوائية الضارة، وتعديل الجرعات وفق الوظائف الحيوية والتحاليل الطبية.`
                    : `Specialized in clinical pharmacy for (${specialtyLabel}). Possesses over ${expYears} years of experience in tertiary medical centers, focusing on patient medication safety, drug-drug interaction prevention, and personalized dosing plans.`
                  )}
                </div>
              </div>

              {/* Quick Details Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{isRtl ? "الرقم النقابي والترخيص:" : "Syndicate License:"}</span>
                  <span className="font-mono font-black text-slate-800">{pharmacist.licenseNumber}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{isRtl ? "الدرجة المهنية:" : "Professional Degree:"}</span>
                  <span className="font-bold text-teal-700">{getDegreeLabel(pharmacist.degree, isRtl)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{isRtl ? "التخصص الأساسي:" : "Clinical Specialty:"}</span>
                  <span className="font-bold text-indigo-700">{specialtyLabel}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{isRtl ? "مكان الممارسة الميدانية:" : "Practice Location:"}</span>
                  <span className="font-bold text-slate-800">{pharmacist.city}، {pharmacist.governorate}</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROFESSIONAL CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>{isRtl ? "الشهادات الأكاديمية والاعتمادات المعتمدة" : "Academic Credentials & Accreditations"}</span>
                </h4>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                  {isRtl ? "موثقة 100%" : "100% Verified"}
                </span>
              </div>

              <div className="space-y-2.5">
                {certificates.map((cert, index) => (
                  <div key={index} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-start space-x-3 space-x-reverse hover:border-teal-300 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Medal className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h5 className="font-bold text-xs text-slate-800 leading-snug">
                        {cert}
                      </h5>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{isRtl ? "شهادة معتمدة ومسجلة في السجل المهني للصيدلانيين" : "Accredited & registered with the professional pharmacy registry"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OTHER PATIENTS' REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              
              {/* Overall Score Summary Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="text-center bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs min-w-16">
                    <span className="text-2xl font-black text-amber-600 block leading-none">{ratingValue.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-500 font-bold">{isRtl ? "من 5.0" : "out of 5.0"}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-800">{isRtl ? "تقييمات وانطباعات المرضى المستفيدين" : "Patient Ratings & Experiences"}</h4>
                    <p className="text-[10.5px] text-slate-600">{isRtl ? `بناءً على ${reviewCount} تقييم حقيقي للمرضى بعد الجلسات والتدقيق` : `Based on ${reviewCount} verified post-consultation reviews`}</p>
                  </div>
                </div>

                <div className="flex text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Add New Review Form */}
              <form onSubmit={handleAddReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span>{isRtl ? "إضافة تقييم وانطباع جديد عن هذا الصيدلي" : "Add Your Review"}</span>
                </h5>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600 font-bold ml-1">{isRtl ? "تحديد النجوم:" : "Rating:"}</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-all cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>

                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-bold text-slate-700 outline-none focus:border-teal-500"
                  >
                    <option value="استشارة دوائية OTC">{isRtl ? "استشارة دوائية OTC" : "OTC Consultation"}</option>
                    <option value="تدقيق روشتة (DUR)">{isRtl ? "تدقيق روشتة (DUR)" : "Prescription Audit (DUR)"}</option>
                    <option value="خطة إدارة الأدوية (MMP)">{isRtl ? "خطة إدارة الأدوية (MMP)" : "Medication Plan (MMP)"}</option>
                  </select>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isRtl ? "اكتب تجربتك وانطباعك بوضوح لمساعدة المرضى الآخرين..." : "Share your feedback with other patients..."}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-none h-20"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isRtl ? "إرسال التقييم الآن" : "Submit Review"}</span>
                  </button>
                </div>
              </form>

              {/* Patient Reviews Feed */}
              <div className="space-y-3 pt-1">
                {localReviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    {isRtl ? "لا توجد تقييمات مسجلة بعد. كن أول من يضيف تقييماً لهذا الصيدلي!" : "No reviews yet. Be the first to leave a review!"}
                  </div>
                ) : (
                  localReviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                            {rev.patientName[0] || "P"}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-800 leading-tight">
                              {rev.patientName}
                            </h5>
                            <span className="text-[9.5px] text-slate-400 font-mono">
                              {rev.date} {rev.serviceType && `• ${rev.serviceType}`}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-400 gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>

                      <p className={`text-xs text-slate-700 leading-relaxed ${isRtl ? 'pr-10' : 'pl-10'}`}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-bold">
            {isRtl ? "رقم الترخيص: " : "License: "}<span className="font-mono text-slate-800">{pharmacist.licenseNumber}</span>
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {isRtl ? "إغلاق" : "Close"}
            </button>

            {onBookConsultation && (
              <button
                onClick={() => {
                  onBookConsultation(pharmacist);
                  onClose();
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{isRtl ? "طلب وحجز استشارة مع الدكتور 📅" : "Book Consultation 📅"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PharmacistProfileModal;
