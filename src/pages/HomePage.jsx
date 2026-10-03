import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-body text-on-surface antialiased flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-gutter flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">airwave</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-title text-on-surface font-semibold tracking-tight">SmartNeb</span>
              <span className="font-label text-label text-on-surface-variant -mt-1">Respiratory IoT</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => navigate('/auth?tab=signin')}
              className="h-10 px-space-md rounded-full bg-surface-container-low text-on-surface flex items-center justify-center font-label text-label font-medium hover:bg-surface-container transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-hover transition-colors"
              aria-label="User Account"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface max-w-md mx-auto">
        <div className="flex flex-col w-full">
          <div className="px-gutter pt-space-md pb-space-lg flex flex-col gap-space-lg">
            
            {/* Header Badge */}
            <div className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-xs bg-primary-container px-space-sm py-1 rounded-full self-start">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-label text-primary font-semibold tracking-wide uppercase">IoT Respiratory Therapy</span>
              </div>
              <p className="font-label text-label text-on-surface-variant tracking-wider uppercase font-medium">
                Smart Respiratory Care, Connected.
              </p>
            </div>

            {/* Hero Title & Actions */}
            <div className="flex flex-col gap-space-md">
              <h1 className="font-display text-display text-on-surface font-bold tracking-tight leading-tight">
                Smarter Respiratory Care, Wherever You Are.
              </h1>
              <p className="font-body text-body text-on-surface-variant leading-relaxed">
                SmartNeb connects respiratory therapy, health monitoring, and intelligent care coordination in one simple, unified platform.
              </p>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <button
                  onClick={() => navigate('/auth?tab=signup')}
                  className="h-12 w-full px-space-lg rounded-full bg-primary text-on-primary flex items-center justify-center gap-space-sm font-label text-body font-semibold shadow-md active:scale-[0.99] hover:bg-primary-hover transition-all"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/auth?tab=signin')}
                  className="h-12 w-full px-space-lg rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label text-body font-semibold hover:bg-surface-container active:scale-[0.99] transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Pocket-01 Device Status Hero Card */}
            <div className="relative w-full rounded-3xl bg-surface-container-low p-space-md overflow-hidden shadow-sm flex flex-col gap-space-md border border-slate-200/60">
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-primary-container/40 blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-1.5 rounded-full shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-label text-label text-on-surface font-medium">Ready to pair • BLE Active</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">bluetooth</span>
                </div>
              </div>

              {/* Circular Gauge Graphic */}
              <div className="flex items-center justify-center py-space-sm z-10">
                <div className="relative w-44 h-44 rounded-full bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center gap-1 border border-slate-100">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-primary" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeDasharray="276" strokeDashoffset="65" strokeLinecap="round" strokeWidth="4"></circle>
                  </svg>
                  <span className="material-symbols-outlined text-primary text-[36px]">air</span>
                  <span className="font-headline text-headline text-on-surface font-bold tracking-tight">Pocket-01</span>
                  <span className="font-label text-[11px] text-on-surface-variant">Optimal Flow 0.4ml/m</span>
                </div>
              </div>

              {/* Live Telemetry Preview Cards */}
              <div className="grid grid-cols-2 gap-space-sm z-10">
                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex items-center gap-space-sm border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label text-label text-on-surface-variant">Resting SpO₂</span>
                    <span className="font-title text-title text-on-surface font-semibold">98%</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex items-center gap-space-sm border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">battery_charging_90</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label text-label text-on-surface-variant">Battery Life</span>
                    <span className="font-title text-title text-on-surface font-semibold">94%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="flex flex-col gap-space-md pt-space-sm">
              <div className="flex flex-col">
                <span className="font-label text-label text-primary font-semibold uppercase tracking-wider">Features</span>
                <h2 className="font-headline text-headline text-on-surface font-bold">Every breath monitored, effortlessly.</h2>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="p-space-md rounded-2xl bg-surface-container-low flex items-start gap-space-md border border-slate-200/50">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex-shrink-0 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">vital_signs</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-title text-title text-on-surface font-semibold">Live Health Monitoring</h3>
                    <p className="font-body text-body text-on-surface-variant pt-space-xs">
                      Track SpO₂, heart rate and temperature simultaneously in one unified medical log.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl bg-surface-container-low flex items-start gap-space-md border border-slate-200/50">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex-shrink-0 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">medication_liquid</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-title text-title text-on-surface font-semibold">Smart Nebulizer Therapy</h3>
                    <p className="font-body text-body text-on-surface-variant pt-space-xs">
                      Manage respiratory therapy sessions with a calm, automated guidance companion.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl bg-surface-container-low flex items-start gap-space-md border border-slate-200/50">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container flex-shrink-0 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[24px]">hub</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-title text-title text-on-surface font-semibold">Connected Care</h3>
                    <p className="font-body text-body text-on-surface-variant pt-space-xs">
                      Keep patients, family caregivers, and primary clinicians continuously in sync.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl bg-surface-container-low flex items-start gap-space-md border border-slate-200/50">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex-shrink-0 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">neurology</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-title text-title text-on-surface font-semibold">AI Respiratory Assistant</h3>
                    <p className="font-body text-body text-on-surface-variant pt-space-xs">
                      Receive tailored adherence alerts and actionable guidance derived from your therapy logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="flex flex-col gap-space-md pt-space-sm">
              <div className="flex flex-col">
                <span className="font-label text-label text-primary font-semibold uppercase tracking-wider">How It Works</span>
                <h2 className="font-headline text-headline text-on-surface font-bold">Three steps to seamless therapy.</h2>
              </div>
              <div className="flex flex-col gap-space-md relative pl-4">
                <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-surface-container"></div>
                <div className="flex items-start gap-space-md relative z-10">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label text-label font-bold flex-shrink-0 shadow-sm">
                    1
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h4 className="font-title text-title text-on-surface font-semibold">Connect</h4>
                    <p className="font-body text-body text-on-surface-variant">Pair your portable SmartNeb hardware via low-power Bluetooth in seconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-space-md relative z-10">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label text-label font-bold flex-shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h4 className="font-title text-title text-on-surface font-semibold">Monitor</h4>
                    <p className="font-body text-body text-on-surface-variant">View nebulization dosage, inhalation stability, and real-time telemetry live on your device.</p>
                  </div>
                </div>
                <div className="flex items-start gap-space-md relative z-10">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label text-label font-bold flex-shrink-0 shadow-sm">
                    3
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h4 className="font-title text-title text-on-surface font-semibold">Care</h4>
                    <p className="font-body text-body text-on-surface-variant">Automate logs directly to your doctor's desk and ensure treatments never slip by.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-User Ecosystem Section */}
            <div className="flex flex-col gap-space-md pt-space-sm">
              <div className="flex flex-col">
                <span className="font-label text-label text-primary font-semibold uppercase tracking-wider">Multi-User Ecosystem</span>
                <h2 className="font-headline text-headline text-on-surface font-bold">Care designed for everyone involved.</h2>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div 
                  onClick={() => navigate('/patient/dashboard')}
                  className="p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-xs cursor-pointer hover:bg-teal-50/50 transition-colors border border-slate-200/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <span className="font-title text-title text-on-surface font-semibold pt-space-xs">Patient</span>
                  <span className="font-label text-label text-on-surface-variant leading-relaxed">Guided daily therapy &amp; vitals tracking at home or on-the-go.</span>
                </div>

                <div 
                  onClick={() => navigate('/doctor')}
                  className="p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-xs cursor-pointer hover:bg-sky-50/50 transition-colors border border-slate-200/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                  </div>
                  <span className="font-title text-title text-on-surface font-semibold pt-space-xs">Doctor</span>
                  <span className="font-label text-label text-on-surface-variant leading-relaxed">Triage alerts, roster monitoring &amp; prescription administration.</span>
                </div>

                <div 
                  onClick={() => navigate('/caregiver')}
                  className="p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-xs cursor-pointer hover:bg-indigo-50/50 transition-colors border border-slate-200/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-tertiary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">supervised_user_circle</span>
                  </div>
                  <span className="font-title text-title text-on-surface font-semibold pt-space-xs">Caregiver</span>
                  <span className="font-label text-label text-on-surface-variant leading-relaxed">Remote adherence notifications &amp; instant emergency updates.</span>
                </div>

                <div 
                  onClick={() => navigate('/admin')}
                  className="p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-xs cursor-pointer hover:bg-slate-200/50 transition-colors border border-slate-200/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  </div>
                  <span className="font-title text-title text-on-surface font-semibold pt-space-xs">Admin</span>
                  <span className="font-label text-label text-on-surface-variant leading-relaxed">Hardware fleet health, cryptographic keys &amp; provisioning.</span>
                </div>
              </div>
            </div>

            {/* Trust and Safety Section */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-slate-200/70">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <h4 className="font-title text-title text-on-surface font-semibold">Designed for Connected Respiratory Care</h4>
              </div>
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-label text-label">Secure account access</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-label text-label">Role-based views</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-label text-label">Real-time telemetry</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-label text-label">Care-team alignment</span>
                </div>
              </div>
              <p className="font-label text-label text-on-surface-variant pt-space-xs leading-normal">
                SmartNeb is a connected medical device accessory. Clinical diagnoses and changes in regimen remain strictly with your treating medical professional.
              </p>
            </div>

            {/* Bottom Call to Action Card */}
            <div className="p-space-lg rounded-3xl bg-surface-container-low flex flex-col items-center text-center gap-space-md border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[28px]">vital_signs</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <h3 className="font-headline text-headline text-on-surface font-bold">Ready to get started?</h3>
                <p className="font-body text-body text-on-surface-variant max-w-xs">
                  Experience seamless respiratory therapy and remote supervision today.
                </p>
              </div>
              <div className="flex flex-col w-full gap-space-sm pt-space-xs">
                <button
                  onClick={() => navigate('/auth?tab=signup')}
                  className="h-12 w-full rounded-full bg-primary text-on-primary flex items-center justify-center font-label text-body font-semibold shadow-md active:scale-[0.99] hover:bg-primary-hover transition-all"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/auth?tab=signin')}
                  className="h-10 w-full flex items-center justify-center font-label text-label text-primary font-medium hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex flex-col items-center justify-center py-space-sm gap-1 text-center">
              <span className="font-label text-label text-on-surface-variant font-medium">SmartNeb IoT Respiratory Ecosystem</span>
              <span className="font-label text-[11px] text-on-surface-variant/70">ISO-13485 Compliant Architecture • HIPAA Ready</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
