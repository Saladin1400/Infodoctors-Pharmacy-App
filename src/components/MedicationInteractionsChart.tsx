/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { 
  AlertTriangle, CheckCircle2, TrendingUp, Sparkles, HelpCircle, 
  ChevronLeft, Info, Calendar, BookOpen, Clock, FileCheck 
} from "lucide-react";

interface InteractionData {
  id: string;
  drugs: string;
  drugsEn: string;
  severity: "Red" | "Yellow" | "Green";
  frequency: number;
  mechanism: string;
  recommendation: string;
  trend: number[];
}

const STATIC_INTERACTION_DATA: InteractionData[] = [
  {
    id: "DDI-01",
    drugs: "ايبوبروفين + وارفارين",
    drugsEn: "Ibuprofen + Warfarin",
    severity: "Red",
    frequency: 42,
    mechanism: "تثبيط البروستاجلاندين بواسطة مضادات الالتهاب غير الستيروئيدية (NSAIDs) يؤدي إلى إتلاف الغشاء المخاطي المبطن للمعدة ويمنع تراكم الصفائح الدموية، مما يضاعف من التأثير المضاد للتجلط للوارفارين ويزيد احتمالية النزيف المعوي الحاد بـ 4 أضعاف.",
    recommendation: "استخدام الباراسيتامول كبديل آمن لتسكين الآلام وخفض الحرارة، وإذا كان الاستخدام ضرورياً يجب مراقبة زمن البروثرومبين (INR) بدقة وتعديل جرعة الوارفارين.",
    trend: [10, 12, 9, 11]
  },
  {
    id: "DDI-02",
    drugs: "سيلدينافيل + نيترات العضلة القلبية",
    drugsEn: "Sildenafil + Nitrates",
    severity: "Red",
    frequency: 38,
    mechanism: "تثبيط إنزيم PDE5 بواسطة السيلدينافيل يمنع تكسير أحادي الفوسفات الحلقي (cGMP)، مما يعزز بشدة التأثير الموسع للأوعية الدموية للنيتروجليسرين ويؤدي إلى هبوط مفاجئ وحاد وحرج في ضغط الدم الشرياني قد يسبب الوفاة.",
    recommendation: "يمنع الجمع بينهما منعاً باتاً تحت أي ظرف. يجب الانتظار 24 ساعة على الأقل بعد استخدام السيلدينافيل قبل تناول أي جرعة من النيترات، و48 ساعة في حالة التادالافيل.",
    trend: [8, 11, 10, 9]
  },
  {
    id: "DDI-03",
    drugs: "مثبطات ACE + مكملات البوتاسيوم",
    drugsEn: "ACE Inhibitors + Potassium",
    severity: "Yellow",
    frequency: 29,
    mechanism: "تثبيط الألدوسترون بواسطة مثبطات الإنزيم المحول للأنجيوتنسين (مثل كابتوبريل/ليسينوبريل) يقلل من إفراز البوتاسيوم في الكلى، والجمع مع مكملات البوتاسيوم يسبب تراكماً سريعاً وهيبيركاليميا (Hyperkalemia) قد تؤدي لاضطراب نظم القلب القاتل.",
    recommendation: "مراقبة مستويات البوتاسيوم ووظائف الكلى دورياً (كل 4-6 أسابيع)، ويوصى بالاعتماد على التغذية الطبيعية المتوازنة وتجنب مكملات البوتاسيوم المركزة إلا تحت إشراف سريري لصيق.",
    trend: [6, 8, 7, 8]
  },
  {
    id: "DDI-04",
    drugs: "كلوبيدوجريل + أوميبرازول",
    drugsEn: "Clopidogrel + Omeprazole",
    severity: "Yellow",
    frequency: 25,
    mechanism: "مثبط مضخة البروتون أوميبرازول يثبط إنزيم الكبد CYP2C19 المسؤول الرئيسي عن استقلاب الكلوبيدوجريل (Plavix) وتحويله لصورته النشطة بيولوجياً، مما يقلل الكفاءة المضادة للتجلط بنسبة 46% ويزيد خطر السكتات.",
    recommendation: "استبدال الأوميبرازول بـ البانتوبرازول (Pantoprazole) أو الإيزوميبرازول كبدائل آمنة حيث أنها تبدي تأثيراً ضعيفاً جداً على هذا الإنزيم الكبدي ولا تلغي كفاءة الحماية القلبية.",
    trend: [5, 6, 7, 7]
  },
  {
    id: "DDI-05",
    drugs: "سيبروفلوكساسين + مكملات الكالسيوم",
    drugsEn: "Ciprofloxacin + Calcium",
    severity: "Green",
    frequency: 21,
    mechanism: "يرتبط الكالسيوم ثنائي التكافؤ بالسيبروفلوكساسين في الأمعاء مكوناً معقداً مخلبياً (Chelation complex) غير قابل للامتصاص، مما يخفض بشكل حاد التركيز العلاجي الفعال للمضاد الحيوي في الدم ويؤدي لفشل علاج العدوى.",
    recommendation: "تثقيف المريض بضرورة تناول المضاد الحيوي قبل مكملات الكالسيوم أو منتجات الألبان بساعتين، أو بعدها بـ 6 ساعات لتلافي التداخل الكيميائي.",
    trend: [4, 5, 6, 6]
  },
  {
    id: "DDI-06",
    drugs: "أتورفاستاتين + كلاريثروميسين",
    drugsEn: "Atorvastatin + Clarithromycin",
    severity: "Red",
    frequency: 18,
    mechanism: "كلاريثروميسين هو مثبط قوي جداً لإنزيم الكبد CYP3A4 وهو المسار الهضمي لاستقلاب الأتورفاستاتين (Lipitor). الجمع بينهما يرفع مستويات الكوليسترول-ستاتين في الدم لعشرة أضعاف مسبباً تحلل العضلات المخططة البولية (Rhabdomyolysis) والفشل الكلوي.",
    recommendation: "إيقاف تناول أتورفاستاتين مؤقتاً خلال دورة المضاد الحيوي (عادة 7-10 أيام)، أو استخدام مضاد حيوي بديل لا يتعارض مثل الأزيثروميسين (Azithromycin).",
    trend: [3, 4, 5, 6]
  },
  {
    id: "DDI-07",
    drugs: "ميتفورمين + صبغة اليود الإشعاعية",
    drugsEn: "Metformin + Contrast Dye",
    severity: "Yellow",
    frequency: 15,
    mechanism: "صبغات التباين التي تحتوي على اليود والمستخدمة في الأشعة التشخيصية قد تسبب قصوراً كلوياً وظيفياً مؤقتاً. تراكم الميتفورمين الناتج عن عجز الإخراج الكلوي يؤدي لحدوث حموضة لاكتية (Lactic Acidosis) حادة ونادرة وخطيرة.",
    recommendation: "إيقاف تناول الميتفورمين (Glucophage) قبل موعد الأشعة بالصبغة بـ 48 ساعة على الأقل، وعدم استئناف العلاج إلا بعد مرور 48 ساعة من الإجراء والتحقق مخبرياً من عودة معدل ترشيح الكلى (eGFR) للمعدل الطبيعي.",
    trend: [3, 3, 4, 5]
  },
  {
    id: "DDI-08",
    drugs: "أسبرين + إيبوبروفين",
    drugsEn: "Aspirin + Ibuprofen",
    severity: "Yellow",
    frequency: 12,
    mechanism: "الإيبوبروفين يمنع وصول الأسبرين بتركيزات حيوية كافية إلى جزيء COX-1 في الصفائح الدموية في الأوعية الدموية بشكل تنافسي، مما يجهض التأثير الوقائي الدائم للأسبرين ضد النوبات القلبية والجلطات الدماغية.",
    recommendation: "يوصى بتناول جرعة أسبرين الأطفال (سريع الذوبان أو الامتصاص) قبل تناول جرعة الإيبوبروفين بساعتين على الأقل، أو الانتظار 8 ساعات بعد الإيبوبروفين قبل أخذ الأسبرين.",
    trend: [2, 3, 3, 4]
  }
];

