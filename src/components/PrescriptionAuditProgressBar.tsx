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
  const [isUpdating, setIsUpdating] = useState(false);

  // Normalize status
  const normalizedStatus: PrescriptionAuditStage = 
    currentStatus === 'Completed' ? 'Completed' :
    currentStatus === 'Ongoing' ? 'Ongoing' : 'In-Waiting';

  // Compute stage indices
  // 1: تم الاستلام (Index 0)
  // 2: قيد الفحص (Index 1)
  // 3: تقرير جاهز (Index 2)
  const currentStageIndex = 
    normalizedStatus === 'Completed' ? 2 :
    normalizedStatus === 'Ongoing' ? 1 : 0;

  const stages = [
    {
      key: 'In-Waiting' as PrescriptionAuditStage,
      title: 'تم الاستلام',
      subtitle: 'وصلت الروشتة لطابور التدقيق',
      icon: Clock,
      badge: 'المرحلة 1',
      color: 'teal'
    },
    {
      key: 'Ongoing' as PrescriptionAuditStage,
      title: 'قيد الفحص',
      subtitle: 'تدقيق الجرعات والـ DUR السريري',
      icon: Search,
      badge: 'المرحلة 2',
      color: 'amber'
    },
    {
      key: 'Completed' as PrescriptionAuditStage,
      title: 'تقرير جاهز',
      subtitle: 'تم توقيع التقرير الطبي واكتماله',
      icon: Award,
      badge: 'المرحلة 3',
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

  // Calculate percentage width for progress line
  const progressPercent = 
    currentStageIndex === 0 ? 15 :
    currentStageIndex === 1 ? 55 : 100;

  return (
    <div 
      className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3 font-sans relative overflow-hidden"
      style={{ direction: "rtl" }}
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
            <span>مراحل تدقيق الروشتة الإكلينيكية</span>
            <span className="text-[10px] text-teal-400 font-mono">({caseId})</span>
          </h4>
        </div>

        {/* Live sync badge & manual quick triggers */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>تحديث لحظي متزامن</span>
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-1">
              {normalizedStatus === 'In-Waiting' && (
                <button
                  onClick={() => handleStageClick('Ongoing')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="نقل الحالة إلى قيد الفحص السريري"
                >
                  <Search className="w-3 h-3 text-amber-400" />
                  <span>بدء الفحص السريري ⚡</span>
                </button>
              )}

              {normalizedStatus === 'Ongoing' && (
                <button
                  onClick={() => handleStageClick('Completed')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="نقل الحالة إلى تقرير جاهز"
                >
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>اعتماد التقرير جاهزاً ✓</span>
                </button>
              )}

              {normalizedStatus === 'Completed' && (
                <button
                  onClick={() => handleStageClick('Ongoing')}
                  disabled={isUpdating}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="إعادة فتح الحالة للمراجعة"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>إعادة فتح للفحص</span>
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
                    isCurrent
                      ? stage.color === 'emerald'
                        ? 'bg-emerald-600 border-emerald-300 text-white ring-4 ring-emerald-500/20 scale-110'
                        : stage.color === 'amber'
                        ? 'bg-amber-600 border-amber-300 text-white ring-4 ring-amber-500/20 scale-110'
                        : 'bg-teal-600 border-teal-300 text-white ring-4 ring-teal-500/20 scale-110'
                      : isCompleted
                      ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3] text-emerald-400" />
                  ) : isCurrent && isUpdating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                  )}
                </div>

                {/* Step Label & Subtitle */}
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span 
                      className={`text-xs font-black transition-colors ${
                        isCurrent 
                          ? stage.color === 'emerald' ? 'text-emerald-300 font-extrabold' :
                            stage.color === 'amber' ? 'text-amber-300 font-extrabold' : 'text-teal-300 font-extrabold'
                          : isCompleted 
                          ? 'text-slate-200' 
                          : 'text-slate-500'
                      }`}
                    >
                      {stage.title}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium hidden sm:block">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER METRICS INFO BAR */}
      <div className="bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">الحالة النشطة:</span>
          <span 
            className={`font-black px-2 py-0.5 rounded-md ${
              normalizedStatus === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
              normalizedStatus === 'Ongoing' ? 'bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse' :
              'bg-teal-950 text-teal-300 border border-teal-800/60'
            }`}
          >
            {normalizedStatus === 'Completed' ? '✅ تم إصدار التقرير النهائي (تقرير جاهز)' :
             normalizedStatus === 'Ongoing' ? '⏳ الروشتة قيد الفحص السريري والتدقيق (قيد الفحص)' :
             '📥 تم الاستلام وجاهزة لبدء التدقيق (تم الاستلام)'}
          </span>
        </div>

        {reportId && normalizedStatus === 'Completed' && (
          <div className="flex items-center gap-1 font-mono text-teal-300">
            <FileText className="w-3 h-3 text-teal-400" />
            <span>رقم التقرير: {reportId}</span>
          </div>
        )}

        {patientName && (
          <div className="text-slate-400">
            المريض: <strong className="text-slate-200">{patientName}</strong>
          </div>
        )}
      </div>

    </div>
  );
}
