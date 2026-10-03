from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_entries'
    )
    action = models.CharField(max_length=128, db_index=True)
    entity_type = models.CharField(max_length=64, blank=True, default='')
    entity_id = models.CharField(max_length=64, blank=True, default='')
    details = models.TextField(blank=True, default='')
    status = models.CharField(max_length=32, default='SUCCESS')
    ip_address = models.CharField(max_length=45, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'smartneb_audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {user_str} - {self.action} ({self.status})"
