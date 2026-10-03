import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockCaregiverData } from '../data/mockData';
import BottomNavigation from '../components/common/BottomNavigation';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

export default function CaregiverMonitorPage() {
  const [showSosModal, setShowSosModal] = useState(false);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [caregiverData, setCaregiverData] = useState(null);
  const [dataSource, setDataSource] = useState('connecting'); // 'backend' | 'fallback'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCaregiver() {
      setIsLoading(true);
      const res = await api.getCaregiverSummary();
      if (res.success && res.data && isMounted) {
        setCaregiverData(res.data);
        setDataSource('backend');
      } else if (isMounted) {
        setDataSource('fallback');
      }
      if (isMounted) setIsLoading(false);
    }
    loadCaregiver();
    return () => { isMounted = false; };
  }, []);

  const patient = caregiverData ? {
    name: caregiverData.patientName,
    initials: caregiverData.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT',
    age: 28,
    status: caregiverData.status || 'Stable & Resting',
    vitals: {
      spo2: caregiverData.quickStats?.avgSpo2 || '98%',
      spo2Status: 'Optimal Range',
      heartRate: '72',
      heartRateUnit: 'bpm',
      heartRateStatus: 'Normal Rhythm',
      battery: `${caregiverData.battery}%`,
      batteryStatus: '14h remaining',
    }
  } : mockCaregiverData.activePatient;

  const clinician = caregiverData?.contacts?.doctor ? {
    name: caregiverData.contacts.doctor.name,
    department: caregiverData.contacts.doctor.role || 'Pulmonology',
    phone: caregiverData.contacts.doctor.phone || '+1 (555) 432-8890',
    email: 's.jenkins@pulmonology.clinic',
  } : mockCaregiverData.clinician;

  const activityLog = caregiverData?.recentActivity || mockCaregiverData.activityLog;

  const handleTriggerSOS = async () => {
    setShowSosModal(true);
    await api.triggerSOS({
      location_address: '104 Health Ave, San Francisco, CA',
      notes: `Caregiver escalated emergency distress beacon for ${patient.name}`,
    }).catch(() => {});
  };

  return (
    <div className="bg-[#F8FAFC] font-body text-[#0F172A] flex flex-col min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Top App Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-xl pt-safe border-b border-[#E2E8F0]">
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-headline font-bold text-lg sm:text-xl text-[#0F172A] tracking-tight">SmartNeb</span>
            <div className="flex items-center gap-1 bg-[#D1FAE5] border border-[#10B981]/30 px-2 py-0.5 rounded-full text-[11px] text-[#065F46] font-semibold">
              <span className="material-symbols-outlined text-[13px]">cloud_download</span>
              <span>{dataSource === 'backend' ? 'API Live' : 'MQTT Demo'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#E2E8F0] px-2 sm:px-2.5 py-1 rounded-full text-[11px] text-[#64748B] font-medium shadow-sm">
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[#0D9488] text-[14px]">battery_charging_full</span>
                <span className="text-[#0F172A] font-semibold">{patient.vitals.battery}</span>
              </div>
              <span className="text-[#CBD5E1]">|</span>
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[#0284C7] text-[14px]">water_drop</span>
                <span className="text-[#0F172A] font-semibold">{caregiverData?.medicationLevel ? `${caregiverData.medicationLevel}%` : '92%'}</span>
              </div>
            </div>
            <button 
              onClick={() => setToast('Caregiver profile: Elena Rostova (Primary Guardian)')}
              className="w-8 h-8 shrink-0 rounded-full bg-[#CCFBF1] border border-[#0D9488]/30 flex items-center justify-center text-[#0D9488] hover:bg-[#99F6E4] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full px-4 pt-20 pb-28 gap-4 max-w-md mx-auto">
        
        {/* Active Patient Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] relative overflow-hidden flex flex-col gap-3.5">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0D9488]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] border border-[#0D9488]/20 flex items-center justify-center text-[#0D9488] font-headline font-bold text-lg shadow-sm">
                {patient.initials}
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Active Patient</span>
                <h2 className="text-xl text-[#0F172A] font-headline font-bold">{patient.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full text-xs font-semibold border border-[#10B981]/30">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span>{patient.status}</span>
            </div>
          </div>

          {/* Live Vitals Summary Row */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[#64748B] text-xs font-medium">
                <span className="material-symbols-outlined text-[#0284C7] text-[16px]">air</span>
                <span>SpO2</span>
              </div>
              <div className="text-xl text-[#0F172A] font-headline font-bold">{patient.vitals.spo2}</div>
              <span className="text-[10px] text-[#047857] font-semibold">{patient.vitals.spo2Status}</span>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[#64748B] text-xs font-medium">
                <span className="material-symbols-outlined text-[#0D9488] text-[16px]">favorite</span>
                <span>Heart Rate</span>
              </div>
              <div className="text-xl text-[#0F172A] font-headline font-bold">
                {patient.vitals.heartRate} <span className="text-xs font-normal text-[#64748B]">{patient.vitals.heartRateUnit}</span>
              </div>
              <span className="text-[10px] text-[#047857] font-semibold">{patient.vitals.heartRateStatus}</span>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[#64748B] text-xs font-medium">
                <span className="material-symbols-outlined text-[#D97706] text-[16px]">bolt</span>
                <span>Battery</span>
              </div>
              <div className="text-xl text-[#0F172A] font-headline font-bold">{patient.vitals.battery}</div>
              <span className="text-[10px] text-[#64748B]">{patient.vitals.batteryStatus}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Row */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowClinicianModal(true)}
            className="bg-white hover:bg-slate-50 transition-all p-4 rounded-2xl flex flex-col items-start gap-2.5 shadow-sm border border-[#E2E8F0] text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#0D9488]/20 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Direct Clinician</h3>
              <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{clinician.name}</p>
            </div>
          </button>

          <button 
            onClick={handleTriggerSOS}
            className="bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-all p-4 rounded-2xl flex flex-col items-start gap-2.5 shadow-sm border border-[#FCA5A5] text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EF4444] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emergency_home
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#DC2626]">Emergency SOS</h3>
              <p className="text-xs text-[#991B1B] mt-0.5 line-clamp-1">Broadcast alert to team</p>
            </div>
          </button>
        </div>

        {/* Nebulizer Flow Rate Live Monitor Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0D9488] text-[20px]">monitoring</span>
              <h3 className="text-sm font-bold text-[#0F172A] font-headline">Nebulizer Flow Rate</h3>
            </div>
            <span className="text-xs text-[#065F46] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full font-semibold border border-[#10B981]/30">
              {mockCaregiverData.liveWaveform.flowRate}
            </span>
          </div>

          {/* Waveform Graph */}
          <div className="w-full h-24 bg-[#F0FDFA] rounded-xl p-2 flex items-center justify-center relative overflow-hidden border border-[#CCFBF1]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M0 40 Q 25 10, 50 40 T 100 40 T 150 20 T 200 50 T 250 40 T 300 40" 
                fill="none" 
                stroke="#0D9488" 
                strokeLinecap="round" 
                strokeWidth="2.5"
              ></path>
              <path 
                d="M0 40 Q 25 10, 50 40 T 100 40 T 150 20 T 200 50 T 250 40 T 300 40 L 300 80 L 0 80 Z" 
                fill="url(#grad)" 
                opacity="0.3"
              ></path>
              <defs>
                <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute right-3 top-3 flex items-center gap-1.5 text-[10px] text-[#0F172A] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-ping"></span>
              <span>{mockCaregiverData.liveWaveform.mqttStatus}</span>
            </div>
          </div>
        </div>

        {/* Event & Activity Log Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284C7] text-[20px]">notifications_active</span>
              <h3 className="text-sm font-bold text-[#0F172A] font-headline">Event &amp; Activity Log</h3>
            </div>
            <span className="text-xs text-[#64748B] font-medium">Today</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className={`w-8 h-8 rounded-lg ${log.bg || 'bg-[#CCFBF1]'} ${log.color || 'text-[#0D9488]'} flex items-center justify-center shrink-0 mt-0.5 border ${log.border || 'border-[#0D9488]/20'}`}>
                  <span className="material-symbols-outlined text-[16px]">{log.icon || 'check_circle'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">{log.title}</h4>
                    <span className="text-[11px] text-[#64748B] shrink-0">{log.time}</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{log.detail || log.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOS Broadcast Receipts Log */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#EF4444] text-[20px]">shield_locked</span>
              <h3 className="text-sm font-bold text-[#0F172A] font-headline">SOS Broadcast Receipts</h3>
            </div>
            <span className="text-[11px] text-[#065F46] flex items-center gap-1 bg-[#D1FAE5] px-2.5 py-0.5 rounded-full border border-[#10B981]/30 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              Secure Relay Active
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            {mockCaregiverData.sosReceipts.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center border border-[#10B981]/30">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{rec.target}</div>
                    <div className="text-[10px] text-[#64748B]">{rec.note}</div>
                  </div>
                </div>
                <span className="text-[11px] text-[#64748B] font-medium">{rec.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Interactive Clinician Contact Modal */}
      <Modal isOpen={showClinicianModal} onClose={() => setShowClinicianModal(false)} title="Assigned Clinician">
        <div className="flex flex-col gap-3.5 py-1">
          <div className="flex items-center gap-3 bg-teal-50 p-3 rounded-xl border border-teal-100">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg font-bold">
              {clinician.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'MD'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{clinician.name}</h4>
              <p className="text-xs text-slate-500">{clinician.department} • On-Call Pulmonologist</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <a 
              href={`tel:${clinician.phone}`} 
              onClick={() => {
                setShowClinicianModal(false);
                setToast(`Connecting voice call to ${clinician.name}...`);
              }}
              className="py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Voice Call: {clinician.phone}</span>
            </a>
            <button 
              onClick={() => {
                setShowClinicianModal(false);
                setToast(`Clinical priority page sent to ${clinician.name}.`);
              }}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Send Priority Telemetry Page</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Interactive SOS Modal */}
      <Modal isOpen={showSosModal} onClose={() => setShowSosModal(false)} title="SOS Emergency Broadcast">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center animate-bounce border border-[#FCA5A5]">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency_home
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] font-headline">SOS Broadcast Sent</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Emergency alert transmitted to assigned clinicians and medical dispatch center with live vitals.
            </p>
          </div>
          <button 
            onClick={() => {
              setShowSosModal(false);
              setToast('Emergency SOS dismissed. Broadcast log updated.');
            }}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Dismiss Notice
          </button>
        </div>
      </Modal>

      {/* Clean Bottom Navigation for Caregiver */}
      <BottomNavigation role="caregiver" activeTab="monitor" />
    </div>
  );
}
