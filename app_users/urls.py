from django.urls import path
from . import views

app_name = 'app-users'

urlpatterns = [
    path('page', views.page, name='page'),
    path('data-dt', views.DTInstanceData.as_view()),
    path('action', views.InstanceAction.as_view()),
    path('change-password', views.change_password.as_view()),
    path('delete', views.InstanceDelete.as_view()),
    path('delete_selected', views.InstanceDeleteSelected.as_view()),
    path('select/<str:pk>', views.InstanceDetail.as_view()),
]
