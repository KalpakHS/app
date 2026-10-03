from django.urls import path
from .views import AlertListView, AlertResolveView, SOSEventView

urlpatterns = [
    path('', AlertListView.as_view(), name='alert_list'),
    path('<int:pk>/resolve/', AlertResolveView.as_view(), name='alert_resolve'),
    path('sos/', SOSEventView.as_view(), name='alert_sos'),
]
