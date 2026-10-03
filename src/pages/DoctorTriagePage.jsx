import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockPatients } from '../data/mockData';
import PatientCard from '../components/common/PatientCard';
import BottomNavigation from '../components/common/BottomNavigation';
import Toast from '../components/common/Toast';

function mapBackendPatient(p) {
  const isCritical = p.status?.toUpperCase() === 'CRITICAL' || p.status?.toUpperCase() === 'ALERT';
  const isWarning = p.status?.toUpperCase().includes('REVIEW') || p.status?.toUpperCase() === 'WARNING';
  const statusFormatted = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Stable';
  const initials = p.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT';

  return {
    id: p.patient_id || `P-${p.id}`,
    rawId: p.id,
    name: p.full_name || p.user?.full_name || 'Patient',
    initials,
    age: p.age,
    gender: p.gender,
    diagnosis: p.diagnosis,
    status: statusFormatted,
    statusLabel: `${statusFormatted} Risk Status`,
    badgeBg: isCritical
      ? "bg-red-100 text-coral-red border-red-200"
      : isWarning
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald border-emerald-200",
    avatarBg: isCritical
      ? "bg-red-50 text-coral-red border border-red-100"
      : isWarning
      ? "bg-amber-50 text-warm-amber border border-amber-100"
      : "bg-emerald-50 text-emerald border border-emerald-100",
    spo2: `${Math.round(p.latest_telemetry?.spo2 || 98)}%`,
    spo2Num: Math.round(p.latest_telemetry?.spo2 || 98),
    heartRate: `${p.latest_telemetry?.pulse || 72} bpm`,
    heartRateNum: p.latest_telemetry?.pulse || 72,
    adherence: `${Math.round(p.adherence_rate || 90)}%`,
    adherenceNum: Math.round(p.adherence_rate || 90),
    lastActive: p.last_session_time || 'Just now',
    aiRecommendation: isCritical
      ? 'Urgent: Oxygen titration required'
      : isWarning
      ? 'Regimen due in 45 mins'
      : 'Optimal response to aerosol',
    notes: `${p.diagnosis}. Prescribed: ${p.prescribed_medication || 'Budesonide'}`,
    durationMinutes: 15,
  };
}

