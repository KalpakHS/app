from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from patients.models import PatientProfile
from devices.models import Device
from telemetry.models import Telemetry
from therapy.models import TherapyPlan, TherapySession
from alerts.models import Alert, SOSEvent
from audit.models import AuditLog

class Command(BaseCommand):
    help = 'Seeds database with realistic initial users, patients, devices, telemetry, and care plans.'

    def handle(self, *args, **options):
        self.stdout.write("Starting SmartNeb database seeding...")

        # 1. Seed Core Users
        password = "SmartNeb123!"

        # Patient: Alex Mercer
        alex, _ = User.objects.get_or_create(
            email="alex.mercer@patient.smartneb.io",
            defaults={
                "full_name": "Alex Mercer",
                "role": User.Role.PATIENT,
                "phone": "+1 (555) 019-2831",
                "is_active": True,
            }
        )
        alex.set_password(password)
        alex.save()

        # Doctor: Dr. Evelyn Vance
        dr_vance, _ = User.objects.get_or_create(
            email="dr.vance@clinic.smartneb.io",
            defaults={
                "full_name": "Dr. Evelyn Vance",
                "role": User.Role.DOCTOR,
                "phone": "+1 (555) 014-9922",
                "is_active": True,
            }
        )
        dr_vance.set_password(password)
        dr_vance.save()

        # Caregiver: Elena Rostova
        elena, _ = User.objects.get_or_create(
            email="care.elena@family.smartneb.io",
            defaults={
                "full_name": "Elena Rostova",
                "role": User.Role.CAREGIVER,
                "phone": "+1 (555) 019-2831",
                "is_active": True,
            }
        )
        elena.set_password(password)
        elena.save()

        # Admin: Fleet Administrator
        admin_user, _ = User.objects.get_or_create(
            email="admin@ops.smartneb.io",
            defaults={
                "full_name": "Fleet Administrator",
                "role": User.Role.ADMIN,
                "phone": "+1 (555) 999-0000",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            }
        )
        admin_user.set_password(password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        self.stdout.write("Core users verified: Alex Mercer, Dr. Vance, Elena Rostova, Admin.")

        # Additional Patients from Mock Data
        roster_patients = [
            ("john.doe@patient.smartneb.io", "John Doe", "P-101", 64, "Male", "Severe COPD Exacerbation", "CRITICAL", 54.0, 89.0, 122, "Bed 104-B"),
            ("sarah.jenkins@patient.smartneb.io", "Sarah Jenkins", "P-102", 51, "Female", "Asthma Tier 2 Patient", "NEEDS REVIEW", 78.0, 93.0, 98, "Bed 202-A"),
            ("robert.fox@patient.smartneb.io", "Robert Fox", "P-103", 45, "Male", "Mild Intermittent Asthma", "STABLE", 96.0, 98.0, 72, "Bed 301-C"),
            ("arthur.pendelton@patient.smartneb.io", "Arthur Pendelton", "P-105", 71, "Male", "Acute Bronchospasm", "CRITICAL", 48.0, 87.0, 119, "ICU Room 03"),
            ("marcus.thorne@patient.smartneb.io", "Marcus Thorne", "P-106", 58, "Male", "Late Evening Dyspnea", "NEEDS REVIEW", 71.0, 92.0, 102, "Bed 112-D"),
        ]

        # 2. Patient Profile for Alex Mercer
        alex_profile, _ = PatientProfile.objects.update_or_create(
            user=alex,
            defaults={
                "patient_id": "PT-9421",
                "age": 28,
                "gender": "Male",
                "diagnosis": "Asthma Mild-Persistent",
                "status": PatientProfile.Status.STABLE,
                "adherence_rate": 94.0,
                "room_bed": "Home Care - Rm 12",
                "prescribed_medication": "Albuterol 2.5mg / Budesonide 0.5mg",
                "daily_sessions_target": 2,
                "daily_sessions_completed": 1,
                "assigned_doctor": dr_vance,
                "assigned_caregiver": elena,
                "emergency_contact_name": "Elena Rostova",
                "emergency_contact_phone": "+1 (555) 019-2831",
                "emergency_contact_relationship": "Spouse / Primary Caregiver",
            }
        )

        # Create Roster Patients
        for email, name, pid, age, gender, diag, stat, adh, s_spo2, s_pulse, bed in roster_patients:
            u, _ = User.objects.get_or_create(
                email=email,
                defaults={"full_name": name, "role": User.Role.PATIENT, "phone": "+1 (555) 000-1111"}
            )
            u.set_password(password)
            u.save()

            p_prof, _ = PatientProfile.objects.update_or_create(
                user=u,
                defaults={
                    "patient_id": pid,
                    "age": age,
                    "gender": gender,
                    "diagnosis": diag,
                    "status": stat,
                    "adherence_rate": adh,
                    "room_bed": bed,
                    "prescribed_medication": "Budesonide Inhalation Suspension",
                    "daily_sessions_target": 2,
                    "daily_sessions_completed": 1,
                    "assigned_doctor": dr_vance,
                    "assigned_caregiver": elena,
                }
            )

            # Telemetry for roster patient
            Telemetry.objects.get_or_create(
                patient=p_prof,
                defaults={
                    "spo2": s_spo2,
                    "pulse": s_pulse,
                    "flow_rate": 0.28,
                    "respiratory_rate": 16,
                    "airway_pressure": 14.2,
                    "battery": 84,
                }
            )

        # 3. Create Devices
        d1, _ = Device.objects.update_or_create(
            device_id="Neb-ESP32-9042",
            defaults={
                "model_name": "SmartNeb Pocket-01 Pro v2",
                "assigned_patient": alex_profile,
                "status": Device.Status.ONLINE,
                "battery_level": 84,
                "signal_rssi": -62,
                "mesh_status": "Connected (Node 04)",
                "firmware_version": "v2.4.1",
                "hardware_version": "v1.2",
                "medication_chamber_level": 68,
            }
        )

        Device.objects.update_or_create(
            device_id="SN-8821-X",
            defaults={
                "model_name": "SmartNeb Pocket-01",
                "assigned_patient": alex_profile,
                "status": Device.Status.ONLINE,
                "battery_level": 87,
                "signal_rssi": -60,
                "mesh_status": "Connected (Node 01)",
                "firmware_version": "v2.4.1-rc3",
                "medication_chamber_level": 78,
            }
        )

        john_profile = PatientProfile.objects.filter(patient_id="P-101").first()
        if john_profile:
            Device.objects.update_or_create(
                device_id="Neb-ESP32-1184",
                defaults={
                    "model_name": "SmartNeb Pocket-01",
                    "assigned_patient": john_profile,
                    "status": Device.Status.ONLINE,
                    "battery_level": 24,
                    "signal_rssi": -78,
                    "mesh_status": "Low Signal (Node 09)",
                    "firmware_version": "v2.3.9",
                    "medication_chamber_level": 32,
                }
            )

        Device.objects.update_or_create(
            device_id="Neb-ESP32-5521",
            defaults={
                "model_name": "SmartNeb Pocket-01",
                "status": Device.Status.OFFLINE,
                "battery_level": 0,
                "signal_rssi": -99,
                "mesh_status": "Disconnected",
                "firmware_version": "v2.4.0",
                "medication_chamber_level": 0,
            }
        )

        # 4. Telemetry for Alex Mercer
        now = timezone.now()
        for i in range(10):
            Telemetry.objects.get_or_create(
                patient=alex_profile,
                device=d1,
                spo2=98.0 + (i % 2) * 0.5,
                pulse=72 + (i % 3),
                flow_rate=0.45,
                respiratory_rate=16,
                airway_pressure=14.2,
                battery=84,
            )

        # 5. Therapy Plan & Sessions
        plan, _ = TherapyPlan.objects.update_or_create(
            patient=alex_profile,
            medication_name="Albuterol 2.5mg / Budesonide 0.5mg",
            defaults={
                "prescribed_by": dr_vance,
                "dosage_ml": 2.5,
                "target_flow_rate": 0.45,
                "duration_seconds": 300,
                "daily_frequency": 2,
                "instructions": "Inhale slowly and deeply through the mouthpiece.",
                "is_active": True,
            }
        )

        TherapySession.objects.get_or_create(
            patient=alex_profile,
            plan=plan,
            device=d1,
            status=TherapySession.Status.COMPLETED,
            defaults={
                "total_duration_seconds": 300,
                "elapsed_seconds": 300,
                "delivered_dosage_ml": 2.5,
                "average_flow_rate": 0.45,
                "average_spo2": 98.0,
                "average_pulse": 72,
                "notes": "Morning dose completed without bronchospasm.",
                "started_at": now - timedelta(hours=3),
                "completed_at": now - timedelta(hours=3) + timedelta(minutes=5),
            }
        )

        # 6. Alerts
        Alert.objects.get_or_create(
            patient=alex_profile,
            title="Medication Refill Reminder",
            defaults={
                "severity": Alert.Severity.INFO,
                "message": "Chamber level at 68%. Prepare next ampule before evening dose.",
                "is_resolved": False,
            }
        )

        if john_profile:
            Alert.objects.get_or_create(
                patient=john_profile,
                title="Low SpO2 & Elevated Pulse Alert",
                defaults={
                    "severity": Alert.Severity.CRITICAL,
                    "message": "SpO2 dropped below 90% (Reading: 89%). Immediate oxygen titration required.",
                    "is_resolved": False,
                }
            )

        # 7. Audit Logs
        AuditLog.objects.get_or_create(
            action="FLEET_INITIALIZED",
            defaults={
                "user": admin_user,
                "entity_type": "System",
                "entity_id": "SYS-INIT",
                "details": "SmartNeb IoT and database clusters initialized.",
                "status": "SUCCESS",
            }
        )

        self.stdout.write(self.style.SUCCESS("SmartNeb database seeded successfully!"))
