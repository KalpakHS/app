from django.db import models

class Telemetry(models.Model):
    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='telemetry_records'
    )
    device = models.ForeignKey(
        'devices.Device',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='telemetry_records'
    )
    spo2 = models.FloatField(default=98.0)
    pulse = models.PositiveIntegerField(default=74)
    flow_rate = models.FloatField(default=0.28)  # ml/min
    respiratory_rate = models.PositiveIntegerField(default=16)  # breaths per minute
    inhalation_exhalation_ratio = models.CharField(max_length=20, default='1:2')
    airway_pressure = models.FloatField(default=14.2)  # cmH2O
    battery = models.PositiveIntegerField(default=87)  # %
    recorded_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'smartneb_telemetry'
        verbose_name = 'Telemetry Record'
        verbose_name_plural = 'Telemetry Records'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['patient', '-recorded_at']),
        ]

    def __str__(self):
        return f"Telemetry {self.patient.patient_id} @ {self.recorded_at}: SpO2={self.spo2}%, Pulse={self.pulse}bpm"
