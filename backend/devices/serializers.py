from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='assigned_patient.patient_id', read_only=True, default=None)
    patient_name = serializers.CharField(source='assigned_patient.user.full_name', read_only=True, default=None)

    class Meta:
        model = Device
        fields = [
            'id',
            'device_id',
            'model_name',
            'assigned_patient',
            'patient_id',
            'patient_name',
            'status',
            'battery_level',
            'signal_rssi',
            'mesh_status',
            'firmware_version',
            'hardware_version',
            'medication_chamber_level',
            'last_sync',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync']
