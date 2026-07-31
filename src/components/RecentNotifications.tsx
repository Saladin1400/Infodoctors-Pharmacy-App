import React, { useState } from "react";
import { 
  Bell, Calendar, ShieldAlert, CheckCircle2, FileText, 
  Clock, ArrowRight, Video, ChevronRight, Sparkles, Filter, Trash2, Check, AlertTriangle
} from "lucide-react";
import { PatientProfile, AppNotification } from "../types";

export interface RecentNotificationsProps {
  notifications: AppNotification[];
  patient: PatientProfile | null;
  onMarkAsRead?: (notifId: string) => void;
  onMarkAllAsRead?: () => void;
  onNavigateToScreen?: (screenName: string) => void;
  onSelectAuditReport?: (reportId: string) => void;
  compactMode?: boolean;
}

export const RecentNotifications: React.FC<RecentNotificationsProps> = ({
  notifications,
  patient,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToScreen,
  onSelectAuditReport,
  compactMode = false
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'APPOINTMENTS' | 'AUDIT_RESULTS' | 'MEDS'>('ALL');

  // Generate enriched default notifications if none exist
  const displayNotifications = notifications.length > 0 ? notifications : [
    {
      id: "notif-app-1",
      recipient: "patient" as const,
      title: "تذكير بموعد استشارة إكلينيكية قادمة 📅",
      body: "لديك موعد تدقيق روشتة ومراجعة دوائية مع د. أحمد الصيدلي الإكلينيكي اليوم الساعة 06:00 مساءً.",
      type: "appointment_reminder" as const,
      read: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: "notif-audit-1",
      recipient: "patient" as const,
      title: "نتيجة تدقيق الروشتة متاحة الآن 🔬",
      body: "أتم الصيدلي الإكلينيكي فحص السلامة (Audit Assist). تم العثور على 1 توجيه بخصوص دمج الكالسيوم مع التيروكسين.",
      type: "prescription_review" as const,
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: "notif-med-1",
      recipient: "patient" as const,
      title: "تنبيه موعد جرعة الدواء القادمة 💊",
      body: "حان موعد تناول قرص Concor 5mg كالمعتاد وفق المخطط العلاجي.",
      type: "alarm" as const,
      read: true,
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    }
  ];

  // Filter based on selected tab
  const filteredNotifs = displayNotifications.filter(n => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'APPOINTMENTS') return n.type === 'appointment_reminder' || n.title.includes('موعد') || n.title.includes('استشارة');
    if (activeCategory === 'AUDIT_RESULTS') return n.type === 'prescription_review' || n.title.includes('تدقيق') || n.title.includes('نتيجة') || n.title.includes('روشتة');
    if (activeCategory === 'MEDS') return n.type === 'alarm' || n.title.includes('جرعة') || n.title.includes('دواء');
    return true;
  });

  const unreadCount = displayNotifications.filter(n => !n.read).length;

  // Utility to format time display
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMins < 1) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      return date.toLocaleDateString('ar-EG');
    } catch (e) {
      return "مؤخراً";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* Component Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>التنبيهات والإشعارات الحديثة</span>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 font-bold text-[9.5px] px-2 py-0.5 rounded-full">
                  {unreadCount} غير مقروء
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-500">
              مواعيد الاستشارات وتحديثات نتائج تدقيق الروشتات الصيدلانية
            </p>
          </div>
        </div>

        {onMarkAllAsRead && unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[10px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!compactMode && (
        <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              activeCategory === 'ALL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            الكل ({displayNotifications.length})
          </button>
          <button
            onClick={() => setActiveCategory('APPOINTMENTS')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              activeCategory === 'APPOINTMENTS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            المواعيد 📅
          </button>
          <button
            onClick={() => setActiveCategory('AUDIT_RESULTS')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              activeCategory === 'AUDIT_RESULTS' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            نتائج التدقيق 🔬
          </button>
          <button
            onClick={() => setActiveCategory('MEDS')}
            className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
              activeCategory === 'MEDS' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            جرعات الأدوية 💊
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            لا توجد إشعارات حالية في هذه الفئة
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const isAppointment = item.type === 'appointment_reminder' || item.title.includes('موعد') || item.title.includes('استشارة');
            const isAudit = item.type === 'prescription_review' || item.title.includes('تدقيق') || item.title.includes('نتيجة');

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all relative ${
                  !item.read ? 'bg-teal-50/40 border-teal-200/90 shadow-2xs' : 'bg-slate-50/70 border-slate-200/60'
                }`}
              >
                {!item.read && (
                  <span className="absolute top-3 left-3 w-2 h-2 bg-rose-500 rounded-full" />
                )}

                <div className="flex items-start space-x-2.5 space-x-reverse">
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                    isAppointment ? 'bg-indigo-100 text-indigo-700' :
                    isAudit ? 'bg-teal-100 text-teal-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {isAppointment ? <Calendar className="w-4 h-4" /> :
                     isAudit ? <ShieldAlert className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-xs text-slate-800 leading-tight">
                        {item.title}
                      </h5>
                      <span className="text-[9.5px] text-slate-400 font-mono">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      {item.body}
                    </p>

                    {/* Quick Interactive Actions */}
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        {isAppointment && onNavigateToScreen && (
                          <button
                            onClick={() => onNavigateToScreen('services')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9.5px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Video className="w-3 h-3" />
                            <span>تفاصيل الموعد واللقاء</span>
                          </button>
                        )}

                        {isAudit && (
                          <button
                            onClick={() => {
                              if (onSelectAuditReport) onSelectAuditReport('rep-1');
                              if (onNavigateToScreen) onNavigateToScreen('reports');
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[9.5px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>عرض تقرير التدقيق الصيدلاني</span>
                          </button>
                        )}
                      </div>

                      {onMarkAsRead && !item.read && (
                        <button
                          onClick={() => onMarkAsRead(item.id)}
                          className="text-[9.5px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تعيين كمقروء</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default RecentNotifications;
