from rest_framework import serializers
from .models import Telemetry

class TelemetrySerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    device_id = serializers.CharField(source='device.device_id', read_only=True, default=None)

    class Meta:
        model = Telemetry
        fields = [
            'id',
            'patient',
            'patient_id',
            'device',
            'device_id',
            'spo2',
            'pulse',
            'flow_rate',
            'respiratory_rate',
            'inhalation_exhalation_ratio',
            'airway_pressure',
            'battery',
            'recorded_at',
        ]
        read_only_fields = ['id', 'recorded_at']
