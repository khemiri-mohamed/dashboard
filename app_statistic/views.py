import secrets
import pandas as pd
import dateutil.parser
from datetime import datetime, timedelta
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.core import serializers
from django.http import JsonResponse
from django.db.models import Q
from rest_framework import permissions
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_datatables import pagination as dt_pagination
from assets.fct import fctcore
from assets.fct.fctsheet import fctsheet
from core import views as coreViews
from app_statistic.serializers import InstanceSerializer, DataTableSerializer
from app_dashboard.models import trbsAppCompanyModel
from app_brokerage.models import trbsAppDetailsModel
from app_statistic.models import trbsAppStatisticModel


@login_required(login_url='/accounts/login/')
def page(request):
    brokerage_id = request.GET.get('id')
    company_link = ''
    try:
        company_link = trbsAppCompanyModel.objects.get(id=brokerage_id).company_link
    except:
        ''

    return render(request, 'page-statistic.html', {'company_link': company_link})


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
    brokerage_id = request.GET.get('brokerage_id', '')
    filter_by_chart_date_start = request.GET.get('chart_date_start', '')
    filter_by_chart_date_end = request.GET.get('chart_date_end', '')

    company_link = ''
    try:
        company_link = trbsAppCompanyModel.objects.get(id=brokerage_id).company_link
    except:
        ''

    if filter_by_chart_date_start:
        filter_by_chart_date_start = dateutil.parser.parse(filter_by_chart_date_start).strftime('%Y-%m-%d')

    if filter_by_chart_date_end:
        filter_by_chart_date_end = dateutil.parser.parse(filter_by_chart_date_end).strftime('%Y-%m-%d')

    query = Q()
    query &= Q(company_link=company_link)

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

    return JsonResponse({'DataChart': DataChart})

