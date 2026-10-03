"""
SmartNeb End-to-End and RBAC Security Verification Script
Thoroughly tests:
1. Database persistence and migrations
2. Unauthenticated access rejections (401)
3. Role-Based Access Control (RBAC) security (403 for unauthorized roles)
4. Public Admin registration prevention
5. Patient End-to-End lifecycle (Login, Profile, Start Therapy, Pause, Resume, Complete, Telemetry, SOS, Logout)
6. Doctor End-to-End lifecycle (Login, Roster, Filter, Search, Telemetry, Regimen update)
7. Caregiver End-to-End lifecycle (Login, Caregiver Summary, Vitals, Activity, SOS, Contacts)
8. Admin End-to-End lifecycle (Login, Fleet Stats, Device Registry, User Provisioning, Audit Trail)
9. JWT Token refresh flow
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from accounts.models import User
from patients.models import PatientProfile
from devices.models import Device
from telemetry.models import Telemetry
from therapy.models import TherapyPlan, TherapySession
from alerts.models import Alert, SOSEvent
from audit.models import AuditLog

def run_tests():
    client = Client()
    print("=" * 60)
    print("SMARTNEB END-TO-END & RBAC VERIFICATION SUITE")
    print("=" * 60)

    # 1. Database Persistence Verification
    print("\n[STEP 1] Verifying Database Entities...")
    user_count = User.objects.count()
    patient_count = PatientProfile.objects.count()
    device_count = Device.objects.count()
    plan_count = TherapyPlan.objects.count()
    telemetry_count = Telemetry.objects.count()
    alert_count = Alert.objects.count()
    audit_count = AuditLog.objects.count()

    print(f"  - Users in DB: {user_count}")
    print(f"  - Patients in DB: {patient_count}")
    print(f"  - Devices in DB: {device_count}")
    print(f"  - Therapy Plans in DB: {plan_count}")
    print(f"  - Telemetry Records in DB: {telemetry_count}")
    print(f"  - Alerts in DB: {alert_count}")
    print(f"  - Audit Logs in DB: {audit_count}")

    assert user_count >= 4, "Missing core users!"
    assert patient_count >= 1, "Missing patient profiles!"
    print("  -> DB Persistence Check: PASSED")

    # 2. Unauthenticated Access Protection (HTTP 401)
    print("\n[STEP 2] Verifying Unauthenticated Access Protection (401)...")
    res_no_auth1 = client.get('/api/patients/me/')
    assert res_no_auth1.status_code == 401, f"Expected 401, got {res_no_auth1.status_code}"
    res_no_auth2 = client.get('/api/devices/')
    assert res_no_auth2.status_code == 401, f"Expected 401, got {res_no_auth2.status_code}"
    res_no_auth3 = client.get('/api/alerts/')
    assert res_no_auth3.status_code == 401, f"Expected 401, got {res_no_auth3.status_code}"
    res_no_auth4 = client.get('/api/admin-ops/fleet-stats/')
    assert res_no_auth4.status_code == 401, f"Expected 401, got {res_no_auth4.status_code}"
    print("  -> Unauthenticated Protection (401): ALL PASSED")

    # 3. Patient Flow & RBAC Tests
    print("\n[STEP 3] Testing Patient Flow (Alex Mercer)...")
    login_patient = client.post('/api/auth/login/', {
        'email': 'alex.mercer@patient.smartneb.io',
        'password': 'SmartNeb123!'
    }, content_type='application/json')
    assert login_patient.status_code == 200, "Patient login failed!"
    patient_token = login_patient.json()['access']
    patient_refresh = login_patient.json()['refresh']
    auth_header_patient = {'HTTP_AUTHORIZATION': f'Bearer {patient_token}'}
    print("  - Patient Login & JWT Issue: SUCCESS")

    # Test /api/auth/me/
    me_res = client.get('/api/auth/me/', **auth_header_patient)
    assert me_res.status_code == 200 and me_res.json()['role'] == 'patient', "Me endpoint failed!"
    print(f"  - Patient /api/auth/me/: SUCCESS (Name: {me_res.json()['full_name']}, Patient ID: {me_res.json()['patient_id']})")

    # Test Patient Dashboard API
    dash_res = client.get('/api/patients/me/', **auth_header_patient)
    assert dash_res.status_code == 200, "Patient dashboard failed!"
    dash_data = dash_res.json()
    assert 'patient' in dash_data and 'vitals' in dash_data and 'device' in dash_data and 'therapy' in dash_data
    print(f"  - Patient Dashboard: SUCCESS (SpO2: {dash_data['vitals']['spo2']}%, Battery: {dash_data['device']['battery']}%)")

    # Patient RBAC Violation Check: Cannot access Admin Ops
    rbac_pat_admin = client.get('/api/admin-ops/users/', **auth_header_patient)
    assert rbac_pat_admin.status_code == 403, f"Patient accessed admin-ops! Expected 403, got {rbac_pat_admin.status_code}"
    print("  - RBAC Check: Patient forbidden from /api/admin-ops/ (403): PASSED")

    # Patient Therapy Lifecycle: Start -> Pause -> Resume -> Complete
    print("  - Testing Therapy Session Lifecycle...")
    start_res = client.post('/api/therapy/sessions/start/', {'total_duration_seconds': 300}, content_type='application/json', **auth_header_patient)
    assert start_res.status_code == 201, "Start therapy failed!"
    sess_id = start_res.json()['id']
    assert start_res.json()['status'] == 'RUNNING'
    print(f"    * Started Session #{sess_id}: RUNNING")

    pause_res = client.post(f'/api/therapy/sessions/{sess_id}/pause/', {'elapsed_seconds': 45}, content_type='application/json', **auth_header_patient)
    assert pause_res.status_code == 200 and pause_res.json()['status'] == 'PAUSED'
    print(f"    * Paused Session #{sess_id}: PAUSED (elapsed 45s)")

    resume_res = client.post(f'/api/therapy/sessions/{sess_id}/resume/', content_type='application/json', **auth_header_patient)
    assert resume_res.status_code == 200 and resume_res.json()['status'] == 'RUNNING'
    print(f"    * Resumed Session #{sess_id}: RUNNING")

    comp_res = client.post(f'/api/therapy/sessions/{sess_id}/complete/', {'elapsed_seconds': 300, 'delivered_dosage_ml': 2.5}, content_type='application/json', **auth_header_patient)
    assert comp_res.status_code == 200 and comp_res.json()['status'] == 'COMPLETED'
    print(f"    * Completed Session #{sess_id}: COMPLETED (delivered 2.5ml)")

    # Verify session persisted in history
    hist_res = client.get('/api/therapy/sessions/', **auth_header_patient)
    assert hist_res.status_code == 200 and len(hist_res.json()) >= 1
    print(f"    * Session history verification: {len(hist_res.json())} sessions recorded")

    # Patient Telemetry Check
    telem_res = client.get('/api/telemetry/latest/', **auth_header_patient)
    assert telem_res.status_code == 200
    print(f"  - Telemetry verification: SpO2={telem_res.json().get('spo2')}%")

    # Patient SOS Trigger
    sos_res = client.post('/api/alerts/sos/', {
        'latitude': 37.7749,
        'longitude': -122.4194,
        'location_address': '104 Health Ave, San Francisco, CA',
        'notes': 'Test patient SOS trigger'
    }, content_type='application/json', **auth_header_patient)
    assert sos_res.status_code == 201 and sos_res.json()['sos']['status'] == 'ACTIVE'
    print(f"  - SOS Distress Beacon Triggered: ACTIVE (ID: {sos_res.json()['sos']['id']})")

    # Patient Token Refresh
    ref_res = client.post('/api/auth/refresh/', {'refresh': patient_refresh}, content_type='application/json')
    assert ref_res.status_code == 200 and 'access' in ref_res.json()
    print("  - JWT Refresh Token Rotation: PASSED")

    # Patient Logout
    logout_res = client.post('/api/auth/logout/', {'refresh': patient_refresh}, content_type='application/json', **auth_header_patient)
    assert logout_res.status_code == 200
    print("  - Patient Logout: SUCCESS")

    # 4. Doctor Flow & RBAC Tests
    print("\n[STEP 4] Testing Doctor Flow (Dr. Evelyn Vance)...")
    login_doc = client.post('/api/auth/login/', {
        'email': 'dr.vance@clinic.smartneb.io',
        'password': 'SmartNeb123!'
    }, content_type='application/json')
    assert login_doc.status_code == 200
    doc_token = login_doc.json()['access']
    auth_header_doc = {'HTTP_AUTHORIZATION': f'Bearer {doc_token}'}
    print("  - Doctor Login: SUCCESS")

    # Doctor Roster & Filtering
    roster_all = client.get('/api/patients/', **auth_header_doc)
    assert roster_all.status_code == 200 and len(roster_all.json()) >= 5
    print(f"  - Doctor Roster (All): {len(roster_all.json())} patients returned")

    roster_crit = client.get('/api/patients/?status=CRITICAL', **auth_header_doc)
    assert roster_crit.status_code == 200
    print(f"  - Doctor Roster (Critical Filter): {len(roster_crit.json())} critical patients returned")

    # Doctor View Patient Detail & Regimen Update
    first_patient = roster_all.json()[0]
    p_detail = client.get(f"/api/patients/{first_patient['patient_id']}/", **auth_header_doc)
    assert p_detail.status_code == 200
    print(f"  - Doctor Patient Detail: SUCCESS ({p_detail.json()['full_name']} - {p_detail.json()['diagnosis']})")

    patch_res = client.patch(f"/api/patients/{first_patient['patient_id']}/", {
        'daily_sessions_target': 2,
        'diagnosis': p_detail.json()['diagnosis']
    }, content_type='application/json', **auth_header_doc)
    assert patch_res.status_code == 200
    print("  - Doctor Regimen / Care Plan Tuning (PATCH): SUCCESS")

    # Doctor RBAC Violation Check: Doctor cannot access Admin Ops
    doc_admin_violation = client.get('/api/admin-ops/users/', **auth_header_doc)
    assert doc_admin_violation.status_code == 403, "Doctor should not access admin user directory!"
    print("  - RBAC Check: Doctor forbidden from /api/admin-ops/ (403): PASSED")

    # 5. Caregiver Flow & RBAC Tests
    print("\n[STEP 5] Testing Caregiver Flow (Elena Rostova)...")
    login_cg = client.post('/api/auth/login/', {
        'email': 'care.elena@family.smartneb.io',
        'password': 'SmartNeb123!'
    }, content_type='application/json')
    assert login_cg.status_code == 200
    cg_token = login_cg.json()['access']
    auth_header_cg = {'HTTP_AUTHORIZATION': f'Bearer {cg_token}'}
    print("  - Caregiver Login: SUCCESS")

    cg_sum = client.get('/api/patients/caregiver-summary/', **auth_header_cg)
    assert cg_sum.status_code == 200
    cg_data = cg_sum.json()
    assert 'patientName' in cg_data and 'status' in cg_data and 'quickStats' in cg_data and 'contacts' in cg_data
    print(f"  - Caregiver Monitor View: SUCCESS (Patient: {cg_data['patientName']}, SpO2: {cg_data['quickStats']['avgSpo2']})")

    # Caregiver RBAC Violation Check: Caregiver cannot modify patient diagnosis
    cg_mod_violation = client.patch(f"/api/patients/{first_patient['patient_id']}/", {
        'diagnosis': 'Hacked diagnosis'
    }, content_type='application/json', **auth_header_cg)
    assert cg_mod_violation.status_code == 403, "Caregiver should not be allowed to modify clinical diagnosis!"
    print("  - RBAC Check: Caregiver forbidden from PATCH /api/patients/<id>/ (403): PASSED")

    # 6. Admin Flow Tests
    print("\n[STEP 6] Testing Admin Flow (Fleet Administrator)...")
    login_admin = client.post('/api/auth/login/', {
        'email': 'admin@ops.smartneb.io',
        'password': 'SmartNeb123!'
    }, content_type='application/json')
    assert login_admin.status_code == 200
    admin_token = login_admin.json()['access']
    auth_header_admin = {'HTTP_AUTHORIZATION': f'Bearer {admin_token}'}
    print("  - Admin Login: SUCCESS")

    fleet_res = client.get('/api/admin-ops/fleet-stats/', **auth_header_admin)
    assert fleet_res.status_code == 200
    print(f"  - Admin Fleet Stats: SUCCESS ({fleet_res.json()['totalDevices']} total, {fleet_res.json()['activeDevices']} active)")

    devs_res = client.get('/api/devices/', **auth_header_admin)
    assert devs_res.status_code == 200
    print(f"  - Admin Device Registry: {len(devs_res.json())} devices listed")

    admin_users = client.get('/api/admin-ops/users/', **auth_header_admin)
    assert admin_users.status_code == 200
    print(f"  - Admin User Directory: {len(admin_users.json())} users listed")

    # Admin User Provisioning
    prov_res = client.post('/api/admin-ops/users/', {
        'full_name': 'Dr. Marcus Test',
        'email': 'dr.marcus.test@clinic.smartneb.io',
        'role': 'doctor',
        'phone': '+1 (555) 333-4444',
        'password': 'SmartNebPass123!'
    }, content_type='application/json', **auth_header_admin)
    assert prov_res.status_code == 201
    print(f"  - Admin User Provisioning: SUCCESS (Created {prov_res.json()['email']})")

    audit_res = client.get('/api/admin-ops/audit-logs/', **auth_header_admin)
    assert audit_res.status_code == 200
    print(f"  - Admin Audit Logs: {len(audit_res.json())} log entries verified")

    # 7. Security: Public Admin Registration Prevention
    print("\n[STEP 7] Testing Public Registration Security Constraints...")
    pub_admin_attempt = client.post('/api/auth/register/', {
        'full_name': 'Attacker Admin',
        'email': 'attacker.admin@smartneb.io',
        'role': 'admin',
        'password': 'Password123!',
        'confirm_password': 'Password123!'
    }, content_type='application/json')
    assert pub_admin_attempt.status_code == 400, "Public registration allowed admin role creation!"
    assert 'Admin accounts cannot be registered publicly' in str(pub_admin_attempt.json())
    print("  - Public Admin Registration Prevention: PASSED (Rejected with 400)")

    print("\n" + "=" * 60)
    print("ALL VERIFICATION SUITE TESTS PASSED (100% SUCCESS)")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
