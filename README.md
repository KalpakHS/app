# SmartNeb — Frontend Implementation from Stitch Export

SmartNeb is a mobile-first, connected respiratory therapy and IoT healthcare web application recreated faithfully from the Google Stitch UI/UX design export.

---

## 1. Project Structure

```text
stitch_smartneb_mobile_application_design/
├── index.html                           # App entry with Inter, Space Grotesk, DM Sans & Material Symbols
├── package.json                         # React 18, Vite 6, React Router 6, Tailwind CSS 3
├── postcss.config.js                    # PostCSS configuration
├── tailwind.config.js                   # Stitch design system tokens (colors, fonts, radii, spacing)
├── vite.config.js                       # Vite server and build config
├── src/
│   ├── main.jsx                         # Application root with BrowserRouter & Context Providers
│   ├── App.jsx                          # Main router with DeviceFrame testbench & all 8 routes
│   ├── index.css                        # Tailwind directives, safe area padding, animations
│   ├── context/
│   │   ├── AuthContext.jsx              # Role switcher & local authentication state
│   │   └── TherapyContext.jsx           # Working Active Therapy countdown timer, chamber drain & SOS
│   ├── data/
│   │   └── mockData.js                  # Centralized mock data layer for all entities
│   ├── components/
│   │   └── common/
│   │       ├── AppHeader.jsx            # Dynamic top navigation header matching Stitch specs
│   │       ├── BottomNavigation.jsx     # Role-aware mobile bottom tab bar (Patient, Doctor, Caregiver, Admin)
│   │       ├── CircularTherapyTimer.jsx # Large countdown SVG ring with dynamic progress calculation
│   │       ├── DeviceStatusCard.jsx     # Battery & chamber liquid levels with progress meters
│   │       ├── DeviceFrame.jsx          # QA viewport switcher (360px, 375px, 390px, 412px, 768px, Full)
│   │       ├── VitalCard.jsx            # Medical vitals card (SpO2, Heart Rate, Temperature)
│   │       ├── PatientCard.jsx          # Doctor roster card with triage badge & telemetry
│   │       ├── MetricCard.jsx           # Generic metric card with trend and progress indicators
│   │       ├── StatusBadge.jsx          # Status pill with pulsing indicators
│   │       ├── SOSButton.jsx            # 1-Tap SOS emergency button
│   │       ├── ChatMessage.jsx          # AI assistant chat bubble with telemetry verification card
│   │       ├── Modal.jsx                # Reusable dialog / modal with smooth backdrop
│   │       └── Toast.jsx                # Non-intrusive action feedback toasts
│   └── pages/
│       ├── HomePage.jsx                 # Route: / (Public landing page)
│       ├── AuthPage.jsx                 # Route: /auth (Segmented login/signup with role preset chips)
│       ├── PatientDashboardPage.jsx     # Route: /patient/dashboard (Vitals, today's therapy, SOS)
│       ├── ActiveTherapyPage.jsx        # Route: /patient/therapy (Live circular countdown timer & controls)
│       ├── AIAssistantPage.jsx          # Route: /patient/ai (Interactive local chat with telemetry context)
│       ├── DoctorTriagePage.jsx         # Route: /doctor (Clinical triage roster, filter chips, trends modal)
│       ├── CaregiverMonitorPage.jsx     # Route: /caregiver (Remote patient vitals, live waveform, SOS receipts)
│       └── AdminFleetPage.jsx           # Route: /admin (ESP32 device registry, fleet health, audit logs)
└── [Original Stitch Export Assets]
    ├── home_smartneb/
    ├── authentication_smartneb/
    ├── dashboard/
    ├── therapy/
    ├── ai_assistant_smartneb/
    ├── doctor_triage_roster_smartneb/
    ├── caregiver_monitor_smartneb/
    ├── admin_device_fleet_smartneb/
    └── smartneb_iot_system/
```

---

## 2. Routes Created

