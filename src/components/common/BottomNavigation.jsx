import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';

export default function BottomNavigation({ role = 'patient', activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalTab, setModalTab] = useState(null);

  const getTabsForRole = () => {
    switch (role) {
      case 'doctor':
        return [
          { id: 'roster', label: 'Roster', icon: 'group', path: '/doctor' },
          { id: 'triage', label: 'Triage', icon: 'clinical_notes', isAction: true },
          { id: 'alerts', label: 'Alerts', icon: 'notification_important', isAction: true },
          { id: 'profile', label: 'Profile', icon: 'account_circle', isAction: true },
        ];
      case 'caregiver':
        return [
          { id: 'monitor', label: 'Dashboard', icon: 'dashboard', path: '/caregiver' },
          { id: 'adherence', label: 'Adherence', icon: 'history', isAction: true },
          { id: 'ai', label: 'AI Assist', icon: 'neurology', path: '/patient/ai' },
          { id: 'settings', label: 'Settings', icon: 'settings', isAction: true },
        ];
      case 'admin':
        return [
          { id: 'fleet', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
          { id: 'adherence', label: 'Adherence', icon: 'history', isAction: true },
          { id: 'ai', label: 'AI Assist', icon: 'neurology', path: '/patient/ai' },
          { id: 'settings', label: 'Settings', icon: 'settings', isAction: true },
        ];
      case 'patient':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/patient/dashboard' },
          { id: 'therapy', label: 'Therapy', icon: 'medication', path: '/patient/therapy' },
          { id: 'ai', label: 'AI Assist', icon: 'smart_toy', path: '/patient/ai' },
          { id: 'alerts', label: 'Alerts', icon: 'notifications', isAction: true },
          { id: 'profile', label: 'Profile', icon: 'person', isAction: true },
        ];
    }
  };

  const tabs = getTabsForRole();

  const handleTabClick = (tab) => {
    if (tab.path) {
      navigate(tab.path);
    } else if (tab.isAction) {
      setModalTab(tab);
    }
  };

  const isCurrentActive = (tab) => {
    if (activeTab) return activeTab === tab.id;
    if (tab.path) return location.pathname === tab.path;
    return false;
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/95 backdrop-blur-xl border-t border-outline-variant/60 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
        aria-label="Bottom Navigation"
      >
        <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto w-full">
          {tabs.map((tab) => {
            const active = isCurrentActive(tab);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-all ${
                  active
                    ? 'bg-primary-container text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {tab.icon}
                </span>
                <span className="text-[11px] font-medium leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Info modal for secondary non-primary tabs (Alerts, Profile, Settings) */}
      <Modal
        isOpen={!!modalTab}
        onClose={() => setModalTab(null)}
        title={modalTab?.label}
      >
        <div className="flex flex-col items-center text-center py-2 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shadow-sm border border-teal-100">
            <span className="material-symbols-outlined text-[28px]">{modalTab?.icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">{modalTab?.label} Summary</h4>
            <p className="text-xs text-slate-500 mt-1">
              {modalTab?.id === 'alerts' 
                ? 'Active telemetry threshold monitors & system push notifications.'
                : modalTab?.id === 'adherence'
                  ? '7-Day compliance telemetry: 92% adherence average across all assigned sessions.'
                  : modalTab?.id === 'profile'
                    ? 'Authenticated SmartNeb healthcare profile & assigned IoT credentials.'
                    : 'System configuration, MQTT broker endpoints & notification channels.'
              }
            </p>
          </div>
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Ecosystem:</span>
              <span className="font-semibold text-slate-800 capitalize">{role} Console</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Telemetry Channel:</span>
              <span className="font-semibold text-teal-700">MQTT Live SSL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security:</span>
              <span className="font-semibold text-emerald-700">HIPAA Compliant</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Firmware:</span>
              <span className="font-semibold text-slate-700">ESP32 v2.4.1</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full pt-1">
            {(modalTab?.id === 'profile' || modalTab?.id === 'settings') && (
              <button
                onClick={() => {
                  setModalTab(null);
                  navigate('/auth');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Switch Role / Sign Out</span>
              </button>
            )}
            <button
              onClick={() => setModalTab(null)}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
