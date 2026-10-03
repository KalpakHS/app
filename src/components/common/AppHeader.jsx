import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppHeader({
  title,
  subtitle,
  icon = "neurology",
  showBack = false,
  onBack,
  rightContent,
  badgeText = "MQTT",
  badgeStatus = "online"
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/60 pt-safe">
      <div className="h-16 px-gutter flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-space-sm">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center text-on-surface rounded-full hover:bg-slate-100 transition-colors -ml-1.5"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          ) : (
            icon && (
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary shadow-sm border border-teal-200/50">
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
              </div>
            )
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
                {title || 'SmartNeb'}
              </span>
              {badgeText && !subtitle && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-container-low rounded-full border border-slate-200/60">
                  <span className={`w-2 h-2 rounded-full ${badgeStatus === 'online' ? 'bg-success animate-pulse' : 'bg-slate-400'}`}></span>
                  <span className="font-label text-[11px] text-on-surface-variant font-medium">{badgeText}</span>
                </div>
              )}
            </div>
            {subtitle && (
              <span className="font-label text-label text-on-surface-variant -mt-0.5 font-medium">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          {rightContent ? (
            rightContent
          ) : (
            <div 
              onClick={() => navigate('/auth')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm cursor-pointer hover:bg-primary-hover transition-colors"
              title={`Logged in as ${currentUser?.name} (${currentUser?.label})`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
