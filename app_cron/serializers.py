from rest_framework import serializers
from django.utils.timesince import timesince
from app_cron.models import trbsAppCronModel


class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = trbsAppCronModel
        fields = '__all__'


class DataTableSerializer(serializers.ModelSerializer):
    cron_start = serializers.SerializerMethodField()
    cron_end = serializers.SerializerMethodField()
    DT_RowId = serializers.SerializerMethodField()
    DT_RowAttr = serializers.SerializerMethodField()

    def get_DT_RowId(self, model):
        return 'row_%d' % model.pk

    def get_DT_RowAttr(self, model):
        return {'data-pk': model.pk}

    def get_cron_start(self, obj):
        if obj.cron_start:
            return obj.cron_start.strftime('%Y-%m-%d %I:%M %p')

    def get_cron_end(self, obj):
        if obj.cron_end:
            return obj.cron_end.strftime('%Y-%m-%d %I:%M %p')

    class Meta:
        model = trbsAppCronModel
        fields = '__all__'
