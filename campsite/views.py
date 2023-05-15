from django.shortcuts import render,redirect
from django.urls import reverse
from .models import Spot,Comment,SpotImageUrl
from .decoraters import superuser_restriction,is_authenticated_restriction
from django.contrib.auth.models import User
from django.core.files import File
from django.conf import settings
from django.http import JsonResponse
import json
import os
import environ

env = environ.Env()
env.read_env(os.path.join(settings.BASE_DIR, '.env'))


@superuser_restriction
def jsonupload_view(request):
    if request.method == "POST" and request.FILES:
        user_instance = User.objects.get(username='googlemapuser')
        if request.FILES.get('spot'):
            spotfile = request.FILES['spot']
            jsonlist = json.load(spotfile)
            for data in jsonlist:
                Spot.objects.update_or_create(key=data['key'],defaults=data)
        elif request.FILES.get('comment'):
            commentfile = request.FILES['comment']
            jsonlist = json.load(commentfile)
            for data in jsonlist:
                spot = Spot.objects.get(key=data['spotkey'])
                Comment.objects.update_or_create(key=data['key'],defaults={
                    'key':data['key'],
                    'spot':spot,
                    'user':user_instance,
                    'starRate':data['starRate'],
                    'text':data['text']
                })
        elif request.FILES.get('spotimage'):
            imagefile = request.FILES['spotimage']
            jsonlist = json.load(imagefile)
            for data in jsonlist:
                spot = Spot.objects.get(key=data['spotkey'])
                SpotImageUrl.objects.update_or_create(key=data['key'],defaults={
                    'key':data['key'],
                    'spot':spot,
                    'url':data['imageurl']
                })
        return redirect('campsite:index')
    else:
        return render(request,'campsite/upload.html')


def index_view(request):
    google_maps_api_key = env('GOOGLE_MAPS_API_KEY')
    return render(request,'campsite/index.html',{'google_maps_api_key':google_maps_api_key})

def detail_spot_view(request,pk):
    is_superuser = True if request.user.is_superuser else False
    spotObj = Spot.objects.get(id=pk)
    commenobj_list = Comment.objects.filter(spot=spotObj)
    imageurlObj_list = SpotImageUrl.objects.filter(spot=spotObj)
    return render(request,'campsite/spot.html',{'obj':spotObj,'commentobj_list':commenobj_list,'imageurlObj_list':imageurlObj_list,'is_superuser':is_superuser})


def delete_spot_view(request,pk):
    spot = Spot.objects.get(id=pk)
    spot.delete()
    return redirect('campsite:index')

@is_authenticated_restriction
def add_comment_view(request):
    spot = Spot.objects.get(key=request.POST['spotkey'])
    Comment.objects.create(spot=spot,user=request.user,starRate=int(request.POST['rate']),text=request.POST['text'])
    return redirect('campsite:spot-detail',spot.id)

def delete_comment_view(request,pk):
    comment = Comment.objects.get(id=pk)
    comment.delete()
    return redirect(request.GET.get('next','campsite:index'))

def about_us_view(request):
    return render(request,'campsite/aboutus.html')

