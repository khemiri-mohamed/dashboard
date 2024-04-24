from django.db import models

class trbsAppStatisticModel(models.Model):
    company_link = models.TextField(default='', null=True)
    createdAt = models.DateField(auto_now_add=True)
    total_van = models.TextField(default='0', null=True)
    total_flat = models.TextField(default='0', null=True)
    total_reffer = models.TextField(default='0', null=True)

    class Meta:
        db_table = "trbs_statistic"
