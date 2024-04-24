from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework import permissions
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user:
                login(request, user)
                if 'next' in request.POST:
                    return redirect(request.POST.get('next'))
                else:
                    return redirect('')

    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})


@login_required(login_url='/accounts/login/')
def profile_view(request):
    response = render(request, 'accounts/profile.html')
    response.set_cookie(key='user', value=request.user.id)
    return response


class edit_profile(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']

        user_instance = request.user
        user_instance.first_name = first_name
        user_instance.last_name = last_name
        user_instance.save()

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class edit_password(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            # update session to prevent user from being logged out
            update_session_auth_hash(request, user)
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "error", "errors": form.errors}, status=status.HTTP_400_BAD_REQUEST)


def logout_view(request):
    logout(request)
    return redirect('accounts:login')


def handler404(request, exception):
    return render(request, '404.html', {})


def handler500(request):
    return render(request, '500.html', {})
