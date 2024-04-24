from django.db import models
from django.utils import timezone
import math

class trbsAppDetailsModel(models.Model):
    company_link = models.TextField(default='', null=True)
    loadboard_link = models.TextField(default='', null=True)
    registration_process = models.TextField(default='', null=True)
    email = models.TextField(default='', null=True)
    password = models.TextField(default='', null=True)
    account_setup_status = models.TextField(default='', null=True)
    account_setup_note = models.TextField(default='', null=True)
    carrier_name = models.TextField(default='', null=True)
    mc_number = models.TextField(default='', null=True)
    dot_number = models.TextField(default='', null=True)
    truck_count = models.TextField(default='', null=True)
    gsuite_admin = models.TextField(default='', null=True)
    address = models.TextField(default='', null=True)
    domain_subscription_amount = models.TextField(default='', null=True)
    google_voice_subscription_amount = models.TextField(default='', null=True)
    phone_number = models.TextField(default='', null=True)
    reason = models.TextField(default='', null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    modifiedAt = models.DateTimeField(auto_now=True)
    auth_credentials = models.JSONField(default=dict)
    refresh_token = models.TextField(default='', null=True)
    server_cookie_1 = models.TextField(default='', null=True)
    server_cookie_2 = models.TextField(default='', null=True)

    class Meta:
        db_table = "trbs_details"
