from rest_framework import serializers
from django.utils.timesince import timesince
from app_brokerage.models import trbsAppDetailsModel
from app_dashboard.models import trbsAppCompanyModel
from django.utils import timezone as djtz


class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = trbsAppCompanyModel
        fields = '__all__'

def convert_seconds(total_seconds):
    minutes = int(total_seconds // 60)
    seconds = int(total_seconds % 60)
    return f"{minutes} mins, {seconds} secs"

class DataTableSerializer(serializers.ModelSerializer):
    modifiedAt = serializers.SerializerMethodField()
    count_success_account = serializers.SerializerMethodField()
    cycle_time = serializers.SerializerMethodField()
    average_cycle_time = serializers.SerializerMethodField()

    DT_RowId = serializers.SerializerMethodField()
    DT_RowAttr = serializers.SerializerMethodField()

    def get_DT_RowId(self, model):
        return 'row_%d' % model.pk

    def get_DT_RowAttr(self, model):
        return {'data-pk': model.pk}

    def get_modifiedAt(self, obj):
        return timesince(obj.modifiedAt, djtz.now())

    def get_count_success_account(self, obj):
        return trbsAppDetailsModel.objects.filter(company_link=obj.company_link, account_setup_status='Success').count()

    def get_cycle_time(self, obj):
        if obj.cycle_time:
            return convert_seconds(float(obj.cycle_time))

    def get_average_cycle_time(self, obj):
        if obj.cycle_time:
            return convert_seconds(float(obj.average_cycle_time))

    class Meta:
        model = trbsAppCompanyModel
        fields = '__all__'
