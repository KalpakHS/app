import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTherapy } from '../context/TherapyContext';
import { api } from '../services/api';
import { mockPatient, mockVitals, mockDevice, mockTherapy } from '../data/mockData';
import AppHeader from '../components/common/AppHeader';
import BottomNavigation from '../components/common/BottomNavigation';
import VitalCard from '../components/common/VitalCard';
import DeviceStatusCard from '../components/common/DeviceStatusCard';
import SOSButton from '../components/common/SOSButton';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { startTherapy, showSosModal, closeSOS, triggerSOS, toastMessage, showToast } = useTherapy();
  const [isStartingTherapy, setIsStartingTherapy] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dataSource, setDataSource] = useState('connecting'); // 'backend' | 'fallback'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const res = await api.getPatientDashboard();
      if (res.success && res.data && isMounted) {
        setDashboardData(res.data);
        setDataSource('backend');
      } else if (isMounted) {
        setDataSource('fallback');
      }
      if (isMounted) setIsLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const patient = dashboardData?.patient || mockPatient;
  const vitals = dashboardData?.vitals ? {
    spo2: { value: Math.round(dashboardData.vitals.spo2), unit: '%', status: dashboardData.vitals.status || 'Normal' },
    heartRate: { value: dashboardData.vitals.pulse, unit: 'bpm', status: 'Steady' },
    temperature: { value: 36.8, unit: '°C', status: 'Optimal' },
  } : mockVitals;
  const device = dashboardData?.device ? {
    batteryLevel: dashboardData.device.battery,
    chamberLevelPct: dashboardData.device.medicationLevel ?? 78,
    chamberVolumeRemainingMl: +(((dashboardData.device.medicationLevel ?? 78) * 0.03)).toFixed(1),
    chamberStatus: 'Optimal',
    deviceModel: dashboardData.device.model || mockPatient.deviceModel,
  } : mockDevice;
  const therapy = dashboardData?.therapy ? {
    status: `${dashboardData.therapy.completedToday}/${dashboardData.therapy.targetToday} Completed`,
    medication: dashboardData.therapy.medication || mockTherapy.medication,
    scheduledTime: `${dashboardData.therapy.nextDose || '2:00 PM'} Scheduled`,
    dosageUnits: dashboardData.therapy.dosage,
  } : mockTherapy;
  const adherenceRate = patient.adherenceRate ? Math.round(patient.adherenceRate) : mockPatient.weeklyAdherenceRate;

  const handleStartTherapy = () => {
    setIsStartingTherapy(true);
    setTimeout(() => {
      startTherapy();
      navigate('/patient/therapy');
    }, 700);
  };

  return (
    <div className="bg-surface font-body flex flex-col min-h-screen text-on-surface">
      <Toast message={toastMessage} />

      {/* Top Header */}
      <AppHeader
        title="SmartNeb"
        icon="neurology"
        badgeText={dataSource === 'backend' ? "API Live" : "Local Demo"}
        badgeStatus={dataSource === 'backend' ? "online" : "syncing"}
      />

      {/* Main Content */}
      <main className="flex flex-col relative w-full px-gutter pt-20 pb-28 bg-surface flex-grow max-w-md mx-auto">
        <div className="flex flex-col w-full space-y-space-lg">
          
          {/* Top Greeting */}
          <div className="flex flex-col gap-1 px-1 pt-1">
            <h1 className="font-headline text-2xl font-bold text-on-surface">Hello, {patient.name}</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-label bg-primary-container text-on-primary-container font-semibold">
                {device.deviceModel || patient.deviceModel || 'SmartNeb Pocket-01'}
              </span>
              <span className="text-body text-on-surface-variant font-medium">
                · {dataSource === 'backend' ? 'Backend Connected' : 'Local Fallback'}
              </span>
            </div>
          </div>

          {/* Section 1: Health Summary Card */}
          <section className="flex flex-col bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-slate-200/50">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline text-title text-on-surface font-bold">Health Summary</h2>
              <span className="material-symbols-outlined text-primary text-[22px]">activity_zone</span>
            </div>
            <div className="grid grid-cols-3 gap-space-sm">
              <VitalCard
                label="SpO2"
                value={`${vitals.spo2.value}%`}
                status={vitals.spo2.status}
                statusColor="text-success"
              />
              <VitalCard
                label="Heart Rate"
                value={vitals.heartRate.value}
                unit="bpm"
                status={vitals.heartRate.status}
                statusColor="text-primary"
              />
              <VitalCard
                label="Temp"
                value={`${vitals.temperature.value}°`}
                status={vitals.temperature.status}
                statusColor="text-success"
              />
            </div>
          </section>

          {/* Section 2: Device & Chamber Status Card */}
          <DeviceStatusCard
            batteryLevel={device.batteryLevel}
            chamberLevel={device.chamberLevelPct}
            chamberVolume={`${device.chamberVolumeRemainingMl}ml`}
            chamberNote={device.chamberStatus}
          />

          {/* Section 3: Today's Therapy Card */}
          <section className="flex flex-col bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-slate-200/50">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline text-title text-on-surface font-bold">Today's Therapy</h2>
              <span className="px-2.5 py-1 bg-primary-container text-on-primary-container rounded-full text-label font-label font-semibold">
                {therapy.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-space-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">medication</span>
                </div>
                <div>
                  <h3 className="font-headline text-title text-on-surface font-bold">
                    {therapy.medication}
                  </h3>
                  <p className="text-body text-on-surface-variant flex items-center gap-1 mt-0.5 text-xs">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>{therapy.scheduledTime}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTherapy}
              disabled={isStartingTherapy}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-headline text-title flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
            >
              {isStartingTherapy ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Initializing Nebulizer...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Start Therapy</span>
                </>
              )}
            </button>
          </section>

          {/* Section 4: Adherence & Progress Card */}
          <section className="flex flex-col bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-slate-200/50">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline text-title text-on-surface font-bold">Adherence &amp; Progress</h2>
              <span className="material-symbols-outlined text-tertiary text-[22px]">trending_up</span>
            </div>
            <div className="grid grid-cols-2 gap-space-md mb-2">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <span className="text-label text-on-surface-variant font-medium">Streak</span>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-headline text-display text-on-surface font-bold">14</span>
                  <span className="text-body text-on-surface-variant">Days</span>
                </div>
                <span className="text-label text-success font-semibold">Consecutive</span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <span className="text-label text-on-surface-variant font-medium">Weekly Rate</span>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-headline text-display text-on-surface font-bold">{adherenceRate}</span>
                  <span className="text-body text-on-surface-variant">%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: `${adherenceRate}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Emergency SOS Action Area */}
          <section className="flex flex-col bg-error-container/40 rounded-2xl p-space-lg shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline text-title text-on-error-container font-bold">Emergency Assist</h2>
              <span className="material-symbols-outlined text-error text-[22px]">emergency</span>
            </div>
            <p className="text-body text-on-error-container mb-space-md text-xs leading-relaxed">
              Instant connection to emergency services and preset clinical contacts.
            </p>
            <SOSButton
              label="1-Tap SOS Emergency Escalation"
              onTrigger={triggerSOS}
            />
          </section>

        </div>
      </main>

      {/* Emergency SOS Modal */}
      <Modal isOpen={showSosModal} onClose={closeSOS} title="Emergency SOS Signal">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-red-100 text-coral-red flex items-center justify-center animate-bounce border border-red-200">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg text-slate-900">Emergency Dispatch Beacon Activated</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              MQTT priority alert broadcast to {patient.doctor || 'Dr. Evelyn Vance'} and designated emergency contacts. Live telemetry stream is now priority-routed.
            </p>
          </div>
          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-800">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current SpO2:</span>
              <span className="font-semibold text-emerald-600">{vitals.spo2.value}% Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Heart Rate:</span>
              <span className="font-semibold text-teal-600">{vitals.heartRate.value} bpm</span>
            </div>
          </div>
          <button
            onClick={() => {
              closeSOS();
              showToast('SOS Standby Dismissed. Care team notified of resolution.');
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Dismiss Standby Notice
          </button>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation role="patient" activeTab="dashboard" />
    </div>
  );
}
