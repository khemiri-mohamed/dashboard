from django.db import models
from django.utils import timezone
from app_brokerage.models import trbsAppDetailsModel
import math

class trbsAppCompanyModel(models.Model):
    company_link = models.TextField(default='', null=True)
    loadboard_link = models.TextField(default='', null=True)
    registration_process = models.TextField(default='', null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    modifiedAt = models.DateTimeField(auto_now=True)
    repeat_task = models.IntegerField(default=60)
    server_task = models.IntegerField(default=1)
    status_task = models.BooleanField(default=True)
    bid_task = models.BooleanField(default=False)
    hf_info = models.TextField(default='Not defined', null=True)
    buy_now = models.BooleanField(default=False)
    loads_scraped = models.TextField(default='', null=True)
    scrape_strategy = models.TextField(default='Not defined', null=True)
    realtime = models.TextField(default='', null=True)
    loads_scraped_flatbed = models.TextField(default='', null=True)
    loads_scraped_aws = models.TextField(default='', null=True)
    loads_scraped_aws_flatbed = models.TextField(default='', null=True)
    loads_scraped_van = models.TextField(default='', null=True)
    loads_scraped_aws_van = models.TextField(default='', null=True)
    loads_scraped_reefer = models.TextField(default='', null=True)
    loads_scraped_aws_reefer = models.TextField(default='', null=True)
    risk_level = models.TextField(default='', null=True)
    cycle_time = models.TextField(default=0, null=True)
    average_cycle_time = models.TextField(default=0, null=True)

    class Meta:
        db_table = "trbs_company"
