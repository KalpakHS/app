import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className={`bg-white rounded-3xl p-6 w-full ${maxWidth} shadow-2xl border border-slate-200/80 relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-headline font-bold text-lg text-slate-900">{title}</h3>
            {onClose && (
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
