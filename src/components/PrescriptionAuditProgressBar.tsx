/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckCircle2, Clock, FileCheck, Search, Sparkles, 
  ArrowLeft, Check, RefreshCw, AlertCircle, Award, 
  Layers, Stethoscope, FileText, Send, Zap
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

export type PrescriptionAuditStage = 'In-Waiting' | 'Ongoing' | 'Completed';

interface PrescriptionAuditProgressBarProps {
  currentStatus: PrescriptionAuditStage | string;
  caseId: string;
  patientName?: string;
  serviceType?: 'REV' | 'OTC' | 'MMP';
  createdAt?: string;
  reportId?: string;
  onStatusChange?: (newStatus: PrescriptionAuditStage) => Promise<void> | void;
  isReadOnly?: boolean;
}

export default function PrescriptionAuditProgressBar({
  currentStatus = 'In-Waiting',
  caseId,
  patientName,
  serviceType = 'REV',
  createdAt,
  reportId,
  onStatusChange,
  isReadOnly = false
}: PrescriptionAuditProgressBarProps) {
  const { t, isRtl, dir } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  // Normalize status
  const normalizedStatus: PrescriptionAuditStage = 
    currentStatus === 'Completed' ? 'Completed' :
    currentStatus === 'Ongoing' ? 'Ongoing' : 'In-Waiting';

  const currentStageIndex = 
    normalizedStatus === 'Completed' ? 2 :
    normalizedStatus === 'Ongoing' ? 1 : 0;

  const stages = [
    {
      key: 'In-Waiting' as PrescriptionAuditStage,
      title: t('pharmacist.stage_received', 'تم الاستلام'),
      subtitle: isRtl ? 'وصلت الروشتة لطابور التدقيق' : 'Prescription queued',
      icon: Clock,
      badge: isRtl ? 'المرحلة 1' : 'Stage 1',
      color: 'teal'
    },
    {
      key: 'Ongoing' as PrescriptionAuditStage,
      title: t('pharmacist.stage_review', 'قيد الفحص'),
      subtitle: isRtl ? 'تدقيق الجرعات والـ DUR السريري' : 'Dosage & DUR clinical review',
      icon: Search,
      badge: isRtl ? 'المرحلة 2' : 'Stage 2',
      color: 'amber'
    },
    {
      key: 'Completed' as PrescriptionAuditStage,
      title: t('pharmacist.stage_ready', 'تقرير جاهز'),
      subtitle: isRtl ? 'تم توقيع التقرير الطبي واكتماله' : 'Clinical report signed & ready',
      icon: Award,
      badge: isRtl ? 'المرحلة 3' : 'Stage 3',
      color: 'emerald'
    }
  ];

  // Handle stage selection / advance
  const handleStageClick = async (targetStatus: PrescriptionAuditStage) => {
    if (isReadOnly || isUpdating || targetStatus === normalizedStatus) return;
    
    setIsUpdating(true);
    try {
      if (onStatusChange) {
        await onStatusChange(targetStatus);
      }
    } catch (e) {
      console.error("Error updating audit stage:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const progressPercent = 
    currentStageIndex === 0 ? 15 :
    currentStageIndex === 1 ? 55 : 100;

  return (
    <div 
      className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3 font-sans relative overflow-hidden"
      style={{ direction: dir }}
    >
      {/* Background ambient glow based on stage */}
      <div 
        className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          currentStageIndex === 2 ? 'bg-emerald-500/10' :
          currentStageIndex === 1 ? 'bg-amber-500/10' : 'bg-teal-500/10'
        }`}
      />

      {/* UPPER HEADER BAR: Current Status Badge & Case Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
          <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
            <span>{isRtl ? "مراحل تدقيق الروشتة الإكلينيكية" : "Prescription Audit Stages"}</span>
            <span className="text-[10px] text-teal-400 font-mono">({caseId})</span>
          </h4>
        </div>

        {/* Live sync badge & manual quick triggers */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{isRtl ? "تحديث لحظي متزامن" : "Live Synchronized"}</span>
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-1">
              {normalizedStatus === 'In-Waiting' && (
                <button
                  onClick={() => handleStageClick('Ongoing')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title={isRtl ? "نقل الحالة إلى قيد الفحص السريري" : "Move to Ongoing Review"}
                >
                  <Search className="w-3 h-3 text-amber-400" />
                  <span>{t('pharmacist.start_audit_quick', 'بدء الفحص السريري ⚡')}</span>
                </button>
              )}

              {normalizedStatus === 'Ongoing' && (
                <button
                  onClick={() => handleStageClick('Completed')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title={isRtl ? "نقل الحالة إلى تقرير جاهز" : "Approve as Completed"}
                >
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>{t('pharmacist.approve_report_quick', 'اعتماد التقرير جاهزاً ✓')}</span>
                </button>
              )}

              {normalizedStatus === 'Completed' && (
                <button
                  onClick={() => handleStageClick('Ongoing')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title={isRtl ? "إعادة فتح الحالة للمراجعة" : "Reopen for Review"}
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>{t('pharmacist.reopen_audit_quick', 'إعادة فتح للفحص')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS BAR TRACK & STEP NODES */}
      <div className="relative pt-2 pb-1 px-2 sm:px-4">
        
        {/* Background Track Line */}
        <div className="absolute top-[28px] left-8 right-8 h-1.5 bg-slate-800 rounded-full -z-0">
          {/* Active Animated Gradient Fill */}
          <div 
            className="h-full bg-gradient-to-r from-teal-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 3 Step Nodes Grid */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div 
                key={stage.key}
                onClick={() => !isReadOnly && handleStageClick(stage.key)}
                className={`flex flex-col items-center text-center group ${
                  !isReadOnly ? 'cursor-pointer' : ''
                }`}
              >
                {/* Step Circle Node */}
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                      : isCurrent
                      ? stage.color === 'emerald'
                        ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-110 shadow-emerald-500/30'
                        : stage.color === 'amber'
                        ? 'bg-amber-500 border-amber-300 text-slate-950 scale-110 shadow-amber-500/30 animate-pulse'
                        : 'bg-teal-500 border-teal-300 text-slate-950 scale-110 shadow-teal-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Node Label & Details */}
                <div className="mt-2 space-y-0.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isCurrent 
                      ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                      : 'text-slate-500'
                  }`}>
                    {stage.badge}
                  </span>
                  <h5 className={`text-xs font-black leading-tight ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {stage.title}
                  </h5>
                  <p className="text-[9.5px] text-slate-500 hidden sm:block">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
