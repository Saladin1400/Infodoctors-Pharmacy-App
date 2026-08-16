import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Activity, FileText, Settings, 
  Search, Bell, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Database, RefreshCw, BarChart2, KeyRound, X, Pill, 
  Sparkles, User, Calendar, MapPin, Phone, AlertCircle, 
  Stethoscope, Eye, Printer, ShieldAlert, HeartPulse, FileCheck
} from 'lucide-react';

interface PrescribedMedication {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  status: 'safe' | 'warning' | 'danger';
  note?: string;
}

interface AuditRecord {
  id: string;
  patient: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  phone: string;
  governorate: string;
  chronicDiseases: string[];
  allergies: string[];
  diagnosis: string;
  pharmacist: string;
  specialty: string;
  status: 'تم التدقيق' | 'قيد المراجعة' | 'يحتاج توضيح' | 'تم الصرف';
  time: string;
  badge: string;
  prescriptionDate: string;
  doctorName: string;
  clinicName: string;
  medications: PrescribedMedication[];
  aiAudit: {
    safetyScore: number; // e.g. 92%
    riskLevel: 'منخفض (آمن)' | 'متوسط (يتطلب تعديل)' | 'عالي (تعارض خطير)';
    summary: string;
    interactions: string[];
    dosageRecommendations: string;
    foodInteractions: string;
  };
  pharmacistNotes: string;
  reportRefNumber: string;
}

