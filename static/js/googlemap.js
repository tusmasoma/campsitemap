
class ControlMap {
    constructor(map) {
        this.map = map;
        this.markerList = [];
        this.currentInfoWindow = null; 
    }

    asynchronousprocessing() {
        /*
        非同期処理を開始します
        */
        let self = this; // thisを別の変数に代入する
        Promise.all([
            self.getData('api/campsite/?format=json'),
            self.getData('api/spa/?format=json'),
            self.getData('api/conveniencestore/?format=json')
        ]).then(function(results) {
            // set markers with results
            self.setMarker(results[0]); // for campsite
            self.setMarker(results[1]); // for spa
            self.setMarker(results[2]); // for conveniencestore
        }).catch(function(error) {
            console.error(error);
        });
    }
    spotAsynchronousprocessing(url) {
        const self = this; // thisを別の変数に代入する
        Promise.all([
            self.getData(url),
        ]).then(function(results) {
            // set markers with results
            self.setSpotMarker(results[0]); // for campsite
        }).catch(function(error) {
            console.error(error);
        });
    }
    getData(url) {
        return new Promise(function(resolve, reject) {
            //XMLHttpRequestオブジェクトの作成
            var xhttp = new XMLHttpRequest();
            //onreadystatechangeイベントの指定(XMLHttpRequestオブジェクトのreadyStateプロパティが変化したら発火)
            xhttp.onreadystatechange = function () {
              //http通信のリクエスト処理が終了(readyState == 4)かつ、通信成功(status == 200)したら、
              //通信データ(responseText)をjson形式にパースし、setMarker関数を実行する
              if (this.readyState == 4) {
                if (this.status == 200) {
                  resolve(JSON.parse(this.responseText));
                } else {
                  reject(new Error('Failed to load data: ' + url));
                }
              }
            };
            //サーバーとの接続
            xhttp.open('GET', url, true);
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send();
        });
    }

    setSpotMarker(jsonObj){
        for(let i = 0;i < jsonObj.length;i++) {
            //markerごとに情報ウィンドウを作成
            if(jsonObj[i].spot_image_url.length === 0){
                jsonObj[i].spot_image_url = [{"url":"https://thumb.ac-illust.com/39/3920178d66157451930de97cc5431a64_t.jpeg"}]
            }
            let infowindow =new google.maps.InfoWindow({
                content: `<a href="spot/${jsonObj[i].id}/detail"><div class="place-window">
                <img class="view" src="${jsonObj[i].spot_image_url[0].url}" alt="デモ画像" decoding="async" style="width: 200px; height: 150px;">
                <div class="name">
                <p class="body">${jsonObj[i].name}</p>
                </div>
                </div></a>
                `
            });

            let marker = new google.maps.Marker({
                position: { lat: Number(jsonObj[i].lat) , lng: Number(jsonObj[i].lng) },
                map: this.map,
                visible: true,
                icon: {
                    url: jsonObj[i].iconpath,
                    scaledSize: new google.maps.Size(32,45.76) // 新しいサイズを指定
                }
            });

            this.bindInfoWindow(marker,infowindow)

            this.markerList.push(marker)

        }
    }

    setMarker(jsonObj){
        /*
        setMarker関数は引数のspotの配列をもとにgooglemap上にspotのマーカーを配置します
        */
        for(let i = 0;i < jsonObj.length;i++) {
            //markerごとに情報ウィンドウを作成
            if(jsonObj[i].spot_image_url.length === 0){
                jsonObj[i].spot_image_url = [{"url":"https://thumb.ac-illust.com/39/3920178d66157451930de97cc5431a64_t.jpeg"}]
            }
            let infowindow =new google.maps.InfoWindow({
                content: `<a href="spot/${jsonObj[i].id}/detail"><div class="place-window">
                <img class="view" src="${jsonObj[i].spot_image_url[0].url}" alt="デモ画像" decoding="async" style="width: 200px; height: 150px;">
                <div class="name">
                <p class="body">${jsonObj[i].name}</p>
                </div>
                </div></a>
                `
            });

            let marker = new google.maps.Marker({
                position: { lat: Number(jsonObj[i].lat) , lng: Number(jsonObj[i].lng) },
                map: this.map,
                visible: false,
                icon: {
                    url: jsonObj[i].iconpath,
                    scaledSize: new google.maps.Size(32,45.76) // 新しいサイズを指定
                }
            });
            // 地図をズームして特定のレベル（ここでは10）までズームされた場合にマーカーを表示する
            google.maps.event.addListener(map, 'zoom_changed', function() {
                if(jsonObj[i].category === 'campsite'){
                    if(map.getZoom() >= 8){
                        marker.setVisible(true);
                    }else{
                        marker.setVisible(false);
                    }
                }else if (jsonObj[i].category === 'spa'){
                    if (map.getZoom() >= i%7+8) {
                        marker.setVisible(true);
                    } else {
                        marker.setVisible(false);
                    }
                }else if (jsonObj[i].category === 'conveniencestore'){
                    if (map.getZoom() >= 16) {
                        marker.setVisible(true)
                    } else {
                        marker.setVisible(false)
                    }
                }
            });

            this.bindInfoWindow(marker,infowindow)

            this.markerList.push(marker)
        }
    }

    bindInfoWindow(marker,infoWindow){
        let self = this //thisのままだと、this.currentInfoWindow の this は marker を参照する
        //markerをクリックしたら、情報ウィンドウを閉じる
        marker.addListener('click',function (){
            if (self.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                self.currentInfoWindow.close();
            }
            infoWindow.open(this.map, marker);
            self.currentInfoWindow = infoWindow; // currentInfoWindowを更新
        })
    }

    removeMarkers(){
        for (let i = 0; i < this.markerList.length; i++) {
            this.markerList[i].setMap(null);
        }
        this.markerList = [];
    }
}


function initMap() {
    const allSpot = document.querySelector('#allspot');
    const campsiteSqueeze = document.querySelector('#campsiteSqueeze');
    const spaSqueeze = document.querySelector('#spaSqueeze');
    const cStoreSqueeze = document.querySelector('#cStoreSqueeze');
    //google.maps.Mapオブジェクトを初期化し、特定のhtml要素内にGoogleMapを表示します
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 43.5882, lng: 142.467 },
      zoom: 6,
      gestureHandling: "greedy",
      //mapTypeControl: false, // マップタイプコントロールを非表示にする
      styles: [
        {
          featureType: 'poi',
          stylers: [{visibility: 'off'}]
        }
      ]
    });
    
    let controlMap = new ControlMap(map)
    controlMap.asynchronousprocessing()

    allSpot.addEventListener('click',function(){
        controlMap.removeMarkers()
        controlMap.asynchronousprocessing()
    })
    campsiteSqueeze.addEventListener('click',function() {
        controlMap.removeMarkers()
        controlMap.spotAsynchronousprocessing('api/campsite/?format=json')
    })
    spaSqueeze.addEventListener('click',function(){
        controlMap.removeMarkers()
        controlMap.spotAsynchronousprocessing('api/spa/?format=json')
    })
    cStoreSqueeze.addEventListener('click',function(){
        controlMap.removeMarkers()
        controlMap.spotAsynchronousprocessing('api/conveniencestore/?format=json')
    })
}
