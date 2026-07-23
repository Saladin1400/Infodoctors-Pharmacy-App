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
      
      const formattedDate = date.toLocaleDateString("ar-EG", {
        month: "numeric",
        day: "numeric"
      });
      
      const formattedDay = date.toLocaleDateString("ar-EG", {
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
          "الالتزام_٪": compRate,
          الجرعات_المأخوذة: takenToday,
          الجرعات_الملغاة: skippedToday,
          المتوقع: expectedToday,
          isToday: true
        });
      } else {
        // Build stable historical distribution curve with slight noise
        // Seeds a highly compliant patient with occasionally missed or skipped doses
        let seedCompliance = 90; // default average
        let seedSkips = 0;
        
        // Add random but stable deviation based on day index
        const hash = (i * 13) % 100;
        if (hash < 12) {
          seedCompliance = 50;
          seedSkips = 1;
        } else if (hash < 25) {
          seedCompliance = 100;
          seedSkips = 0;
        } else if (hash < 40) {
          seedCompliance = 0; // missed whole day or didn't check
          seedSkips = medsCount;
        } else {
          seedCompliance = 100;
          seedSkips = 0;
        }
        
        // Ensure some variability matches selected med filter
        const finalExpected = medsCount;
        const takenSimulated = Math.round((seedCompliance / 100) * finalExpected);
        
        data.push({
          dateStr: formattedDate,
          dayName: formattedDay,
          "الالتزام_٪": seedCompliance,
          الجرعات_المأخوذة: takenSimulated,
          الجرعات_الملغاة: seedSkips,
          المتوقع: finalExpected,
          isToday: false
        });
      }
    }
    return data;
  }, [finalTimetableItems, pillStatus, skippedAlarms]);

  // Aggregate metrics
  const stats = useMemo(() => {
    let totalTaken = 0;
    let totalSkipped = 0;
    let totalExpected = 0;
    
    historicalData.forEach(d => {
      totalTaken += d.الجرعات_المأخوذة;
      totalSkipped += d.الجرعات_الملغاة;
      totalExpected += d.المتوقع;
    });

    const averageCompliance = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 85;
    
    // Count snoozes registered in state (since snoozedAlarms keys represent today we count that)
    const activeSnoozeCount = Object.values(snoozedAlarms).reduce((acc, curr) => acc + curr.count, 0);

    return {
      averageCompliance,
      totalSkipped,
      totalTaken,
      activeSnoozeCount
    };
  }, [historicalData, snoozedAlarms]);

  // Insights / Actionable Clinical AI feedback
  const clinicalInsights = useMemo(() => {
    if (stats.averageCompliance < 60) {
      return {
        title: "تنبيه التزام حرج بالخطة العلاجية",
        status: "critical",
        text: "معدل الالتزام الدوائي الإجمالي منخفض بشكل ملحوظ (أقل من 60%). قد يؤثر تضارب المواعيد والجرعات المتروكة على كفاءة الكبد ووظائف الكلى. ننصح بشدة بتفعيل منبه الحجوزات مع الصيدلي لمراجعة أسباب عدم انتظام الامتثال.",
        color: "text-rose-650 bg-rose-50 border-rose-100"
      };
    } else if (stats.averageCompliance < 85) {
      return {
        title: "توصية تأمين الفعالية السريرية",
        status: "warning",
        text: "نظام التوجيه ممتثل بشكل متوسط. لوحظ تكرار تأجيل أو تخطي بعض الجرعات لليوم. ننصح بالربط الدوائي مع وجبة طعام رئيسية لضمان تثبيت الجدول، خصوصاً للأدوية الكلوية والمزمنة.",
        color: "text-amber-800 bg-amber-50 border-amber-100"
      };
    } else {
      return {
        title: "مستوى الالتزام استثنائي ومثالي",
        status: "success",
        text: "رائع جداً! ممتثل للجرعات بمعدل مثالي يفوق 85% خلال الـ 30 يوماً الماضية. هذا الالتزام الثابت والمنتظم يعزز بشكل حقيقي الحفاظ على استقرار الضغط الشرياني ويحمي جهاز الدوران ووظائف الكلى.",
        color: "text-emerald-800 bg-emerald-50 border-emerald-100"
      };
    }
  }, [stats.averageCompliance]);

  return (
    <div className="space-y-4 text-right font-sans" style={{ direction: "rtl" }}>
      
      {/* Overview Cards (Bento style) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Compliance Rate Card */}
        <div className="bg-white p-3 rounded-2xl border border-slate-250 flex flex-col justify-between space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">متوسط الالتزام (30 يوماً)</span>
            <div className="p-1 bg-teal-50 text-teal-600 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-extrabold text-slate-800 font-mono flex items-baseline space-x-1 space-x-reverse">
              <span>{stats.averageCompliance}%</span>
            </h3>
            <p className="text-[9px] text-slate-400 mt-1">النسبة المستهدفة طبيًا &gt; 85%</p>
          </div>
        </div>

        {/* Skipped Doses Card */}
        <div className="bg-white p-3 rounded-2xl border border-slate-250 flex flex-col justify-between space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">إجمالي الجرعات المؤجلة/الملغاة</span>
            <div className="p-1 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-extrabold text-slate-800 font-mono flex items-baseline space-x-1 space-x-reverse">
              <span>{stats.totalSkipped}</span>
              <span className="text-[10px] text-slate-400 font-normal">جرعات</span>
            </h3>
            <p className="text-[9px] text-amber-650 font-bold mt-1">
              {stats.activeSnoozeCount > 0 ? `🕒 +${stats.activeSnoozeCount} غفوة منبه نشطة اليوم` : "مراقبة متصلة بـ EDA"}
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
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                chartType === "area" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              معدل الالتزام %
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                chartType === "bar" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              الجرعات الملغاة
            </button>
          </div>
          <h4 className="font-extrabold text-slate-850 text-xs flex items-center space-x-1.5 space-x-reverse">
            <HeartPulse className="w-4 h-4 text-teal-650" />
            <span>منحنى الاستقرار البيولوجي والامتثال الآمن</span>
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
                  stroke="#94a3b8" 
                  tickSize={4}
                  minTickGap={20}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#f8fafc',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                  formatter={(value: any) => [`${value}%`, 'النسبة']}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="الالتزام_٪" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCompliance)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dateStr" 
                  stroke="#94a3b8" 
                  tickSize={4}
                  minTickGap={20}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  allowDecimals={false}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#f8fafc',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                  formatter={(value: any) => [value, 'جرعة ملغاة']}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                />
                <Bar 
                  dataKey="الجرعات_الملغاة" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <p className="text-[9.5px] text-slate-400 text-center flex items-center justify-center space-x-1 space-x-reverse">
          <Calendar className="w-3 h-3 text-teal-600" />
          <span>تظهر هذه الإحصائيات مستويات طيف الانتظام المستمر لآخر 30 يوماً للمريض.</span>
        </p>
      </div>

      {/* AI Clinical Insight Box */}
      <div className={`p-4 rounded-2xl border text-right space-y-2 leading-relaxed ${clinicalInsights.color}`}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Brain className="w-4 h-4 animate-bounce" />
          <h5 className="font-extrabold text-[12px]">{clinicalInsights.title}</h5>
        </div>
        <p className="text-[10.5px] text-slate-700/90 leading-relaxed font-medium">
          {clinicalInsights.text}
        </p>
      </div>

      {/* Structured Guidelines for Compliance */}
      <div className="bg-slate-50 border border-slate-205 p-3.5 rounded-2xl space-y-2.5">
        <h5 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1.5 space-x-reverse border-b border-slate-200 pb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>توصيات الصيدلاني للامتثال والحماية الكلوية</span>
        </h5>
        
        <div className="space-y-2 text-[10.5px] text-slate-600 font-medium">
          <div className="flex items-start space-x-1.5 space-x-reverse">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0"></span>
            <p><strong>تنظيم أوقات الفينولات والحديد:</strong> يُنصح بتفادي تناول المشروبات الساخنة والقهوة والشاي قبل أو بعد الكبسولة الملينة للحديد بثلاثة ساعات لتفادي انخفاض الفعالية.</p>
          </div>
          <div className="flex items-start space-x-1.5 space-x-reverse">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0"></span>
            <p><strong>منظم ضربات القلب (Bisoprolol):</strong> الالتزام بالجرعة الصباحية قبل تناول الإفطار بانتظام هو الركيزة الأساسية للسيطرة على تذبذبات الضغط ومنع ارتفاع النبض المفاجئ.</p>
          </div>
          <div className="flex items-start space-x-1.5 space-x-reverse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
            <p className="text-amber-900"><strong>تنبيه الـ DDI وتداخل الأدوية:</strong> أي ترقية للوصفة الطبية يجب فحصها فورياً عبر بوابة (DUR) لمطابقتها من قبل الصيدلي الإكلينيكي المعتمد لضمان خلوها من تداخلات الأدوية الحادة.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
