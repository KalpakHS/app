import React from 'react';

export default function StatusBadge({ 
  status = "Stable", 
  label, 
  variant, 
  icon, 
  pulse = false, 
  size = "md" 
}) {
  const getStyles = () => {
    if (variant === "critical" || status.toLowerCase().includes("critical") || status.toLowerCase().includes("offline")) {
      return {
        bg: "bg-red-50 text-coral-red border-red-200",
        dot: "bg-coral-red",
        iconDefault: "emergency"
      };
    }
    if (variant === "warning" || status.toLowerCase().includes("warning") || status.toLowerCase().includes("low batt")) {
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        iconDefault: "warning"
      };
    }
    if (variant === "primary" || status.toLowerCase().includes("live feed") || status.toLowerCase().includes("on track")) {
      return {
        bg: "bg-primary-container text-primary border-teal-200",
        dot: "bg-primary",
        iconDefault: "check_circle"
      };
    }
    // Default stable / synced / online / optimal
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      iconDefault: "check_circle"
    };
  };

  const style = getStyles();
  const text = label || status;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${style.bg} ${padding} transition-all`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
        </span>
      )}
      {!pulse && style.dot && !icon && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      )}
      {icon && (
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
      )}
      <span>{text}</span>
    </span>
  );
}
