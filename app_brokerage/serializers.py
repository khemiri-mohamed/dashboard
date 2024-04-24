from rest_framework import serializers
from django.utils.timesince import timesince
from app_brokerage.models import trbsAppDetailsModel


class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = trbsAppDetailsModel
        fields = '__all__'


class DataTableSerializer(serializers.ModelSerializer):
    DT_RowId = serializers.SerializerMethodField()
    DT_RowAttr = serializers.SerializerMethodField()

    def get_DT_RowId(self, model):
        return 'row_%d' % model.pk

    def get_DT_RowAttr(self, model):
        return {'data-pk': model.pk}

    class Meta:
        model = trbsAppDetailsModel
        fields = '__all__'
