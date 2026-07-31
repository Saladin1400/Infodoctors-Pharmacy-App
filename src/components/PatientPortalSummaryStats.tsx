import React, { useState } from "react";
import { 
  Pill, Calendar, CheckCircle2, AlertCircle, Clock, 
  ChevronDown, ChevronUp, ArrowLeft, Video, ShieldCheck, 
  Activity, Sparkles, FileText, TrendingUp
} from "lucide-react";
import { PatientProfile } from "../types";

interface PatientPortalSummaryStatsProps {
  patient: PatientProfile | null;
  bookedServices?: { otc: any[]; revisions: any[]; plan: any[] };
  takenDosesCount?: number;
  skippedDosesCount?: number;
  reportsCount?: number;
  onNavigateToScreen?: (screen: string) => void;
}

export const PatientPortalSummaryStats: React.FC<PatientPortalSummaryStatsProps> = ({
  patient,
  bookedServices = { otc: [], revisions: [], plan: [] },
  takenDosesCount = 15,
  skippedDosesCount = 1,
  reportsCount = 2,
  onNavigateToScreen
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Calculate Recent Prescription Count
  const currentMeds = patient?.currentMedications || [];
  const recentPrescriptionCount = currentMeds.length > 0 ? currentMeds.length : 3;

  // 2. Upcoming Consultations List
  const allBookings = [
    ...(bookedServices.otc || []).map(b => ({
      id: b.id || "otc-1",
      type: "استشارة OTC صيدلانية",
      doctor: b.pharmacistName || "د. سارة محمود - صيدلي إكلينيكي",
      date: b.date || "الغد، 10:30 صباحاً",
      status: "مؤكد 🟢",
      screen: "videocall"
    })),
    ...(bookedServices.revisions || []).map(b => ({
      id: b.id || "rev-1",
      type: "مراجعة الروشتة الشاملة (DUR)",
      doctor: b.pharmacistName || "د. أحمد خالد - صيدلي إكلينيكي",
      date: b.date || "الأحد القادم، 04:00 عصراً",
      status: "قيد المراجعة ⏳",
      screen: "overview"
    }))
  ];

  // Fallback demo upcoming consultations if none booked yet
  const upcomingConsultations = allBookings.length > 0 ? allBookings : [
    {
      id: "demo-c1",
      type: "استشارة OTC صيدلانية",
      doctor: "د. شيماء العبد - صيدلي إكلينيكي معتمد",
      date: "غداً - 10:30 ص",
      status: "مؤكد 🟢",
      screen: "videocall"
    },
    {
      id: "demo-c2",
      type: "تدقيق الروشتة الموحد (DUR)",
      doctor: "د. مصطفى محمود - صيدلي سريري",
      date: "الخميس - 02:00 م",
      status: "مجدول 📅",
      screen: "overview"
    }
  ];

  // 3. Calculate Medication Adherence Percentage
  const totalTrackedDoses = Math.max(1, takenDosesCount + skippedDosesCount);
  const adherencePercentage = Math.round((takenDosesCount / totalTrackedDoses) * 100);
  
  // Rating Badge Logic
  let adherenceBadge = { text: "ممتاز جداً 🟢", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (adherencePercentage < 70) {
    adherenceBadge = { text: "يحتاج تحسين 🔴", color: "text-rose-700 bg-rose-50 border-rose-200" };
  } else if (adherencePercentage < 85) {
    adherenceBadge = { text: "جيد جداً 🟡", color: "text-amber-700 bg-amber-50 border-amber-200" };
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* Component Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>مؤشرات المريض والالتزام الدوائي</span>
              <span className="text-[9px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">محدث فورياً</span>
            </h4>
            <p className="text-[10px] text-slate-500">ملخص الروشتات، المواعيد القادمة، ونسبة الامتثال للجرعات</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 transition-all cursor-pointer"
        >
          <span>{isExpanded ? "طَي التفاصيل" : "تفاصيل أكثر"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Core Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Metric 1: Recent Prescription Count */}
        <div 
          onClick={() => onNavigateToScreen && onNavigateToScreen('overview')}
          className="bg-slate-50/80 hover:bg-teal-50/40 border border-slate-200/80 hover:border-teal-300 rounded-2xl p-3 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-600">الروشتات النشطة</span>
            <div className="w-7 h-7 bg-teal-100/80 text-teal-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-1.5 space-x-reverse">
            <span className="text-2xl font-black text-slate-900 font-mono">{recentPrescriptionCount}</span>
            <span className="text-[10px] font-bold text-slate-500">روشتات وأدوية</span>
          </div>

          <div className="text-[9.5px] text-teal-700 font-medium flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>{reportsCount} تقارير معتمدة</span>
            <span className="group-hover:translate-x-[-2px] transition-transform">استعراض ➔</span>
          </div>
        </div>

        {/* Metric 2: Upcoming Consultation Date */}
        <div 
          onClick={() => onNavigateToScreen && onNavigateToScreen('videocall')}
          className="bg-slate-50/80 hover:bg-cyan-50/40 border border-slate-200/80 hover:border-cyan-300 rounded-2xl p-3 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-600">الموعد القادم</span>
            <div className="w-7 h-7 bg-cyan-100/80 text-cyan-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="text-xs font-black text-slate-900 truncate">
              {upcomingConsultations[0]?.date || "لا توجد استشارات قادمة"}
            </div>
            <div className="text-[10px] text-cyan-800 font-bold truncate">
              {upcomingConsultations[0]?.type}
            </div>
          </div>

          <div className="text-[9.5px] text-cyan-700 font-medium flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>{upcomingConsultations.length} استشارات مسجلة</span>
            <span className="group-hover:translate-x-[-2px] transition-transform">الانضمام ➔</span>
          </div>
        </div>

        {/* Metric 3: Medication Adherence Percentage */}
        <div 
          onClick={() => onNavigateToScreen && onNavigateToScreen('insights')}
          className="bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-3 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-600">نسبة الالتزام بالجرعات</span>
            <div className="w-7 h-7 bg-emerald-100/80 text-emerald-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1 space-x-reverse">
              <span className="text-2xl font-black text-emerald-700 font-mono">{adherencePercentage}%</span>
            </div>
            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${adherenceBadge.color}`}>
              {adherenceBadge.text}
            </span>
          </div>

          {/* Adherence Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${adherencePercentage}%` }}
            ></div>
          </div>

          <div className="text-[9.5px] text-emerald-800 font-medium flex items-center justify-between pt-0.5">
            <span>{takenDosesCount} جرعة مكتملة</span>
            <span className="group-hover:translate-x-[-2px] transition-transform">تحليل الامتثال ➔</span>
          </div>
        </div>

      </div>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Active Medications Breakdown List */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>قائمة الروشتات والأدوية المسجلة ({recentPrescriptionCount}):</span>
              </span>
              <button 
                onClick={() => onNavigateToScreen && onNavigateToScreen('pillbox')}
                className="text-[10px] text-teal-700 hover:underline font-bold"
              >
                فتح علبة الأدوية الرقمية ➔
              </button>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentMeds.length > 0 ? (
                currentMeds.map((med, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block text-[11px]">{med.brandName}</strong>
                      <span className="text-[9.5px] text-slate-500">{med.dose} - {med.frequency}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      نشط 🟢
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block text-[11px]">كونكور 5 ملجم (Concor)</strong>
                      <span className="text-[9.5px] text-slate-500">قرص واحد صباحاً بعد الإفطار</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      نشط 🟢
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block text-[11px]">فيروجلوبين كبسول (Ferroglobin)</strong>
                      <span className="text-[9.5px] text-slate-500">كبسولة واحدة بعد الغداء</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      نشط 🟢
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upcoming Consultations Schedule Breakdown */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                <span>مواعيد الاستشارات الطبية القادمة:</span>
              </span>
              <button 
                onClick={() => onNavigateToScreen && onNavigateToScreen('otc-book')}
                className="text-[10px] text-cyan-700 hover:underline font-bold"
              >
                حجز استشارة جديدة ➔
              </button>
            </h5>

            <div className="space-y-1.5 text-xs">
              {upcomingConsultations.map((c) => (
                <div key={c.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-bold text-slate-900 text-[11px]">{c.type}</span>
                      <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{c.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{c.doctor}</p>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-1 rounded-lg border border-cyan-200">
                      {c.date}
                    </span>
                    <button
                      onClick={() => onNavigateToScreen && onNavigateToScreen(c.screen)}
                      className="bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="الانضمام للاستشارة"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default PatientPortalSummaryStats;
