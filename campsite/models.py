from django.db import models
from django.contrib.auth.models import User

class Spot(models.Model):
    key = models.CharField(max_length=30)
    category = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=30)
    lat = models.CharField(max_length=53)
    lng = models.CharField(max_length=53)
    period = models.CharField(max_length=30,default='-')
    phone = models.CharField(max_length=15,default='-')
    price = models.CharField(max_length=300,default='-')
    description = models.CharField(max_length=500,default='-')
    iconpath = models.CharField(max_length=30,default='iconpath')

class Comment(models.Model):
    key = models.CharField(max_length=30,default='-')
    spot = models.ForeignKey(Spot,on_delete=models.CASCADE,related_name='spot_comment')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    starRate = models.IntegerField()
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

class SpotImageUrl(models.Model):
    key = models.CharField(max_length=200)
    spot = models.ForeignKey(Spot,on_delete=models.CASCADE,related_name='spot_image_url')
    url = models.CharField(max_length=200)

"""
class Campsite(models.Model):
    key = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=30)
    lat = models.CharField(max_length=53)
    lng = models.CharField(max_length=53)
    period = models.CharField(max_length=30)
    phone = models.CharField(max_length=15)
    price = models.CharField(max_length=300)
    description = models.CharField(max_length=500)
    iconpath = models.CharField(max_length=30,default='iconpath')

    def __str__(self):
        return self.name

class Spa(models.Model):
    key = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=30)
    lat = models.CharField(max_length=53)
    lng = models.CharField(max_length=53)
    period = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    price = models.CharField(max_length=300)
    description = models.CharField(max_length=500,default='unknown')
    iconpath = models.CharField(max_length=30,default='iconpath')

    def __str__(self):
        return self.name

class ConvenienceStore(models.Model):
    key = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=30)
    lat = models.CharField(max_length=53)
    lng = models.CharField(max_length=53)
    phone = models.CharField(max_length=15)
    description = models.CharField(max_length=500,default='unknown')
    iconpath = models.CharField(max_length=30,default='iconpath')

    def __str__(self):
        return self.name
    
class CampsiteComment(models.Model):
    spot = models.ForeignKey(Campsite,on_delete=models.CASCADE,related_name='comments')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    starRate = models.IntegerField()
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    
class SpaComment(models.Model):
    spot = models.ForeignKey(Spa,on_delete=models.CASCADE,related_name='comments')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    starRate = models.IntegerField()
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    
class ConvenienceStoreComment(models.Model):
    spot = models.ForeignKey(ConvenienceStore,on_delete=models.CASCADE,related_name='comments')
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    starRate = models.IntegerField()
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

"""