"""campsiteproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from campsite.models import Spot,SpotImageUrl
from django.urls import path,include
from rest_framework import routers, serializers, viewsets

#シリアライザーを使用することで、APIレスポンスやPOSTリクエストのデータ変換などを簡単に実装することができます。
#PythonオブジェクトをJSON形式やXML形式などのシリアル化されたデータに変換することができます。また、逆に、シリアル化されたデータをPythonオブジェクトに変換することもできます。
class SpotImageUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpotImageUrl
        fields = ('url',)

class SpotSerializer(serializers.HyperlinkedModelSerializer):
    spot_image_url = SpotImageUrlSerializer(many=True, read_only=True)
    class Meta:
        model = Spot
        fields = ('id','key','category','name', 'address', 'lat', 'lng', 'period', 'phone', 'price', 'description','iconpath','spot_image_url')

#CampsiteViewSetで取得したCampsiteモデルのデータ(queryset)は、CampsiteSerializerクラスによってシリアル化されてレスポンスされます。
class CampsiteViewSet(viewsets.ModelViewSet):
    queryset = Spot.objects.filter(category = 'campsite')
    serializer_class = SpotSerializer

class SpaViewSet(viewsets.ModelViewSet):
    queryset = Spot.objects.filter(category = 'spa')
    serializer_class = SpotSerializer

class ConvenienceStoreViewSet(viewsets.ModelViewSet):
    queryset = Spot.objects.filter(category = 'conveniencestore')
    serializer_class = SpotSerializer


#DefaultRouterは、ビューセットを自動的にルーティングすることができる、便利なルーターの一種です。
#ルーターにビューセットを登録することで、ビューに対応するURLを自動的に生成することができます。
#この場合、router.registerメソッドを使用して、CampsiteViewSetをcustomerという名前のルートに登録しています。
#つまり、このAPIのエンドポイントは、/api/customer/になります。router.urlsをurlpatternsに追加することで、ルーターが生成したURLをアプリケーションのURLに追加することができます。
router = routers.DefaultRouter()
router.register(r'campsite', CampsiteViewSet)
router.register(r'spa', SpaViewSet)
router.register(r'conveniencestore', ConvenienceStoreViewSet)

urlpatterns = [
    path('admin/', admin.site.urls,name='admin'),
    #path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/', include('accounts.urls')),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('',include('campsite.urls'))
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)