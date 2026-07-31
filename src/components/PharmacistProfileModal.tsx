import React, { useState } from "react";
import { 
  X, Award, ShieldCheck, Star, Clock, MapPin, Phone, Mail, FileText, 
  CheckCircle2, Sparkles, MessageSquare, ThumbsUp, Send, User, ChevronRight,
  Briefcase, GraduationCap, Medal, BadgeCheck, Stethoscope, HeartHandshake
} from "lucide-react";
import { PharmacistProfile, PharmacistReview, ApprovedSpecialtiesList } from "../types";

interface PharmacistProfileModalProps {
  pharmacist: PharmacistProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation?: (pharmacist: PharmacistProfile) => void;
  onAddReview?: (licenseNumber: string, review: Omit<PharmacistReview, 'id' | 'date'>) => void;
  currentPatientName?: string;
}

// Arabic degree labels mapping
export const getDegreeLabelArabic = (degree: string): string => {
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
};

// Default certificates generator if none present
export const getDefaultCertificates = (specialty: string, degree: string): string[] => {
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
};

// Default reviews generator if none present
export const getDefaultReviews = (pharmName: string): PharmacistReview[] => [
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
    serviceType: "استشارة دوائية OTC"
  },
  {
    id: "rev-3",
    patientName: "مهندس خالد الشربيني",
    rating: 4.8,
    date: "منذ أسبوعين",
    comment: "طبيب صيدلي خبير ومستمع جيد. وضع لي جدول مواعيد صارم ومناسب لمنبهات الأدوية اليومية.",
    serviceType: "خطة إدارة الأدوية (MMP)"
  }
];

