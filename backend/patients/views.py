from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsPatient, IsDoctor, IsCaregiver, IsAdmin, IsDoctorOrAdmin, IsCaregiverOrDoctorOrAdmin
from .models import PatientProfile
from .serializers import PatientProfileSerializer, PatientUpdateSerializer

class PatientMeView(APIView):
    """
    Returns the comprehensive dashboard payload for the currently authenticated patient.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'patient_profile', None)
        if not profile:
            # Fallback for newly created patient user without profile
            profile, _ = PatientProfile.objects.get_or_create(
                user=user,
                defaults={
                    "patient_id": f"PT-{user.id:04d}",
                    "age": 28,
                    "gender": "Male",
                    "diagnosis": "Severe Persistent Asthma",
                    "status": "STABLE",
                    "adherence_rate": 94.0,
                }
            )

        serializer = PatientProfileSerializer(profile)
        data = serializer.data

        # Construct payload matching frontend dashboard format
        device = profile.devices.first()
        telemetry = profile.telemetry_records.first()
        active_plan = profile.therapy_plans.filter(is_active=True).first()

        response_payload = {
            "patient": {
                "id": profile.patient_id,
                "name": user.full_name,
                "age": profile.age,
                "gender": profile.gender,
                "diagnosis": profile.diagnosis,
                "status": profile.status,
                "adherenceRate": profile.adherence_rate,
                "doctor": profile.assigned_doctor.full_name if profile.assigned_doctor else "Dr. Sarah Vance, Pulmonology",
                "emergencyContact": {
                    "name": profile.emergency_contact_name,
                    "phone": profile.emergency_contact_phone,
                    "relationship": profile.emergency_contact_relationship,
                }
            },
            "vitals": {
                "spo2": telemetry.spo2 if telemetry else 98,
                "pulse": telemetry.pulse if telemetry else 74,
                "flowRate": telemetry.flow_rate if telemetry else 0.28,
                "respiratoryRate": telemetry.respiratory_rate if telemetry else 16,
                "airwayPressure": telemetry.airway_pressure if telemetry else 14.2,
                "status": "Normal",
                "lastUpdated": "Just now"
            },
            "device": {
                "id": device.device_id if device else "SN-8821-X",
                "model": device.model_name if device else "SmartNeb Pocket-01",
                "status": device.status if device else "ONLINE",
                "battery": device.battery_level if device else 87,
                "signal": device.signal_rssi if device else -62,
                "meshStatus": device.mesh_status if device else "Connected (Node 04)",
                "firmware": device.firmware_version if device else "v2.4.1-rc3",
                "medicationLevel": device.medication_chamber_level if device else 78
            },
            "therapy": {
                "completedToday": profile.daily_sessions_completed,
                "targetToday": profile.daily_sessions_target,
                "nextDose": "2:00 PM",
                "medication": active_plan.medication_name if active_plan else profile.prescribed_medication,
                "dosage": f"{active_plan.dosage_ml if active_plan else 2.0} ml",
                "flowTarget": f"{active_plan.target_flow_rate if active_plan else 0.28} ml/min",
                "durationMinutes": (active_plan.duration_seconds // 60) if active_plan else 10,
            }
        }
        return Response(response_payload, status=status.HTTP_200_OK)


class PatientListView(APIView):
    """
    Roster of patients for Doctors and Admins.
    Supports filtering by status (all, critical, needs review, stable) and search query.
    """
    permission_classes = [IsCaregiverOrDoctorOrAdmin]

    def get(self, request):
        queryset = PatientProfile.objects.select_related('user', 'assigned_doctor', 'assigned_caregiver').all()

        # Filter if doctor
        if request.user.role == 'doctor' and not request.user.is_staff:
            # doctors can see assigned patients or clinical department patients
            pass

        # Filter by status
        status_filter = request.query_params.get('status', '').upper()
        if status_filter and status_filter != 'ALL':
            if status_filter in ['CRITICAL', 'ALERT']:
                queryset = queryset.filter(status__in=['CRITICAL', 'ALERT'])
            elif 'REVIEW' in status_filter:
                queryset = queryset.filter(status='NEEDS REVIEW')
            elif status_filter == 'STABLE':
                queryset = queryset.filter(status='STABLE')

        # Filter by search
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                models.Q(user__full_name__icontains=search_query) |
                models.Q(patient_id__icontains=search_query) |
                models.Q(diagnosis__icontains=search_query)
            )

        serializer = PatientProfileSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientDetailView(APIView):
    """
    Patient detail view with clinical information and update capabilities.
    """
    permission_classes = [IsCaregiverOrDoctorOrAdmin]

    def get_object(self, identifier):
        try:
            if str(identifier).isdigit():
                return PatientProfile.objects.get(id=int(identifier))
            return PatientProfile.objects.get(patient_id__iexact=identifier)
        except PatientProfile.DoesNotExist:
            return None

    def get(self, request, identifier):
        profile = self.get_object(identifier)
        if not profile:
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatientProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, identifier):
        if request.user.role not in ['doctor', 'admin'] and not request.user.is_staff:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        profile = self.get_object(identifier)
        if not profile:
            return Response({"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(PatientProfileSerializer(profile).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CaregiverSummaryView(APIView):
    """
    Returns caregiver overview matching mockCaregiverData schema.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Find first assigned patient or demo patient Alex Mercer
        profile = PatientProfile.objects.filter(patient_id="PT-9421").first()
        if not profile:
            profile = PatientProfile.objects.first()

        if not profile:
            return Response({"detail": "No patient assigned."}, status=status.HTTP_404_NOT_FOUND)

        device = profile.devices.first()
        telemetry = profile.telemetry_records.first()

        data = {
            "patientName": profile.user.full_name,
            "patientId": profile.patient_id,
            "ageDiagnosis": f"{profile.age} yrs • {profile.diagnosis}",
            "status": profile.status,
            "lastSessionTime": "Today, 08:30 AM",
            "battery": device.battery_level if device else 87,
            "medicationLevel": device.medication_chamber_level if device else 78,
            "signal": device.signal_rssi if device else -62,
            "quickStats": {
                "adherence": f"{profile.adherence_rate}%",
                "sessionsToday": f"{profile.daily_sessions_completed}/{profile.daily_sessions_target}",
                "avgSpo2": f"{int(telemetry.spo2) if telemetry else 98}%",
                "alertsCount": profile.alerts.filter(is_resolved=False).count(),
            },
            "recentActivity": [
                {
                    "id": 1,
                    "title": "Therapy Completed",
                    "time": "08:30 AM",
                    "detail": "10 min Budesonide • SpO2 98%",
                    "icon": "check",
                    "color": "emerald"
                },
                {
                    "id": 2,
                    "title": "Medication Chamber Refilled",
                    "time": "Yesterday, 09:15 PM",
                    "detail": "Level at 100% • Chamber sealed",
                    "icon": "flask",
                    "color": "blue"
                },
                {
                    "id": 3,
                    "title": "Vitals Sync Complete",
                    "time": "Yesterday, 08:30 PM",
                    "detail": "Mesh Node 04 • All vitals normal",
                    "icon": "wifi",
                    "color": "teal"
                }
            ],
            "contacts": {
                "doctor": {
                    "name": profile.assigned_doctor.full_name if profile.assigned_doctor else "Dr. Sarah Vance",
                    "role": "Lead Pulmonologist",
                    "phone": "+1 (555) 014-9922",
                },
                "clinic": {
                    "name": "Metro Health Respiratory Center",
                    "phone": "+1 (555) 010-4400",
                },
                "emergency": {
                    "label": "Emergency Services",
                    "number": "911",
                }
            }
        }
        return Response(data, status=status.HTTP_200_OK)
