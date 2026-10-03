/**
 * SmartNeb Mock Data Architecture
 * Dedicated single source of truth for mock healthcare, IoT telemetry,
 * device status, and multi-user entities.
 * Can later be swapped seamlessly with ESP32 / Firebase / MQTT backend.
 */

export const mockUserRoles = [
  {
    role: "patient",
    name: "Alex Mercer",
    email: "alex.mercer@patient.smartneb.io",
    label: "Patient",
    initials: "AM",
    homeRoute: "/patient/dashboard"
  },
  {
    role: "doctor",
    name: "Dr. Evelyn Vance",
    email: "dr.vance@clinic.smartneb.io",
    label: "Doctor",
    initials: "EV",
    homeRoute: "/doctor"
  },
  {
    role: "caregiver",
    name: "Elena Rostova",
    email: "care.elena@family.smartneb.io",
    label: "Caregiver",
    initials: "ER",
    homeRoute: "/caregiver"
  },
  {
    role: "admin",
    name: "Fleet Administrator",
    email: "admin@ops.smartneb.io",
    label: "Admin",
    initials: "FA",
    homeRoute: "/admin"
  }
];

export const mockPatient = {
  id: "P-001",
  name: "Alex Mercer",
  age: 28,
  condition: "Asthma Mild-Persistent",
  deviceModel: "SmartNeb Pro v2",
  deviceSerial: "Pocket-01",
  assignedDoctor: "Dr. Evelyn Vance",
  assignedCaregiver: "Elena Rostova",
  adherenceStreakDays: 14,
  weeklyAdherenceRate: 92,
  nextScheduledTherapy: "11:00 AM",
  activeMedication: "Albuterol 2.5mg"
};

export const mockVitals = {
  spo2: {
    value: 98,
    unit: "%",
    status: "Normal",
    label: "Resting SpO₂",
    trend: "Stable reading",
    color: "emerald"
  },
  heartRate: {
    value: 72,
    unit: "bpm",
    status: "Steady",
    label: "Heart Rate",
    trend: "Normal Rhythm",
    color: "primary"
  },
  temperature: {
    value: 36.8,
    unit: "°C",
    status: "Optimal",
    label: "Body Temp",
    trend: "Afebrile baseline",
    color: "emerald"
  },
  respiratoryRate: {
    value: 16,
    unit: "breaths/min",
    status: "Normal"
  }
};

export const mockDevice = {
  model: "Pocket-01",
  name: "SmartNeb Pro v2",
  deviceId: "Neb-ESP32-9042",
  firmware: "v2.4.1",
  bleStatus: "Ready to pair • BLE Active",
  mqttStatus: "Connected",
  batteryLevel: 84, // percentage
  batteryRemainingHours: 14,
  chamberLevelPct: 68,
  chamberVolumeRemainingMl: 2.1,
  chamberTotalCapacityMl: 8.5,
  chamberStatus: "Optimal",
  flowRate: "0.45 ml/m",
  optimalFlowTarget: "0.40 ml/m",
  atomizerHealthPct: 97.4,
  lastSync: "Just now"
};

export const mockTherapy = {
  id: "session-20261003",
  medication: "Albuterol 2.5mg",
  scheduledTime: "11:00 AM Scheduled",
  status: "On Track",
  targetDurationSeconds: 272, // 04:32 remaining as shown in Stitch Active Therapy design
  totalDurationSeconds: 300,  // 5 minutes session
  flowStatus: "Flow: Normal",
  aerosolRate: "0.45 ml/m",
  chamberRemainingMl: 2.1,
  chamberPct: 68,
  dosageUnits: "2 puffs / 2.5 mL nebulized solution",
  prescribedBy: "Dr. Evelyn Vance"
};

