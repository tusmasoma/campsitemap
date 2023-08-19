from django.urls import path,include
from .views import CampsiteViewSet,SpaViewSet,ConvenienceStoreViewSet,index_view,jsonupload_view,detail_spot_view,add_comment_view,delete_comment_view,delete_spot_view,about_us_view
from rest_framework import routers

app_name='campsite'

#DefaultRouterは、ビューセットを自動的にルーティングすることができる、便利なルーターの一種です。
#ルーターにビューセットを登録することで、ビューに対応するURLを自動的に生成することができます。
#この場合、router.registerメソッドを使用して、CampsiteViewSetをcustomerという名前のルートに登録しています。
#つまり、このAPIのエンドポイントは、/api/customer/になります。router.urlsをurlpatternsに追加することで、ルーターが生成したURLをアプリケーションのURLに追加することができます。
router = routers.DefaultRouter()
router.register(r'campsite', CampsiteViewSet)
router.register(r'spa', SpaViewSet)
router.register(r'conveniencestore', ConvenienceStoreViewSet)

urlpatterns = [
    path('',index_view,name='index'),
    path('upload/',jsonupload_view,name='upload'),
    path('spot/<int:pk>/detail/',detail_spot_view,name='spot-detail'),
    path('spot/<int:pk>/delete/',delete_spot_view,name='spot-delete'),
    path('comment/add',add_comment_view,name='add-comment'),
    path('comment/<int:pk>/delete',delete_comment_view,name='delete-comment'),
    path('about/us/',about_us_view,name='about-us'),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]