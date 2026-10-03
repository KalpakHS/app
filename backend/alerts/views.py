from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Alert, SOSEvent
from .serializers import AlertSerializer, SOSEventSerializer
from patients.models import PatientProfile
from audit.models import AuditLog

class AlertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Alert.objects.all()

        if user.role == 'patient':
            profile = getattr(user, 'patient_profile', None)
            if profile:
                queryset = queryset.filter(patient=profile)
            else:
                queryset = Alert.objects.none()
        else:
            patient_id = request.query_params.get('patient_id')
            if patient_id:
                queryset = queryset.filter(patient__patient_id=patient_id)

        severity = request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity__iexact=severity)

        unresolved_only = request.query_params.get('unresolved', 'false').lower() in ('true', '1')
        if unresolved_only:
            queryset = queryset.filter(is_resolved=False)

        serializer = AlertSerializer(queryset[:50], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AlertSerializer(data=request.data)
        if serializer.is_valid():
            alert = serializer.save()
            return Response(AlertSerializer(alert).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlertResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk)
        except Alert.DoesNotExist:
            return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)

        alert.is_resolved = True
        alert.resolved_at = timezone.now()
        alert.save()
        return Response(AlertSerializer(alert).data, status=status.HTTP_200_OK)


class SOSEventView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = SOSEvent.objects.all()
        serializer = SOSEventSerializer(queryset[:20], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        patient = getattr(user, 'patient_profile', None)
        if not patient:
            patient = PatientProfile.objects.first()

        lat = float(request.data.get('latitude', 37.7749))
        lng = float(request.data.get('longitude', -122.4194))
        address = request.data.get('location_address', '104 Health Ave, San Francisco, CA')
        notes = request.data.get('notes', 'Manual SOS triggered from mobile application.')

        sos = SOSEvent.objects.create(
            patient=patient,
            triggered_by=user,
            latitude=lat,
            longitude=lng,
            location_address=address,
            status=SOSEvent.Status.ACTIVE,
            notes=notes,
        )

        # Also create a critical alert
        Alert.objects.create(
            patient=patient,
            severity=Alert.Severity.CRITICAL,
            title='EMERGENCY SOS TRIGGERED',
            message=f"SOS distress signal activated by {user.full_name} at {address}.",
            is_resolved=False
        )

        # Audit log entry
        AuditLog.objects.create(
            user=user,
            action='SOS_TRIGGERED',
            entity_type='SOSEvent',
            entity_id=str(sos.id),
            details=f"Distress alert broadcasted. GPS: ({lat}, {lng}). Address: {address}",
            status='CRITICAL'
        )

        return Response({
            "message": "Emergency SOS triggered successfully. Care team notified.",
            "sos": SOSEventSerializer(sos).data,
        }, status=status.HTTP_201_CREATED)
