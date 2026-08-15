/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { 
  TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, 
  Filter, Award, Brain, ChevronLeft, ShieldCheck, HeartPulse
} from "lucide-react";
import { PatientProfile } from "../types";
import { useLanguage } from "../LanguageContext";

interface MedicationInsightsProps {
  activePatient: PatientProfile;
  finalTimetableItems: any[];
  pillStatus: Record<string, boolean>;
  skippedAlarms: Record<string, boolean>;
  snoozedAlarms: Record<string, { time: string; count: number }>;
}

export default function MedicationInsights({
  activePatient,
  finalTimetableItems,
  pillStatus,
  skippedAlarms,
  snoozedAlarms
}: MedicationInsightsProps) {
  const { t, isRtl, dir } = useLanguage();
  const [selectedMedId, setSelectedMedId] = useState<string>("all");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  
  // Create 30-day simulated history data
  const historicalData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Total number of medications the patient is supposed to take
    const medsCount = finalTimetableItems.length || 2;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isToday = i === 0;
      
      const formattedDate = date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        month: "numeric",
        day: "numeric"
      });
      
      const formattedDay = date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        weekday: "short"
      });

      if (isToday) {
        // Today is dynamic based on user actions
        let takenToday = 0;
        let skippedToday = 0;
        
        finalTimetableItems.forEach(item => {
          if (pillStatus[item.id] === true) takenToday++;
          if (skippedAlarms[item.id] === true) skippedToday++;
        });
        
        const expectedToday = medsCount;
        const compRate = expectedToday > 0 ? Math.round((takenToday / expectedToday) * 100) : 100;
        
        data.push({
          dateStr: formattedDate,
          dayName: formattedDay,
          complianceRate: compRate,
          takenDoses: takenToday,
          skippedDoses: skippedToday,
          expectedDoses: expectedToday,
          isToday: true
        });
      } else {
        // Build stable historical distribution curve with slight noise
        // Seeds a highly compliant patient with occasionally missed or skipped doses
        const dayOfWeek = date.getDay(); // 5 = Friday
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        
        // Random variation between 75% and 100%
        let baseCompliance = isWeekend ? 88 : 94;
        const seedShift = (Math.sin(i * 1.5) * 12);
        const dailyComp = Math.min(100, Math.max(60, Math.round(baseCompliance + seedShift)));
        
        const expected = medsCount;
        const taken = Math.round((dailyComp / 100) * expected);
        const skipped = expected - taken;
        
        data.push({
          dateStr: formattedDate,
          dayName: formattedDay,
          complianceRate: dailyComp,
          takenDoses: taken,
          skippedDoses: skipped,
          expectedDoses: expected,
          isToday: false
        });
      }
    }
    
    return data;
  }, [finalTimetableItems, pillStatus, skippedAlarms, isRtl]);

  // Aggregate statistics over 30-day range
  const stats = useMemo(() => {
    let totalRate = 0;
    let totalSkipped = 0;
    let totalTaken = 0;
    let totalExpected = 0;
    
    historicalData.forEach(d => {
      totalRate += d.complianceRate;
      totalSkipped += d.skippedDoses;
      totalTaken += d.takenDoses;
      totalExpected += d.expectedDoses;
    });

    const averageCompliance = Math.round(totalRate / historicalData.length);
    const activeSnoozeCount = Object.keys(snoozedAlarms).length;

    return {
      averageCompliance,
      totalSkipped,
      totalTaken,
      totalExpected,
      activeSnoozeCount
    };
  }, [historicalData, snoozedAlarms]);

  // AI-guided clinical recommendation based on compliance rate
  const clinicalInsight = useMemo(() => {
    if (stats.averageCompliance < 70) {
      return {
        title: isRtl ? "تنبيه سريري: مخاطر عدم انتظام الجرعات" : "Clinical Warning: Irregular Dosage Risks",
        status: "critical",
        text: isRtl ? "معدل الالتزام أقل من 70%. هذا الانقطاع المتكرر قد يسبب تذبذب خطير في ضغط الدم واستجابة غير كافية للدواء. يرجى مراجعة الصيدلي الإكلينيكي فوراً لضبط أوقات المنبه." : "Adherence rate below 70%. Repeated misses may lead to unstable blood pressure. Please consult your pharmacist immediately to adjust reminders.",
        color: "text-rose-650 bg-rose-50 border-rose-100"
      };
    } else if (stats.averageCompliance < 85) {
      return {
        title: isRtl ? "توصية تأمين الفعالية السريرية" : "Recommendation: Ensure Clinical Efficacy",
        status: "warning",
        text: isRtl ? "نظام التوجيه ممتثل بشكل متوسط. لوحظ تكرار تأجيل أو تخطي بعض الجرعات لليوم. ننصح بالربط الدوائي مع وجبة طعام رئيسية لضمان تثبيت الجدول، خصوصاً للأدوية الكلوية والمزمنة." : "Moderate adherence. Several doses were snoozed or skipped. We recommend pairing medication with a primary meal to establish routine.",
        color: "text-amber-800 bg-amber-50 border-amber-100"
      };
    } else {
      return {
        title: isRtl ? "مستوى الالتزام استثنائي ومثالي" : "Exceptional & Optimal Adherence",
        status: "success",
        text: isRtl ? "رائع جداً! ممتثل للجرعات بمعدل مثالي يفوق 85% خلال الـ 30 يوماً الماضية. هذا الالتزام الثابت والمنتظم يعزز بشكل حقيقي الحفاظ على استقرار الضغط الشرياني ويحمي جهاز الدوران ووظائف الكلى." : "Outstanding! Adherence exceeds 85% over the past 30 days. Steady compliance ensures optimal cardiovascular stabilization and kidney protection.",
        color: "text-emerald-800 bg-emerald-50 border-emerald-100"
      };
    }
  }, [stats.averageCompliance, isRtl]);

  return (
    <div className={`space-y-4 font-sans ${isRtl ? 'text-right' : 'text-left'}`} style={{ direction: dir }}>
      
      {/* Overview Cards (Bento style) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Compliance Rate Card */}
        <div className="bg-white p-3 rounded-2xl border border-slate-250 flex flex-col justify-between space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">{isRtl ? "متوسط الالتزام (30 يوماً)" : "Average Adherence (30d)"}</span>
            <div className="p-1 bg-teal-50 text-teal-600 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-extrabold text-slate-800 font-mono flex items-baseline space-x-1 space-x-reverse">
              <span>{stats.averageCompliance}%</span>
            </h3>
            <p className="text-[9px] text-slate-400 mt-1">{isRtl ? "النسبة المستهدفة طبيًا > 85%" : "Clinical Target > 85%"}</p>
          </div>
        </div>

        {/* Skipped Doses Card */}
        <div className="bg-white p-3 rounded-2xl border border-slate-250 flex flex-col justify-between space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">{isRtl ? "إجمالي الجرعات المؤجلة/الملغاة" : "Total Skipped/Delayed"}</span>
            <div className="p-1 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-extrabold text-slate-800 font-mono flex items-baseline space-x-1 space-x-reverse">
              <span>{stats.totalSkipped}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isRtl ? "جرعات" : "doses"}</span>
            </h3>
            <p className="text-[9px] text-amber-650 font-bold mt-1">
              {stats.activeSnoozeCount > 0 ? (isRtl ? `🕒 +${stats.activeSnoozeCount} غفوة منبه نشطة اليوم` : `🕒 +${stats.activeSnoozeCount} active snoozes today`) : (isRtl ? "مراقبة متصلة بـ EDA" : "EDA Monitored")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          {/* Chart selector toggles */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setChartType("area")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                chartType === "area" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              {isRtl ? "معدل الالتزام %" : "Adherence Rate %"}
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                chartType === "bar" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              {isRtl ? "الجرعات الملغاة" : "Skipped Doses"}
            </button>
          </div>
          <h4 className="font-extrabold text-slate-850 text-xs flex items-center space-x-1.5 space-x-reverse">
            <HeartPulse className="w-4 h-4 text-teal-650" />
            <span>{isRtl ? "منحنى الامتثال الدوائي" : "Medication Adherence Curve"}</span>
          </h4>
        </div>

        {/* Recharts Component Container */}
        <div className="w-full h-[200px] overflow-hidden select-none font-mono text-[10px]" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  interval={4}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  unit="%"
                />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, isRtl ? "الالتزام" : "Adherence"]}
                  labelFormatter={(label: any) => `${isRtl ? "التاريخ: " : "Date: "} ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="complianceRate" 
                  stroke="#0d9488" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCompliance)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  interval={4}
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']} 
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(val: any) => [`${val} ${isRtl ? "جرعات" : "doses"}`, isRtl ? "الجرعات الملغاة" : "Skipped Doses"]}
                  labelFormatter={(label: any) => `${isRtl ? "التاريخ: " : "Date: "} ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar 
                  dataKey="skippedDoses" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clinical AI Guidance Summary */}
      <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${clinicalInsight.color}`}>
        <div className="flex items-center gap-1.5 font-black mb-1">
          <Brain className="w-4 h-4" />
          <span>{clinicalInsight.title}</span>
        </div>
        <p className="text-[11px] opacity-90">{clinicalInsight.text}</p>
      </div>

    </div>
  );
}
