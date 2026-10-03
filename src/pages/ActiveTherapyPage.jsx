import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTherapy } from '../context/TherapyContext';
import { mockTherapy, mockDevice } from '../data/mockData';
import CircularTherapyTimer from '../components/common/CircularTherapyTimer';
import SOSButton from '../components/common/SOSButton';
import BottomNavigation from '../components/common/BottomNavigation';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

export default function ActiveTherapyPage() {
  const navigate = useNavigate();
  const {
    sessionStatus,
    remainingSeconds,
    totalSeconds,
    liquidRemainingMl,
    chamberPct,
    aerosolRate,
    spo2,
    showCompletedModal,
    setShowCompletedModal,
    showSosModal,
    closeSOS,
    triggerSOS,
    toastMessage,
    showToast,
    pauseTherapy,
    resumeTherapy,
    stopTherapy,
    resetTherapy,
    formatTime
  } = useTherapy();

  const isPaused = sessionStatus === 'PAUSED';

  const handleTogglePause = () => {
    if (isPaused) {
      resumeTherapy();
    } else {
      pauseTherapy();
    }
  };

  const handleFinishAndReturn = () => {
    setShowCompletedModal(false);
    resetTherapy(300);
    navigate('/patient/dashboard');
  };

  return (
    <div className="bg-surface font-body flex flex-col min-h-screen text-on-surface">
      <Toast message={toastMessage} />

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/60 pt-safe">
        <div className="h-16 px-gutter flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[28px]">neurology</span>
            <span className="font-headline text-title font-bold tracking-tight text-on-surface">SmartNeb</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-full border border-slate-200/50">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="font-label text-label text-on-surface-variant font-medium">MQTT</span>
            </div>
          </div>
          <div 
            onClick={() => navigate('/auth')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary cursor-pointer hover:bg-primary-hover shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full px-gutter pt-20 pb-28 bg-surface flex-grow max-w-md mx-auto">
        <div className="flex flex-col w-full pb-6 space-y-space-md">
          
          {/* Top Bar with Back and SSL badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <button 
                onClick={() => navigate('/patient/dashboard')}
                className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-all -ml-1 border border-slate-200/60"
                aria-label="Back to dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h1 className="font-headline text-headline text-on-surface font-bold">Active Therapy</h1>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary-container rounded-full shadow-sm border border-teal-200/60">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span className="font-label text-label font-semibold">Secure SSL</span>
            </div>
          </div>

          {/* Section 1: Device Status Banner */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary shadow-sm border border-teal-200/60">
                <span className={`material-symbols-outlined text-[22px] ${isPaused ? '' : 'animate-pulse'}`}>
                  pulse_alert
                </span>
              </div>
              <div>
                <div className="font-title text-title text-on-surface flex items-center gap-2 font-bold">
                  <span>{isPaused ? 'Atomizer Paused' : 'Atomizer Active'}</span>
                  <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-success'}`}></span>
                </div>
                <p className="font-body text-xs text-on-surface-variant font-medium">MQTT Confirmed · SSL Secured</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
          </div>

          {/* Section 2: Large Circular Countdown Timer */}
          <CircularTherapyTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            formattedTime={formatTime(remainingSeconds)}
            flowStatus={mockTherapy.flowStatus}
            sessionStatus={sessionStatus}
          />

          {/* Section 3: Key Live Metrics Side-by-Side */}
          <div className="grid grid-cols-2 gap-space-md">
            {/* SpO2 Card */}
            <div className="bg-white rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-slate-200/70">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label text-label font-medium">SpO2 Level</span>
                <span className="material-symbols-outlined text-[20px] text-success" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline text-headline text-on-surface font-bold">{spo2}</span>
                  <span className="font-body text-body text-on-surface-variant">%</span>
                </div>
                <p className="font-label text-label text-success mt-1 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Stable reading
                </p>
              </div>
            </div>

            {/* Aerosol Rate Card */}
            <div className="bg-white rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-slate-200/70">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label text-label font-medium">Aerosol Rate</span>
                <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  air
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline text-headline text-on-surface font-bold">{isPaused ? '0.00' : aerosolRate}</span>
                  <span className="font-body text-body text-on-surface-variant">ml/m</span>
                </div>
                <p className="font-label text-label text-on-surface-variant mt-1 font-medium">
                  {isPaused ? 'Standby flow' : 'Optimal output'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Chamber Liquid Level Card */}
          <div className="bg-white rounded-xl p-space-md shadow-sm border border-slate-200/70">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                </div>
                <div>
                  <h3 className="font-title text-title text-on-surface text-sm font-bold">Chamber Liquid Level</h3>
                  <p className="font-label text-label text-on-surface-variant">{liquidRemainingMl} ml remaining</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-primary-container text-on-primary-container rounded-full font-label text-label font-semibold">
                {chamberPct}% Optimal
              </span>
            </div>
            <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden mt-space-sm">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${chamberPct}%` }}
              ></div>
            </div>
          </div>

          {/* Section 5: Action Buttons */}
          <div className="grid grid-cols-2 gap-space-md">
            <button
              onClick={handleTogglePause}
              className="py-3 px-4 bg-surface-container text-on-surface rounded-xl font-title text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-300 transition-all shadow-sm active:scale-95 border border-slate-300/70"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={stopTherapy}
              className="py-3 px-4 bg-error-container text-on-error-container rounded-xl font-title text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-200 transition-all shadow-sm active:scale-95 border border-red-200"
            >
              <span className="material-symbols-outlined text-[20px]">stop</span>
              <span>Stop Session</span>
            </button>
          </div>

          {/* Section 6: Emergency SOS Shortcut */}
          <div className="pt-2">
            <SOSButton
              variant="shortcut"
              onTrigger={triggerSOS}
            />
          </div>

        </div>
      </main>

      {/* Session Completed Modal */}
      <Modal 
        isOpen={showCompletedModal} 
        onClose={handleFinishAndReturn}
        title="Therapy Session Completed"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm animate-pulse-glow">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg text-slate-900">Treatment Successfully Dispensed</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Full dose of <strong className="text-teal-700">{mockTherapy.medication}</strong> administered with optimal inhalation stability. Telemetry log synced to clinical roster.
            </p>
          </div>
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Session Duration:</span>
              <span className="font-semibold text-slate-800">5 mins (Target Met)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average SpO2:</span>
              <span className="font-semibold text-emerald-600">98% Stable</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adherence Streak:</span>
              <span className="font-semibold text-teal-700">15 Days (+1 Day Earned!)</span>
            </div>
          </div>
          <button
            onClick={handleFinishAndReturn}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">done</span>
            <span>Return to Patient Dashboard</span>
          </button>
        </div>
      </Modal>

      {/* Emergency SOS Modal */}
      <Modal isOpen={showSosModal} onClose={closeSOS} title="Emergency SOS Signal">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 text-coral-red flex items-center justify-center animate-bounce border border-red-200">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg text-slate-900">Emergency Broadcast Dispatched</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Immediate escalation triggered via MQTT broker. Pulmonology triage on-call team alerted with live vital telemetry.
            </p>
          </div>
          <button
            onClick={() => {
              closeSOS();
              showToast('SOS Standby Dismissed.');
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Dismiss Notice
          </button>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation role="patient" activeTab="therapy" />
    </div>
  );
}
