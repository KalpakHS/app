from rest_framework import serializers
from .models import Alert, SOSEvent

class AlertSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id',
            'patient',
            'patient_id',
            'patient_name',
            'severity',
            'title',
            'message',
            'is_resolved',
            'created_at',
            'resolved_at',
        ]
        read_only_fields = ['id', 'created_at']


class SOSEventSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    triggered_by_name = serializers.CharField(source='triggered_by.full_name', read_only=True)

    class Meta:
        model = SOSEvent
        fields = [
            'id',
            'patient',
            'patient_id',
            'patient_name',
            'triggered_by',
            'triggered_by_name',
            'latitude',
            'longitude',
            'location_address',
            'status',
            'notes',
            'triggered_at',
            'resolved_at',
        ]
        read_only_fields = ['id', 'triggered_at']
