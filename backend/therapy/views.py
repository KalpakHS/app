from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import TherapyPlan, TherapySession
from .serializers import TherapyPlanSerializer, TherapySessionSerializer
from patients.models import PatientProfile
from devices.models import Device

class TherapyPlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'patient':
            profile = getattr(user, 'patient_profile', None)
            queryset = TherapyPlan.objects.filter(patient=profile, is_active=True)
        else:
            patient_id = request.query_params.get('patient_id')
            if patient_id:
                queryset = TherapyPlan.objects.filter(patient__patient_id=patient_id)
            else:
                queryset = TherapyPlan.objects.all()

        serializer = TherapyPlanSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role not in ['doctor', 'admin'] and not request.user.is_staff:
            return Response({"detail": "Only physicians or admins can prescribe therapy plans."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TherapyPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(prescribed_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TherapySessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'patient':
            profile = getattr(user, 'patient_profile', None)
            queryset = TherapySession.objects.filter(patient=profile)
        else:
            patient_id = request.query_params.get('patient_id')
            if patient_id:
                queryset = TherapySession.objects.filter(patient__patient_id=patient_id)
            else:
                queryset = TherapySession.objects.all()

        serializer = TherapySessionSerializer(queryset[:20], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StartSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        patient = getattr(user, 'patient_profile', None)
        if not patient:
            # Fallback for testing/care team
            patient = PatientProfile.objects.first()

        device = patient.devices.first() if patient else None
        plan = patient.therapy_plans.filter(is_active=True).first() if patient else None

        duration = int(request.data.get('total_duration_seconds', 600))
        session = TherapySession.objects.create(
            patient=patient,
            plan=plan,
            device=device,
            status=TherapySession.Status.RUNNING,
            total_duration_seconds=duration,
            elapsed_seconds=0,
            started_at=timezone.now(),
        )

        return Response(TherapySessionSerializer(session).data, status=status.HTTP_201_CREATED)


class PauseSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            session = TherapySession.objects.get(pk=pk)
        except TherapySession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.status = TherapySession.Status.PAUSED
        elapsed = request.data.get('elapsed_seconds')
        if elapsed is not None:
            session.elapsed_seconds = int(elapsed)
        session.save()
        return Response(TherapySessionSerializer(session).data, status=status.HTTP_200_OK)


class ResumeSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            session = TherapySession.objects.get(pk=pk)
        except TherapySession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.status = TherapySession.Status.RUNNING
        session.save()
        return Response(TherapySessionSerializer(session).data, status=status.HTTP_200_OK)


class CompleteSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            session = TherapySession.objects.get(pk=pk)
        except TherapySession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.status = TherapySession.Status.COMPLETED
        session.completed_at = timezone.now()
        
        elapsed = request.data.get('elapsed_seconds')
        if elapsed is not None:
            session.elapsed_seconds = int(elapsed)
        else:
            session.elapsed_seconds = session.total_duration_seconds

        delivered = request.data.get('delivered_dosage_ml')
        if delivered is not None:
            session.delivered_dosage_ml = float(delivered)
        else:
            session.delivered_dosage_ml = session.plan.dosage_ml if session.plan else 2.0

        session.notes = request.data.get('notes', 'Completed smoothly.')
        session.save()

        # Update patient completed counter
        if session.patient:
            session.patient.daily_sessions_completed = min(
                session.patient.daily_sessions_target,
                session.patient.daily_sessions_completed + 1
            )
            session.patient.save()

        return Response(TherapySessionSerializer(session).data, status=status.HTTP_200_OK)


class CancelSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            session = TherapySession.objects.get(pk=pk)
        except TherapySession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.status = TherapySession.Status.CANCELLED
        session.save()
        return Response(TherapySessionSerializer(session).data, status=status.HTTP_200_OK)
