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
from app_cron.serializers import InstanceSerializer, DataTableSerializer
from app_dashboard.models import trbsAppCompanyModel
from app_cron.models import trbsAppCronModel


@login_required(login_url='/accounts/login/')
def page(request):
    return render(request, 'page-cron.html')

class DTInstanceData(generics.ListAPIView):
    serializer_class = DataTableSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = dt_pagination.DatatablesLimitOffsetPagination

    def post(self, request, *args, **kwargs):
        query = Q()

        brokerage_id = request.data.get('brokerage_id')
        company_link = ''
        try:
            company_link = trbsAppCompanyModel.objects.get(id=brokerage_id).company_link
        except:
            ''

        if company_link:
            query &= Q(company_link=company_link)

        queryset = trbsAppCronModel.objects.filter(query).order_by('-cron_start')
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

