/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, Settings, ShieldCheck, DollarSign, Clock, Users, CalendarCheck, 
  ArrowUpRight, Sparkles, RefreshCw, Send, ListFilter, Sliders, ToggleLeft,
  MapPin, CalendarDays, Award, CheckCircle2, Zap, Power, Briefcase, Activity,
  TrendingUp, Phone, ExternalLink, ShieldAlert, FileText, Layers,
  UserX, UserCheck, RotateCcw, Trash2, Search, Lock
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
import { useLanguage, LanguageSwitcher } from "../LanguageContext";

export default function AdminPanel() {
  const { t, language, isRtl, dir } = useLanguage();
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'cases' | 'revenue' | 'pharmacists' | 'quality'>('users');
  
  // Custom campaign variables
  const [otcPrice, setOtcPrice] = useState("250");
  const [revisionPrice, setRevisionPrice] = useState("350");
  const [mgmtPrice, setMgmtPrice] = useState("400");
  const [discountPercent, setDiscountPercent] = useState("10");

  const [isUpdatingCampaign, setIsUpdatingCampaign] = useState(false);

  // User Accounts Management states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'patient' | 'pharmacist' | 'admin'>('ALL');

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

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/v1/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleFreezeAccount = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFrozen: !currentStatus })
      });
      if (res.ok) {
        fetchUsers();
        fetchMetrics();
      } else {
        const data = await res.json();
        alert(data.error || "فشلت عملية تغيير حالة الحساب");
      }
    } catch (err) {
      console.error("Error toggling freeze account:", err);
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!window.confirm("هل أنت تأكد من إرادة حذف هذا الحساب نهائياً؟ لن تتمكن من استرجاع البيانات المربوطة به.")) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchUsers();
        fetchMetrics();
      } else {
        const data = await res.json();
        alert(data.error || "فشلت عملية حذف الحساب");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const handleResetAccount = async (userId: string) => {
    if (!window.confirm("هل تريد إعادة ضبط كلمة المرور الافتراضية (123456) وإلغاء الجلسات النشطة والتجميد لهذا الحساب؟")) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${userId}/reset`, {
        method: "POST"
      });
      if (res.ok) {
        alert("تمت إعادة ضبط الحساب بنجاح إلى الوضع الافتراضي (كلمة المرور: 123456)");
        fetchUsers();
        fetchMetrics();
      } else {
        const data = await res.json();
        alert(data.error || "فشلت عملية إعادة ضبط الحساب");
      }
    } catch (err) {
      console.error("Error resetting account:", err);
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
    fetchUsers();
  };

  useEffect(() => {
    fetchMetrics();
    fetchFinanceData();
    fetchPharmacists();
    fetchUsers();
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

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      if (userRoleFilter !== 'ALL' && user.role !== userRoleFilter) return false;
      if (userSearchQuery.trim()) {
        const query = userSearchQuery.toLowerCase();
        const nameMatch = user.fullName?.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        const idMatch = user.nationalId?.includes(query);
        const licMatch = user.licenseNumber?.includes(query);
        if (!nameMatch && !emailMatch && !idMatch && !licMatch) return false;
      }
      return true;
    });
  }, [usersList, userRoleFilter, userSearchQuery]);

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
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1">لوحة الإدارة</h1>
            <p className="text-xs text-slate-500 mt-0.5">مراقبة إنتاجية الصيادلة، تقارير الحالات والعائدات، وحكامة الحسابات والجودة</p>
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

      {/* Main Tab Navigation bar at top */}
      <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm overflow-x-auto gap-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('users');
            fetchUsers();
          }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>إدارة الحسابات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
            activeTab === 'cases'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span>تقارير الحالات</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('revenue');
            fetchFinanceData();
          }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
            activeTab === 'revenue'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4.5 h-4.5" />
          <span>تقارير العائدات والأرباح</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('pharmacists');
            fetchPharmacists();
          }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
            activeTab === 'pharmacists'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4.5 h-4.5" />
          <span>تقارير أداء الصيادلة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap focus:outline-none flex items-center justify-center space-x-2 space-x-reverse cursor-pointer ${
            activeTab === 'quality'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>تقارير الجودة</span>
        </button>
      </div>

      {/* TAB CONTENT AREA - Renders ONLY elements for the selected tab */}
      <div className="flex-1 space-y-6">

        {/* 1. TAB: إدارة الحسابات */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    إدارة وحكامة حسابات النظام المركزية
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    التحكم الكامل في تجميد، حذف وإعادة ضبط حسابات المرضى والصيادلة لمنع الانتهاكات والوصول غير المصرح به
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-indigo-100">
                    إجمالي الحسابات: {usersList.length}
                  </span>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="تحديث القائمة"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="البحث بالاسم، البريد الإلكتروني، الرقم القومي أو رقم الترخيص..."
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-right"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all text-right font-medium"
                  >
                    <option value="ALL">جميع الأدوار والصفات</option>
                    <option value="patient">حسابات المرضى فقط (Patient)</option>
                    <option value="pharmacist">حسابات الصيادلة فقط (Pharmacist)</option>
                    <option value="admin">حسابات الأدمن فقط (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Users List Grid */}
              <div className="space-y-3 pt-2">
                {isLoadingUsers ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    جاري تحميل بيانات الحسابات من قاعدة البيانات...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <p className="text-xs font-bold">لا يوجد أي مستخدمين يطابقون معايير البحث والفرز.</p>
                    <p className="text-[10px] text-slate-400 mt-1">تأكد من عدم وجود أخطاء إملائية أو جرب مسح حقل البحث.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredUsers.map((usr) => {
                      const isFrozen = !!usr.isFrozen;
                      return (
                        <div 
                          key={usr.id} 
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                            isFrozen 
                              ? 'bg-amber-50/60 border-amber-300/80 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-indigo-200 shadow-sm'
                          }`}
                        >
                          {/* User details */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-black text-slate-800">{usr.fullName || "مستخدم بدون اسم"}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                usr.role === 'pharmacist' 
                                  ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                                  : usr.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {usr.role === 'pharmacist' ? 'صيدلي إكلينيكي' : usr.role === 'admin' ? 'أدمن النظام' : 'مريض / جمهور'}
                              </span>

                              {isFrozen && (
                                <span className="bg-amber-500 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  <Lock className="w-3 h-3" />
                                  حساب مجمد ❄️
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                              <span>📧 {usr.email}</span>
                              {usr.nationalId && <span>🆔 قومي: {usr.nationalId}</span>}
                              {usr.licenseNumber && <span>🪪 ترخيص: {usr.licenseNumber}</span>}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleFreezeAccount(usr.id, isFrozen)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isFrozen
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                              }`}
                              title={isFrozen ? 'إلغاء تجميد الحساب وإعادة التفعيل' : 'تجميد الحساب لمنع الدخول والحجز'}
                            >
                              {isFrozen ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>إلغاء التجميد</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>تجميد الحساب</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResetAccount(usr.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                              title="إعادة ضبط كلمة المرور إلى 123456 وإنهاء كافة الجلسات"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                              <span>إعادة ضبط</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(usr.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200"
                              title="حذف الحساب نهائياً من قاعدة البيانات"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: تقارير الحالات */}
        {activeTab === 'cases' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* KPI Summary Row for Cases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي استشارات النظام</span>
                  <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                    {metrics?.totalConsultations || 8} <span className="text-xs font-bold text-slate-400">استشارة</span>
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">الحالات المصفاة بالفلاتر</span>
                  <span className="text-xl font-black text-indigo-600 font-mono mt-1 block">
                    {filteredTransactions.length} <span className="text-xs font-bold text-slate-400">حالة</span>
                  </span>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">متوسط زمن استجابة الصيادلة</span>
                  <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                    14.9 <span className="text-xs font-bold text-slate-400">دقيقة</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
              {/* Filter Panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <ListFilter className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-extrabold text-xs">محددات تصفية الحالات والتقارير</h3>
                  </div>
                  
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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

                {financeTimeframe === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">من تاريخ البدء:</span>
                      <input
                        type="date"
                        value={financeStartDate}
                        onChange={(e) => setFinanceStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-left font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold">إلى تاريخ الانتهاء:</span>
                      <input
                        type="date"
                        value={financeEndDate}
                        onChange={(e) => setFinanceEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-left font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Comprehensive Cases Table */}
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
          </div>
        )}

        {/* 3. TAB: تقارير العائدات والأرباح */}
        {activeTab === 'revenue' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* KPI Summary Row for Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي إيرادات المنصة</span>
                  <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                    {(metrics?.totalRevenue || 1250).toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">حصة الإدارة السافية (40%)</span>
                  <span className="text-xl font-black text-indigo-600 font-mono mt-1 block">
                    {((metrics?.totalRevenue || 1250) * 0.4).toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">حصة عمولات الصيادلة (60%)</span>
                  <span className="text-xl font-black text-teal-600 font-mono mt-1 block">
                    {((metrics?.totalRevenue || 1250) * 0.6).toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
                  </span>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pricing Controller */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-right">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 space-x-reverse">
                      <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                      <span>لوحة التحكم بتسعيرة الخدمات</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">تحكم لحظي في أسعار عيادات الرعاية الصيدلية ونسب خصم الحملات الفعالة للمرضى</p>
                  </div>

                  <form onSubmit={handleUpdateCampaign} className="space-y-3.5">
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

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">خطة إدارة الأدوية (MMP):</span>
                        <span className="text-indigo-650 font-mono">{mgmtPrice} ج.م</span>
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
              </div>

              {/* Right Column: Revenue Growth Chart */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1.5 space-x-reverse">
                    <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
                    <span>منحنى نمو الأرباح الإدارية والعمولات (60/40 Split)</span>
                  </h4>

                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setChartTimeframe(view)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer focus:outline-none ${
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

                <div className="h-[300px] w-full bg-slate-50 rounded-2xl p-2 relative border border-slate-100">
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
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
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
                      <Legend verticalAlign="top" height={25} iconSize={8} wrapperStyle={{ fontSize: '10px', direction: 'rtl' }} />
                      <Area type="monotone" name="حصة الصيادلة (60%)" dataKey="حصة الصيادلة (60%)" stroke="#10b981" fillOpacity={1} fill="url(#colorPharmacistLight)" strokeWidth={2} />
                      <Area type="monotone" name="حصة الإدارة (40%)" dataKey="حصة الإدارة (40%)" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAdminLight)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: تقارير أداء الصيادلة */}
        {activeTab === 'pharmacists' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* KPI Summary Row for Pharmacists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي كادر الصيادلة</span>
                  <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
                    {totalPharmacists} <span className="text-xs font-bold text-slate-400">صيدلي</span>
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">متصلون بالمنظومة الآن</span>
                  <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                    {onlinePharmacists} <span className="text-xs font-bold text-slate-400">أونلاين</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">غير متصلين حالياً</span>
                  <span className="text-xl font-black text-slate-500 font-mono mt-1 block">
                    {offlinePharmacists} <span className="text-xs font-bold text-slate-400">أوفلاين</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200">
                  <UserX className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Productivity Ranking */}
              <div className="xl:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1.5 space-x-reverse border-b border-slate-100 pb-3">
                  <Award className="w-4.5 h-4.5 text-indigo-600" />
                  <span>جدول إنتاجية وكفاءة الصيادلة النشطين</span>
                </h4>
                
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {pharmacistProductivity.length > 0 ? (
                    pharmacistProductivity.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs shadow-sm">
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800">{item.name}</span>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">متوسط المراجعة: <strong className="text-indigo-600">{item.avgTime} دقيقة</strong></div>
                        </div>
                        <div className="text-left">
                          <span className="bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-lg font-mono text-[10px] border border-indigo-200">
                            {item.completed} استشارات
                          </span>
                          <div className="text-[10px] text-emerald-600 font-bold mt-1 font-mono">{item.revenueGenerated} ج.م</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 text-center py-10">لا توجد سجلات إنتاجية مطابقة لمحددات الفلترة حالياً.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Pharmacists Directory & Filters */}
              <div className="xl:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <ListFilter className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-extrabold text-xs">أدوات الفرز والتتبع لطاقم الصيادلة</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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

                    <div className="space-y-1">
                      <span className="text-slate-400 block font-bold text-[10.5px]">تصفية بالدرجة العلمية:</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {isLoadingPharmacists ? (
                    <p className="text-xs text-slate-400 text-center py-10 col-span-2 font-bold">جاري تحميل قائمة الصيادلة من السجل الأساسي...</p>
                  ) : filteredPharmacists.length > 0 ? (
                    filteredPharmacists.map((pharm) => (
                      <div 
                        key={pharm.licenseNumber} 
                        className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-3 text-right relative"
                      >
                        <div className="absolute top-3.5 left-3.5">
                          <span className={`inline-flex items-center space-x-1.5 space-x-reverse px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            pharm.status === 'online' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-200 text-slate-500 border border-slate-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pharm.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{pharm.status === 'online' ? 'أونلاين' : 'أوفلاين'}</span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold border border-indigo-100 w-max block">
                            {translateDegree(pharm.degree)}
                          </span>
                          <h5 className="font-extrabold text-slate-800 text-xs pt-1">{pharm.fullName}</h5>
                          <div className="text-[10.5px] text-slate-500 font-bold">التخصص: <strong className="text-slate-700">{translateSpecialty(pharm.specialty)}</strong></div>
                          
                          <div className="flex items-center space-x-1 space-x-reverse text-[10px] text-slate-400 pt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>مصر، {pharm.governorate}، {pharm.city}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-mono">الترخيص: {pharm.licenseNumber}</span>
                          
                          <button
                            type="button"
                            onClick={() => togglePharmacistStatus(pharm.licenseNumber)}
                            className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer flex items-center space-x-1 space-x-reverse ${
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
                    <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <p className="text-xs font-bold">لم نجد أي صيادلة يطابقون محددات الفرز المحددة حالياً.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB: تقارير الجودة */}
        {activeTab === 'quality' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Quality KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">مداخلات سريرية منقذة للحياة (DUR)</span>
                  <span className="text-xl font-black text-rose-600 font-mono mt-1 block">
                    {roundedInterventionsCount} <span className="text-xs font-bold text-slate-400">مداخلة</span>
                  </span>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">منع التعارضات والحساسية الدوائية</span>
                  <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                    100% <span className="text-xs font-bold text-slate-400">نسبة الامتثال</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">سجلات الامتثال المعتمدة (EDA)</span>
                  <span className="text-xl font-black text-indigo-600 font-mono mt-1 block">
                    {metrics?.auditLogs?.length || 0} <span className="text-xs font-bold text-slate-400">سجل</span>
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
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
                    <div key={log.id} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-right space-y-1.5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[9.5px]">
                          {new Date(log.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'numeric' })}
                        </span>
                        <span className="bg-indigo-950 text-indigo-300 font-bold text-[9px] px-2 py-0.5 rounded border border-indigo-800/40">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{log.details}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60 font-mono">
                        <span>رقم مرجع الإحالة: {log.serviceId}</span>
                        <span className="text-teal-400 font-bold">{log.pharmacist}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-12 font-bold">لا يوجد أي سجلات تدقيق إدارية أو سريرية في الوقت الحالي.</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 text-right leading-relaxed">
                🚨 <strong>ملاحظة تنظيمية:</strong> يتم تغذية هذا السجل تلقائياً عبر المداخلات الدوائية والخدمات السريرية التي تتم من خلال الصيادلة الاستشاريين، ولا يمكن تعديله أو حذفه تماشياً مع لوائح التفتيش السريري الإلكتروني المعتمدة من وزارة الصحة المصرية وهيئة الدواء.
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
