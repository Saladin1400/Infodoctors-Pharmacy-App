import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Info, Sparkles, 
  Plus, Trash2, ArrowLeft, Search, RefreshCw, FileText, Check, 
  Activity, Pill, Stethoscope, HeartPulse, Filter
} from "lucide-react";
import { PatientProfile, CurrentMedication } from "../types";

export interface AuditFinding {
  id: string;
  category: 'DDI' | 'DOSAGE' | 'DUPLICATION' | 'PREGNANCY' | 'RENAL' | 'FOOD';
  severity: 'Red' | 'Yellow' | 'Blue';
  title: string;
  drugsInvolved: string[];
  mechanism: string;
  recommendation: string;
}

interface AuditAssistModuleProps {
  patient: PatientProfile | null;
  customMeds?: string[];
  onApplyFindingsToReport?: (findings: {
    ddiSeverity: 'Green' | 'Yellow' | 'Red';
    details: string;
    unnecessaryMeds?: string;
    omittedMeds?: string;
  }) => void;
  compactMode?: boolean;
}

// Rule Database Definitions
const COMMON_DRUG_RULES = [
  // 1. Warfarin + NSAIDs/Aspirin
  {
    category: 'DDI' as const,
    severity: 'Red' as const,
    check: (meds: string[]) => {
      const hasWarfarin = meds.some(m => /warfarin|ماريفان|واؤفارين|coumadin/i.test(m));
      const hasNsaid = meds.some(m => /aspirin|أسبرين|ibuprofen|إيبوبروفين|diclofenac|ديكلوفيناك|naproxen|نابروكسين|profid|voltarine|فولتارين|cataflam|كاتافلام/i.test(m));
      if (hasWarfarin && hasNsaid) {
        return {
          title: "تداخل خطير: وارفارين + مضادات الإلتهاب غير الستيرويدية (NSAIDs/Aspirin)",
          drugsInvolved: ["Warfarin", "NSAID / Aspirin"],
          mechanism: "زيادة مضاعفة لخطر النزيف المعوي والدموي الحاد نتيجة لتثبيط الصفائح وتأثير وارفارين المباشر.",
          recommendation: "تجنب الدمج فورا. استبدل المسكن بـ Paracetamol بجرعة آمنة (≤ 2g/day) أو استشر الطبيب للتقييم."
        };
      }
      return null;
    }
  },

  // 2. ACEi/ARBs + Potassium/Spironolactone
  {
    category: 'DDI' as const,
    severity: 'Red' as const,
    check: (meds: string[]) => {
      const hasAceiArb = meds.some(m => /capoten|كابوتين|enalapril|انالابريل|lisinopril|ليسينوبريل|ramipril|راميبريل|triatec|ترياتيك|valsartan|فالسارتان|losartan|لوسارتان|exforge|تارغ/i.test(m));
      const hasPotassiumSpiro = meds.some(m => /spironolactone|سبيرونولاكتون|aldactone|الداكتون|potassium|بوتاسيوم|k-lor|مكمل بوتاسيوم/i.test(m));
      if (hasAceiArb && hasPotassiumSpiro) {
        return {
          title: "تداخل حرج: مثبطات ACE/ARBs + سبيرونولاكتون / مكملات البوتاسيوم",
          drugsInvolved: ["ACEi / ARBs", "Spironolactone / Potassium"],
          mechanism: "خطر حدوث ارتفاع حاد ومفاجئ في مستوى البوتاسيوم بالدم (Hyperkalemia) وتوقف القلب.",
          recommendation: "فحص مستوى البوتاسيوم ووضائف الكلية (Serum K+ & eGFR) فوراً وضبط الجرعات بانتظام."
        };
      }
      return null;
    }
  },

  // 3. Clopidogrel + Omeprazole
  {
    category: 'DDI' as const,
    severity: 'Yellow' as const,
    check: (meds: string[]) => {
      const hasClopidogrel = meds.some(m => /clopidogrel|كلوپيدوجريل|plavix|بلافيكس|بلافكس/i.test(m));
      const hasOmeprazole = meds.some(m => /omeprazole|أوميبرازول|omiz|اوميز|losec|esomeprazole|إيسوميبرازول|nexium|نيكسيوم/i.test(m));
      if (hasClopidogrel && hasOmeprazole) {
        return {
          title: "تحديث سريري: كلوپيدوجريل (Plavix) + أوميبرازول / نيكسيوم",
          drugsInvolved: ["Clopidogrel", "Omeprazole / Esomeprazole"],
          mechanism: "تثبيط إنزيم CYP2C19 مما يقلل من تحول الكلوپيدوجريل لمادته الفعالة ويقلل حماية التجلط.",
          recommendation: "استبدال أوميبرازول بـ Pantoprazole (Controloc) أو Famotidine لعدم تأثيرهما على CYP2C19."
        };
      }
      return null;
    }
  },

  // 4. Beta Blockers + Verapamil/Diltiazem
  {
    category: 'DDI' as const,
    severity: 'Red' as const,
    check: (meds: string[]) => {
      const hasBetaBlocker = meds.some(m => /concor|كونكور|bisoprolol|بيسوبرولول|atenolol|أتينولول|propranolol|إندرال|inderal|nebivolol/i.test(m));
      const hasVerapamil = meds.some(m => /verapamil|فيrapamil|isoptin|إيزوبتين|diltiazem|ديلتيازيم|altiazem/i.test(m));
      if (hasBetaBlocker && hasVerapamil) {
        return {
          title: "تحذير حظري: متمهلات بيتا (Concor) + فيراباميل / ديلتيازيم",
          drugsInvolved: ["Beta-Blocker", "Verapamil / Diltiazem"],
          mechanism: "تثبيط شديد للعقدة الجيبية الأذينية (AV Block) وهبوط حاد في نبضات القلب وضغط الدم.",
          recommendation: "ممنوع الدمج! استبدل غالق قنوات الكالسيوم بـ Dihydropyridine مثل Amlodipine عند الحاجة."
        };
      }
      return null;
    }
  },

  // 5. Statins + Macrolides / Clarithromycin
  {
    category: 'DDI' as const,
    severity: 'Yellow' as const,
    check: (meds: string[]) => {
      const hasStatin = meds.some(m => /simvastatin|سيمفاستاتين|lipitor|ليپيتور|atorvastatin|أتورفاستاتين|crestor|كريستور/i.test(m));
      const hasMacrolide = meds.some(m => /clarithromycin|كلاريثروميسين|klacid|كلاسيد|erythromycin|إريثروميسين/i.test(m));
      if (hasStatin && hasMacrolide) {
        return {
          title: "تنبيه DDI: ستاتينات كوليسترول + مضاد حيوي كلاريثروميسين (Klacid)",
          drugsInvolved: ["Simvastatin / Atorvastatin", "Clarithromycin"],
          mechanism: "تثبيط أيض الستاتين عبر CYP3A4 مما يرفع تركيزه بالدم ويزيد خطر تحلل العضلات (Rhabdomyolysis).",
          recommendation: "إيقاف الستاتين مؤقتاً طوال فترة علاج المضاد الحيوي أو استخدام Azithromycin بدلاً من Klacid."
        };
      }
      return null;
    }
  },

  // 6. NSAIDs Duplication
  {
    category: 'DUPLICATION' as const,
    severity: 'Red' as const,
    check: (meds: string[]) => {
      const nsaidsFound = meds.filter(m => /ibuprofen|إيبوبروفين|diclofenac|ديكلوفيناك|naproxen|نابروكسين|profid|فولتارين|voltarine|cataflam|كاتافلام|brufen|بروفين|ketoprofen|كيتوبروفين|ketofan|كيتوفان|feldene/i.test(m));
      if (nsaidsFound.length >= 2) {
        return {
          title: "ازدواجية علاجية خطيرة: تناول أكثر من مسكن NSAID في نفس الوقت",
          drugsInvolved: nsaidsFound,
          mechanism: "تكرار التغطية من نفس العائلة يزيد خطر تقرحات وقطع المعدة وتدهور الكلى دون أي زيادة في مسكن الألم.",
          recommendation: `إيقاف أحدهما فوراً (${nsaidsFound.join(" / ")}) والاعتماد على مركب واحد بجرعة مدروسة.`
        };
      }
      return null;
    }
  },

  // 7. Paracetamol Dosage Threshold
  {
    category: 'DOSAGE' as const,
    severity: 'Yellow' as const,
    check: (meds: string[]) => {
      const hasParacetamol = meds.some(m => /paracetamol|باراسيتامول|panadol|بانادول|cetal|سيتال|abimol|أبيمول/i.test(m));
      if (hasParacetamol) {
        return {
          title: "فحص الحد الأقصى الآمن: باراسيتامول (Paracetamol 4g/day)",
          drugsInvolved: ["Paracetamol / Panadol"],
          mechanism: "تجاوز جرعة 4000 ملجم/يومياً (8 أقراص تركيز 500 ملجم) يؤدي لتسمم كبدي حاد وتلف الخلية الكبدية.",
          recommendation: "التأكد من ألا تتجاوز الجرعة الإجمالية 4 جرام يومياً (أو 2 جرام لمرضى قصور الكبد والمسنين)."
        };
      }
      return null;
    }
  },

  // 8. Levothyroxine + Iron/Calcium
  {
    category: 'FOOD' as const,
    severity: 'Blue' as const,
    check: (meds: string[]) => {
      const hasThyroid = meds.some(m => /thyroxin|إيوتيروكس|euthyrox|eltroxin|التيروكسين/i.test(m));
      const hasSupplements = meds.some(m => /calcium|كالسيوم|iron|حديد|ferroglobin|فيروجلوبين|ferronil|فيتامين/i.test(m));
      if (hasThyroid && hasSupplements) {
        return {
          title: "إرشاد الامتصاص: التيروكسين (Euthyrox) + الكالسيوم أو الحديد",
          drugsInvolved: ["Levothyroxine", "Calcium / Iron"],
          mechanism: "تكون مخلبات غير قابلة للامتصاص تقلل كفاءة دواء الغدة الدرقية بشكل ملحوظ.",
          recommendation: "الفصل بين جرعة التيروكسين صباحاً على الريق ومكملات الحديد/الكالسيوم بـ 4 ساعات على الأقل."
        };
      }
      return null;
    }
  }
];

