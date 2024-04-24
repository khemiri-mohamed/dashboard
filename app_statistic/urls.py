from django.urls import path
from . import views

app_name = 'app-statistic'

urlpatterns = [
    path('page', views.page, name='page'),
    path('chart', views.chart, name='chart'),
]
