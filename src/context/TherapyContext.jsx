import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockTherapy, mockDevice, mockVitals } from '../data/mockData';
import { api } from '../services/api';

const TherapyContext = createContext();

export function TherapyProvider({ children }) {
  const [sessionStatus, setSessionStatus] = useState('RUNNING'); // RUNNING by default as in Active Therapy design
  const [remainingSeconds, setRemainingSeconds] = useState(mockTherapy.targetDurationSeconds); // 272s = 04:32
  const [totalSeconds, setTotalSeconds] = useState(mockTherapy.totalDurationSeconds); // 300s
  const [liquidRemainingMl, setLiquidRemainingMl] = useState(mockTherapy.chamberRemainingMl); // 2.1 ml
  const [chamberPct, setChamberPct] = useState(mockTherapy.chamberPct); // 68%
  const [aerosolRate, setAerosolRate] = useState(mockTherapy.aerosolRate); // 0.45 ml/m
  const [spo2, setSpo2] = useState(mockVitals.spo2.value); // 98%
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Track backend session ID if available
  const backendSessionIdRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    let interval = null;
    if (sessionStatus === 'RUNNING') {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setSessionStatus('COMPLETED');
            setShowCompletedModal(true);
            // Notify backend of completion
            if (backendSessionIdRef.current) {
              api.completeTherapy(backendSessionIdRef.current, {
                elapsed_seconds: totalSeconds,
                delivered_dosage_ml: 2.5,
              }).catch(() => {});
            }
            return 0;
          }
          // Slow subtle drain of chamber
          if (prev % 15 === 0) {
            setLiquidRemainingMl((vol) => Math.max(0, +(vol - 0.05).toFixed(2)));
            setChamberPct((pct) => Math.max(0, Math.round(pct - 1)));
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStatus, totalSeconds]);

  const startTherapy = async () => {
    if (remainingSeconds <= 0 || sessionStatus === 'COMPLETED') {
      setRemainingSeconds(mockTherapy.targetDurationSeconds);
      setTotalSeconds(mockTherapy.totalDurationSeconds);
      setLiquidRemainingMl(2.1);
      setChamberPct(68);
    }
    setSessionStatus('RUNNING');
    setShowCompletedModal(false);
    showToast('Nebulizer Atomizer Activated • Flow Optimal');

    // Notify backend
    try {
      const res = await api.startTherapy(totalSeconds);
      if (res.success && res.data?.id) {
        backendSessionIdRef.current = res.data.id;
      }
    } catch (e) {
      // offline fallback
    }
  };

  const pauseTherapy = async () => {
    setSessionStatus('PAUSED');
    showToast('Therapy Paused. Chamber & Telemetry Standby.');

    if (backendSessionIdRef.current) {
      api.pauseTherapy(backendSessionIdRef.current, totalSeconds - remainingSeconds).catch(() => {});
    }
  };

  const resumeTherapy = async () => {
    setSessionStatus('RUNNING');
    showToast('Therapy Resumed • MQTT Confirmed');

    if (backendSessionIdRef.current) {
      api.resumeTherapy(backendSessionIdRef.current).catch(() => {});
    }
  };

  const stopTherapy = async () => {
    setSessionStatus('COMPLETED');
    setShowCompletedModal(true);
    showToast('Therapy Stopped. Session Summary Generated.');

    if (backendSessionIdRef.current) {
      api.completeTherapy(backendSessionIdRef.current, {
        elapsed_seconds: totalSeconds - remainingSeconds,
        delivered_dosage_ml: +((2.5 * (totalSeconds - remainingSeconds)) / totalSeconds).toFixed(2),
      }).catch(() => {});
    }
  };

  const resetTherapy = (newDurationSeconds = 300) => {
    setRemainingSeconds(newDurationSeconds);
    setTotalSeconds(newDurationSeconds);
    setSessionStatus('RUNNING');
    setLiquidRemainingMl(2.1);
    setChamberPct(68);
    setShowCompletedModal(false);
    showToast('New Nebulizer Session Started.');

    api.startTherapy(newDurationSeconds).then((res) => {
      if (res.success && res.data?.id) {
        backendSessionIdRef.current = res.data.id;
      }
    }).catch(() => {});
  };

  const triggerSOS = () => {
    setShowSosModal(true);
    api.triggerSOS({
      latitude: 37.7749,
      longitude: -122.4194,
      location_address: '104 Health Ave, San Francisco, CA',
      notes: 'Emergency SOS initiated via SmartNeb mobile UI',
    }).catch(() => {});
  };

  const closeSOS = () => {
    setShowSosModal(false);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  return (
    <TherapyContext.Provider
      value={{
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
        setShowSosModal,
        toastMessage,
        showToast,
        startTherapy,
        pauseTherapy,
        resumeTherapy,
        stopTherapy,
        resetTherapy,
        triggerSOS,
        closeSOS,
        formatTime,
      }}
    >
      {children}
    </TherapyContext.Provider>
  );
}

export function useTherapy() {
  const context = useContext(TherapyContext);
  if (!context) {
    throw new Error('useTherapy must be used within a TherapyProvider');
  }
  return context;
}
