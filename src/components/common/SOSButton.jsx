import React from 'react';
import { useTherapy } from '../../context/TherapyContext';

export default function SOSButton({
  label = "1-Tap SOS Emergency Escalation",
  variant = "full", // "full" | "shortcut" | "card"
  onTrigger
}) {
  const { triggerSOS } = useTherapy();

  const handleClick = () => {
    if (onTrigger) {
      onTrigger();
    } else {
      triggerSOS();
    }
  };

  if (variant === "shortcut") {
    return (
      <button 
        onClick={handleClick}
        className="w-full py-4 px-6 bg-error hover:bg-red-600 text-on-error rounded-2xl font-title text-title flex items-center justify-center gap-3 shadow-md hover:opacity-95 transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          sos
        </span>
        <span>Emergency SOS Shortcut</span>
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button 
        onClick={handleClick}
        className="bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-all p-4 rounded-2xl flex flex-col items-start gap-2.5 shadow-sm border border-[#FCA5A5] text-left group w-full"
      >
        <div className="w-10 h-10 rounded-xl bg-[#EF4444] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            emergency_home
          </span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#DC2626]">Emergency SOS</h3>
          <p className="text-xs text-[#991B1B] mt-0.5 line-clamp-1">Broadcast alert to team</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full h-12 bg-error hover:bg-red-600 text-on-error rounded-xl font-headline text-title flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
    >
      <span className="material-symbols-outlined">warning</span>
      <span>{label}</span>
    </button>
  );
}
