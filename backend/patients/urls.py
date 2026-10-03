from django.urls import path
from .views import PatientMeView, PatientListView, PatientDetailView, CaregiverSummaryView

urlpatterns = [
    path('me/', PatientMeView.as_view(), name='patient_me'),
    path('caregiver-summary/', CaregiverSummaryView.as_view(), name='caregiver_summary'),
    path('', PatientListView.as_view(), name='patient_list'),
    path('<str:identifier>/', PatientDetailView.as_view(), name='patient_detail'),
]
