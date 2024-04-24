from django.urls import path
from . import views

app_name = 'app-brokerage'

urlpatterns = [
    path('page', views.page, name='page'),
    path('data-dt', views.DTInstanceData.as_view()),
    path('action', views.InstanceAction.as_view()),
    path('delete', views.InstanceDelete.as_view()),
    path('delete_selected', views.InstanceDeleteSelected.as_view()),
    path('select-account/<str:pk>', views.InstanceDetail.as_view()),
    path('export-xlsx', views.export_xlsx.as_view(), name='export-xlsx'),
    path('export-csv', views.export_csv.as_view(), name='export-csv'),
    path('update-account-brokerage', views.InstanceUpdateAccountBrokerage.as_view()),
]
