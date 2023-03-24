from django.urls import path
#from .views import index_view,jsonupload_view,detail_campsite,detail_spa,detail_conveniencestore
from .views import index_view,jsonupload_view,detail_spot_view,add_comment_view,delete_spot_view
app_name='campsite'
urlpatterns = [
    path('',index_view,name='index'),
    path('upload/',jsonupload_view,name='upload'),
    path('spot/<int:pk>/detail/',detail_spot_view,name='spot-detail'),
    path('spot/<int:pk>/delete/',delete_spot_view,name='spot-delete'),
    path('add/comment/',add_comment_view,name='add-comment')
]
"""
    path('upload/',jsonupload_view,name='upload'),
    path('campsite/<int:pk>/detail/',detail_campsite,name='campsite-detail'),
    path('spa/<int:pk>/detail/',detail_spa,name='spa-detail'),
    path('conveniencestore/<int:pk>/detail/',detail_conveniencestore,name='conveniencestore-detail')
"""