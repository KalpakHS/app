import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DeviceFrame({ children }) {
  const [viewportWidth, setViewportWidth] = useState('390px'); // Default 390px as requested
  const [isFrameEnabled, setIsFrameEnabled] = useState(false); // Fluid by default, framed optionally
  const [isBarExpanded, setIsBarExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setRole } = useAuth();

  const routes = [
    { label: 'Home', path: '/' },
    { label: 'Auth', path: '/auth' },
    { label: 'Patient', path: '/patient/dashboard' },
    { label: 'Therapy', path: '/patient/therapy' },
    { label: 'AI Assist', path: '/patient/ai' },
    { label: 'Doctor', path: '/doctor' },
    { label: 'Caregiver', path: '/caregiver' },
    { label: 'Admin', path: '/admin' },
  ];

  const viewports = [
    { label: '360px', width: '360px' },
    { label: '375px', width: '375px' },
    { label: '390px (Std)', width: '390px' },
    { label: '412px', width: '412px' },
    { label: '768px (Tab)', width: '768px' },
    { label: '100% Fluid', width: '100%' },
  ];

  const isNative = typeof window !== 'undefined' && (
    Boolean(window.ReactNativeWebView) ||
    new URLSearchParams(location.search).get('native') === 'true' ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );

  if (isNative) {
    return (
      <main className="bg-surface relative flex flex-col min-h-screen w-full">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start text-slate-800">
      {/* Top QA Navigation Bar - collapsible for easy reviewing */}
      <aside 
        aria-label="Screen & Viewport Switcher"
        className="w-full bg-slate-800 border-b border-slate-700/80 px-3 py-2 z-50 text-white flex flex-col gap-2 shrink-0 select-none shadow-lg text-xs"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-bold text-teal-300 tracking-wide text-xs">SMARTNEB TESTBENCH</span>
            <span className="text-[11px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
              Role: <strong className="text-teal-300">{currentUser?.label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport size buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              {viewports.map((vp) => (
                <button
                  key={vp.label}
                  onClick={() => {
                    setViewportWidth(vp.width);
                    setIsFrameEnabled(vp.width !== '100%');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    (isFrameEnabled && viewportWidth === vp.width) || (!isFrameEnabled && vp.width === '100%')
                      ? 'bg-teal-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {vp.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsBarExpanded(!isBarExpanded)}
              className="text-slate-300 hover:text-white p-1 rounded bg-slate-700"
              title="Toggle routes"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isBarExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {/* 8 Screen Quick Route Bar */}
        {isBarExpanded && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0">8 Screens:</span>
            {routes.map((rt) => {
              const isActive = location.pathname === rt.path;
              return (
                <button
                  key={rt.path}
                  onClick={() => {
                    // Also auto-switch role if navigating to role screens
                    if (rt.path === '/doctor') setRole('doctor');
                    else if (rt.path === '/caregiver') setRole('caregiver');
                    else if (rt.path === '/admin') setRole('admin');
                    else if (rt.path.startsWith('/patient')) setRole('patient');
                    navigate(rt.path);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-700/80 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {rt.label}
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main Content Area: Centered framed viewport or fluid container */}
      <div className={`w-full flex justify-center items-start flex-grow ${isFrameEnabled ? 'py-4' : ''}`}>
        <main 
          className="bg-surface relative flex flex-col transition-all duration-300 shadow-2xl overflow-x-hidden min-h-screen"
          style={{
            width: isFrameEnabled ? viewportWidth : '100%',
            maxWidth: isFrameEnabled ? viewportWidth : '100%',
            borderRadius: isFrameEnabled && viewportWidth !== '100%' ? '28px' : '0px',
            border: isFrameEnabled && viewportWidth !== '100%' ? '8px solid #1E293B' : 'none',
            transform: isFrameEnabled && viewportWidth !== '100%' ? 'translateZ(0)' : undefined,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
