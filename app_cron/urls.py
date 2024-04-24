from django.urls import path
from . import views

app_name = 'app-cron'

urlpatterns = [
    path('page', views.page, name='page'),
    path('data-dt', views.DTInstanceData.as_view()),
]
