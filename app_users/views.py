from app_users.models import usersModel as User
from django.utils.translation import gettext as _
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_datatables import pagination as dt_pagination
from .serializers import InstanceUserSerializer, DataTableSerializer
from core import views as coreViews
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import make_password
from accounts.decorators import superuser_required, IsSuperuserOrReadOnly


@superuser_required(login_url='/accounts/login/')
def page(request):
    response = render(request, 'page-users.html')
    response.set_cookie(key='user', value=request.user.id)
    return response


class DTInstanceData(generics.ListAPIView):
    serializer_class = DataTableSerializer
    pagination_class = dt_pagination.DatatablesLimitOffsetPagination
    permission_classes = [IsSuperuserOrReadOnly]

    def post(self, request, *args, **kwargs):
        queryset = User.objects.all().order_by('-id')

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
    serializer_class = InstanceUserSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsSuperuserOrReadOnly]

    def get_obj(self, pk):
        try:
            return User.objects.get(pk=pk)
        except:
            return None

    def post(self, request):
        action_type = request.POST['action_type']

        if action_type == 'edit':
            pk = request.POST['pk']
            obj = self.get_obj(pk)
            if obj == None: return Response({"status": "fail", "message": f"{_('Brand')} with Id: {pk} not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.serializer_class(obj, data=request.data, partial=True)
        else:
            serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            username = request.POST['username']
            first_name = request.POST['first_name']
            last_name = request.POST['last_name']

            if action_type != 'edit' and User.objects.filter(username=username).count() > 0:
                return Response({"status": "exist"}, status=status.HTTP_200_OK)

            if action_type == 'new' :
                password = make_password(request.POST['password'])
                obj = serializer.save(username=username, password=password, first_name=first_name, last_name=last_name, is_superuser=True, is_staff=True, is_active=True)
            else:
                obj = serializer.save(first_name=first_name, last_name=last_name)

            update_session_auth_hash(request, request.user)

            if (action_type == 'edit'):
                return Response({"status": "updated", "id": obj.id}, status=status.HTTP_200_OK)
            else:
                return Response({"status": "success", "id": obj.id}, status=status.HTTP_200_OK)

        return Response({"status": "fail", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class change_password(generics.GenericAPIView):
    permission_classes = [IsSuperuserOrReadOnly]

    def post(self, request):
        user_id = request.POST['id']
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"status": "error", "message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.POST['new_password']
        if not new_password:
            return Response({"status": "error", "message": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class InstanceDelete(coreViews.InstanceDelete):
    serializer_class = InstanceUserSerializer
    model_class = User

class InstanceDeleteSelected(coreViews.InstanceDeleteSelected):
    serializer_class = InstanceUserSerializer
    model_class = User

class InstanceDetail(coreViews.InstanceDetail):
    serializer_class = InstanceUserSerializer
    model_class = User
