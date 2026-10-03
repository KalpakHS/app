from django.db import models
from django.conf import settings

class PatientProfile(models.Model):
    class Status(models.TextChoices):
        STABLE = 'STABLE', 'Stable'
        NEEDS_REVIEW = 'NEEDS REVIEW', 'Needs Review'
        CRITICAL = 'CRITICAL', 'Critical'
        ALERT = 'ALERT', 'Alert'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    patient_id = models.CharField(max_length=32, unique=True, db_index=True)
    age = models.PositiveIntegerField(default=28)
    gender = models.CharField(max_length=20, default='Male')
    diagnosis = models.CharField(max_length=255, default='Severe Persistent Asthma')
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.STABLE,
        db_index=True
    )
    adherence_rate = models.FloatField(default=94.0)
    room_bed = models.CharField(max_length=64, blank=True, default='')

    # Clinical details
    prescribed_medication = models.CharField(max_length=255, default='Budesonide 0.5mg / 2ml')
    daily_sessions_target = models.PositiveIntegerField(default=2)
    daily_sessions_completed = models.PositiveIntegerField(default=1)

    # Care team relationships
    assigned_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_patients'
    )
    assigned_caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='caregiver_patients'
    )

    # Emergency contact details
    emergency_contact_name = models.CharField(max_length=255, default='Elena Mercer')
    emergency_contact_phone = models.CharField(max_length=50, default='+1 (555) 019-2831')
    emergency_contact_relationship = models.CharField(max_length=100, default='Spouse / Primary Caregiver')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smartneb_patient_profiles'
        verbose_name = 'Patient Profile'
        verbose_name_plural = 'Patient Profiles'
        ordering = ['patient_id']

    def __str__(self):
        return f"{self.patient_id} - {self.user.full_name} ({self.status})"
