from rest_framework import routers, serializers, viewsets
from .models import Spot,SpotImageUrl

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
