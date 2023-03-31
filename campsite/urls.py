from django.urls import path
from .views import index_view,jsonupload_view,detail_spot_view,add_comment_view,delete_spot_view,about_us_view
app_name='campsite'
urlpatterns = [
    path('',index_view,name='index'),
    path('upload/',jsonupload_view,name='upload'),
    path('spot/<int:pk>/detail/',detail_spot_view,name='spot-detail'),
    path('spot/<int:pk>/delete/',delete_spot_view,name='spot-delete'),
    path('add/comment/',add_comment_view,name='add-comment'),
    path('about/us/',about_us_view,name='about-us')
]