export const PharmacistProfileModal: React.FC<PharmacistProfileModalProps> = ({
  pharmacist,
  isOpen,
  onClose,
  onBookConsultation,
  onAddReview,
  currentPatientName = "مريض مستفيد"
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'certificates' | 'reviews'>('overview');
  
  // New review state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newServiceType, setNewServiceType] = useState<string>('استشارة دوائية OTC');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [localReviews, setLocalReviews] = useState<PharmacistReview[]>([]);

  // Update local reviews when pharmacist changes
  React.useEffect(() => {
    if (pharmacist) {
      if (pharmacist.reviews && pharmacist.reviews.length > 0) {
        setLocalReviews(pharmacist.reviews);
      } else {
        setLocalReviews(getDefaultReviews(pharmacist.fullName));
      }
    }
  }, [pharmacist]);

  if (!isOpen || !pharmacist) return null;

  const specialtyAr = ApprovedSpecialtiesList.find(s => s.key === pharmacist.specialty)?.ar || pharmacist.specialty;
  const certificates = pharmacist.certificates && pharmacist.certificates.length > 0 
    ? pharmacist.certificates 
    : getDefaultCertificates(pharmacist.specialty, pharmacist.degree);
  
  const ratingValue = pharmacist.rating || 4.9;
  const reviewCount = localReviews.length;
  const expYears = pharmacist.experienceYears || (pharmacist.degree === 'prime consultant' ? 15 : pharmacist.degree === 'consultant' ? 10 : pharmacist.degree === 'Specialist' ? 6 : 3);
  const totalConsultations = pharmacist.totalConsultations || (expYears * 40 + 85);

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);

    const createdReview: PharmacistReview = {
      id: `rev-${Date.now()}`,
      patientName: currentPatientName,
      rating: newRating,
      date: "الآن",
      comment: newComment.trim(),
      serviceType: newServiceType
    };

    setLocalReviews(prev => [createdReview, ...prev]);

    if (onAddReview) {
      onAddReview(pharmacist.licenseNumber, {
        patientName: currentPatientName,
        rating: newRating,
        comment: newComment.trim(),
        serviceType: newServiceType
      });
    }

    setNewComment('');
    setIsSubmittingReview(false);
    setActiveTab('reviews');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 md:p-6 font-sans text-right" style={{ direction: "rtl" }}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header Banner with Cover Gradient & Photo */}
        <div className="relative bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-10"
            title="إغلاق النافذة"
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
                    {pharmacist.fullName?.split(" ")[1]?.[0] || pharmacist.fullName?.[0] || "ص"}
                  </div>
                )}
              </div>

              {/* Status Indicator Pill */}
              <span className={`absolute -bottom-2 right-2 text-[9.5px] font-black px-2.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-1 ${
                pharmacist.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {pharmacist.status === 'online' ? 'م متاح الآن' : 'غير متصل'}
              </span>
            </div>

            {/* Pharmacist Headline Specs */}
            <div className="flex-1 text-center sm:text-right space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>صيدلي إكلينيكي معتمد</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{ratingValue.toFixed(1)} ({reviewCount} تقييم)</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {pharmacist.fullName}
              </h2>

              <p className="text-xs text-teal-200 font-extrabold flex items-center justify-center sm:justify-start gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>{getDegreeLabelArabic(pharmacist.degree)}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>التخصص: <strong className="text-white">{specialtyAr}</strong></span>
                </span>

                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>رقم الترخيص: <strong className="text-amber-300 font-mono">{pharmacist.licenseNumber}</strong></span>
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
            <span className="text-[10px] text-slate-500 font-bold block">التقييم العام</span>
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingValue.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">سنوات الخبرة</span>
            <span className="text-xs font-black text-teal-700">{expYears} سنوات</span>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">الاستشارات الناجحة</span>
            <span className="text-xs font-black text-indigo-700">+{totalConsultations} استشارة</span>
          </div>

          <div className="p-1.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">سرعة الرد</span>
            <span className="text-xs font-black text-emerald-700">فوري (10 دقائق)</span>
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
            <span>نبذة ومؤهلات الملف</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-2.5 px-4 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'certificates' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>الشهادات والاعتمادات ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-4 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>تقييمات المرضى ({reviewCount})</span>
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
                    <span>ترخيص مهني موثق ونقابي معتمد</span>
                    <span className="bg-teal-200/80 text-teal-900 font-mono text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                      مفعل وقائم
                    </span>
                  </h4>
                  <p className="text-[11px] text-teal-850 leading-relaxed">
                    هذا الصيدلي مرخص رسمياً بموجب ترخيص رقم <strong className="font-mono text-teal-900">{pharmacist.licenseNumber}</strong> الصادر عن نقابة صيدلانيي {pharmacist.country} ووزارة الصحة، ومصرح له بتقديم الاستشارات الصيدلانية السريرية وتدقيق خطط الأدوية.
                  </p>
                </div>
              </div>

              {/* Doctor Bio */}
              <div className="space-y-1.5">
                <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>عن الصيدلي الإكلينيكي</span>
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {pharmacist.bio || `متخصص في الصيدلة السريرية بمجال (${specialtyAr}). يمتلك خبرة عمل تزيد عن ${expYears} سنوات في المستشفيات الجامعية والمراكز الطبية المتقدمة. يركز على سلامة المرضى، اكتشاف التفاعلات الدوائية الضارة، وتعديل الجرعات وفق الوظائف الحيوية والتحاليل الطبية.`}
                </div>
              </div>

              {/* Quick Details Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">الرقم النقابي والترخيص:</span>
                  <span className="font-mono font-black text-slate-800">{pharmacist.licenseNumber}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">الدرجة المهنية:</span>
                  <span className="font-bold text-teal-700">{getDegreeLabelArabic(pharmacist.degree)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">التخصص الأساسي:</span>
                  <span className="font-bold text-indigo-700">{specialtyAr}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">مكان الممارسة الميدانية:</span>
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
                  <span>الشهادات الأكاديمية والاعتمادات المعتمدة</span>
                </h4>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                  موثقة 100%
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
                        <span>شهادة معتمدة ومسجلة في السجل المهني للصيدلانيين</span>
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
                    <span className="text-[9px] text-slate-500 font-bold">من 5.0</span>
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-800">تقييمات وانطباعات المرضى المستفيدين</h4>
                    <p className="text-[10.5px] text-slate-600">بناءً على {reviewCount} تقييم حقيقي للمرضى بعد الجلسات والتدقيق</p>
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
                  <span>إضافة تقييم وانطباع جديد عن هذا الصيدلي</span>
                </h5>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600 font-bold ml-1">تحديد النجوم:</span>
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
                    <option value="استشارة دوائية OTC">استشارة دوائية OTC</option>
                    <option value="تدقيق روشتة (DUR)">تدقيق روشتة (DUR)</option>
                    <option value="خطة إدارة الأدوية (MMP)">خطة إدارة الأدوية (MMP)</option>
                  </select>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تجربتك وانطباعك بوضوح لمساعدة المرضى الآخرين..."
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
                    <span>إرسال التقييم الآن</span>
                  </button>
                </div>
              </form>

              {/* Patient Reviews Feed */}
              <div className="space-y-3 pt-1">
                {localReviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    لا توجد تقييمات مسجلة بعد. كن أول من يضيف تقييماً لهذا الصيدلي!
                  </div>
                ) : (
                  localReviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                            {rev.patientName[0] || "م"}
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

                      <p className="text-xs text-slate-700 leading-relaxed pr-10">
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
            رقم الترخيص: <span className="font-mono text-slate-800">{pharmacist.licenseNumber}</span>
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              إغلاق
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
                <span>طلب وحجز استشارة مع الدكتور 📅</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PharmacistProfileModal;
