from django.db import models
from django.conf import settings

class Alert(models.Model):
    class Severity(models.TextChoices):
        CRITICAL = 'CRITICAL', 'Critical'
        WARNING = 'WARNING', 'Warning'
        INFO = 'INFO', 'Info'

    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.INFO,
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'smartneb_alerts'
        verbose_name = 'Alert'
        verbose_name_plural = 'Alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.patient.patient_id} - {self.title}"


class SOSEvent(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        DISPATCHED = 'DISPATCHED', 'Dispatched'
        RESOLVED = 'RESOLVED', 'Resolved'

    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='sos_events'
    )
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='triggered_sos'
    )
    latitude = models.FloatField(default=37.7749)
    longitude = models.FloatField(default=-122.4194)
    location_address = models.CharField(
        max_length=255,
        default='104 Health Ave, San Francisco, CA'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True
    )
    notes = models.TextField(blank=True, default='')
    triggered_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'smartneb_sos_events'
        verbose_name = 'SOS Event'
        verbose_name_plural = 'SOS Events'
        ordering = ['-triggered_at']

    def __str__(self):
        return f"SOS #{self.id} for {self.patient.patient_id} ({self.status}) at {self.triggered_at}"
