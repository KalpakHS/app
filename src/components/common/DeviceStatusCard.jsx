import React from 'react';

export default function DeviceStatusCard({
  batteryLevel = 84,
  chamberLevel = 68,
  chamberVolume = "2.1ml",
  chamberNote = "Optimal"
}) {
  return (
    <section className="flex flex-col bg-surface-container-low rounded-xl p-space-md shadow-sm border border-slate-200/50">
      <div className="flex items-center justify-between mb-space-md">
        <h2 className="font-headline text-title text-on-surface">Device &amp; Chamber</h2>
        <span className="material-symbols-outlined text-secondary text-[22px]">neurology</span>
      </div>
      <div className="grid grid-cols-2 gap-space-md">
        {/* Battery Card */}
        <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-on-surface-variant">Battery Level</span>
            <span className="material-symbols-outlined text-success text-[20px]">
              battery_charging_full
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-display text-on-surface">{batteryLevel}</span>
            <span className="text-body font-medium text-on-surface-variant">%</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-success h-full rounded-full transition-all duration-500" 
              style={{ width: `${batteryLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Chamber Level Card */}
        <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-on-surface-variant">Chamber Level</span>
            <span className="material-symbols-outlined text-primary text-[20px]">
              water_drop
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-display text-on-surface">{chamberLevel}</span>
            <span className="text-body font-medium text-on-surface-variant">%</span>
          </div>
          <span className="text-label text-on-surface-variant mt-1 truncate">
            {chamberVolume} remaining · {chamberNote}
          </span>
        </div>
      </div>
    </section>
  );
}
