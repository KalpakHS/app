import React from 'react';

export default function PatientCard({ patient, onClick }) {
  const isCritical = patient.status === 'Critical';
  const isWarning = patient.status === 'Warning';

  const borderColor = isCritical 
    ? 'border-red-200 hover:border-red-400' 
    : isWarning 
      ? 'border-amber-200 hover:border-amber-400' 
      : 'border-slate-200 hover:border-teal-300';

  const statusBadge = isCritical ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-coral-red text-[11px] font-bold mt-1">
      <span className="material-symbols-outlined text-[13px]">emergency</span> Critical Risk
    </span>
  ) : isWarning ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold mt-1">
      <span className="material-symbols-outlined text-[13px]">warning</span> Warning Status
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald text-[11px] font-bold mt-1">
      <span className="material-symbols-outlined text-[13px]">check_circle</span> Stable Baseline
    </span>
  );

  return (
    <div 
      className={`bg-white rounded-2xl p-4 shadow-sm border ${borderColor} relative overflow-hidden flex flex-col gap-3.5 cursor-pointer transition-all active:scale-[0.99] hover:shadow-md`}
      onClick={() => onClick(patient)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${patient.avatarBg} flex items-center justify-center font-headline-sm text-base font-bold shadow-sm`}>
            {patient.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base font-bold text-on-surface">{patient.name}</h2>
              <span className="text-xs text-on-surface-variant font-medium">Age {patient.age}</span>
            </div>
            {statusBadge}
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_right</span>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-border-subtle">
        <div className="flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium">Telemetry</span>
          <span className={`font-bold text-sm flex items-center gap-1 mt-0.5 ${isCritical ? 'text-coral-red' : isWarning ? 'text-warm-amber' : 'text-on-surface'}`}>
            <span className="material-symbols-outlined text-[14px]">water_drop</span>
            <span>{patient.spo2} SpO2</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium">Heart Rate</span>
          <span className="font-bold text-on-surface text-sm flex items-center gap-1 mt-0.5">
            <span className={`material-symbols-outlined text-[14px] ${isCritical ? 'text-coral-red' : isWarning ? 'text-warm-amber' : 'text-teal-600'}`}>
              monitoring
            </span>
            <span>{patient.heartRate}</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-on-surface-variant font-medium">Adherence</span>
          <span className={`font-bold text-sm mt-0.5 ${isCritical ? 'text-coral-red' : isWarning ? 'text-warm-amber' : 'text-emerald'}`}>
            {patient.adherence}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1 font-medium truncate">
          <span className={`material-symbols-outlined text-[15px] ${isCritical ? 'text-primary' : isWarning ? 'text-slate-500' : 'text-emerald'}`}>
            {isCritical ? 'neurology' : isWarning ? 'schedule' : 'done_all'}
          </span>
          <span className={isCritical ? 'text-primary' : 'text-slate-700'}>{patient.aiRecommendation}</span>
        </span>
        <span className="text-slate-400 shrink-0 ml-2">{patient.lastActive}</span>
      </div>
    </div>
  );
}
