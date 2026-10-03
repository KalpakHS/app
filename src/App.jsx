import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeviceFrame from './components/common/DeviceFrame';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import ActiveTherapyPage from './pages/ActiveTherapyPage';
import AIAssistantPage from './pages/AIAssistantPage';
import DoctorTriagePage from './pages/DoctorTriagePage';
import CaregiverMonitorPage from './pages/CaregiverMonitorPage';
import AdminFleetPage from './pages/AdminFleetPage';

export default function App() {
  return (
    <DeviceFrame>
      <Routes>
        {/* 1. Home / Landing */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Authentication */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* 3. Patient Dashboard */}
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        
        {/* 4. Active Therapy */}
        <Route path="/patient/therapy" element={<ActiveTherapyPage />} />
        
        {/* 5. Doctor / Clinical Triage */}
        <Route path="/doctor" element={<DoctorTriagePage />} />
        
        {/* 6. Caregiver Monitor */}
        <Route path="/caregiver" element={<CaregiverMonitorPage />} />
        
        {/* 7. AI Respiratory Assistant */}
        <Route path="/patient/ai" element={<AIAssistantPage />} />
        
        {/* 8. Admin / Device Fleet */}
        <Route path="/admin" element={<AdminFleetPage />} />
        
        {/* Convenience Redirects */}
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="/patient/assistant" element={<Navigate to="/patient/ai" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DeviceFrame>
  );
}
