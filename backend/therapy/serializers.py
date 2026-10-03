from rest_framework import serializers
from .models import TherapyPlan, TherapySession

class TherapyPlanSerializer(serializers.ModelSerializer):
    prescribed_by_name = serializers.CharField(source='prescribed_by.full_name', read_only=True, default='')

    class Meta:
        model = TherapyPlan
        fields = [
            'id',
            'patient',
            'prescribed_by',
            'prescribed_by_name',
            'medication_name',
            'dosage_ml',
            'target_flow_rate',
            'duration_seconds',
            'daily_frequency',
            'instructions',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TherapySessionSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    device_id = serializers.CharField(source='device.device_id', read_only=True, default=None)
    medication_name = serializers.CharField(source='plan.medication_name', read_only=True, default='Budesonide 0.5mg / 2ml')

    class Meta:
        model = TherapySession
        fields = [
            'id',
            'patient',
            'patient_id',
            'plan',
            'medication_name',
            'device',
            'device_id',
            'status',
            'total_duration_seconds',
            'elapsed_seconds',
            'delivered_dosage_ml',
            'average_flow_rate',
            'average_spo2',
            'average_pulse',
            'notes',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
