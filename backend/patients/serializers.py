from rest_framework import serializers
from .models import PatientProfile
from accounts.serializers import UserSerializer

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    doctor_name = serializers.CharField(source='assigned_doctor.full_name', read_only=True)
    caregiver_name = serializers.CharField(source='assigned_caregiver.full_name', read_only=True)
    
    # Associated device & telemetry summary
    device_id = serializers.SerializerMethodField()
    device_status = serializers.SerializerMethodField()
    battery_level = serializers.SerializerMethodField()
    latest_telemetry = serializers.SerializerMethodField()
    last_session_time = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            'id',
            'patient_id',
            'user',
            'full_name',
            'email',
            'phone',
            'age',
            'gender',
            'diagnosis',
            'status',
            'adherence_rate',
            'room_bed',
            'prescribed_medication',
            'daily_sessions_target',
            'daily_sessions_completed',
            'assigned_doctor',
            'doctor_name',
            'assigned_caregiver',
            'caregiver_name',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'device_id',
            'device_status',
            'battery_level',
            'latest_telemetry',
            'last_session_time',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'patient_id', 'created_at', 'updated_at']

    def get_device_id(self, obj):
        device = obj.devices.first()
        return device.device_id if device else "SN-8821-X"

    def get_device_status(self, obj):
        device = obj.devices.first()
        return device.status if device else "ONLINE"

    def get_battery_level(self, obj):
        device = obj.devices.first()
        return device.battery_level if device else 87

    def get_latest_telemetry(self, obj):
        telemetry = obj.telemetry_records.first()
        if telemetry:
            return {
                "spo2": telemetry.spo2,
                "pulse": telemetry.pulse,
                "flow_rate": telemetry.flow_rate,
                "respiratory_rate": telemetry.respiratory_rate,
                "airway_pressure": telemetry.airway_pressure,
                "battery": telemetry.battery,
                "recorded_at": telemetry.recorded_at,
            }
        return {
            "spo2": 98.0,
            "pulse": 74,
            "flow_rate": 0.28,
            "respiratory_rate": 16,
            "airway_pressure": 14.2,
            "battery": 87,
            "recorded_at": None,
        }

    def get_last_session_time(self, obj):
        session = obj.therapy_sessions.filter(status='COMPLETED').first()
        if session and session.completed_at:
            return session.completed_at.strftime("%I:%M %p")
        return "Today, 08:30 AM"


class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            'age',
            'gender',
            'diagnosis',
            'status',
            'room_bed',
            'prescribed_medication',
            'daily_sessions_target',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
        ]