export const mockPatients = [
  {
    id: "P-101",
    name: "John Doe",
    initials: "JD",
    age: 64,
    status: "Critical",
    statusLabel: "Critical Risk Status",
    badgeBg: "bg-red-100 text-coral-red border-red-200",
    avatarBg: "bg-red-50 text-coral-red border border-red-100",
    spo2: "89%",
    spo2Num: 89,
    heartRate: "122 bpm",
    heartRateNum: 122,
    adherence: "54%",
    adherenceNum: 54,
    lastActive: "14m ago",
    aiRecommendation: "Adjust oxygen titration",
    notes: "Severe COPD exacerbation. Low oxygen saturation and elevated pulse.",
    durationMinutes: 20
  },
  {
    id: "P-102",
    name: "Sarah Jenkins",
    initials: "SJ",
    age: 51,
    status: "Warning",
    statusLabel: "Warning Status",
    badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
    avatarBg: "bg-amber-50 text-warm-amber border border-amber-100",
    spo2: "93%",
    spo2Num: 93,
    heartRate: "98 bpm",
    heartRateNum: 98,
    adherence: "78%",
    adherenceNum: 78,
    lastActive: "3h ago",
    aiRecommendation: "Regimen due in 45 mins",
    notes: "Asthma Tier 2 Patient. Morning dose completed late.",
    durationMinutes: 15
  },
  {
    id: "P-103",
    name: "Robert Fox",
    initials: "RF",
    age: 45,
    status: "Stable",
    statusLabel: "Stable Baseline",
    badgeBg: "bg-emerald-100 text-emerald border-emerald-200",
    avatarBg: "bg-emerald-50 text-emerald border border-emerald-100",
    spo2: "98%",
    spo2Num: 98,
    heartRate: "72 bpm",
    heartRateNum: 72,
    adherence: "96%",
    adherenceNum: 96,
    lastActive: "1h ago",
    aiRecommendation: "Optimal response to aerosol",
    notes: "Excellent compliance and stable peak flow readings.",
    durationMinutes: 15
  },
  {
    id: "P-104",
    name: "Elena Rostova",
    initials: "ER",
    age: 38,
    status: "Stable",
    statusLabel: "Stable Baseline",
    badgeBg: "bg-emerald-100 text-emerald border-emerald-200",
    avatarBg: "bg-emerald-50 text-emerald border border-emerald-100",
    spo2: "97%",
    spo2Num: 97,
    heartRate: "75 bpm",
    heartRateNum: 75,
    adherence: "92%",
    adherenceNum: 92,
    lastActive: "5h ago",
    aiRecommendation: "Regular daily compliance",
    notes: "No nocturnal symptoms reported this week.",
    durationMinutes: 10
  },
  {
    id: "P-105",
    name: "Arthur Pendelton",
    initials: "AP",
    age: 71,
    status: "Critical",
    statusLabel: "Critical Risk Status",
    badgeBg: "bg-red-100 text-coral-red border-red-200",
    avatarBg: "bg-red-50 text-coral-red border border-red-100",
    spo2: "87%",
    spo2Num: 87,
    heartRate: "119 bpm",
    heartRateNum: 119,
    adherence: "48%",
    adherenceNum: 48,
    lastActive: "8m ago",
    aiRecommendation: "Urgent: Nebulization session overdue",
    notes: "Acute bronchospasm. Requires clinical oversight and supplemental O2.",
    durationMinutes: 20
  },
  {
    id: "P-106",
    name: "Marcus Thorne",
    initials: "MT",
    age: 58,
    status: "Warning",
    statusLabel: "Warning Status",
    badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
    avatarBg: "bg-amber-50 text-warm-amber border border-amber-100",
    spo2: "92%",
    spo2Num: 92,
    heartRate: "102 bpm",
    heartRateNum: 102,
    adherence: "71%",
    adherenceNum: 71,
    lastActive: "2h ago",
    aiRecommendation: "Monitor nocturnal wheezing",
    notes: "Late evening dyspnea reported. Nebulizer flow rate fluctuating.",
    durationMinutes: 15
  }
];

export const mockCaregiverData = {
  activePatient: {
    name: "John Doe",
    initials: "JD",
    age: 64,
    status: "Stable & Resting",
    pulseDotColor: "bg-[#10B981]",
    vitals: {
      spo2: "98%",
      spo2Status: "Optimal Range",
      heartRate: "72",
      heartRateUnit: "bpm",
      heartRateStatus: "Normal Rhythm",
      battery: "84%",
      batteryStatus: "14h remaining"
    }
  },
  clinician: {
    name: "Dr. Sarah Jenkins",
    department: "Pulmonology",
    phone: "+1 (555) 432-8890",
    email: "s.jenkins@pulmonology.clinic"
  },
  liveWaveform: {
    flowRate: "Live 6.2 L/min",
    mqttStatus: "Real-time MQTT"
  },
  activityLog: [
    {
      id: "act-1",
      title: "Albuterol Dose Completed",
      time: "10:42 AM",
      desc: "Patient completed scheduled 2.5mg nebulization session successfully.",
      icon: "medication",
      color: "text-[#0D9488]",
      bg: "bg-[#CCFBF1]",
      border: "border-[#0D9488]/20"
    },
    {
      id: "act-2",
      title: "Chamber Refill Status",
      time: "08:15 AM",
      desc: "Saline chamber refilled to 92% capacity by caregiver.",
      icon: "water_drop",
      color: "text-[#D97706]",
      bg: "bg-[#FEF3C7]",
      border: "border-[#F59E0B]/30"
    },
    {
      id: "act-3",
      title: "Device Self-Test Passed",
      time: "07:00 AM",
      desc: "SmartNeb diagnostic check complete. Pressure sensors calibrated.",
      icon: "check_circle",
      color: "text-[#059669]",
      bg: "bg-[#D1FAE5]",
      border: "border-[#10B981]/30"
    }
  ],
  sosReceipts: [
    {
      id: "rec-1",
      target: "Pulmonology On-Call Unit",
      note: "Acknowledged via Pager Gateway",
      time: "Yesterday",
      verified: true
    },
    {
      id: "rec-2",
      target: "Emergency Dispatch Center",
      note: "Test Beacon Handshake Verified",
      time: "3 days ago",
      verified: true
    }
  ]
};

