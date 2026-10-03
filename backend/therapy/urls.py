from django.urls import path
from .views import (
    TherapyPlanListView,
    TherapySessionListView,
    StartSessionView,
    PauseSessionView,
    ResumeSessionView,
    CompleteSessionView,
    CancelSessionView
)

urlpatterns = [
    path('plans/', TherapyPlanListView.as_view(), name='therapy_plans'),
    path('sessions/', TherapySessionListView.as_view(), name='therapy_sessions'),
    path('sessions/start/', StartSessionView.as_view(), name='therapy_start'),
    path('sessions/<int:pk>/pause/', PauseSessionView.as_view(), name='therapy_pause'),
    path('sessions/<int:pk>/resume/', ResumeSessionView.as_view(), name='therapy_resume'),
    path('sessions/<int:pk>/complete/', CompleteSessionView.as_view(), name='therapy_complete'),
    path('sessions/<int:pk>/cancel/', CancelSessionView.as_view(), name='therapy_cancel'),
]