export default function AdminApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacists' | 'audits' | 'settings'>('overview');
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  const stats = [
    { title: 'إجمالي الصيادلة المعتمدين', value: '48', icon: Users, change: '+12%', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { title: 'روشتات قيد المراجعة الإكلينيكية (DUR)', value: '19', icon: Activity, change: '+5%', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { title: 'التقارير السريرية المصدرة', value: '1,240', icon: FileText, change: '+18%', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'حالة خوادم قاعدة البيانات', value: 'مستقرة 99.9%', icon: Database, change: 'نشط', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  ];

  const recentAudits: AuditRecord[] = [
    {
      id: 'REV-892',
      patient: 'أحمد محمود سليمان',
      age: 46,
      gender: 'ذكر',
      phone: '01012345678',
      governorate: 'القاهرة (مدينة نصر)',
      chronicDiseases: ['ارتفاع ضغط الدم', 'داء السكري من النوع الثاني'],
      allergies: ['حساسية البنسلين (Penicillin Allergy)'],
      diagnosis: 'ارتفاع حاد في ضغط الدم الشرياني واعتلال سكري طفيف',
      pharmacist: 'د. سارة المنشاوي',
      specialty: 'أمراض باطنة وغدد صماء',
      status: 'تم التدقيق',
      time: 'منذ 10 دقائق',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      prescriptionDate: '2026-08-16',
      doctorName: 'أ.د. عصام القاضي (استشاري الباطنة)',
      clinicName: 'مجمع عيادات دار الفؤاد التخصصية',
      medications: [
        {
          name: 'Concor 5 Plus',
          genericName: 'Bisoprolol + Hydrochlorothiazide',
          dosage: '5mg / 12.5mg',
          frequency: 'قرص واحد صباحاً',
          instructions: 'يؤخذ بعد وجبة الإفطار مع كوب ماء كامل',
          status: 'safe',
          note: 'متوافق مع خطة علاج الضغط'
        },
        {
          name: 'Janumet 50/1000',
          genericName: 'Sitagliptin + Metformin HCl',
          dosage: '50mg / 1000mg',
          frequency: 'قرص مرتين يومياً',
          instructions: 'يؤخذ وسط الوجبة الرئيسية لتجنب الاضطرابات الهضمية',
          status: 'safe',
          note: 'مراقبة سكر الدم التراكمي دورياً'
        },
        {
          name: 'Lipitor 20mg',
          genericName: 'Atorvastatin Calcium',
          dosage: '20mg',
          frequency: 'قرص واحد مساءً قبل النوم',
          instructions: 'تجنب تناول الجريب فروت أثناء فترة العلاج',
          status: 'safe',
          note: 'فحص وظائف الكبد كل 6 أشهر'
        }
      ],
      aiAudit: {
        safetyScore: 96,
        riskLevel: 'منخفض (آمن)',
        summary: 'لا توجد تعارضات دوائية خطيرة (Contraindications). تم تأكيد أمان استخدام مثبطات بيتا مع أدوية السكري للمريض مع توصية بمراقبة أعراض هبوط السكر.',
        interactions: [
          'Bisoprolol + Metformin: قد يُخفي Bisoprolol بعض علامات هبوط السكر مثل تسارع نبضات القلب، يُنصح المريض بمراقبة التعرق والرعشة.',
          'Hydrochlorothiazide: مراقبة شوارد الدم (البوتاسيوم والصوديوم) كل 3 أشهر.'
        ],
        dosageRecommendations: 'الجرعات المقررة متوافقة تماماً مع معايير الجمعية الأمريكية للسكري (ADA 2026) وهيئة الدواء المصرية (EDA).',
        foodInteractions: 'تجنب عصير الجريب فروت لتأثيره على أيض Atorvastatin عبر إنزيم CYP3A4.'
      },
      pharmacistNotes: 'تمت مراجعة الوصفة الطبية والتحقق من عدم وجود حساسية ضد مركبات السلفا، وتم تدقيق وظائف الكلى (eGFR = 88 ml/min). التقرير السريري معتمد وموقع رقمياً.',
      reportRefNumber: 'EDA-CLIN-2026-892-SM'
    },
    {
      id: 'REV-891',
      patient: 'مريم السيد حسن',
      age: 29,
      gender: 'أنثى',
      phone: '01123456789',
      governorate: 'الجيزة (الدقي)',
      chronicDiseases: ['حمل في الأسبوع 18', 'فقر دم خفيف (Hb: 10.2)'],
      allergies: ['لا توجد حساسية دوائية مسجلة'],
      diagnosis: 'رعاية الحمل - التهاب المسالك البولية الحملي (Gestational UTI)',
      pharmacist: 'د. خالد عبد الرحمن',
      specialty: 'نساء وتوليد ورعاية حوامل (DUR)',
      status: 'قيد المراجعة',
      time: 'منذ 25 دقيقة',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      prescriptionDate: '2026-08-16',
      doctorName: 'د. نورهان الشناوي (أخصائية النساء والتوليد)',
      clinicName: 'مركز الشناوي لرعاية الأم والجنين',
      medications: [
        {
          name: 'Cefotax 1g Vial',
          genericName: 'Cefotaxime Sodium',
          dosage: '1000mg',
          frequency: 'حقنة عضلية كل 12 ساعة لمدة 5 أيام',
          instructions: 'حقن عضل عميق بعد عمل اختبار حساسية السيفالوسبورين',
          status: 'safe',
          note: 'آمن أثناء الحمل من الفئة Category B'
        },
        {
          name: 'Feroglobin B12 Capsules',
          genericName: 'Iron + Zinc + Folic Acid + B12',
          dosage: 'كبسولة واحدة',
          frequency: 'كبسولة يومياً بعد الغداء',
          instructions: 'تناولها مع عصير برتقال لزيادة الامتصاص وفصلها عن منتجات الألبان بساعتين',
          status: 'safe',
          note: 'مكمل لرفع نسبة الهيموجلوبين'
        },
        {
          name: 'Cataflam 50mg (مسكن مقترح)',
          genericName: 'Diclofenac Potassium',
          dosage: '50mg',
          frequency: 'عند اللزوم للألم الشديد',
          instructions: 'ملاحظة حرجة: يُمنع استخدام مضادات الالتهاب غير الستيرويدية أثناء الحمل',
          status: 'danger',
          note: 'مخاطر إغلاق القناة الشريانية الجنينية وتأثير على الكلى'
        }
      ],
      aiAudit: {
        safetyScore: 68,
        riskLevel: 'عالي (تعارض خطير)',
        summary: 'تنبيه أمان حرج (FDA Pregnancy Alert): تم رصد وصف مسكن مضاد للالتهاب (NSAID: Cataflam) لسيدة حامل في الثلث الثاني. يوصى فوراً باستبداله بالباراسيتامول (Paracetamol 500-1000mg).',
        interactions: [
          'Diclofenac Potassium أثناء الحمل: يحمل خطورة حدوث قلة السائل السلوي (Oligohydramnios) والإغلاق المبكر للقناة الشريانية للجنين.',
          'Iron Supplementation: يجب الفصل بينه وبين مضادات الحموضة والألبان لمدة لا تقل عن ساعتين.'
        ],
        dosageRecommendations: 'إيقاف Cataflam فوراً واقتراح بديل آمن: Panadol 500mg بحد أقصى 3 جرامات يومياً.',
        foodInteractions: 'تجنب تناول مكمل الحديد مع الشاي أو القهوة مباشرة.'
      },
      pharmacistNotes: 'جاري الاتصال بالطبيبة المعالجة د. نورهان الشناوي لاستبدال عقار Cataflam بـ Paracetamol لضمان سلامة الجنين والأم.',
      reportRefNumber: 'EDA-CLIN-2026-891-KR'
    },
    {
      id: 'REV-890',
      patient: 'محمود عبد الفتاح قاسم',
      age: 63,
      gender: 'ذكر',
      phone: '01234567890',
      governorate: 'الإسكندرية (سموحة)',
      chronicDiseases: ['قصور كلوي مزمن (CKD Stage 3b)', 'رجفان أذيني (Atrial Fibrillation)'],
      allergies: ['حساسية أدوية السلفا (Sulfonamides)'],
      diagnosis: 'وقاية من السكتة الدماغية واضطراب نظم القلب المزمن',
      pharmacist: 'د. أحمد الهواري',
      specialty: 'أمراض كلى وقلب سريرية',
      status: 'يحتاج توضيح',
      time: 'منذ 45 دقيقة',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      prescriptionDate: '2026-08-16',
      doctorName: 'أ.د. طارق السعدني (استشاري أمراض القلب والأوعية)',
      clinicName: 'مركز سموحة التخصصي لأمراض القلب',
      medications: [
        {
          name: 'Eliquis 5mg (Apixaban)',
          genericName: 'Apixaban',
          dosage: '5mg',
          frequency: 'قرص مرتين يومياً',
          instructions: 'تعديل الجرعة مطلوب بناءً على وظائف الكلى والعمر',
          status: 'warning',
          note: 'يحتاج تخفيض الجرعة إلى 2.5mg مرتين يومياً لتطابق شرطين (العمر > 80 أو الكرياتينين > 1.5)'
        },
        {
          name: 'Cordarone 200mg',
          genericName: 'Amiodarone HCl',
          dosage: '200mg',
          frequency: 'قرص واحد يومياً',
          instructions: 'تناوله بانتظام مع مراقبة تخطيط القلب ECG وفحص الغدة الدرقية',
          status: 'warning',
          note: 'تداخل دوائي محتمل مع مضادات التخثر'
        }
      ],
      aiAudit: {
        safetyScore: 74,
        riskLevel: 'متوسط (يتطلب تعديل)',
        summary: 'تعديل جرعة مضاد التخثر (Apixaban Dose Adjustment): بالنظر لتحليل الكرياتينين (Serum Cr = 1.9 mg/dL) ووزن المريض، ينبغي خفض الجرعة لتفادي خطر النزيف المفرط.',
        interactions: [
          'Amiodarone + Apixaban: مثبط لبروتين P-gp السكري مما قد يزيد من تركيز Apixaban في بلازما الدم بنسبة 30%.',
          'مراقبة علامات النزيف الخفي أو الكدمات الجلدية غير المبررة.'
        ],
        dosageRecommendations: 'تعديل جرعة Apixaban إلى 2.5mg مرتين يومياً مع فحص وظائف الكلى كل شهرين.',
        foodInteractions: 'تجنب المكملات العشبية المحتوية على الجنكة أو الثوم المركز لتأثيرها المميع للدم.'
      },
      pharmacistNotes: 'تم إرسال استفسار سريري رسمي للطبيب المعالج عبر منصة InfoDoctors لتعديل الجرعة وتحديث أمر الصرف.',
      reportRefNumber: 'EDA-CLIN-2026-890-AH'
    }
  ];

  const filteredAudits = recentAudits.filter(a => 
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pharmacist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-teal-500 selection:text-white">
      {/* HEADER BAR */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 border border-teal-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              لوحة الرقابة والإدارة المركزية - InfoDoctors
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                Admin Control v4.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              نظام الرقابة والإشراف الإداري على الفحوصات والاعتمادات الصيدلانية السريرية ومراجعة الذكاء الاصطناعي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالمريض، الكود، الطبيب أو الصيدلي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <button className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 left-1.5 animate-ping"></span>
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="max-w-7xl mx-auto flex gap-2 my-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'نظرة عامة والتدقيق', icon: BarChart2 },
          { id: 'pharmacists', label: 'إدارة الصيادلة والتراخيص', icon: Users },
          { id: 'audits', label: 'سجل المراجعات السريرية (DUR)', icon: FileText },
          { id: 'settings', label: 'إعدادات النظام والأمان', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-slate-900 border ${stat.border} shadow-sm space-y-3 relative overflow-hidden`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400">{stat.title}</span>
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                  <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AUDIT LOG TABLE & ACTIVITY */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                سجل تدقيق الروشتات والتقارير السريرية
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                انقر على أي صف لفتح تقرير الحالة الشامل، الأدوية الموصوفة، ونتائج فحص الذكاء الاصطناعي (Gemini AI DUR)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20 font-bold">
                {filteredAudits.length} روشتة مسجلة
              </span>
              <button className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="py-3.5 px-4 font-bold">كود المراجعة</th>
                  <th className="py-3.5 px-4 font-bold">المريض المستفيد</th>
                  <th className="py-3.5 px-4 font-bold">المحافظة / النطاق</th>
                  <th className="py-3.5 px-4 font-bold">الصيدلي المعتمد</th>
                  <th className="py-3.5 px-4 font-bold">التخصص</th>
                  <th className="py-3.5 px-4 font-bold">أمان الذكاء الاصطناعي</th>
                  <th className="py-3.5 px-4 font-bold">الحالة</th>
                  <th className="py-3.5 px-4 font-bold">التوقيت</th>
                  <th className="py-3.5 px-4 font-bold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredAudits.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedAudit(row)}
                    className="hover:bg-teal-950/20 hover:border-teal-500/40 transition-all cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500 group-hover:scale-125 transition-transform"></span>
                      {row.id}
                    </td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      <div>{row.patient}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{row.age} سنة • {row.gender}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{row.governorate}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-bold">{row.pharmacist}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.specialty}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.aiAudit.riskLevel.includes('منخفض')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : row.aiAudit.riskLevel.includes('متوسط')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {row.aiAudit.safetyScore}% ({row.aiAudit.riskLevel.split(' ')[0]})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.badge}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{row.time}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAudit(row);
                        }}
                        className="p-1.5 bg-teal-500/10 text-teal-300 hover:bg-teal-500 hover:text-white rounded-lg border border-teal-500/30 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* DIALOG MODAL: DETAILED PRESCRIPTION & AI AUDIT REPORT */}
      {/* ============================================================ */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-right text-slate-100"
          >
            {/* MODAL HEADER */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 border-b border-slate-800 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full font-mono text-xs font-bold">
                    {selectedAudit.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedAudit.badge}`}>
                    {selectedAudit.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    رقم الوثيقة: {selectedAudit.reportRefNumber}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white flex items-center gap-2 pt-1">
                  <span>الملف الإكلينيكي للروشتة: {selectedAudit.patient}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedAudit.clinicName} • الطبيب المحول: {selectedAudit.doctorName} • تاريخ الوصفة: {selectedAudit.prescriptionDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 1. PATIENT DEMOGRAPHICS & CLINICAL HISTORY */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black text-teal-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-4 h-4" />
                  <span>البيانات الشخصية والتاريخ الصحي للمريض</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">العمر والنوع:</span>
                    <span className="text-white font-bold text-xs">{selectedAudit.age} سنة ({selectedAudit.gender})</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">رقم الهاتف:</span>
                    <span className="text-white font-mono font-bold text-xs">{selectedAudit.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">المحافظة والعنوان:</span>
                    <span className="text-white font-bold text-xs">{selectedAudit.governorate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">الصيدلي المعتمد:</span>
                    <span className="text-teal-300 font-bold text-xs">{selectedAudit.pharmacist}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                      التشخيص الطبي الأولي:
                    </span>
                    <span className="text-slate-200 font-bold">{selectedAudit.diagnosis}</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      الأمراض المزمنة:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAudit.chronicDiseases.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded text-[10.5px] font-bold border border-amber-500/20">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      الحساسيات الدوائية (Allergies):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAudit.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded text-[10.5px] font-bold border border-rose-500/20">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PRESCRIBED MEDICATIONS TABLE */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black text-teal-400 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    <span>جدول الأدوية والجرعات المسجلة بالروشتة ({selectedAudit.medications.length} أصناف)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Prescription Regimen</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="text-slate-400 bg-slate-900/60 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">اسم الدواء التجاري</th>
                        <th className="py-2.5 px-3 font-bold">المادة الفعالة (Generic)</th>
                        <th className="py-2.5 px-3 font-bold">التركيز والجرعة</th>
                        <th className="py-2.5 px-3 font-bold">التكرار والتعليمات</th>
                        <th className="py-2.5 px-3 font-bold">مستوى الأمان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {selectedAudit.medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-teal-400 font-mono">
                              {idx + 1}
                            </span>
                            {med.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{med.genericName}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-bold">{med.dosage}</td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            <div>{med.frequency}</div>
                            <span className="text-[10px] text-slate-500 block">{med.instructions}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              med.status === 'safe'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : med.status === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {med.status === 'safe' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {med.status === 'safe' ? 'آمن' : med.status === 'warning' ? 'تعديل جرعة' : 'تعارض حرج'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. GEMINI AI DUR AUDIT & CLINICAL SUMMARY */}
              <div className="bg-gradient-to-br from-indigo-950/50 via-slate-950 to-teal-950/40 p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white flex items-center gap-2">
                        <span>تقرير التدقيق الآلي للذكاء الاصطناعي (Gemini AI DUR Engine)</span>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono">EDA Guidelines</span>
                      </h3>
                      <p className="text-[10.5px] text-slate-400">تحليل التفاعلات الدوائية والتوافق مع الحالة الفسيولوجية للمريض</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">مؤشر السلامة الإكلينيكية:</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                      selectedAudit.aiAudit.safetyScore >= 85
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : selectedAudit.aiAudit.safetyScore >= 70
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {selectedAudit.aiAudit.safetyScore}% ({selectedAudit.aiAudit.riskLevel})
                    </span>
                  </div>
                </div>

                {/* AI Summary Box */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>الخلاصة السريرية للذكاء الاصطناعي:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {selectedAudit.aiAudit.summary}
                  </p>
                </div>

                {/* Interactions & Dosage Adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      التداخلات الدوائية المرصودة:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {selectedAudit.aiAudit.interactions.map((inter, i) => (
                        <li key={i}>{inter}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-teal-400 block flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      توصيات تعديل الجرعات والغذاء:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {selectedAudit.aiAudit.dosageRecommendations}
                    </p>
                    <p className="text-slate-400 text-[10.5px] border-t border-slate-800 pt-1">
                      💡 {selectedAudit.aiAudit.foodInteractions}
                    </p>
                  </div>
                </div>

                {/* Pharmacist Review Notes */}
                <div className="p-3.5 bg-teal-950/30 rounded-xl border border-teal-500/30 space-y-1">
                  <span className="text-[11px] font-bold text-teal-300 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    قرار وملاحظات الصيدلي الإكلينيكي المعتمد ({selectedAudit.pharmacist}):
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {selectedAudit.pharmacistNotes}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                InfoDoctors Clinical Safety Hub • Digtally Signed Report
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => alert(`تم إرسال التقرير السريري ${selectedAudit.reportRefNumber} إلى الطباعة والتصدير PDF.`)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-teal-400" />
                  <span>طباعة التقرير الرقمي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAudit(null)}
                  className="flex-1 sm:flex-none px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 transition-all cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
