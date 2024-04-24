from rest_framework import serializers
from app_users.models import usersModel as User


class InstanceUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class DataTableSerializer(serializers.ModelSerializer):
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M")
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M")
    DT_RowId = serializers.SerializerMethodField()
    DT_RowAttr = serializers.SerializerMethodField()

    def get_DT_RowId(self, model):
        return 'row_%d' % model.pk

    def get_DT_RowAttr(self, model):
        return {'data-pk': model.pk}

    class Meta:
        model = User
        fields = '__all__'
