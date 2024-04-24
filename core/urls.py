from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('users/', include('app_users.urls')),
    path('dashboard/', include('app_dashboard.urls')),
    path('brokerage/', include('app_brokerage.urls')),
    path('statistic/', include('app_statistic.urls')),
    path('cron/', include('app_cron.urls')),
    path('', RedirectView.as_view(url='/dashboard/page', permanent=False), name='index')
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)