export const mockAdminData = {
  mqttStatus: {
    status: "ONLINE",
    cluster: "us-east-mqtt.smartneb.io",
    latency: "18ms"
  },
  fleetMetrics: {
    registeredDevices: "1,428",
    registeredGrowth: "+12% this week",
    activeMeshHeads: "1,392",
    meshOperationalPct: "97.4% Operational",
    batteryDegradationAvg: "4.2% / year",
    batteryDegradationPct: 28,
    meshWearInspectionCount: 14,
    meshWearPct: 65
  },
  deviceRegistry: [
    {
      id: "Neb-ESP32-9042",
      firmware: "Firmware v2.4.1",
      battery: "88%",
      status: "Synced",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ping: "Ping: 12ms",
      icon: "bluetooth_connected",
      iconBg: "bg-teal-50 text-teal-600 border border-teal-100"
    },
    {
      id: "Neb-ESP32-1184",
      firmware: "Firmware v2.3.9",
      battery: "24%",
      status: "Low Batt",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      ping: "Ping: 45ms",
      icon: "bluetooth_searching",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100"
    },
    {
      id: "Neb-ESP32-5521",
      firmware: "Firmware v2.4.0",
      battery: "0%",
      status: "Offline",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      ping: "Timeout",
      icon: "bluetooth_disabled",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100"
    }
  ],
  userDirectory: [
    {
      id: "user-1",
      name: "Dr. Evelyn Vance",
      title: "Pulmonology Lead",
      role: "Doctor",
      initials: "DR",
      avatarBg: "bg-sky-100 text-sky-700",
      badgeBg: "bg-sky-50 text-sky-700 border-sky-200"
    },
    {
      id: "user-2",
      name: "Marcus Chen",
      title: "Assigned Caregiver",
      role: "Caregiver",
      initials: "MC",
      avatarBg: "bg-amber-100 text-amber-700",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      id: "user-3",
      name: "Sarah Jenkins",
      title: "Asthma Tier 2 Patient",
      role: "Patient",
      initials: "SJ",
      avatarBg: "bg-emerald-100 text-emerald-700",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  ],
  auditLogs: [
    {
      id: "log-1",
      timestamp: "14:32:01",
      colorClass: "text-teal-700 font-semibold",
      message: "OTA Firmware push initiated for ESP32-9042"
    },
    {
      id: "log-2",
      timestamp: "14:30:15",
      colorClass: "text-sky-700 font-semibold",
      message: "Role updated: Marcus Chen -> Caregiver"
    },
    {
      id: "log-3",
      timestamp: "14:28:44",
      colorClass: "text-amber-700 font-semibold",
      message: "MQTT Broker heartbeat re-established (18ms)"
    }
  ]
};

export const mockChatInitialMessages = [
  {
    id: "msg-1",
    sender: "assistant",
    time: "Just now",
    text: "Hello! I'm monitoring your SmartNeb telemetry. How can I help you understand your respiratory metrics or care routine today?"
  },
  {
    id: "msg-2",
    sender: "user",
    time: "12:32 PM",
    text: "Did I take my midday dose?"
  },
  {
    id: "msg-3",
    sender: "assistant",
    time: "12:33 PM",
    text: "Based on your IoT inhaler logs and pressure sensor telemetry, yes. Your midday dose of Albuterol (2 puffs) was successfully dispensed today at 12:15 PM.",
    verificationCard: {
      flowRate: "Flow Rate: 45 L/min",
      duration: "Inhalation duration: 4.2s",
      badge: "Verified Dose"
    }
  }
];

export const mockChatResponses = [
  {
    keywords: ["adherence", "streak", "compliance"],
    response: "Your 7-day adherence score is 92%. You have successfully completed 13 of your 14 scheduled dosing sessions this week with consistent flow rates."
  },
  {
    keywords: ["albuterol", "dosage", "medication", "dose"],
    response: "Albuterol is a short-acting beta-agonist (SABA) prescribed for quick relief of bronchospasm. Your standard prescribed dose is 2 puffs per session as needed."
  },
  {
    keywords: ["battery", "charge", "power"],
    response: "Your SmartNeb device battery level is currently at 84%, which is optimal for approximately 14 more operating hours and 4 more days of regular treatment sessions."
  },
  {
    keywords: ["chamber", "liquid", "saline", "refill"],
    response: "The chamber currently holds 2.1 mL (68% capacity). You have sufficient medication for the next scheduled session."
  },
  {
    keywords: ["spo2", "oxygen", "pulse", "heart"],
    response: "Your current resting SpO2 is 98% with a stable heart rate of 72 bpm. Both are within your healthy target baseline."
  },
  {
    keywords: ["sos", "emergency", "help", "attack"],
    response: "If you are experiencing severe shortness of breath or blue lips, please activate the SOS button immediately or call 911/emergency services directly."
  }
];
