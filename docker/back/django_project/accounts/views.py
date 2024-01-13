
from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User
from django.views.decorators.cache import never_cache
import re

@never_cache
def login_view(request):
    if request.method == 'POST':
        email=request.POST['email']
        password=request.POST['password']
        username=re.search(r'(.+)@.+',email).group(1)

        user_obj=authenticate(request,username=username,email=email,password=password)

        if user_obj is not None:

            login(request,user_obj)

            next_url = request.POST.get('next','campsite:index')  # nextパラメータを取得
            return redirect(next_url)  # nextパラメータがある場合はリダイレクト
        
        else:
            return render(request,'accounts/login.html',{'loginDenied':True})
    else:
        return render(request,'accounts/login.html',{'next':request.GET.get('next','campsite:index')})


def logout_view(request):
    logout(request)
    return redirect("campsite:index")

def signup_view(request):
    if request.method == 'POST':
        email=request.POST['email']
        password=request.POST['password']
        username=re.search(r'(.+)@.+',email).group(1)

        user_obj=authenticate(request,username=username,email=email,password=password)

        if not user_obj:
            User.objects.create_user(username,email,password)
            user_obj=authenticate(request,username=username,email=email,password=password)
            login(request,user_obj)
            
            next_url = request.POST.get('next','campsite:index')  # nextパラメータを取得
            return redirect(next_url)  # nextパラメータがある場合はリダイレクト
        else:
            return render(request,'accounts/signup.html',{'alreadyRegistered':True})
    else:
        return render(request,'accounts/signup.html',{'next':request.GET.get('next','campsite:index')})