export default function MedicationInteractionsChart() {
  const [filter, setFilter] = useState<"All" | "Red" | "Yellow" | "Green">("All");
  const [selectedItem, setSelectedItem] = useState<InteractionData | null>(STATIC_INTERACTION_DATA[0]);
  
  const d3ContainerRef = useRef<SVGSVGElement>(null);
  const containerParentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 550, height: 320 });

  // Handle responsive resize via ResizeObserver
  useEffect(() => {
    if (!containerParentRef.current) return;
    
    // Timer to debounce resize actions to protect performance
    let resizeTimer: number;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Keep within safe visual boundaries
        const targetWidth = Math.max(width - 16, 280);
        
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          setDimensions({
            width: targetWidth,
            height: 290
          });
        }, 120);
      }
    });

    resizeObserver.observe(containerParentRef.current);
    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(resizeTimer);
    };
  }, []);

  // Filter interaction reports
  const filteredData = useMemo(() => {
    if (filter === "All") return STATIC_INTERACTION_DATA;
    return STATIC_INTERACTION_DATA.filter(d => d.severity === filter);
  }, [filter]);

  // Handle building and transitions of the D3 Chart
  useEffect(() => {
    if (!d3ContainerRef.current || filteredData.length === 0) return;

    // Clear previous elements
    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    
    const margin = { top: 20, right: 35, bottom: 35, left: 165 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale - Frequencies
    const maxFreq = d3.max(STATIC_INTERACTION_DATA, d => d.frequency) || 50;
    const xScale = d3.scaleLinear()
      .domain([0, maxFreq + 5])
      .range([0, chartWidth]);

    // Y scale - Interaction Drugs
    const yScale = d3.scaleBand()
      .domain(filteredData.map(d => d.drugs))
      .range([0, chartHeight])
      .padding(0.35);

    // Grid lines for frequency intervals
    g.append("g")
      .attr("class", "grid-lines stroke-slate-800/40")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove());

    // Color definitions
    const getSeverityColor = (sev: string) => {
      switch (sev) {
        case "Red": return "#f43f5e"; // rose-500
        case "Yellow": return "#fbbf24"; // amber-400
        case "Green": return "#10b981"; // emerald-500
        default: return "#cbd5e1";
      }
    };

    // Render bars with entrance animation
    const bars = g.selectAll(".bar")
      .data(filteredData, (d: any) => d.id)
      .enter()
      .append("rect")
      .attr("class", "bar cursor-pointer transition-all duration-300")
      .attr("y", d => yScale((d as InteractionData).drugs) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", d => getSeverityColor((d as InteractionData).severity))
      .attr("opacity", 0.85)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 1.0)
          .attr("filter", "brightness(1.15)")
          .style("transform", "scaleX(1.02)");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", 0.85)
          .attr("filter", "none")
          .style("transform", "none");
      })
      .on("click", (event, d) => {
        setSelectedItem(d as InteractionData);
      });

    // Animate width from 0 on load
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr("width", d => xScale((d as InteractionData).frequency));

    // Render text label inside or right next to each bar
    g.selectAll(".bar-value")
      .data(filteredData, (d: any) => d.id)
      .enter()
      .append("text")
      .attr("class", "bar-value font-mono font-bold text-[10px] text-slate-300 fill-slate-300 pointer-events-none")
      .attr("y", d => (yScale((d as InteractionData).drugs) || 0) + yScale.bandwidth() / 2 + 3.5)
      .attr("x", 0)
      .attr("text-anchor", "start")
      .attr("dx", 8)
      .text(d => `${(d as InteractionData).frequency} حالة`)
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .attr("x", d => xScale((d as InteractionData).frequency));

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(4)
      .tickFormat(d => `${d} مرّات`);

    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .attr("class", "text-slate-400 font-sans text-[9px]")
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#334155"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#334155"));

    // Y Axis (Custom Arabic drugs titles)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    const yAxisGroup = g.append("g")
      .attr("class", "text-slate-200 font-sans text-[10.5px] font-bold")
      .call(yAxis);

    yAxisGroup.select(".domain").remove();

    // Adjust Arabic text anchor alignment for right-to-left vibes
    yAxisGroup.selectAll("text")
      .attr("dx", -6)
      .style("text-anchor", "end")
      .attr("class", "hover:fill-teal-400 transition-colors cursor-pointer")
      .on("click", (event, d: any) => {
        const found = STATIC_INTERACTION_DATA.find(x => x.drugs === d);
        if (found) setSelectedItem(found);
      });

  }, [filteredData, dimensions, filter]);

  return (
    <div className="w-full flex flex-col space-y-4 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* Upper Status & Interactive Dashboard Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="bg-rose-500/10 text-rose-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/20">
              📊 مرصد التداخلات الدوائية الإقليمي (DDU/DDI)
            </span>
            <span className="bg-slate-800 text-slate-300 text-[9.5px] px-2 py-0.5 rounded-full border border-slate-700">
              آخر 30 يوماً
            </span>
          </div>
          <h3 className="text-sm font-black text-white mt-1">تكرار ومعدلات التداخلات الدوائية المرصودة في مصر</h3>
          <p className="text-[10px] text-slate-400">نظام ذكاء سريري تفاعلي مبني بـ D3.js لتحليل خطورة تضارب الأدوية الموصوفة للمرضى من الصيادلة الاستشاريين.</p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto shrink-0">
          {([
            { key: "All", label: "الكل" },
            { key: "Red", label: "حرجة 🔴" },
            { key: "Yellow", label: "متوسطة 🟡" },
            { key: "Green", label: "خفيفة 🟢" }
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setFilter(opt.key);
                // Auto-select first item matching filter
                const matched = STATIC_INTERACTION_DATA.find(d => opt.key === "All" || d.severity === opt.key);
                if (matched) setSelectedItem(matched);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer focus:outline-none ${
                filter === opt.key
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split dashboard block: D3 Chart (Right) + Side Clinical Details (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* RIGHT PANEL: D3.js Canvas Container (7 cols) */}
        <div 
          ref={containerParentRef} 
          className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-slate-400 font-extrabold flex items-center space-x-1.5 space-x-reverse">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>انقر فوق أي شريط أو اسم عقار لاستكشاف التحليل الطبي والأثر الجانبي</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">D3 Dynamic Engine</span>
          </div>

          <div className="w-full flex justify-center items-center overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs font-bold w-full">
                لا توجد تداخلات مسجلة لهذه الفئة حالياً.
              </div>
            ) : (
              <svg 
                ref={d3ContainerRef} 
                width={dimensions.width} 
                height={dimensions.height}
                className="overflow-visible font-sans max-w-full"
              />
            )}
          </div>

          {/* Scale labels */}
          <div className="flex justify-between items-center border-t border-slate-800/60 pt-2 text-[9px] text-slate-500">
            <span>* التكرارات المذكورة تغذيها عمليات التدقيق وحجوزات الـ DUR المكتملة.</span>
            <span className="flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              <span>حرجة</span>
              <span className="w-2 h-2 bg-amber-400 rounded-full ml-1"></span>
              <span>متوسطة</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full ml-1"></span>
              <span>منخفضة</span>
            </span>
          </div>
        </div>

        {/* LEFT PANEL: Selected Interaction Clinical Briefing (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          {selectedItem ? (
            <div className="space-y-3.5 text-right">
              
              {/* Card Header with Severity badge */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10.5px] text-slate-400 font-bold font-sans">{selectedItem.id}</span>
                  <h4 className="text-xs font-black text-white">{selectedItem.drugs}</h4>
                  <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">{selectedItem.drugsEn}</p>
                </div>
                
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${
                  selectedItem.severity === "Red"
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/25 animate-pulse"
                    : selectedItem.severity === "Yellow"
                    ? "bg-amber-400/15 text-amber-300 border-amber-400/25"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                }`}>
                  {selectedItem.severity === "Red" ? "تداخل حرج 🚨" : selectedItem.severity === "Yellow" ? "تداخل متوسط ⚠️" : "تداخل خفيف 🟢"}
                </span>
              </div>

              {/* Mechanism of Action */}
              <div className="space-y-1">
                <span className="text-[10px] text-teal-400 font-extrabold flex items-center space-x-1.5 space-x-reverse">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>آلية التداخل والتأثير الفارماكولوجي:</span>
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  {selectedItem.mechanism}
                </p>
              </div>

              {/* Recommendation */}
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center space-x-1.5 space-x-reverse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>التوصية المهنية السريرية والبدائل المعتمدة:</span>
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300 bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-500/15">
                  {selectedItem.recommendation}
                </p>
              </div>

              {/* Trend Mini Visualization */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>منحنى التكرار الأسبوعي (الـ 4 أسابيع الماضية)</span>
                  <span className="text-emerald-400 flex items-center space-x-1 space-x-reverse font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>مستقر</span>
                  </span>
                </div>
                
                {/* Visual sparkline bars */}
                <div className="flex justify-between items-end h-8 px-2 pt-1">
                  {selectedItem.trend.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                      <div 
                        style={{ height: `${(val / 15) * 100}%` }}
                        className={`w-4 rounded-t ${
                          selectedItem.severity === "Red" 
                            ? "bg-rose-500/60" 
                            : selectedItem.severity === "Yellow" 
                            ? "bg-amber-400/60" 
                            : "bg-emerald-500/60"
                        }`}
                      />
                      <span className="text-[8px] text-slate-500 font-mono">أسبوع {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <HelpCircle className="w-10 h-10 text-slate-600 animate-pulse" />
              <span className="text-xs text-slate-400 font-bold">الرجاء تحديد تفاعل من الرسم البياني لعرض معايير الأثر الطبي والسريري البديل.</span>
            </div>
          )}

          {/* Quick Regulatory reminder */}
          <div className="bg-teal-950/25 border border-teal-500/10 rounded-xl p-2.5 text-[9.5px] text-teal-400 leading-snug flex items-start space-x-1.5 space-x-reverse shrink-0">
            <FileCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p>
              تخضع هذه البيانات لتصنيفات الأدوية المعتمدة من <strong>هيئة الدواء المصرية (EDA)</strong> ووزارة الصحة لضمان الامتثال لضوابط السلامة والحد من تكرار الأخطاء الدوائية الشائعة.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