| Route | Screen Name | Role Target | Key Features |
|---|---|---|---|
| `/` | **Home / Landing** | Public | Brand presentation, Pocket-01 device card, features, 3-step guide, ecosystem overview, CTAs. |
| `/auth` | **Authentication** | All Roles | Sign In & Create Account tabs, role preset chips (Patient, Doctor, Caregiver, Admin), form validation, Google OAuth button. |
| `/patient/dashboard` | **Patient Dashboard** | Patient | SpO₂ (98%), Heart Rate (72 bpm), Temp (36.8°C), Battery (84%), Chamber (68%), Today's Therapy, 14-day streak, 1-Tap SOS. |
| `/patient/therapy` | **Active Therapy** | Patient | **Fully functional countdown timer**, Pause / Resume, Stop Session, dynamic chamber drain, session completed modal. |
| `/patient/ai` | **AI Assistant** | Patient | Local conversational assistant, quick prompt chips, grounded clinical responses, telemetry verification card. |
| `/doctor` | **Doctor Triage** | Doctor | Roster (42 patients), Critical (2) / Warning (5) / Stable (35) filter chips, interactive patient detail modal with 24h trends and regimen tuner. |
| `/caregiver` | **Caregiver Monitor** | Caregiver | John Doe active monitoring, live vitals, direct clinician contact dialog, animated flow rate waveform, SOS receipts. |
| `/admin` | **Admin / Device Fleet** | Admin | MQTT broker status & latency (18ms), fleet metrics, ESP32 registry, Add User modal, real-time audit log stream. |

---

## 3. Dedicated Mock Data Architecture

All mock entities are centralized in [`src/data/mockData.js`](file:///c:/Users/kalpa/Desktop/stitch_smartneb_mobile_application_design/src/data/mockData.js):

* `mockUserRoles`: Presets for Patient, Doctor, Caregiver, Admin.
* `mockPatient`: Alex Mercer, 28, Asthma Mild-Persistent, Pocket-01 hardware pairing.
* `mockVitals`: SpO₂ (98%), Heart Rate (72 bpm), Body Temp (36.8°C), Respiratory Rate (16 bpm).
* `mockDevice`: Battery (84%), Chamber (68% / 2.1 mL), Flow (0.45 ml/m), Mesh (97.4%).
* `mockTherapy`: Albuterol 2.5mg, 11:00 AM scheduled, target duration 272 seconds.
* `mockPatients`: John Doe (Critical), Sarah Jenkins (Warning), Robert Fox (Stable), Elena Rostova (Stable).
* `mockCaregiverData`: Active patient vitals, Dr. Sarah Jenkins contact, SVG waveform parameters, activity log, SOS receipts.
* `mockAdminData`: MQTT cluster status, fleet metrics, ESP32 device registry, user role directory, audit logs.
* `mockChatResponses`: Knowledge base for clinical AI query grounding.

---

## 4. How to Run the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running with Docker (Production Ready)

No manual node or python installation required:

**Option 1: Using Docker Compose (Recommended)**
```bash
docker compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost).

**Option 2: Using Docker CLI**
```bash
# Build the unified production image
docker build -t smartneb .

# Run the container
docker run -d -p 3000:3000 -p 80:80 --name smartneb-app smartneb
```
Access the application at [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost).

### Running on Mobile with Expo Go (iOS & Android)

To experience SmartNeb on your physical mobile device with full touch gestures, safe area handling, and native chrome:

1. **Install Expo Go**:
   - Download **Expo Go** from Google Play (Android) or App Store (iOS).
2. **Connect to Same Wi-Fi**:
   - Ensure your phone and development machine are connected to the same local Wi-Fi network.
3. **Start the Frontend**:
   ```bash
   npm run dev
   ```
4. **Start Expo Go Bundler**:
   ```bash
   npm run mobile
   ```
5. **Scan QR Code**:
   - **Android**: Open the **Expo Go** app and select **"Scan QR code"**.
   - **iOS**: Open the stock **Camera** app, scan the terminal QR code, and tap to open in **Expo Go**.
6. The mobile app automatically connects to `http://<YOUR_LAN_IP>:3000?native=true` without desktop frames or borders.

### Production Build (Local)
```bash
npm run build
```

### Preview Production Build (Local)
```bash
npm run preview
```


---

## 5. Viewport & Testbench Switcher

The top navigation bar includes an embedded **SmartNeb Testbench**:
* Switch instantly between viewports: **360px**, **375px**, **390px (Standard)**, **412px**, **768px**, and **100% Fluid**.
* Quick 1-tap route buttons to jump between any of the 8 screens while automatically syncing the appropriate role context.
* Expand or collapse the testbench anytime using the top chevron button.

---

## 6. Frontend Scope & Future Hardware/Backend Roadmap

As specified in the scope requirements:
* **Current Phase**: Pure frontend application with realistic mock data, stateful timer, local chat, role routing, and mobile responsiveness.
* **Future Phase (Not yet connected)**:
  * ESP32 Bluetooth Low Energy (BLE) pairing
  * Live MQTT broker publish/subscribe telemetry
  * Firebase Authentication and Cloud Firestore
  * Real AI LLM API endpoint for assistant
  * Real emergency SOS dispatch telematics
