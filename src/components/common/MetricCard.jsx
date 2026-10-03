import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-primary",
  trend,
  trendColor = "text-emerald-600",
  progressValue,
  progressColor = "bg-primary"
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium truncate">{title}</span>
        {icon && (
          <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>
            {icon}
          </span>
        )}
      </div>

      <div>
        <div className="font-headline text-slate-900 font-bold text-xl tracking-tight">
          {value}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 font-medium text-[11px] mt-1 ${trendColor}`}>
            <span className="material-symbols-outlined text-[13px]">trending_up</span>
            <span>{trend}</span>
          </div>
        )}

        {subtitle && !trend && (
          <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
            {subtitle}
          </div>
        )}

        {typeof progressValue === 'number' && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`} 
              style={{ width: `${Math.min(100, progressValue)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