export default function DoctorTriagePage() {
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Critical' | 'Warning' | 'Stable'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(15);
  const [toast, setToast] = useState(null);
  const [isPushing, setIsPushing] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [dataSource, setDataSource] = useState('connecting'); // 'backend' | 'fallback'
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async (statusFilter = '', search = '') => {
    setIsLoading(true);
    const params = {};
    if (statusFilter && statusFilter !== 'All') {
      params.status = statusFilter;
    }
    if (search.trim()) {
      params.search = search.trim();
    }

    const res = await api.getPatients(params);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setPatientsList(res.data.map(mapBackendPatient));
      setDataSource('backend');
    } else {
      setPatientsList(mockPatients);
      setDataSource('fallback');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPatients(activeFilter, searchQuery);
  }, [activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(activeFilter, searchQuery);
  };

  const filteredPatients = patientsList.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: patientsList.length || 42,
    critical: patientsList.filter(p => p.status === 'Critical').length || 2,
    warning: patientsList.filter(p => p.status === 'Warning').length || 5,
    stable: patientsList.filter(p => p.status === 'Stable').length || 35,
  };

  const handleOpenDetail = (patient) => {
    setSelectedPatient(patient);
    setSessionDuration(patient.durationMinutes || 15);
  };

  const handleCloseDetail = () => {
    setSelectedPatient(null);
  };

  const handlePushRegimen = async () => {
    setIsPushing(true);
    if (selectedPatient?.rawId) {
      await api.updatePatient(selectedPatient.rawId, {
        daily_sessions_target: 2,
      }).catch(() => {});
    }

    setTimeout(() => {
      setIsPushing(false);
      setToast(`Updated ${sessionDuration}m regimen successfully saved and pushed to ${selectedPatient?.name}'s Pocket-01 via MQTT.`);
      setTimeout(() => {
        setSelectedPatient(null);
      }, 700);
    }, 800);
  };

  return (
    <div className="bg-background font-body-md text-on-surface flex flex-col min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl pt-safe border-b border-border-subtle">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center font-headline-sm border border-teal-100 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">pulmonology</span>
            </div>
            <div>
              <span className="font-headline-sm text-on-surface text-lg font-bold block leading-tight">SmartNeb</span>
              <span className="text-[10px] text-emerald flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
                {dataSource === 'backend' ? 'API Roster' : 'Local Mock'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearchInput(!showSearchInput)}
              aria-label="Search" 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                showSearchInput ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-on-surface-variant hover:text-on-surface border-border-subtle'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[20px]">stethoscope</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full px-4 pt-20 pb-28 gap-6 bg-background max-w-md mx-auto">
        
        {/* Search Bar when expanded */}
        {showSearchInput && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
            <span className="material-symbols-outlined text-slate-400 pl-1 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search patient name, condition, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); fetchPatients(activeFilter, ''); }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </form>
        )}

        {/* Title & Action */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">Clinical Triage</h1>
            <p className="font-body-sm text-xs text-on-surface-variant">Active respiratory telemetry &amp; roster</p>
          </div>
          <button 
            onClick={() => setToast('Sorted by clinical severity score (Highest risk first).')}
            className="bg-white border border-border-subtle hover:border-primary/50 text-on-surface px-3 py-2 rounded-xl font-label-md flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">sort</span>
            <span className="font-medium text-xs">Risk Priority</span>
          </button>
        </div>

        {/* Quick Metrics Summary Banner */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-white p-2.5 sm:p-3 rounded-2xl border border-border-subtle shadow-sm">
          <button 
            onClick={() => setActiveFilter('All')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${activeFilter === 'All' ? 'bg-slate-200 border-2 border-slate-400' : 'bg-slate-50 border border-slate-100'}`}
          >
            <span className="text-[11px] text-on-surface-variant font-medium">Total</span>
            <span className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">{counts.total}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('Critical')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${activeFilter === 'Critical' ? 'bg-red-100 border-2 border-red-400' : 'bg-red-50 border border-red-100'}`}
          >
            <span className="text-[11px] text-coral-red font-semibold">Critical</span>
            <span className="font-headline-sm text-base sm:text-lg font-bold text-coral-red">{counts.critical}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('Warning')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${activeFilter === 'Warning' ? 'bg-amber-100 border-2 border-amber-400' : 'bg-amber-50 border border-amber-100'}`}
          >
            <span className="text-[11px] text-warm-amber font-semibold truncate">Warnings</span>
            <span className="font-headline-sm text-base sm:text-lg font-bold text-warm-amber">{counts.warning}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('Stable')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${activeFilter === 'Stable' ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-emerald-50 border border-emerald-100'}`}
          >
            <span className="text-[11px] text-emerald font-semibold">Stable</span>
            <span className="font-headline-sm text-base sm:text-lg font-bold text-emerald">{counts.stable}</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3.5 py-1.5 rounded-full font-label-md whitespace-nowrap flex items-center gap-1.5 shadow-sm text-xs transition-colors ${
              activeFilter === 'All'
                ? 'bg-primary text-white font-semibold'
                : 'bg-white text-on-surface border border-slate-200 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>All Patients ({counts.total})</span>
          </button>
          
          <button
            onClick={() => setActiveFilter('Critical')}
            className={`px-3.5 py-1.5 rounded-full font-label-md whitespace-nowrap flex items-center gap-1.5 shadow-sm text-xs transition-colors ${
              activeFilter === 'Critical'
                ? 'bg-coral-red text-white font-semibold'
                : 'bg-white text-on-surface border border-red-200 hover:bg-red-50/50 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-coral-red" style={activeFilter === 'Critical' ? { color: 'white' } : { fontVariationSettings: "'FILL' 1" }}>error</span>
            <span>Critical ({counts.critical})</span>
          </button>

          <button
            onClick={() => setActiveFilter('Warning')}
            className={`px-3.5 py-1.5 rounded-full font-label-md whitespace-nowrap flex items-center gap-1.5 shadow-sm text-xs transition-colors ${
              activeFilter === 'Warning'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white text-on-surface border border-amber-200 hover:bg-amber-50/50 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-warm-amber" style={activeFilter === 'Warning' ? { color: 'white' } : {}}>warning</span>
            <span>Warnings ({counts.warning})</span>
          </button>

          <button
            onClick={() => setActiveFilter('Stable')}
            className={`px-3.5 py-1.5 rounded-full font-label-md whitespace-nowrap flex items-center gap-1.5 shadow-sm text-xs transition-colors ${
              activeFilter === 'Stable'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-white text-on-surface border border-emerald-200 hover:bg-emerald-50/50 font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald" style={activeFilter === 'Stable' ? { color: 'white' } : {}}>check_circle</span>
            <span>Stable ({counts.stable})</span>
          </button>
        </div>

        {/* Patient Roster Cards List */}
        <div className="flex flex-col gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={handleOpenDetail}
            />
          ))}
        </div>

      </main>

      {/* Patient Detail Modal Overlay */}
      {selectedPatient && (
        <div 
          onClick={handleCloseDetail}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm overflow-y-auto px-4 pt-14 pb-24 flex flex-col items-center justify-start animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 border border-border-subtle shadow-2xl flex flex-col gap-5 max-w-md w-full mt-2"
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <button 
                onClick={handleCloseDetail}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-on-surface flex items-center justify-center transition-colors"
                aria-label="Back to roster"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="flex flex-col items-center">
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">{selectedPatient.name}</h2>
                <span className={`text-xs font-semibold ${selectedPatient.status === 'Critical' ? 'text-coral-red' : selectedPatient.status === 'Warning' ? 'text-warm-amber' : 'text-emerald'}`}>
                  {selectedPatient.status} Risk Status
                </span>
              </div>
              <button 
                onClick={handleCloseDetail}
                className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-label-md font-bold shadow-sm transition-colors text-xs"
              >
                Save
              </button>
            </div>

            {/* Telemetry Trends Card with Real SVG Waveforms */}
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">monitoring</span>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">24h Telemetry Trends</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-border-subtle px-2.5 py-1 rounded-lg text-xs text-on-surface-variant font-medium">
                  <span>Live MQTT</span>
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
                </div>
              </div>

              {/* SpO2 Trend */}
              <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-border-subtle shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Blood Oxygen (SpO2)</span>
                  <span className={`font-bold ${selectedPatient.status === 'Critical' ? 'text-coral-red' : 'text-emerald'}`}>
                    {selectedPatient.spo2} ({selectedPatient.status === 'Critical' ? 'Critical Low' : 'Stable'})
                  </span>
                </div>
                <div className="h-20 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                    <path
                      d={selectedPatient.status === 'Critical' 
                        ? "M 0,40 Q 50,30 100,50 T 200,80 T 300,70"
                        : "M 0,30 Q 75,25 150,35 T 250,20 T 300,28"
                      }
                      fill="none" 
                      stroke={selectedPatient.status === 'Critical' ? '#EF4444' : '#10B981'} 
                      strokeWidth="3"
                    ></path>
                    <circle 
                      cx="280" 
                      cy={selectedPatient.status === 'Critical' ? "73" : "28"} 
                      r="5" 
                      fill={selectedPatient.status === 'Critical' ? '#EF4444' : '#10B981'} 
                      className="animate-ping"
                    ></circle>
                    <circle 
                      cx="280" 
                      cy={selectedPatient.status === 'Critical' ? "73" : "28"} 
                      r="4" 
                      fill={selectedPatient.status === 'Critical' ? '#EF4444' : '#10B981'}
                    ></circle>
                  </svg>
                </div>
              </div>

              {/* Heart Rate Trend */}
              <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-border-subtle shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Heart Rate (BPM)</span>
                  <span className={`font-bold ${selectedPatient.status === 'Critical' ? 'text-warm-amber' : 'text-teal-600'}`}>
                    {selectedPatient.heartRate} ({selectedPatient.status === 'Critical' ? 'Elevated' : 'Steady'})
                  </span>
                </div>
                <div className="h-16 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                    <path 
                      d={selectedPatient.status === 'Critical'
                        ? "M 0,60 Q 75,20 150,40 T 300,25"
                        : "M 0,50 Q 80,45 160,55 T 300,48"
                      }
                      fill="none" 
                      stroke={selectedPatient.status === 'Critical' ? '#F59E0B' : '#0D9488'} 
                      strokeWidth="3"
                    ></path>
                    <circle 
                      cx="280" 
                      cy={selectedPatient.status === 'Critical' ? "27" : "48"} 
                      r="4" 
                      fill={selectedPatient.status === 'Critical' ? '#F59E0B' : '#0D9488'}
                    ></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Regimen Tuner Card */}
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 border border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Care Plan Regimen Tuner</h3>
              </div>
              <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-border-subtle shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium text-xs">Nebulizer Session Duration</span>
                  <span className="text-primary font-bold text-sm">{sessionDuration} Mins</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  step="5"
                  value={sessionDuration} 
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="w-full accent-primary bg-slate-200 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
                  <span>5m</span>
                  <span>15m (Standard)</span>
                  <span>30m</span>
                </div>
              </div>
              <button 
                onClick={handlePushRegimen}
                disabled={isPushing}
                className="w-full bg-primary hover:bg-teal-700 text-white py-3.5 rounded-xl font-label-lg font-bold shadow-md mt-1 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {isPushing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Broadcasting via MQTT...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Push Updated Regimen via MQTT</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Doctor Bottom Navigation */}
      <BottomNavigation role="doctor" activeTab="roster" />
    </div>
  );
}
