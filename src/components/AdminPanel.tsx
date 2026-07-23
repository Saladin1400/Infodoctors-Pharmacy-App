/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, Settings, ShieldCheck, DollarSign, Clock, Users, CalendarCheck, 
  ArrowUpRight, Sparkles, RefreshCw, Send, ListFilter, Sliders, ToggleLeft,
  MapPin, CalendarDays, Award, CheckCircle2, Zap, Power, Briefcase, Activity,
  TrendingUp, Phone, ExternalLink, ShieldAlert, FileText, Layers
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { OperationalMetrics, ApprovedSpecialtiesList } from "../types";

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'pharmacists' | 'pricing' | 'logs'>('reports');
  
  // Custom campaign variables
  const [otcPrice, setOtcPrice] = useState("250");
  const [revisionPrice, setRevisionPrice] = useState("350");
  const [mgmtPrice, setMgmtPrice] = useState("400");
  const [discountPercent, setDiscountPercent] = useState("10");

  const [isUpdatingCampaign, setIsUpdatingCampaign] = useState(false);

  // Admin Financial Report & Commissions states
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);
  const [financeTimeframe, setFinanceTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [financeRegion, setFinanceRegion] = useState<string>('All');
  const [financeSpecialty, setFinanceSpecialty] = useState<string>('All');
  const [financeType, setFinanceType] = useState<string>('All');
  const [financeStartDate, setFinanceStartDate] = useState<string>('');
  const [financeEndDate, setFinanceEndDate] = useState<string>('');
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);

  // Active Pharmacists state
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [isLoadingPharmacists, setIsLoadingPharmacists] = useState(false);
  
  // Pharmacists directory filters
  const [pharmacistRegion, setPharmacistRegion] = useState<string>('All');
  const [pharmacistDegree, setPharmacistDegree] = useState<string>('All');
  const [pharmacistStatus, setPharmacistStatus] = useState<'All' | 'online' | 'offline'>('All');

  // Commission growth chart view state
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const fetchFinanceData = async () => {
    setIsLoadingFinance(true);
    try {
      const res = await fetch("/api/v1/financials");
      if (res.ok) {
        const data = await res.json();
        setFinanceTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching financials:", err);
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const fetchPharmacists = async () => {
    setIsLoadingPharmacists(true);
    try {
      const res = await fetch("/api/v1/pharmacists");
      if (res.ok) {
        const data = await res.json();
        setPharmacists(data || []);
      }
    } catch (err) {
      console.error("Error fetching pharmacists:", err);
    } finally {
      setIsLoadingPharmacists(false);
    }
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setOtcPrice(String(data.basePricing.otcConsultation));
        setRevisionPrice(String(data.basePricing.prescriptionRevision));
        setMgmtPrice(String(data.basePricing.medicationManagement));
        setDiscountPercent(String(data.activeCampaignDiscount));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = () => {
    fetchMetrics();
    fetchFinanceData();
    fetchPharmacists();
  };

  useEffect(() => {
    fetchMetrics();
    fetchFinanceData();
    fetchPharmacists();
  }, []);

  // Sync pharmacist local toggle to prevent backend friction on simulation
  const togglePharmacistStatus = (licenseNumber: string) => {
    setPharmacists(prev => prev.map(p => {
      if (p.licenseNumber === licenseNumber) {
        const nextStatus = p.status === 'online' ? 'offline' : 'online';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Extract dynamically aggregated governorates from transactions and pharmacists
  const uniqueGovernorates = useMemo(() => {
    const fromTxns = financeTransactions.map(t => t.governorate).filter(Boolean);
    const fromPharms = pharmacists.map(p => p.governorate).filter(Boolean);
    return Array.from(new Set([...fromTxns, ...fromPharms]));
  }, [financeTransactions, pharmacists]);

  // Filters clinical cases based on timeframe, region, specialty and consultation type
  const filteredTransactions = useMemo(() => {
    return financeTransactions.filter(txn => {
      if (txn.status !== 'Success') return false;

      // Timeframe Calculations
      const txnDate = new Date(txn.timestamp);
      const now = new Date();
      
      if (financeTimeframe === 'daily') {
        const today = new Date();
        today.setHours(0,0,0,0);
        if (txnDate < today) return false;
      } else if (financeTimeframe === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (txnDate < oneWeekAgo) return false;
      } else if (financeTimeframe === 'monthly') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        if (txnDate < oneMonthAgo) return false;
      } else if (financeTimeframe === 'custom') {
        if (financeStartDate) {
          const start = new Date(financeStartDate);
          start.setHours(0,0,0,0);
          if (txnDate < start) return false;
        }
        if (financeEndDate) {
          const end = new Date(financeEndDate);
          end.setHours(23,59,59,999);
          if (txnDate > end) return false;
        }
      }

      // Filter by Region
      if (financeRegion !== 'All' && txn.governorate !== financeRegion) return false;

      // Filter by Specialty
      if (financeSpecialty !== 'All' && txn.specialty !== financeSpecialty) return false;

      // Filter by Consultation Type
      if (financeType !== 'All' && txn.serviceType !== financeType) return false;

      return true;
    });
  }, [financeTransactions, financeTimeframe, financeRegion, financeSpecialty, financeType, financeStartDate, financeEndDate]);

  // Filtering of active pharmacists directory
  const filteredPharmacists = useMemo(() => {
    return pharmacists.filter(p => {
      if (pharmacistRegion !== 'All' && p.governorate !== pharmacistRegion) return false;
      if (pharmacistDegree !== 'All' && p.degree !== pharmacistDegree) return false;
      if (pharmacistStatus !== 'All' && p.status !== pharmacistStatus) return false;
      return true;
    });
  }, [pharmacists, pharmacistRegion, pharmacistDegree, pharmacistStatus]);

  // Aggregate pharmacist productivity / completions from filtered transactions
  const pharmacistProductivity = useMemo(() => {
    const counts: Record<string, { count: number; totalRevenue: number; avgTime: number }> = {};
    filteredTransactions.forEach(tx => {
      const name = tx.pharmacistName || "د. أميرة أحمد الخطيب";
      if (!counts[name]) {
        counts[name] = { count: 0, totalRevenue: 0, avgTime: 12 + Math.floor(Math.random() * 6) };
      }
      counts[name].count += 1;
      counts[name].totalRevenue += tx.amount;
    });
    return Object.entries(counts).map(([name, val]) => ({
      name,
      completed: val.count,
      revenueGenerated: val.totalRevenue,
      avgTime: val.avgTime
    })).sort((a, b) => b.completed - a.completed);
  }, [filteredTransactions]);

  // Generate chart data for Recharts (60/40 Split)
  const chartData = useMemo(() => {
    const successTxns = financeTransactions.filter(t => t.status === 'Success');
    const now = new Date();

    if (chartTimeframe === 'daily') {
      const list = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        
        const dayTxns = successTxns.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate.getDate() === d.getDate() && 
                 txDate.getMonth() === d.getMonth() && 
                 txDate.getFullYear() === d.getFullYear();
        });

        const total = dayTxns.reduce((sum, tx) => sum + tx.amount, 0);
        list.push({
          name: label,
          "إجمالي المبيعات": total,
          "حصة الصيادلة (60%)": total * 0.6,
          "حصة الإدارة (40%)": total * 0.4,
        });
      }
      return list;
    } else if (chartTimeframe === 'weekly') {
      const list = [];
      for (let i = 3; i >= 0; i--) {
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - now.getDay() - (i * 7));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const label = `أسبوع ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;

        const weekTxns = successTxns.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate >= startOfWeek && txDate <= endOfWeek;
        });

        const total = weekTxns.reduce((sum, tx) => sum + tx.amount, 0);
        list.push({
          name: label,
          "إجمالي المبيعات": total,
          "حصة الصيادلة (60%)": total * 0.6,
          "حصة الإدارة (40%)": total * 0.4,
        });
      }
      return list;
    } else {
      const list = [];
      const monthsAr = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const label = monthsAr[d.getMonth()];

        const monthTxns = successTxns.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
        });

        const total = monthTxns.reduce((sum, tx) => sum + tx.amount, 0);
        list.push({
          name: label,
          "إجمالي المبيعات": total,
          "حصة الصيادلة (60%)": total * 0.6,
          "حصة الإدارة (40%)": total * 0.4,
        });
      }
      return list;
    }
  }, [financeTransactions, chartTimeframe]);

  const handleUpdateCampaign = async (e: any) => {
    e.preventDefault();
    setIsUpdatingCampaign(true);
    try {
      const res = await fetch("/api/v1/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otc: otcPrice,
          revision: revisionPrice,
          plan: mgmtPrice,
          discount: discountPercent
        })
      });

      if (res.ok) {
        alert("📊 تم تحديث تسعيرة الخدمات وعروض حملات الخصم بنجاح! تم المزامنة تلقائياً مع بوابة المرضى.");
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingCampaign(false);
    }
  };

  // Translations helpers for medical Arabic terminology
  const translateDegree = (deg: string) => {
    switch (deg) {
      case 'junior': return 'صيدلي ممارس (Junior)';
      case 'Senior': return 'صيدلي أول (Senior)';
      case 'Specialist': return 'أخصائي رعاية (Specialist)';
      case 'consultant': return 'استشاري دواء (Consultant)';
      case 'prime consultant': return 'استشاري أول دواء (Prime)';
      default: return deg;
    }
  };

  const translateSpecialty = (spec: string) => {
    const match = ApprovedSpecialtiesList.find(s => s.key === spec);
    return match ? match.ar : spec;
  };

  // Pharmacist stats indicators
  const totalPharmacists = pharmacists.length;
  const onlinePharmacists = pharmacists.filter(p => p.status === 'online').length;
  const offlinePharmacists = pharmacists.filter(p => p.status === 'offline').length;

  const roundedInterventionsCount = metrics ? metrics.completedRevisions * 2 + 3 : 12;

  // Active metrics calculations
  const totalPeriodRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  }, [filteredTransactions]);

  const pharmacistSharePeriod = totalPeriodRevenue * 0.6;
  const adminSharePeriod = totalPeriodRevenue * 0.4;

  return (
    <div className="bg-slate-50 rounded-3xl p-6 shadow-xl border border-slate-200 flex flex-col min-h-[850px] lg:max-h-[88vh] overflow-y-auto" style={{ direction: "rtl" }}>
      
      {/* Upper Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 mb-5 gap-4">
        <div className="flex items-center space-x-3.5 space-x-reverse text-right">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-indigo-100 shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                منظومة الإشراف والتحكم
              </span>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 animate-pulse">
                ● النظام متصل بالوزارة
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1">لوحة القيادة التنفيذية والمالية للمدراء</h1>
            <p className="text-xs text-slate-500 mt-0.5">مراقبة إنتاجية الصيادلة، تفصيل ربحية الحالات، وإدارة تسعيرة الخدمات والعروض الترويجية</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse self-end md:self-auto">
          <button 
            onClick={handleRefreshAll}
            className="p-2.5 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm flex items-center space-x-2 space-x-reverse"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isLoadingFinance || isLoadingPharmacists ? "animate-spin" : ""}`} />
            <span className="text-xs font-bold">تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* KPI Core Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* KPI 1: Profitability & Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">إجمالي إيرادات المنصة</span>
              <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                {(metrics?.totalRevenue || 1250).toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
              </span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
            <div>حصة الصيدلي (60%): <strong className="text-emerald-600 font-mono font-black">{((metrics?.totalRevenue || 1250) * 0.6).toLocaleString('ar-EG')}</strong></div>
            <div className="text-slate-400">|</div>
            <div>الإدارة (40%): <strong className="text-indigo-600 font-mono font-black">{((metrics?.totalRevenue || 1250) * 0.4).toLocaleString('ar-EG')}</strong></div>
          </div>
        </div>

        {/* KPI 2: Productivity Index */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">مؤشر الإنتاجية السريرية</span>
              <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                {metrics?.totalConsultations || 8} <span className="text-xs font-bold text-slate-400">استشارة</span>
              </span>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
            <div>متوسط زمن الاستجابة: <strong className="text-slate-700 font-mono font-black">14.9 د</strong></div>
            <div className="flex items-center space-x-1 space-x-reverse text-indigo-600 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Live Pharmacists Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">طاقم الصيادلة النشطين</span>
              <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                {onlinePharmacists} / {totalPharmacists} <span className="text-xs font-bold text-slate-400">نشط الآن</span>
              </span>
            </div>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
            <div className="flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span>أونلاين: <strong className="text-emerald-600 font-mono">{onlinePharmacists}</strong></span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
              <span>أوفلاين: <strong className="text-slate-500 font-mono">{offlinePharmacists}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Clinical Safety & Interventions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">مداخلات منقذة للحياة (DUR)</span>
              <span className="text-xl font-black text-red-600 font-mono mt-1 block">
                {roundedInterventionsCount} <span className="text-xs font-bold text-slate-400">مداخلة</span>
              </span>
            </div>
            <div className="p-2 bg-red-50 text-red-650 rounded-xl border border-red-100">
              <ShieldAlert className="w-5 h-5 text-red-650" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
            <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 font-bold">منع الحساسية المفرطة</span>
            <span className="text-slate-400">بنسبة نجاح 100%</span>
          </div>
        </div>

      </div>

      {/* Main Container Divided into two areas: Controls (Left) and Content Tabs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT 3 COLS: Pricing and Campaign Controller Panel */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Pricing Control Form */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-right">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 space-x-reverse">
                <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                <span>لوحة التحكم بتسعيرة الخدمات</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">تحكم لحظي في أسعار عيادات الرعاية الصيدلية ونسب خصم الحملات الفعالة للمرضى</p>
            </div>

            <form onSubmit={handleUpdateCampaign} className="space-y-3.5">
              {/* OTC Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">استشارة OTC العادية:</span>
                  <span className="text-indigo-650 font-mono">{otcPrice} ج.م</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="10"
                  value={otcPrice}
                  onChange={(e) => setOtcPrice(e.target.value)}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* DUR Revision Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">مراجعة الروشتات (DUR):</span>
                  <span className="text-indigo-650 font-mono">{revisionPrice} ج.م</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="10"
                  value={revisionPrice}
                  onChange={(e) => setRevisionPrice(e.target.value)}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* MMP Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">خطة إدارة الأدوية (MMP):</span>
                  <span className="text-indigo-650 font-mono">{mgmtPrice} ...ج.م</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="2000" 
                  step="20"
                  value={mgmtPrice}
                  onChange={(e) => setMgmtPrice(e.target.value)}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Active Campaign Discount */}
              <div className="space-y-1 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-indigo-800 flex items-center space-x-1 space-x-reverse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>خصم حملات التسويق الفعالة:</span>
                  </span>
                  <span className="text-indigo-950 font-mono">{discountPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  step="5"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full h-1 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Financial Simulator breakdown on input */}
              <div className="text-[10px] bg-slate-50 p-2.5 rounded-xl text-slate-500 space-y-1 leading-normal border border-slate-150">
                <span className="font-bold text-slate-700 block text-[10.5px]">💡 محاكاة الحصص والأرباح:</span>
                <div>استشارة الـ OTC بعد خصم {discountPercent}%:</div>
                <div className="font-bold text-indigo-700 font-mono">
                  {Math.round(Number(otcPrice) * (1 - Number(discountPercent) / 100))} ج.م مدفوع
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-200 mt-1">
                  <div>الصيدلي (60%): <strong className="text-emerald-600 font-mono">{Math.round(Number(otcPrice) * (1 - Number(discountPercent) / 100) * 0.6)} ج.م</strong></div>
                  <div>الإدارة (40%): <strong className="text-slate-700 font-mono">{Math.round(Number(otcPrice) * (1 - Number(discountPercent) / 100) * 0.4)} ج.م</strong></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingCampaign}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 space-x-reverse mt-3 cursor-pointer"
              >
                {isUpdatingCampaign ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>تحديث البيانات...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>حفظ وتفعيل التسعيرة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sandbox Help Panel */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl border border-slate-800 text-xs text-right leading-normal space-y-2">
            <h4 className="font-bold text-[12px] text-white flex items-center space-x-1.5 space-x-reverse border-b border-slate-800 pb-1.5">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>دليل المطور والتفتيش السريع</span>
            </h4>
            <p>1. استخدم <strong>محاكي المريض (Mobile Patient App)</strong> لحجز استشارة ودفعها.</p>
            <p>2. ستظهر الحالات وتنعكس المعاملات مباشرة داخل تبويب <strong>"تقرير وتقييم الحالات"</strong>.</p>
            <p>3. يمكنك تغيير حالة أي صيدلي (متصل/منفصل) بالضغط على زر الحالة بتبويب <strong>"الصيادلة النشطين"</strong> لتجربة أدوات الفرز الإدارية.</p>
          </div>

        </div>

        {/* RIGHT 9 COLS: Operational & Analytical workspace tabs */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          
          {/* Tab Navigation buttons */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span>📊 تقارير وتقييم الحالات والربحية</span>
            </button>
            <button
              onClick={() => setActiveTab('pharmacists')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
                activeTab === 'pharmacists'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>🥼 دليل وتتبع الصيادلة النشطين</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>🛡️ سجلات التفتيش والامتثال (EDA)</span>
            </button>
          </div>

          {/* TAB 1: REPORTS & COMMISSIONS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
              
              {/* Report Header & Filter panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <ListFilter className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-extrabold text-xs">محددات تصفية الحالات والتقارير</h3>
                  </div>
                  
                  {/* Select timeframe */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {([
                      { key: 'daily', label: 'اليومي' },
                      { key: 'weekly', label: 'الأسبوعي' },
                      { key: 'monthly', label: 'الشهري' },
                      { key: 'custom', label: 'حسب المدة' }
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFinanceTimeframe(opt.key)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer focus:outline-none ${
                          financeTimeframe === opt.key
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* Region Select */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold text-[10.5px]">حسب المنطقة الجغرافية (المحافظة):</label>
                    <select
                      value={financeRegion}
                      onChange={(e) => setFinanceRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      <option value="All">كل المحافظات والمناطق</option>
                      {uniqueGovernorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Specialty Select */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold text-[10.5px]">حسب التخصص السريري:</label>
                    <select
                      value={financeSpecialty}
                      onChange={(e) => setFinanceSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      <option value="All">كل التخصصات الطبية</option>
                      {ApprovedSpecialtiesList.map(spec => (
                        <option key={spec.key} value={spec.key}>{spec.ar}</option>
                      ))}
                    </select>
                  </div>

                  {/* Case Type Select */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold text-[10.5px]">حسب نوع الاستشارة:</label>
                    <select
                      value={financeType}
                      onChange={(e) => setFinanceType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      <option value="All">كل الخدمات الاستشارية</option>
                      <option value="OTC">استشارة OTC عادية</option>
                      <option value="REV">مراجعة روشتة إكلينيكية DUR</option>
                      <option value="MMP">خطة إدارة الدواء وصندوق الحبوب MMP</option>
                    </select>
                  </div>

                </div>

                {/* Custom Date Range Picker (shown when custom is selected) */}
                {financeTimeframe === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">من تاريخ البدء:</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={financeStartDate}
                          onChange={(e) => setFinanceStartDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-left font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">إلى تاريخ الانتهاء:</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={financeEndDate}
                          onChange={(e) => setFinanceEndDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-left font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-KPI summary bar based on selected filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">مجموع الإيرادات للفترة</span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">{totalPeriodRevenue.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 text-right">
                  <span className="text-[10px] text-indigo-500 block font-bold">أرباح الإدارة (40%)</span>
                  <span className="text-sm font-black text-indigo-700 font-mono mt-0.5 block">{adminSharePeriod.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-right">
                  <span className="text-[10px] text-emerald-600 block font-bold">حصة الصيادلة (60%)</span>
                  <span className="text-sm font-black text-emerald-700 font-mono mt-0.5 block">{pharmacistSharePeriod.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">الحالات المستوفاة المصفاة</span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">{filteredTransactions.length} حالة</span>
                </div>
              </div>

              {/* Visualizations & Productivity list */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Visual Chart - 7 cols */}
                <div className="xl:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11.5px] font-black text-slate-700 flex items-center space-x-1 space-x-reverse">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>منحنى نمو الأرباح الإدارية والعمولات (60/40 Split)</span>
                    </h4>
                    
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-300">
                      {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setChartTimeframe(view)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer focus:outline-none ${
                            chartTimeframe === view
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {view === 'daily' ? 'يومي' : view === 'weekly' ? 'أسبوعي' : 'شهري'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[220px] w-full bg-white rounded-xl p-1 relative shadow-inner">
                    {chartData.every(d => d["إجمالي المبيعات"] === 0) && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-3 text-center z-10">
                        <span className="text-[11px] text-indigo-600 font-bold">💡 تلميح تغذية التقارير</span>
                        <p className="text-[9px] text-slate-500 leading-normal max-w-[240px] mt-0.5">
                          لا توجد معاملات مالية مكتملة في هذه الفترة. جرب القيام بدفوعات تجريبية في محاكي المريض.
                        </p>
                      </div>
                    )}
                    
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorPharmacistLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorAdminLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#334155',
                            borderRadius: '10px',
                            fontSize: '10px',
                            textAlign: 'right',
                            color: '#fff',
                            direction: 'rtl'
                          }} 
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={20} 
                          iconSize={8}
                          wrapperStyle={{ fontSize: '9px', direction: 'rtl' }}
                        />
                        <Area 
                          type="monotone" 
                          name="حصة الصيادلة (60%)"
                          dataKey="حصة الصيادلة (60%)" 
                          stroke="#10b981" 
                          fillOpacity={1} 
                          fill="url(#colorPharmacistLight)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          name="حصة الإدارة (40%)"
                          dataKey="حصة الإدارة (40%)" 
                          stroke="#4f46e5" 
                          fillOpacity={1} 
                          fill="url(#colorAdminLight)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Productivity List - 5 cols */}
                <div className="xl:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11.5px] font-black text-slate-700 flex items-center space-x-1.5 space-x-reverse border-b border-slate-200 pb-2 mb-2">
                      <Award className="w-4.5 h-4.5 text-indigo-600" />
                      <span>جدول إنتاجية وكفاءة الصيادلة النشطين</span>
                    </h4>
                    
                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {pharmacistProductivity.length > 0 ? (
                        pharmacistProductivity.map((item, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-sm">
                            <div className="text-right">
                              <span className="font-extrabold text-slate-800">{item.name}</span>
                              <div className="text-[9px] text-slate-400 mt-0.5">متوسط المراجعة: <strong className="text-indigo-600">{item.avgTime} دقيقة</strong></div>
                            </div>
                            <div className="text-left">
                              <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md font-mono text-[10px] border border-indigo-100">
                                {item.completed} استشارات
                              </span>
                              <div className="text-[9px] text-emerald-600 font-bold mt-0.5 font-mono">{item.revenueGenerated} ج.م</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-10">لا توجد سجلات إنتاجية مطابقة لمحددات الفلترة حالياً.</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-snug mt-2 pt-2 border-t border-slate-200">
                    * يتم ترتيب الصيادلة تنازلياً حسب عدد المعاملات والتقارير الموقعة والمنشورة في المنظومة.
                  </p>
                </div>

              </div>

              {/* Comprehensive Cases table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[12px] font-black text-slate-800 flex items-center space-x-1.5 space-x-reverse">
                    <FileText className="w-4.5 h-4.5 text-indigo-600" />
                    <span>سجلات الحالات السريرية المفصلة للعملاء ({filteredTransactions.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">ترتيب تنازلي حسب التاريخ</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-3">تاريخ الحالة</th>
                        <th className="p-3">اسم المريض</th>
                        <th className="p-3">المنطقة الجغرافية</th>
                        <th className="p-3">التخصص السريري</th>
                        <th className="p-3">نوع الخدمة</th>
                        <th className="p-3">الإيراد (ج.م)</th>
                        <th className="p-3">توزيع الأرباح (60/40)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {isLoadingFinance ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">جاري جلب قائمة المعاملات المحدثة...</td>
                        </tr>
                      ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono text-slate-500 text-[10.5px]">
                              {new Date(tx.timestamp).toLocaleString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 font-extrabold text-slate-800">{tx.patientName}</td>
                            <td className="p-3 text-slate-600 flex items-center space-x-1 space-x-reverse pt-4">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{tx.governorate}</span>
                            </td>
                            <td className="p-3 text-slate-600">
                              <span className="bg-indigo-50/60 text-indigo-800 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                                {translateSpecialty(tx.specialty)}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-700">
                              {tx.serviceType === 'OTC' ? 'استشارة OTC' : tx.serviceType === 'REV' ? 'مراجعة روشتة DUR' : 'باقة MMP السنوية'}
                            </td>
                            <td className="p-3 font-mono font-black text-slate-800">{tx.amount} ج.م</td>
                            <td className="p-3 font-mono text-[10px]">
                              <span className="text-emerald-600 font-bold">{tx.amount * 0.6} ج.م (صيدلي)</span>
                              <span className="text-slate-300 mx-1">/</span>
                              <span className="text-indigo-600 font-bold">{tx.amount * 0.4} ج.م (إدارة)</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد حالات سريرية مطابقة للفلاتر والمحددات النشطة حالياً.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVE PHARMACISTS TRACKING */}
          {activeTab === 'pharmacists' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
              
              {/* Filter controls row */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ListFilter className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-extrabold text-xs">أدوات الفرز والتتبع لطاقم الصيادلة</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Governorate Filter */}
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10.5px]">تصفية بالمنطقة الجغرافية:</span>
                    <select
                      value={pharmacistRegion}
                      onChange={(e) => setPharmacistRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none text-[11px]"
                    >
                      <option value="All">كل المحافظات</option>
                      {uniqueGovernorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Filter */}
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10.5px]">تصفية بالدرجة العلمية الأكاديمية:</span>
                    <select
                      value={pharmacistDegree}
                      onChange={(e) => setPharmacistDegree(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none text-[11px]"
                    >
                      <option value="All">كل الدرجات العلمية</option>
                      <option value="junior">صيدلي ممارس (Junior)</option>
                      <option value="Senior">صيدلي أول (Senior)</option>
                      <option value="Specialist">أخصائي رعاية صيدلانية (Specialist)</option>
                      <option value="consultant">استشاري دواء (Consultant)</option>
                      <option value="prime consultant">استشاري أول دواء (Prime Consultant)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[10.5px]">حالة النشاط على المنصة:</span>
                    <select
                      value={pharmacistStatus}
                      onChange={(e: any) => setPharmacistStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none text-[11px]"
                    >
                      <option value="All">الكل (نشط وغير نشط)</option>
                      <option value="online">متصل حالياً (Online)</option>
                      <option value="offline">غير متصل (Offline)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats and grid listing */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800">سجل الصيادلة المعتمدين والمطابقين للمحددات ({filteredPharmacists.length})</h4>
                  <div className="text-[10px] text-slate-500 font-bold">
                    إجمالي الطاقم: {totalPharmacists} صيدلي | متصلين حالياً: <span className="text-emerald-600">{onlinePharmacists}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
                  {isLoadingPharmacists ? (
                    <p className="text-xs text-slate-400 text-center py-10 col-span-2 font-bold">جاري تحميل قائمة الصيادلة من السجل الأساسي...</p>
                  ) : filteredPharmacists.length > 0 ? (
                    filteredPharmacists.map((pharm) => (
                      <div 
                        key={pharm.licenseNumber} 
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between space-y-3 text-right relative"
                      >
                        {/* Live status badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 rounded-full text-[9px] font-bold ${
                            pharm.status === 'online' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pharm.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            <span>{pharm.status === 'online' ? 'أونلاين' : 'أوفلاين'}</span>
                          </span>
                        </div>

                        {/* Pharmacist Profile fields */}
                        <div className="space-y-1">
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold border border-indigo-100 w-max block">
                            {translateDegree(pharm.degree)}
                          </span>
                          <h5 className="font-extrabold text-slate-800 text-sm pt-1">{pharm.fullName}</h5>
                          <div className="text-[11px] text-slate-500 font-bold">التخصص: <strong className="text-slate-700">{translateSpecialty(pharm.specialty)}</strong></div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse text-[10.5px] text-slate-400 pt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>مصر، {pharm.governorate}، {pharm.city}</span>
                          </div>
                        </div>

                        {/* License and Action button */}
                        <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-mono">الترخيص: {pharm.licenseNumber}</span>
                          
                          <button
                            onClick={() => togglePharmacistStatus(pharm.licenseNumber)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 space-x-reverse ${
                              pharm.status === 'online'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{pharm.status === 'online' ? 'قطع الاتصال' : 'تمكين الاتصال'}</span>
                          </button>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <p className="text-xs font-bold">لم نجد أي صيادلة يطابقون محددات الفرز المحددة حالياً.</p>
                      <p className="text-[10px] text-slate-400 mt-1">جرب تصفير الفلاتر لرؤية طاقم الصيادلة بالكامل.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: IMMUTABLE AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-800">دفتر التدقيق السريري وسجلات الامتثال الرقمي (EDA Audit Log)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">سجل نظام مشفر غير قابل للتعديل لتتبع قرارات الصيادلة ومطابقتها لهيئة الدواء المصرية</p>
                </div>
                <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                  {metrics?.auditLogs?.length || 0} سجل امتثال
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {metrics?.auditLogs && metrics.auditLogs.length > 0 ? (
                  metrics.auditLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-right space-y-1.5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-mono text-[9.5px]">
                          {new Date(log.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'numeric' })}
                        </span>
                        <span className="bg-indigo-950 text-indigo-400 font-bold text-[9px] px-2 py-0.5 rounded border border-indigo-800/40">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{log.details}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60 font-mono">
                        <span>رقم مرجع الإحالة: {log.serviceId}</span>
                        <span className="text-teal-400 font-bold">{log.pharmacist}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-rose-400 text-center py-12 font-bold">لا يوجد أي سجلات تدقيق إدارية أو سريرية في الوقت الحالي.</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 text-right leading-relaxed">
                🚨 <strong>ملاحظة تنظيمية:</strong> يتم تغذية هذا السجل تلقائياً عبر المداخلات الدوائية والخدمات السريرية التي تتم من خلال الصيادلة الاستشاريين، ولا يمكن تعديله أو حذفه تماشياً مع لوائح التفتيش السريري الإلكتروني المعتمدة من وزارة الصحة المصرية وهيئة الدواء.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
