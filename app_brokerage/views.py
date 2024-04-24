import secrets
import pandas as pd
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.db.models import Q
from rest_framework import permissions
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_datatables import pagination as dt_pagination
from assets.fct import fctcore
from assets.fct.fctsheet import fctsheet
from core import views as coreViews
from app_brokerage.serializers import InstanceSerializer, DataTableSerializer
from app_dashboard.models import trbsAppCompanyModel
from app_brokerage.models import trbsAppDetailsModel


@login_required(login_url='/accounts/login/')
def page(request):
    return render(request, 'page-brokerage.html')

def query_filter(request):
    query = Q()

    filter_by_account_status = request.GET.get('account_status', '')
    if filter_by_account_status: query &= Q(account_setup_status=filter_by_account_status)

    return query

class DTInstanceData(generics.ListAPIView):
    serializer_class = DataTableSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = dt_pagination.DatatablesLimitOffsetPagination

    def post(self, request, *args, **kwargs):
        query = query_filter(request)

        brokerage_id = request.data.get('brokerage_id')
        company_link = ''
        try:
            company_link = trbsAppCompanyModel.objects.get(id=brokerage_id).company_link
        except:
            ''

        if company_link:
            query &= Q(company_link=company_link)

        queryset = trbsAppDetailsModel.objects.filter(query).order_by('-email')
        sort_column = request.POST.get('order[0][column]', '')
        sort_dir = request.POST.get('order[0][dir]', '')
        if sort_column and sort_dir:
            sort_column = int(sort_column)
            sort_by = request.POST.get('columns[{}][data]'.format(sort_column), '')
            if sort_by:
                sort_dir = '-' if sort_dir == 'desc' else ''
                queryset = queryset.order_by('{}{}'.format(sort_dir, sort_by))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DataTableSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DataTableSerializer(queryset, many=True)
        return Response(serializer.data)

class InstanceAction(generics.GenericAPIView):
    serializer_class = InstanceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get_obj(self, pk):
        try:
            return trbsAppDetailsModel.objects.get(pk=pk)
        except:
            return None

    def post(self, request):
        brokerage_id = request.POST['brokerage_id']
        action_type = request.POST['action_type']

        if action_type == 'edit':
            pk = request.POST['pk']
            obj = self.get_obj(pk)
            if obj is None:
                return Response({"status": "fail", "message": f"{trbsAppDetailsModel._meta.verbose_name} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.serializer_class(obj, data=request.data, partial=True)
        else:
            serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            company_link = loadboard_link = ''
            try:
                company_obj = trbsAppCompanyModel.objects.get(id=brokerage_id)
                company_link = company_obj.company_link
                loadboard_link = company_obj.loadboard_link
            except:
                ''

            if company_link:
                email = request.POST['email']
                password = request.POST['password']
                account_status = request.POST['account_status']

                if action_type != 'edit' and trbsAppDetailsModel.objects.filter(company_link=company_link, loadboard_link=loadboard_link, email=email, password=password, account_setup_status=account_status).count() > 0:
                    return Response({"status": "exist"}, status=status.HTTP_200_OK)

                if action_type == 'edit':
                    pk = request.POST['pk']
                    obj = self.get_obj(pk)
                    obj.email = email
                    obj.password = password
                    obj.account_setup_status = account_status
                    obj.save(update_fields=['email', 'password', 'account_setup_status'])

                else:
                    obj = serializer.save(company_link=company_link, loadboard_link=loadboard_link, email=email, password=password, account_setup_status=account_status)

                if action_type == 'edit':
                    return Response({"status": "updated", "id": obj.id}, status=status.HTTP_200_OK)

                else:
                    return Response({"status": "success", "id": obj.id}, status=status.HTTP_200_OK)

        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_200_OK)


class InstanceUpdateAccountBrokerage(generics.GenericAPIView):
    serializer_class = InstanceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get_obj(self, pk):
        try:
            return trbsAppDetailsModel.objects.get(id=pk)
        except:
            return None

    def post(self, request):
        pk = request.POST['pk']
        obj = self.get_obj(pk)
        if obj is None:
            return Response({"status": "fail", "message": f"{trbsAppDetailsModel._meta.verbose_name} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(obj, data=request.data, partial=True)
        if serializer.is_valid():
            brokerage_status = request.POST['brokerage_status']
            obj.account_setup_status = brokerage_status
            obj.save(update_fields=['account_setup_status'])

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class InstanceDelete(coreViews.InstanceDelete):
    serializer_class = InstanceSerializer
    model_class = trbsAppDetailsModel

class InstanceDeleteSelected(coreViews.InstanceDeleteSelected):
    serializer_class = InstanceSerializer
    model_class = trbsAppDetailsModel

class InstanceDetail(coreViews.InstanceDetail):
    serializer_class = InstanceSerializer
    model_class = trbsAppDetailsModel

class export_csv(coreViews.export_csv):
    model_class = trbsAppDetailsModel
    exclude = ['id', 'registration_process', 'account_setup_note', 'carrier_name', 'mc_number', 'dot_number', 'truck_count', 'gsuite_admin', 'address', 'domain_subscription_amount', 'google_voice_subscription_amount', 'phone_number', 'reason', 'refresh_token', 'server_cookie_1', 'server_cookie_2', 'createdAt', 'modifiedAt']

class export_xlsx(coreViews.export_xlsx):
    model_class = trbsAppDetailsModel
    exclude = ['id', 'registration_process', 'account_setup_note', 'carrier_name', 'mc_number', 'dot_number', 'truck_count', 'gsuite_admin', 'address', 'domain_subscription_amount', 'google_voice_subscription_amount', 'phone_number', 'reason', 'refresh_token', 'server_cookie_1', 'server_cookie_2', 'createdAt', 'modifiedAt']


