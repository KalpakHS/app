from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/devices/', include('devices.urls')),
    path('api/telemetry/', include('telemetry.urls')),
    path('api/therapy/', include('therapy.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/admin-ops/', include('audit.urls')),
]
