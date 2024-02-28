from django.db import models
from django.contrib.auth.models import User

class Spot(models.Model):
    key = models.CharField(max_length=30)
    category = models.CharField(max_length=30)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    lat = models.CharField(max_length=53)
    lng = models.CharField(max_length=53)
    period = models.CharField(max_length=150,default='-')
    phone = models.CharField(max_length=100,default='-')
    price = models.CharField(max_length=400,default='-')
    description = models.TextField(default='-')
    iconpath = models.CharField(max_length=30,default='iconpath')

class Comment(models.Model):
    key = models.CharField(max_length=60,default='-')
    spot = models.ForeignKey(Spot,on_delete=models.CASCADE,related_name='spot_comment')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    starRate = models.IntegerField()
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

class SpotImageUrl(models.Model):
    key = models.CharField(max_length=200)
    spot = models.ForeignKey(Spot,on_delete=models.CASCADE,related_name='spot_image_url')
    url = models.CharField(max_length=200)

#class TestCD(models.Model):
#    name = models.CharField(max_length=120)
