import React from 'react';

export default function VitalCard({
  label,
  value,
  unit,
  status,
  statusColor = "text-success",
  icon,
  iconColor = "text-primary",
  bg = "bg-white",
  border = true
}) {
  return (
    <div className={`flex flex-col p-3 rounded-xl shadow-sm ${bg} ${border ? 'border border-slate-200/80' : ''}`}>
      <div className="flex items-center gap-1.5 text-on-surface-variant mb-1 text-xs font-medium">
        {icon && (
          <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1 my-0.5">
        <span className="font-headline text-lg font-bold text-on-surface tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-normal text-on-surface-variant">
            {unit}
          </span>
        )}
      </div>

      {status && (
        <span className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{status}</span>
        </span>
      )}
    </div>
  );
}
