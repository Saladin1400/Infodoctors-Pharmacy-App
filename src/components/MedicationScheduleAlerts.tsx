import React, { useState } from "react";
import { 
  Bell, Clock, Calendar, CheckCircle2, AlertCircle, Plus, 
  Trash2, Edit3, Volume2, VolumeX, Sparkles, X, ChevronRight, 
  Check, RefreshCw, Repeat, ShieldCheck
} from "lucide-react";
import { PatientProfile } from "../types";

export interface AdherenceAlertRule {
  id: string;
  medicationName: string;
  doseInstruction: string;
  frequencyType: 'daily' | 'weekly' | 'custom';
  selectedDays?: string[]; // Array of day names e.g. ['السبت', 'الإثنين']
  repeatIntervalHours?: number; // e.g. 8 for every 8 hours
  alertTime: string; // e.g., "08:00"
  enabled: boolean;
  soundEnabled: boolean;
  createdAt: string;
}

export interface ScheduledDoseItem {
  id: string;
  ruleId: string;
  medicationName: string;
  doseInstruction: string;
  displayTime: string;
  dayCategory: 'today' | 'tomorrow' | 'upcoming';
  dayLabel: string;
  frequencyType: 'daily' | 'weekly' | 'custom';
  status: 'pending' | 'taken' | 'snoozed' | 'skipped';
}

interface MedicationScheduleAlertsProps {
  patient: PatientProfile | null;
  onDoseTaken?: (doseId: string, medName: string) => void;
  onDoseSkipped?: (doseId: string, medName: string) => void;
  onDoseSnoozed?: (doseId: string, medName: string) => void;
  onAddNotification?: (notif: { title: string; body: string; type: string }) => void;
  showScheduleOnlyOnDashboard?: boolean;
}

