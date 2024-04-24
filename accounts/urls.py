from django.urls import path, reverse_lazy, include
from django.contrib.auth.views import PasswordChangeView, PasswordChangeDoneView
from accounts import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('edit-profile/', views.edit_profile.as_view()),
    path('edit-password/', views.edit_password.as_view()),
]

handler404 = 'accounts.views.handler404'
handler500 = 'accounts.views.handler500'
