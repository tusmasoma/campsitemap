from django.contrib import admin
from .models import Spot,Comment,SpotImageUrl

admin.site.register(Spot)
admin.site.register(Comment)
admin.site.register(SpotImageUrl)