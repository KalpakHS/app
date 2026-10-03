from django.db import models

class Device(models.Model):
    class Status(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
        SYNCING = 'SYNCING', 'Syncing'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        IN_USE = 'IN USE', 'In Use'

    device_id = models.CharField(max_length=64, unique=True, db_index=True)
    model_name = models.CharField(max_length=128, default='SmartNeb Pocket-01')
    assigned_patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='devices'
    )
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.ONLINE,
        db_index=True
    )
    battery_level = models.PositiveIntegerField(default=87)
    signal_rssi = models.IntegerField(default=-62)
    mesh_status = models.CharField(max_length=128, default='Connected (Node 04)')
    firmware_version = models.CharField(max_length=64, default='v2.4.1-rc3')
    hardware_version = models.CharField(max_length=64, default='v1.2')
    medication_chamber_level = models.PositiveIntegerField(default=78)

    last_sync = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smartneb_devices'
        verbose_name = 'Device'
        verbose_name_plural = 'Devices'
        ordering = ['device_id']

    def __str__(self):
        return f"{self.device_id} ({self.status}) - Patient: {self.assigned_patient.patient_id if self.assigned_patient else 'Unassigned'}"
