import secrets
import pandas as pd
import dateutil.parser
from datetime import datetime, timedelta
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import permissions
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_datatables import pagination as dt_pagination
from assets.fct import fctcore
from assets.fct.fctsheet import fctsheet
from core import views as coreViews
from app_dashboard.serializers import InstanceSerializer, DataTableSerializer
from app_brokerage.models import trbsAppDetailsModel
from app_dashboard.models import trbsAppCompanyModel
from app_statistic.models import trbsAppStatisticModel


@login_required(login_url='/accounts/login/')
def page(request):
    return render(request, 'page-dashboard.html')


def query_filter(request):
    query = Q()

    filter_by_brokerage = request.GET.get('brokerage', '')
    filter_by_active_brokerages = request.GET.get('active_brokerages', 'true')

    if filter_by_brokerage: query &= Q(company_link__icontains=filter_by_brokerage)
    if filter_by_active_brokerages == 'true':
        company_links = list(set(trbsAppDetailsModel.objects.filter(account_setup_status='Success').values_list('company_link', flat=True)))
        query &= Q(company_link__in=company_links)
        query &= Q(modifiedAt__gt=datetime.now() - timedelta(days=1))

    return query


class DTInstanceData(generics.ListAPIView):
    serializer_class = DataTableSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = dt_pagination.DatatablesLimitOffsetPagination

    def post(self, request, *args, **kwargs):

        query = query_filter(request)
        queryset = trbsAppCompanyModel.objects.filter(query).order_by('-company_link')

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
            return trbsAppCompanyModel.objects.get(pk=pk)
        except:
            return None

    def post(self, request):
        action_type = request.POST['action_type']

        if action_type == 'edit':
            pk = request.POST['pk']
            obj = self.get_obj(pk)
            if obj is None:
                return Response({"status": "fail", "message": f"{trbsAppCompanyModel._meta.verbose_name} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.serializer_class(obj, data=request.data, partial=True)
        else:
            serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            brokerage_name = request.POST['brokerage_name']
            brokerage_url = request.POST['brokerage_url']

            if action_type != 'edit' and trbsAppCompanyModel.objects.filter(company_link=brokerage_name, loadboard_link=brokerage_url).count() > 0:
                return Response({"status": "exist"}, status=status.HTTP_200_OK)

            if action_type == 'edit':
                pk = request.POST['pk']
                obj = self.get_obj(pk)
                obj.company_link = brokerage_name
                obj.loadboard_link = brokerage_url
                obj.save(update_fields=['company_link', 'loadboard_link'])

            else:
                obj = serializer.save(company_link=brokerage_name, loadboard_link=brokerage_url)

            if action_type == 'edit':
                return Response({"status": "updated", "id": obj.id}, status=status.HTTP_200_OK)

            else:
                return Response({"status": "success", "id": obj.id}, status=status.HTTP_200_OK)

        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_200_OK)


class InstanceUpdateStatusBrokerage(generics.GenericAPIView):
    serializer_class = InstanceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get_obj(self, pk):
        try:
            return trbsAppCompanyModel.objects.get(id=pk)
        except:
            return None

    def post(self, request):
        pk = request.POST['pk']
        obj = self.get_obj(pk)
        if obj is None:
            return Response({"status": "fail", "message": f"{trbsAppCompanyModel._meta.verbose_name} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(obj, data=request.data, partial=True)
        if serializer.is_valid():
            brokerage_status = request.POST['brokerage_status']
            obj.status_task = brokerage_status
            obj.save(update_fields=['status_task'])

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class InstanceUpdateRiskLevel(generics.GenericAPIView):
    serializer_class = InstanceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get_obj(self, pk):
        try:
            return trbsAppCompanyModel.objects.get(id=pk)
        except:
            return None

    def post(self, request):
        pk = request.POST['pk']
        obj = self.get_obj(pk)
        if obj is None:
            return Response({"status": "fail", "message": f"{trbsAppCompanyModel._meta.verbose_name} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(obj, data=request.data, partial=True)
        if serializer.is_valid():
            risk_level = request.POST['risk_level']
            obj.risk_level = risk_level
            obj.save(update_fields=['risk_level'])

            return Response({"status": "success"}, status=status.HTTP_201_CREATED)
        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


def date_range_from_user_input(start_date_str, end_date_str):
    date_format = "%Y-%m-%d"

    start_date = datetime.strptime(start_date_str, date_format).date()
    end_date = datetime.strptime(end_date_str, date_format).date()

    delta = timedelta(days=1)
    current_date = start_date

    while current_date <= end_date:
        yield current_date
        current_date += delta


@login_required(login_url='/accounts/login/')
def chart(request):
    filter_by_chart_date_start = request.GET.get('chart_date_start', '')
    filter_by_chart_date_end = request.GET.get('chart_date_end', '')

    if filter_by_chart_date_start:
        filter_by_chart_date_start = dateutil.parser.parse(filter_by_chart_date_start).strftime('%Y-%m-%d')

    if filter_by_chart_date_end:
        filter_by_chart_date_end = dateutil.parser.parse(filter_by_chart_date_end).strftime('%Y-%m-%d')

    query = Q()

    dateDataChart = []
    if filter_by_chart_date_start:
        if filter_by_chart_date_end:
            if filter_by_chart_date_start != filter_by_chart_date_end:
                query &= Q(createdAt__range=(filter_by_chart_date_start, filter_by_chart_date_end))
                dateDataChart = list(date_range_from_user_input(filter_by_chart_date_start, filter_by_chart_date_end))
            else:
                query &= Q(createdAt=filter_by_chart_date_start)
                dateDataChart = list(date_range_from_user_input(filter_by_chart_date_start, filter_by_chart_date_start))
        else:
            query &= Q(createdAt=filter_by_chart_date_start)
            dateDataChart = list(date_range_from_user_input(filter_by_chart_date_start, filter_by_chart_date_start))

    # point['createdAt'].strftime("%a %d-%m-%Y")
    # dateDataChart = [date.strftime("%a %d-%m-%Y") for date in dateDataChart]

    data_points = trbsAppStatisticModel.objects.filter(query).values('createdAt', 'total_van', 'total_flat', 'total_reffer').order_by('createdAt')
    DataChart = [[int(point['total_van']), int(point['total_flat']), int(point['total_reffer']), point['createdAt']] for point in data_points]
    # DataChart = [[int(point['total_van']), int(point['total_flat']), int(point['total_reffer']), point['createdAt'].strftime("%a %d-%m-%Y")] for point in data_points]

    sum_by_date = {}
    for row in DataChart:
        date = row[-1]  # Last element of each row is the date
        values = row[:-1]  # Exclude the date
        if date in sum_by_date:
            sum_by_date[date] = [sum(x) for x in zip(sum_by_date[date], values)]
        else:
            sum_by_date[date] = values

    # print("Sum of rows by date:")
    result_list = []
    for date, sums in sum_by_date.items():
        result_list.append(sums + [date])
    # print("result_list:", result_list)

    return JsonResponse({'DataChart': result_list})


class InstanceDelete(coreViews.InstanceDelete):
    serializer_class = InstanceSerializer
    model_class = trbsAppCompanyModel

class InstanceDeleteSelected(coreViews.InstanceDeleteSelected):
    serializer_class = InstanceSerializer
    model_class = trbsAppCompanyModel

class InstanceDetail(coreViews.InstanceDetail):
    serializer_class = InstanceSerializer
    model_class = trbsAppCompanyModel

class export_csv(coreViews.export_csv):
    model_class = trbsAppCompanyModel
    exclude = ['id']

class export_xlsx(coreViews.export_xlsx):
    model_class = trbsAppCompanyModel
    exclude = ['id']


