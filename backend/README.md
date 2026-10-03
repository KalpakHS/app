# SmartNeb Backend — Django REST Framework & JWT Authentication

High-reliability healthcare & IoT device fleet backend for the **SmartNeb** respiratory care system.

---

## Architecture & Technology Stack

- **Framework**: Django 5.1 & Django REST Framework
- **Authentication**: Simple JWT (JSON Web Tokens) with role claims
- **Database**: PostgreSQL (Production) / SQLite3 (Development fallback via `DATABASE_URL`)
- **CORS**: `django-cors-headers` configured for `localhost:3000` & `localhost:5173`
- **Security**: Role-Based Access Control (RBAC), protected admin endpoints, password hashing

---

## Directory Structure

```
backend/
├── config/                  # Core project settings and URL router
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/                # Custom User model, JWT authentication & RBAC
├── patients/                # Patient profiles, care plans & triage views
├── devices/                 # Device fleet registry & telemetry associations
├── telemetry/               # SpO2, heart rate, flow rate & pressure logs
├── therapy/                 # Therapy sessions lifecycle & prescriptions
├── alerts/                  # Clinical alerts & emergency SOS signal dispatch
├── audit/                   # Security audit logs & fleet admin operations
├── requirements.txt         # Python dependencies
├── .env.example             # Configuration template
├── manage.py                # Django CLI entrypoint
└── venv/                    # Virtual environment (Python 3.12)
```

---

## Setup & Running Locally

### 1. Activate Virtual Environment
```powershell
# Windows PowerShell
.\backend\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```
Default `.env` configuration uses SQLite for rapid local development:
```env
SECRET_KEY=django-insecure-smartneb-super-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL:
# DATABASE_URL=postgres://postgres:password@localhost:5432/smartneb_db
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Run Migrations & Seed Data
```bash
cd backend
python manage.py migrate
python manage.py seed_data
```

### 5. Run the Server
```bash
python manage.py runserver 127.0.0.1:8000
```

### 6. Run Automated Test Suite
```bash
python manage.py test accounts
```

---

## Pre-Seeded Demo Credentials

| Role | Email | Password | Assigned Portal |
|---|---|---|---|
| **Patient** | `alex.mercer@patient.smartneb.io` | `SmartNeb123!` | `/patient/dashboard` |
| **Doctor** | `dr.vance@clinic.smartneb.io` | `SmartNeb123!` | `/doctor` |
| **Caregiver** | `care.elena@family.smartneb.io` | `SmartNeb123!` | `/caregiver` |
| **Admin** | `admin@ops.smartneb.io` | `SmartNeb123!` | `/admin` |

---

## API Endpoints Reference

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` — Register new user (blocks unauthorized public admin creation)
- `POST /api/auth/login/` — Login with credentials, returns JWT tokens
- `POST /api/auth/refresh/` — Refresh access token
- `GET  /api/auth/me/` — Get authenticated user details & clinical relations
- `POST /api/auth/logout/` — Invalidate session

### Patients (`/api/patients/`)
- `GET  /api/patients/me/` — Comprehensive patient dashboard payload (vitals, device, therapy)
- `GET  /api/patients/` — Roster of patients (filterable by status: `all`, `critical`, `needs review`, `stable`)
- `GET  /api/patients/<id>/` — Patient details & care plan
- `PATCH /api/patients/<id>/` — Update diagnosis, bed/room, or target regimen (Doctor/Admin)
- `GET  /api/patients/caregiver-summary/` — Real-time telemetry & activity log for Caregiver view

### Telemetry (`/api/telemetry/`)
- `GET  /api/telemetry/latest/?patient_id=PT-9421` — Latest SpO2, pulse, and airway pressure
- `GET  /api/telemetry/history/?patient_id=PT-9421&limit=20` — Historical readings for charts
- `POST /api/telemetry/ingest/` — Ingest sensor telemetry stream

### Therapy (`/api/therapy/`)
- `GET  /api/therapy/plans/` — Active prescribed therapy plans
- `GET  /api/therapy/sessions/` — Historical session records
- `POST /api/therapy/sessions/start/` — Start active nebulization session
- `POST /api/therapy/sessions/<id>/pause/` — Pause session
- `POST /api/therapy/sessions/<id>/resume/` — Resume session
- `POST /api/therapy/sessions/<id>/complete/` — Complete session, record delivered dose
- `POST /api/therapy/sessions/<id>/cancel/` — Cancel session

### Devices & Fleet (`/api/devices/` & `/api/admin-ops/`)
- `GET  /api/devices/` — Fleet device list (battery, firmware, mesh status)
- `GET  /api/admin-ops/fleet-stats/` — Fleet metrics (active nodes, mesh health, degradation)
- `GET  /api/admin-ops/users/` — User directory management
- `POST /api/admin-ops/users/` — Provision user with specific role
- `GET  /api/admin-ops/audit-logs/` — Tamper-evident operational audit trail

### Alerts & Emergency SOS (`/api/alerts/`)
- `GET  /api/alerts/` — List active clinical alerts
- `POST /api/alerts/<id>/resolve/` — Resolve clinical alert
- `POST /api/alerts/sos/` — Dispatch high-priority emergency distress beacon