export const AuditAssistModule: React.FC<AuditAssistModuleProps> = ({
  patient,
  customMeds = [],
  onApplyFindingsToReport,
  compactMode = false
}) => {
  // Local list of active test medications
  const initialMeds = useMemo(() => {
    const list: string[] = [];
    if (patient?.currentMedications) {
      patient.currentMedications.forEach(m => {
        if (m.brandName) list.push(m.brandName);
        if (m.activeIngredient && !list.includes(m.activeIngredient)) list.push(m.activeIngredient);
      });
    }
    customMeds.forEach(c => {
      if (c && !list.includes(c)) list.push(c);
    });
    // Fallback defaults if empty
    if (list.length === 0) {
      return ["Concor 5mg", "Plavix 75mg", "Omeprazole 20mg", "Panadol 500mg"];
    }
    return list;
  }, [patient, customMeds]);

  const [medList, setMedList] = useState<string[]>(initialMeds);
  const [newMedInput, setNewMedInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Red' | 'Yellow' | 'Blue'>('ALL');

  // Rule Execution Engine
  const findings = useMemo(() => {
    const results: AuditFinding[] = [];

    // Run string-based DDI & dosage rule checks
    COMMON_DRUG_RULES.forEach((ruleRule, idx) => {
      const result = ruleRule.check(medList);
      if (result) {
        results.push({
          id: `finding-${idx}-${Date.now()}`,
          category: ruleRule.category,
          severity: ruleRule.severity,
          title: result.title,
          drugsInvolved: result.drugsInvolved,
          mechanism: result.mechanism,
          recommendation: result.recommendation
        });
      }
    });

    // Patient Context Checks (Pregnancy, Renal, Allergies, Age)
    if (patient) {
      // Pregnancy check
      if (patient.pregnancyLactation?.isPregnant) {
        const contraInPregnancy = medList.filter(m => /concor|bisoprolol|valsartan|losartan|exforge|triatec|capoten|atorvastatin|lipitor|crestor|doxycycline|ibuprofen|voltaren|cataflam/i.test(m));
        if (contraInPregnancy.length > 0) {
          results.push({
            id: `pregnancy-warn-${Date.now()}`,
            category: 'PREGNANCY',
            severity: 'Red',
            title: "🚫 تحذير الحمل: أدوية محظورة أثناء الحمل (Category X / D)",
            drugsInvolved: contraInPregnancy,
            mechanism: "تشوهات أجنة مثبتة أو تسمم كلي جنيني حاد عند تناول مثبطات الضغط الضارة أو الستاتينات أثناء الحمل.",
            recommendation: "إيقاف هذه الأدوية فوراً واستبدالها بالخيارات الآمنة للحمل (مثل Methyldopa أو Labetalol) تحت إشراف طبي."
          });
        }
      }

      // Patient Allergies Check
      if (patient.allergies?.drugAllergies && patient.allergies.drugAllergies.length > 0) {
        patient.allergies.drugAllergies.forEach(allergy => {
          if (allergy && allergy.trim().length > 1) {
            const matchedMeds = medList.filter(m => m.toLowerCase().includes(allergy.toLowerCase().trim()));
            if (matchedMeds.length > 0) {
              results.push({
                id: `allergy-alert-${Date.now()}`,
                category: 'DDI',
                severity: 'Red',
                title: `🚨 تنبيه حساسية دوائية مثبتة بملف المريض: (${allergy})`,
                drugsInvolved: matchedMeds,
                mechanism: "تفاعل فرط حساسية حاد (Anaphylaxis) أو طفح جلدي وضيق تنفس عند التعرض للدواء المسجل بالحساسية.",
                recommendation: `إلغاء واستبدال ${matchedMeds.join(", ")} فوراً نظراً لتسجيل حساسية سابقة لدى المريض.`
              });
            }
          }
        });
      }

      // Elderly dosage warning (>65 years)
      const ageYears = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 0;
      if (ageYears >= 65) {
        const beersListMeds = medList.filter(m => /dimenhydrinate|راميكود|فاليوم|diazepam|alprazolam|indomethacin|amitriptyline|night/i.test(m));
        if (beersListMeds.length > 0) {
          results.push({
            id: `elderly-warn-${Date.now()}`,
            category: 'DOSAGE',
            severity: 'Yellow',
            title: "⚠️ تحذير كبار السن (معايير بيرز Beers Criteria):",
            drugsInvolved: beersListMeds,
            mechanism: "زيادة خطر السقوط والارتباك الذهني وهبوط الضغط الانتصابي لدى المسنين.",
            recommendation: "تقليل الجرعة أو استبدال الدواء ببديل آمن لكبار السن."
          });
        }
      }
    }

    return results;
  }, [medList, patient]);

  // Overall Severity Count
  const redCount = findings.filter(f => f.severity === 'Red').length;
  const yellowCount = findings.filter(f => f.severity === 'Yellow').length;
  const blueCount = findings.filter(f => f.severity === 'Blue').length;

  const overallSeverity: 'Red' | 'Yellow' | 'Green' = redCount > 0 ? 'Red' : yellowCount > 0 ? 'Yellow' : 'Green';

  // Add Med to Audit Sandbox
  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedInput.trim() && !medList.includes(newMedInput.trim())) {
      setMedList(prev => [...prev, newMedInput.trim()]);
      setNewMedInput("");
    }
  };

  // Remove Med from Audit Sandbox
  const handleRemoveMed = (medToRemove: string) => {
    setMedList(prev => prev.filter(m => m !== medToRemove));
  };

  // Filter Findings
  const filteredFindings = findings.filter(f => {
    if (activeFilter === 'ALL') return true;
    return f.severity === activeFilter;
  });

  // Export Audit Results to Prescription Report Draft
  const handleExportToReport = () => {
    if (!onApplyFindingsToReport) return;

    let summaryText = `[تقرير محرك تدقيق الأدوية الآلي Audit Assist - ${new Date().toLocaleDateString('ar-EG')}]:\n`;
    if (findings.length === 0) {
      summaryText += "• لا توجد تداخلات دوائية أو تحذيرات حادة مكتشفة في قائمة الأدوية المفحوصة.";
    } else {
      findings.forEach((f, idx) => {
        summaryText += `${idx + 1}. [${f.severity === 'Red' ? 'خطر حرج 🔴' : f.severity === 'Yellow' ? 'تحذير 🟡' : 'إرشاد 🔵'}] ${f.title}\n   - الآلية: ${f.mechanism}\n   - التوصية الصيدلانية: ${f.recommendation}\n\n`;
      });
    }

    const unnecessary = findings
      .filter(f => f.category === 'DUPLICATION' || f.severity === 'Red')
      .flatMap(f => f.drugsInvolved)
      .join("، ");

    onApplyFindingsToReport({
      ddiSeverity: overallSeverity,
      details: summaryText,
      unnecessaryMeds: unnecessary || undefined
    });
  };

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 space-y-3 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/30">
            <ShieldAlert className="w-4 h-4 animate-pulse text-teal-300" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>محرك تدقيق السلامة الصيدلانية (Audit Assist Engine)</span>
              <span className="text-[9px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-md font-bold">
                قواعد الذكاء الصيدلاني ⚡
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              فحص التداخلات الدوائية (DDI)، ازدواجية المواد، والجرعات بناءً على ملف المريض
            </p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`px-2.5 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 ${
            overallSeverity === 'Red' ? 'bg-red-950/80 border-red-500 text-red-200' :
            overallSeverity === 'Yellow' ? 'bg-amber-950/80 border-amber-500 text-amber-200' :
            'bg-emerald-950/80 border-emerald-500 text-emerald-200'
          }`}>
            <span>
              {overallSeverity === 'Red' ? 'تداخلات حادة 🚨' : overallSeverity === 'Yellow' ? 'تحذيرات للتقييم ⚠️' : 'آمن ومطابق 🟢'}
            </span>
          </div>

          {onApplyFindingsToReport && (
            <button
              onClick={handleExportToReport}
              className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl transition-all shadow-sm flex items-center space-x-1 space-x-reverse cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>تصدير للتقرير ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Drug Sandbox / Chips Section */}
      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-300">
          <span className="flex items-center gap-1 text-teal-300">
            <Pill className="w-3.5 h-3.5" />
            <span>الأدوية الخاضعة للتدقيق المباشر ({medList.length}):</span>
          </span>
          <span className="text-[9.5px] text-slate-400">يمكنك إضافة/حذف أدوية لاختبار التداخلات</span>
        </div>

        {/* Chips List */}
        <div className="flex flex-wrap gap-1.5">
          {medList.map((med, idx) => (
            <span
              key={idx}
              className="bg-slate-950 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span>{med}</span>
              <button
                onClick={() => handleRemoveMed(med)}
                className="text-slate-400 hover:text-rose-400 font-extrabold text-[10px] w-3.5 h-3.5 rounded-full hover:bg-rose-950 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Add New Drug to Sandbox Input Form */}
        <form onSubmit={handleAddMed} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newMedInput}
            onChange={(e) => setNewMedInput(e.target.value)}
            placeholder="أدخل اسم دواء أو مادة فعالة لإخضاعها للتدقيق..."
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة للمختبر</span>
          </button>
        </form>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl text-[10px] font-bold border border-slate-800">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          الكل ({findings.length})
        </button>
        <button
          onClick={() => setActiveFilter('Red')}
          className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'Red' ? 'bg-red-900/60 text-red-200 border border-red-500/40' : 'text-slate-400 hover:text-red-300'
          }`}
        >
          حرج وجسيم 🚨 ({redCount})
        </button>
        <button
          onClick={() => setActiveFilter('Yellow')}
          className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'Yellow' ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40' : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          تحذير وتعديل ⚠️ ({yellowCount})
        </button>
        <button
          onClick={() => setActiveFilter('Blue')}
          className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
            activeFilter === 'Blue' ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/40' : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          إرشادات امتصاص 💡 ({blueCount})
        </button>
      </div>

      {/* Audit Findings List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-slate-300">لم يتم رصد تداخلات دوائية حرجة في التصفية الحالية</span>
            <span className="text-[10px] text-slate-500">مجموعة الأدوية المفحوصة تبدو متوافقة سريرياً بناءً على القواعد المسجلة.</span>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className={`p-3 rounded-xl border transition-all text-right space-y-1.5 ${
                finding.severity === 'Red' ? 'bg-red-950/30 border-red-800/80 text-red-100' :
                finding.severity === 'Yellow' ? 'bg-amber-950/30 border-amber-800/80 text-amber-100' :
                'bg-cyan-950/30 border-cyan-800/80 text-cyan-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                  finding.severity === 'Red' ? 'bg-red-900 text-red-200 border-red-500' :
                  finding.severity === 'Yellow' ? 'bg-amber-900 text-amber-200 border-amber-500' :
                  'bg-cyan-900 text-cyan-200 border-cyan-500'
                }`}>
                  {finding.category === 'DDI' ? 'تداخل DDI' : finding.category === 'PREGNANCY' ? 'تحذير حمل' : finding.category === 'DOSAGE' ? 'حد الجرعة' : 'ازدواجية'}
                </span>

                <span className="text-[9.5px] font-mono text-slate-400">
                  الأدوية: {finding.drugsInvolved.join(" + ")}
                </span>
              </div>

              <h5 className="font-extrabold text-xs text-white leading-tight">{finding.title}</h5>
              
              <div className="text-[10.5px] space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                <p className="text-slate-300 leading-normal">
                  <strong className="text-slate-400">الآلية السريرية:</strong> {finding.mechanism}
                </p>
                <p className="text-teal-300 font-bold leading-normal">
                  <strong className="text-teal-400">توصية الصيدلي الإكلينيكي:</strong> {finding.recommendation}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AuditAssistModule;
