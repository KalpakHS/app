from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Device
from .serializers import DeviceSerializer
from accounts.permissions import IsAdmin, IsDoctorOrAdmin

class DeviceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Device.objects.all()

        if user.role == 'patient':
            # Patient can only view their own device
            profile = getattr(user, 'patient_profile', None)
            if profile:
                queryset = queryset.filter(assigned_patient=profile)
            else:
                queryset = Device.objects.none()
        
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status__iexact=status_param)

        serializer = DeviceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role not in ['admin', 'doctor'] and not request.user.is_staff:
            return Response({"detail": "Only admins or doctors can register devices."}, status=status.HTTP_403_FORBIDDEN)

        serializer = DeviceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeviceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, identifier):
        try:
            if str(identifier).isdigit():
                return Device.objects.get(id=int(identifier))
            return Device.objects.get(device_id__iexact=identifier)
        except Device.DoesNotExist:
            return None

    def get(self, request, identifier):
        device = self.get_object(identifier)
        if not device:
            return Response({"detail": "Device not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permission for patient
        if request.user.role == 'patient':
            profile = getattr(request.user, 'patient_profile', None)
            if not profile or device.assigned_patient != profile:
                return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = DeviceSerializer(device)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, identifier):
        if request.user.role not in ['admin', 'doctor'] and not request.user.is_staff:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        device = self.get_object(identifier)
        if not device:
            return Response({"detail": "Device not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeviceSerializer(device, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
