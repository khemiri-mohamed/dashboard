from django.utils.translation import gettext as _
from django.contrib.auth.models import AbstractUser, UserManager

class CustomUserManager(UserManager):
    pass

class usersModel(AbstractUser):
    objects = CustomUserManager()

    class Meta:
        db_table = 'app_users'
        verbose_name = _('Users')
