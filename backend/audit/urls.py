from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminAuditLogListView,
    AdminFleetStatsView
)

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin_users'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('audit-logs/', AdminAuditLogListView.as_view(), name='admin_audit_logs'),
    path('fleet-stats/', AdminFleetStatsView.as_view(), name='admin_fleet_stats'),
]
