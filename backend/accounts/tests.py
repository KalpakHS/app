from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from patients.models import PatientProfile

class AuthAndRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.patient_user = User.objects.create_user(
            email="patient.test@smartneb.io",
            password="Password123!",
            full_name="Test Patient",
            role=User.Role.PATIENT
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            patient_id="PT-TEST",
            age=30,
            diagnosis="Mild Asthma"
        )
        self.doctor_user = User.objects.create_user(
            email="doctor.test@smartneb.io",
            password="Password123!",
            full_name="Dr. Test",
            role=User.Role.DOCTOR
        )
        self.admin_user = User.objects.create_user(
            email="admin.test@smartneb.io",
            password="Password123!",
            full_name="Admin Test",
            role=User.Role.ADMIN,
            is_staff=True
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            "email": "patient.test@smartneb.io",
            "password": "Password123!"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["role"], "patient")

    def test_registration_validation(self):
        # Mismatched passwords
        res_mismatch = self.client.post('/api/auth/register/', {
            "full_name": "New User",
            "email": "new@user.com",
            "password": "Password123!",
            "confirm_password": "WrongPassword!",
            "role": "patient"
        })
        self.assertEqual(res_mismatch.status_code, status.HTTP_400_BAD_REQUEST)

        # Disallow public admin registration
        res_admin = self.client.post('/api/auth/register/', {
            "full_name": "Bad Admin",
            "email": "badadmin@user.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin"
        })
        self.assertEqual(res_admin.status_code, status.HTTP_400_BAD_REQUEST)

        # Successful registration
        res_ok = self.client.post('/api/auth/register/', {
            "full_name": "Good Patient",
            "email": "good@patient.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "patient"
        })
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res_ok.data)

    def test_patient_dashboard_api(self):
        self.client.force_authenticate(user=self.patient_user)
        res = self.client.get('/api/patients/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["patient"]["name"], "Test Patient")
        self.assertIn("vitals", res.data)
        self.assertIn("device", res.data)
        self.assertIn("therapy", res.data)

    def test_doctor_access_and_triage(self):
        self.client.force_authenticate(user=self.doctor_user)
        res = self.client.get('/api/patients/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data) >= 1)

    def test_therapy_lifecycle(self):
        self.client.force_authenticate(user=self.patient_user)
        # 1. Start therapy
        start_res = self.client.post('/api/therapy/sessions/start/', {
            "total_duration_seconds": 300
        })
        self.assertEqual(start_res.status_code, status.HTTP_201_CREATED)
        session_id = start_res.data["id"]
        self.assertEqual(start_res.data["status"], "RUNNING")

        # 2. Pause therapy
        pause_res = self.client.post(f'/api/therapy/sessions/{session_id}/pause/', {
            "elapsed_seconds": 60
        })
        self.assertEqual(pause_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pause_res.data["status"], "PAUSED")

        # 3. Resume therapy
        resume_res = self.client.post(f'/api/therapy/sessions/{session_id}/resume/')
        self.assertEqual(resume_res.status_code, status.HTTP_200_OK)
        self.assertEqual(resume_res.data["status"], "RUNNING")

        # 4. Complete therapy
        complete_res = self.client.post(f'/api/therapy/sessions/{session_id}/complete/', {
            "elapsed_seconds": 300,
            "delivered_dosage_ml": 2.5
        })
        self.assertEqual(complete_res.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_res.data["status"], "COMPLETED")

    def test_sos_emergency_trigger(self):
        self.client.force_authenticate(user=self.patient_user)
        res = self.client.post('/api/alerts/sos/', {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "location_address": "Test Emergency Location"
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["sos"]["status"], "ACTIVE")

    def test_admin_fleet_and_users(self):
        # Patient cannot access admin ops
        self.client.force_authenticate(user=self.patient_user)
        res_forbidden = self.client.get('/api/admin-ops/users/')
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access admin ops
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get('/api/admin-ops/users/')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)

        fleet_res = self.client.get('/api/admin-ops/fleet-stats/')
        self.assertEqual(fleet_res.status_code, status.HTTP_200_OK)
        self.assertIn("totalDevices", fleet_res.data)
