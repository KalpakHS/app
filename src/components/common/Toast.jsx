import React from 'react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none animate-fade-in">
      <div className="bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm border border-slate-700/60 pointer-events-auto backdrop-blur-md">
        <span className="material-symbols-outlined text-teal-400 text-[18px]">info</span>
        <span className="text-xs font-medium text-slate-100 flex-1">{message}</span>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
