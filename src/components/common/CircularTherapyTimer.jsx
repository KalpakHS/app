import React from 'react';

export default function CircularTherapyTimer({
  remainingSeconds = 272,
  totalSeconds = 300,
  formattedTime = "04:32",
  flowStatus = "Flow: Normal",
  sessionStatus = "RUNNING"
}) {
  const radius = 84;
  const circumference = 2 * Math.PI * radius; // ~527.78
  // Progress fraction (1 when full, 0 when empty)
  const fraction = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  // Offset: 0 when full, circumference when empty
  const strokeDashoffset = circumference * (1 - fraction);

  const isPaused = sessionStatus === "PAUSED";
  const isCompleted = sessionStatus === "COMPLETED";

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-slate-200/70 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative w-48 h-48 flex items-center justify-center my-2">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            className="text-slate-100" 
            cx="96" 
            cy="96" 
            fill="transparent" 
            r={radius} 
            stroke="currentColor" 
            strokeWidth="12"
          />
          {/* Animated Progress track */}
          <circle 
            className={`transition-all duration-1000 ${isPaused ? 'text-amber-500' : isCompleted ? 'text-emerald-500' : 'text-primary'}`} 
            cx="96" 
            cy="96" 
            fill="transparent" 
            r={radius} 
            stroke="currentColor" 
            strokeWidth="12"
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-3xl font-bold text-on-surface tracking-tight">
            {formattedTime}
          </span>
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
            {isCompleted ? 'Completed' : isPaused ? 'Paused' : 'Remaining'}
          </span>
        </div>
      </div>

      {/* Flow Status Pill */}
      <div className="mt-3 px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full flex items-center gap-2 shadow-sm border border-teal-200/60">
        <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-primary animate-ping'}`}></span>
        <span className="font-label text-xs font-semibold">
          {isPaused ? 'Aerosol Paused' : flowStatus}
        </span>
      </div>
    </div>
  );
}
