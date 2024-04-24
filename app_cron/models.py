from django.db import models

class trbsAppCronModel(models.Model):
    company_link = models.TextField(default='', null=True)
    cron_start = models.DateTimeField(default=None, null=True)
    cron_end = models.DateTimeField(default=None, null=True)
    cron_status = models.TextField(default='', null=True)

    class Meta:
        db_table = "trbs_cron"
