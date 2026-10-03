from django.urls import path
from .views import TelemetryLatestView, TelemetryHistoryView, TelemetryIngestView

urlpatterns = [
    path('latest/', TelemetryLatestView.as_view(), name='telemetry_latest'),
    path('history/', TelemetryHistoryView.as_view(), name='telemetry_history'),
    path('ingest/', TelemetryIngestView.as_view(), name='telemetry_ingest'),
]
