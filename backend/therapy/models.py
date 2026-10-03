from django.db import models
from django.conf import settings

class TherapyPlan(models.Model):
    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='therapy_plans'
    )
    prescribed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescribed_plans'
    )
    medication_name = models.CharField(max_length=255, default='Budesonide 0.5mg / 2ml')
    dosage_ml = models.FloatField(default=2.0)
    target_flow_rate = models.FloatField(default=0.28)  # ml/min
    duration_seconds = models.PositiveIntegerField(default=600)  # 10 minutes default
    daily_frequency = models.PositiveIntegerField(default=2)
    instructions = models.TextField(
        blank=True,
        default='Sit upright. Inhale slowly and deeply through the mouthpiece. Exhale normally.'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smartneb_therapy_plans'
        verbose_name = 'Therapy Plan'
        verbose_name_plural = 'Therapy Plans'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.patient_id} - {self.medication_name} ({self.duration_seconds // 60}m)"


class TherapySession(models.Model):
    class Status(models.TextChoices):
        IDLE = 'IDLE', 'Idle'
        RUNNING = 'RUNNING', 'Running'
        PAUSED = 'PAUSED', 'Paused'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='therapy_sessions'
    )
    plan = models.ForeignKey(
        TherapyPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    device = models.ForeignKey(
        'devices.Device',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IDLE,
        db_index=True
    )
    total_duration_seconds = models.PositiveIntegerField(default=600)
    elapsed_seconds = models.PositiveIntegerField(default=0)
    delivered_dosage_ml = models.FloatField(default=0.0)
    average_flow_rate = models.FloatField(default=0.28)
    average_spo2 = models.FloatField(default=98.0)
    average_pulse = models.PositiveIntegerField(default=74)
    notes = models.TextField(blank=True, default='')

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smartneb_therapy_sessions'
        verbose_name = 'Therapy Session'
        verbose_name_plural = 'Therapy Sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Session #{self.id} for {self.patient.patient_id} ({self.status}) - {self.elapsed_seconds}s/{self.total_duration_seconds}s"
