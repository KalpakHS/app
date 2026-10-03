from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Telemetry
from .serializers import TelemetrySerializer
from patients.models import PatientProfile

class TelemetryLatestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        patient_id_param = request.query_params.get('patient_id')

        if patient_id_param and user.role in ['doctor', 'caregiver', 'admin']:
            patient = PatientProfile.objects.filter(patient_id=patient_id_param).first()
        else:
            patient = getattr(user, 'patient_profile', None)

        if not patient:
            # Fallback to demo default
            patient = PatientProfile.objects.first()

        latest = Telemetry.objects.filter(patient=patient).first()
        if latest:
            return Response(TelemetrySerializer(latest).data, status=status.HTTP_200_OK)
        
        # Return fallback default if no record yet
        return Response({
            "spo2": 98.0,
            "pulse": 74,
            "flow_rate": 0.28,
            "respiratory_rate": 16,
            "airway_pressure": 14.2,
            "battery": 87,
            "status": "Normal",
            "recorded_at": None,
        }, status=status.HTTP_200_OK)


class TelemetryHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        patient_id_param = request.query_params.get('patient_id')

        if patient_id_param and user.role in ['doctor', 'caregiver', 'admin']:
            patient = PatientProfile.objects.filter(patient_id=patient_id_param).first()
        else:
            patient = getattr(user, 'patient_profile', None)

        if not patient:
            patient = PatientProfile.objects.first()

        limit = min(int(request.query_params.get('limit', 20)), 100)
        queryset = Telemetry.objects.filter(patient=patient)[:limit]
        serializer = TelemetrySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TelemetryIngestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TelemetrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