const WEEK_DAYS_AR = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export const MedicationScheduleAlerts: React.FC<MedicationScheduleAlertsProps> = ({
  patient,
  onDoseTaken,
  onDoseSkipped,
  onDoseSnoozed,
  onAddNotification,
  showScheduleOnlyOnDashboard = false
}) => {
  // Initial default custom alert rules
  const [alertRules, setAlertRules] = useState<AdherenceAlertRule[]>([
    {
      id: "rule-01",
      medicationName: "كونكور 5 ملجم (Concor 5mg)",
      doseInstruction: "قرص واحد بعد الإفطار مع كاس ماء",
      frequencyType: "daily",
      alertTime: "08:00",
      enabled: true,
      soundEnabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "rule-02",
      medicationName: "فيروجلوبين كبسول (Ferroglobin)",
      doseInstruction: "كبسولة واحدة بعد الغداء مباشرة",
      frequencyType: "daily",
      alertTime: "14:00",
      enabled: true,
      soundEnabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "rule-03",
      medicationName: "فيتامين د3 (Vitamin D3 50,000 IU)",
      doseInstruction: "كبسولة واحدة أسبوعياً بعد الوجبة الدسمة",
      frequencyType: "weekly",
      selectedDays: ["الجمعة"],
      alertTime: "20:00",
      enabled: true,
      soundEnabled: true,
      createdAt: new Date().toISOString()
    }
  ]);

  // Scheduled doses state
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDoseItem[]>([
    {
      id: "dose-today-1",
      ruleId: "rule-01",
      medicationName: "كونكور 5 ملجم (Concor 5mg)",
      doseInstruction: "قرص واحد بعد الإفطار مع كاس ماء",
      displayTime: "08:00 صباحاً",
      dayCategory: "today",
      dayLabel: "اليوم - الصباح",
      frequencyType: "daily",
      status: "pending"
    },
    {
      id: "dose-today-2",
      ruleId: "rule-02",
      medicationName: "فيروجلوبين كبسول (Ferroglobin)",
      doseInstruction: "كبسولة واحدة بعد الغداء",
      displayTime: "02:00 عصراً",
      dayCategory: "today",
      dayLabel: "اليوم - الظهيرة",
      frequencyType: "daily",
      status: "pending"
    },
    {
      id: "dose-tomorrow-1",
      ruleId: "rule-01",
      medicationName: "كونكور 5 ملجم (Concor 5mg)",
      doseInstruction: "قرص واحد بعد الإفطار",
      displayTime: "08:00 صباحاً",
      dayCategory: "tomorrow",
      dayLabel: "غداً - الصباح",
      frequencyType: "daily",
      status: "pending"
    },
    {
      id: "dose-upcoming-1",
      ruleId: "rule-03",
      medicationName: "فيتامين د3 (Vitamin D3)",
      doseInstruction: "كبسولة واحدة أسبوعياً",
      displayTime: "08:00 مساءً",
      dayCategory: "upcoming",
      dayLabel: "الجمعة القادم",
      frequencyType: "weekly",
      status: "pending"
    }
  ]);

  // Form modal state for adding new alert rule
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [customMedInput, setCustomMedInput] = useState("");
  const [newDoseInstruction, setNewDoseInstruction] = useState("");
  const [newFrequencyType, setNewFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [newSelectedDays, setNewSelectedDays] = useState<string[]>(["السبت", "الثلاثاء"]);
  const [newRepeatHours, setNewRepeatHours] = useState<number>(8);
  const [newAlertTime, setNewAlertTime] = useState("09:00");
  const [newSoundEnabled, setNewSoundEnabled] = useState(true);

  // Active filter tab for schedule: 'all' | 'today' | 'upcoming'
  const [scheduleTab, setScheduleTab] = useState<'all' | 'today' | 'upcoming'>('all');

  // Handle Mark as Taken
  const handleMarkTaken = (doseId: string, medName: string) => {
    setScheduledDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'taken' } : d));
    if (onDoseTaken) onDoseTaken(doseId, medName);
    if (onAddNotification) {
      onAddNotification({
        title: `✅ تم تأكيد جرعة: ${medName}`,
        body: "تم تسجيل الجرعة بنجاح وتحديث نسبة الامتثال في ملفك الطبي.",
        type: "PillReminder"
      });
    }
  };

  // Handle Mark as Skipped
  const handleMarkSkipped = (doseId: string, medName: string) => {
    setScheduledDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'skipped' } : d));
    if (onDoseSkipped) onDoseSkipped(doseId, medName);
    if (onAddNotification) {
      onAddNotification({
        title: `⏸️ تم تخطي جرعة: ${medName}`,
        body: "تم تسجيل التخطي. حاول عدم تفويت الجرعات القادمة للالتزام بخطة العلاج.",
        type: "PillReminder"
      });
    }
  };

  // Handle Mark as Snoozed
  const handleMarkSnoozed = (doseId: string, medName: string) => {
    setScheduledDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'snoozed' } : d));
    if (onDoseSnoozed) onDoseSnoozed(doseId, medName);
    if (onAddNotification) {
      onAddNotification({
        title: `⏰ تم تأجيل تنبيه: ${medName}`,
        body: "سيتم تذكيرك بالجرعة مجدداً بعد 15 دقيقة.",
        type: "PillReminder"
      });
    }
  };

  // Toggle Rule Enable/Disable
  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
    setScheduledDoses(prev => prev.filter(d => d.ruleId !== ruleId));
  };

  // Submit New Custom Alert Rule Form
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMedName = newMedName === "custom" ? customMedInput : (newMedName || "دواء جديد");
    if (!finalMedName.trim()) return;

    const newRuleId = `rule-${Date.now()}`;
    const newRule: AdherenceAlertRule = {
      id: newRuleId,
      medicationName: finalMedName,
      doseInstruction: newDoseInstruction || "حسب إرشادات الصيدلي",
      frequencyType: newFrequencyType,
      selectedDays: newFrequencyType === 'weekly' ? newSelectedDays : undefined,
      repeatIntervalHours: newFrequencyType === 'custom' ? newRepeatHours : undefined,
      alertTime: newAlertTime,
      enabled: true,
      soundEnabled: newSoundEnabled,
      createdAt: new Date().toISOString()
    };

    setAlertRules(prev => [newRule, ...prev]);

    // Format time for display
    const [hrs, mins] = newAlertTime.split(":");
    const hNum = parseInt(hrs) || 0;
    const suffix = hNum >= 12 ? "مساءً" : "صباحاً";
    const formattedHrs = hNum % 12 === 0 ? 12 : hNum % 12;
    const formattedDisplayTime = `${String(formattedHrs).padStart(2, '0')}:${mins || "00"} ${suffix}`;

    // Add corresponding upcoming scheduled doses for today and tomorrow
    const newDoseToday: ScheduledDoseItem = {
      id: `dose-${Date.now()}-1`,
      ruleId: newRuleId,
      medicationName: finalMedName,
      doseInstruction: newDoseInstruction || "حسب الإرشادات",
      displayTime: formattedDisplayTime,
      dayCategory: "today",
      dayLabel: "اليوم",
      frequencyType: newFrequencyType,
      status: "pending"
    };

    const newDoseTomorrow: ScheduledDoseItem = {
      id: `dose-${Date.now()}-2`,
      ruleId: newRuleId,
      medicationName: finalMedName,
      doseInstruction: newDoseInstruction || "حسب الإرشادات",
      displayTime: formattedDisplayTime,
      dayCategory: "tomorrow",
      dayLabel: "غداً",
      frequencyType: newFrequencyType,
      status: "pending"
    };

    setScheduledDoses(prev => [newDoseToday, newDoseTomorrow, ...prev]);

    // Reset Form
    setShowAddModal(false);
    setNewMedName("");
    setCustomMedInput("");
    setNewDoseInstruction("");

    if (onAddNotification) {
      onAddNotification({
        title: `🔔 تم ضبط تنبيه جديد: ${finalMedName}`,
        body: `تكرار التنبيه: ${newFrequencyType === 'daily' ? 'يومياً' : newFrequencyType === 'weekly' ? 'أسبوعياً' : `كل ${newRepeatHours} ساعات`} في تمام الساعة ${formattedDisplayTime}.`,
        type: "PillReminder"
      });
    }
  };

  const filteredDoses = scheduledDoses.filter(d => {
    if (scheduleTab === 'today') return d.dayCategory === 'today';
    if (scheduleTab === 'upcoming') return d.dayCategory === 'tomorrow' || d.dayCategory === 'upcoming';
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* SECTION 1: UPCOMING MEDICATION SCHEDULE LIST */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        
        {/* Schedule Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>جدول الجرعات القادمة والالتزام</span>
                <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {scheduledDoses.filter(d => d.status === 'pending').length} متبقية
                </span>
              </h4>
              <p className="text-[10px] text-slate-500">استعرض مواعيد أدويتك لليوم وللأيام القادمة وتفقد الحالات</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] px-2.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1 space-x-reverse cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تنبيه جديد</span>
          </button>
        </div>

        {/* Schedule Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-[10.5px] font-bold">
          <button
            onClick={() => setScheduleTab('all')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              scheduleTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جميع المواعيد ({scheduledDoses.length})
          </button>
          <button
            onClick={() => setScheduleTab('today')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              scheduleTab === 'today' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جرعات اليوم 📅 ({scheduledDoses.filter(d => d.dayCategory === 'today').length})
          </button>
          <button
            onClick={() => setScheduleTab('upcoming')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              scheduleTab === 'upcoming' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            القادمة ⏳ ({scheduledDoses.filter(d => d.dayCategory !== 'today').length})
          </button>
        </div>

        {/* Scheduled Doses List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredDoses.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              لا توجد جرعات مجدولة في هذا التصنيف.
            </div>
          ) : (
            filteredDoses.map((dose) => {
              const isTaken = dose.status === 'taken';
              const isSnoozed = dose.status === 'snoozed';
              const isSkipped = dose.status === 'skipped';

              return (
                <div
                  key={dose.id}
                  className={`p-3 rounded-2xl border transition-all space-y-2 text-right ${
                    isTaken ? "bg-emerald-50/40 border-emerald-200" :
                    isSnoozed ? "bg-indigo-50/40 border-indigo-200" :
                    isSkipped ? "bg-amber-50/40 border-amber-200 opacity-80" :
                    "bg-slate-50 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                        dose.dayCategory === 'today' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {dose.dayLabel}
                      </span>
                      <span className="text-[10px] font-mono font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        ⏰ {dose.displayTime}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-lg border ${
                      isTaken ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                      isSnoozed ? "bg-indigo-100 text-indigo-800 border-indigo-300" :
                      isSkipped ? "bg-amber-100 text-amber-800 border-amber-300" :
                      "bg-slate-200 text-slate-700 border-slate-300"
                    }`}>
                      {isTaken ? "تم أخذ الجرعة ✅" : isSnoozed ? "مؤجل 15 دقيقة ⏰" : isSkipped ? "تم التخطي ⏸️" : "قادم ⏳"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{dose.medicationName}</h5>
                      <p className="text-[10.5px] text-slate-600 mt-0.5">{dose.doseInstruction}</p>
                    </div>

                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold shrink-0">
                      {dose.frequencyType === 'daily' ? 'يومياً' : dose.frequencyType === 'weekly' ? 'أسبوعياً' : 'تكرار مخصص'}
                    </span>
                  </div>

                  {/* Interactive Quick Action Buttons */}
                  {!isTaken && !isSkipped && (
                    <div className="flex items-center space-x-2 space-x-reverse pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => handleMarkTaken(dose.id, dose.medicationName)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-1.5 px-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1 space-x-reverse cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد أخذ الجرعة</span>
                      </button>

                      <button
                        onClick={() => handleMarkSnoozed(dose.id, dose.medicationName)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        تأجيل 15د
                      </button>

                      <button
                        onClick={() => handleMarkSkipped(dose.id, dose.medicationName)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        تخطي
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* SECTION 2: CONFIGURED ADHERENCE ALERTS MANAGEMENT (IF NOT DASHBOARD ONLY) */}
      {!showScheduleOnlyOnDashboard && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">إعدادات المنبهات والتنبيهات المخصصة</h4>
                <p className="text-[10px] text-slate-500">التحكم في التكرار اليومي والأسبوعي ونغمات الصيدلية</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-[10.5px] font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 space-x-reverse cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة دواء جديد</span>
            </button>
          </div>

          <div className="space-y-2">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  rule.enabled ? "bg-white border-slate-200 hover:border-teal-300" : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h5 className="font-extrabold text-xs text-slate-900">{rule.medicationName}</h5>
                    <span className="text-[9.5px] font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                      ⏰ {rule.alertTime}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{rule.doseInstruction}</p>
                  
                  <div className="flex items-center space-x-2 space-x-reverse text-[9px] text-slate-400">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                      {rule.frequencyType === 'daily' ? 'يومياً' : rule.frequencyType === 'weekly' ? `أسبوعياً (${rule.selectedDays?.join("، ") || "الجمعة"})` : `كل ${rule.repeatIntervalHours} ساعات`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  {/* Toggle Enable */}
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rule.enabled ? "bg-teal-100 text-teal-800 border border-teal-300" : "bg-slate-200 text-slate-600"
                    }`}
                    title={rule.enabled ? "تعطيل المنبه" : "تفعيل المنبه"}
                  >
                    {rule.enabled ? "مفعّل 🟢" : "معطل ⏸️"}
                  </button>

                  {/* Delete Rule */}
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="حذف المنبه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* CREATE NEW ADHERENCE ALERT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[2800] flex items-center justify-center p-4 text-right" style={{ direction: "rtl" }}>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">إضافة تنبيه دواؤك المخصص</h4>
                  <p className="text-[10px] text-slate-500">اضبط مواعيد الجرعة والتكرار لضمان الالتزام العلاجي</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              
              {/* Select Medication */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">اختر اسم الدواء:</label>
                <select
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="">اختر الدواء من ملفك الطبي...</option>
                  {(patient?.currentMedications || []).map((m, idx) => (
                    <option key={idx} value={m.brandName}>{m.brandName} - {m.dose}</option>
                  ))}
                  <option value="custom">✏️ دواء آخر (إدخال يدوي)...</option>
                </select>
              </div>

              {newMedName === "custom" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">اسم الدواء المخصص:</label>
                  <input
                    type="text"
                    required
                    value={customMedInput}
                    onChange={(e) => setCustomMedInput(e.target.value)}
                    placeholder="مثال: بانادول إكسترا 500 ملجم"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Dose Instructions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">تعليمات الجرعة والجرعات:</label>
                <input
                  type="text"
                  value={newDoseInstruction}
                  onChange={(e) => setNewDoseInstruction(e.target.value)}
                  placeholder="مثال: قرص واحد بعد الطعام مع كوب ماء دافئ"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Frequency Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">تكرار التنبيه (Frequency):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFrequencyType('daily')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newFrequencyType === 'daily' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    يومياً 📅
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewFrequencyType('weekly')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newFrequencyType === 'weekly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    أسبوعياً 🗓️
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewFrequencyType('custom')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newFrequencyType === 'custom' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    تكرار بالساعات ⏳
                  </button>
                </div>
              </div>

              {/* Weekly Day Selector */}
              {newFrequencyType === 'weekly' && (
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-700 block text-[11px]">حدد أيام الأسبوع للتنبيه:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS_AR.map((day) => {
                      const isSelected = newSelectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewSelectedDays(prev => prev.filter(d => d !== day));
                            } else {
                              setNewSelectedDays(prev => [...prev, day]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Repeat Interval Hours */}
              {newFrequencyType === 'custom' && (
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-700 block text-[11px]">تكرار كل كم ساعة:</label>
                  <select
                    value={newRepeatHours}
                    onChange={(e) => setNewRepeatHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-900 p-2 rounded-xl font-bold"
                  >
                    <option value={4}>كل 4 ساعات (6 مرات يومياً)</option>
                    <option value={6}>كل 6 ساعات (4 مرات يومياً)</option>
                    <option value={8}>كل 8 ساعات (3 مرات يومياً)</option>
                    <option value={12}>كل 12 ساعة (مرتان يومياً)</option>
                    <option value={24}>كل 24 ساعة (مرة واحدة)</option>
                  </select>
                </div>
              )}

              {/* Time Picker */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">وقت التنبيه الأول:</label>
                <input
                  type="time"
                  required
                  value={newAlertTime}
                  onChange={(e) => setNewAlertTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white text-center font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 space-x-reverse pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  حفظ وتفعيل المنبه 🔔
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MedicationScheduleAlerts;
