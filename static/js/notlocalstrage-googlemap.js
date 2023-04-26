
const getCircularReplacer = () => {
	const seen = new WeakSet()
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) {
				return
			}
			seen.add(value)
		}
		return value
	}
}

class ControlMap {
    constructor(map) {
        this.map = map;
        this.markerList = [];
        this.currentInfoWindow = null; 
        this.category = ["campsite","spa","conveniencestore"]
    }
    asynchronousprocessing() {
        /*
        非同期処理を開始します
        */
        let self = this;
        Promise.all([
            self.getData('api/campsite/?format=json').then(function(result) {
                self.setMarker(result); // for campsite
            }),
            self.getData('api/spa/?format=json').then(function(result) {
                self.setMarker(result); // for spa
            }),
            self.getData('api/conveniencestore/?format=json').then(function(result) {
                self.setMarker(result); // for conveniencestore
            })
        ]).then(function() {
            console.log('All data retrieved and markers set!');
        }).catch(function(error) {
            console.error(error);
        });
    }
    spotAsynchronousprocessing(url) {
        /**
         単独のspotの非同期処理
         */
        this.getData(url).then((result) => {
            this.setMarker(result);
        }).catch((error) => {
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
    setMarker(jsonObj){
        /*
        setMarker関数は引数のspotの配列をもとにgooglemap上にspotのマーカーを配置します
        */
        // カテゴリーが`campsite`の場合、zIndexを1にする
        const zIndex = (category) => {
            return category === 'campsite' ? 1 : 0;
        };
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
                },
                zIndex: zIndex(jsonObj[i].category),
            });
            // 地図をズームして特定のレベルまでズームされた場合にマーカーを表示
            let updatemarker =  _.debounce(() => {
                const bounds = map.getBounds();
                if(bounds.contains(marker.getPosition())){
                    if(jsonObj[i].category === 'campsite'){
                        if(map.getZoom() >= i%4+7 || map.getZoom() >=9){
                            marker.setVisible(true);
                        }else{
                            marker.setVisible(false);
                        }
                    }else if (jsonObj[i].category === 'spa'){
                        if (map.getZoom() >= i%10+7 || map.getZoom() >= 10) {
                            marker.setVisible(true);
                        } else {
                            marker.setVisible(false);
                        }
                    }
                }else{
                    marker.setVisible(false);
                }
            }, 1000)

            google.maps.event.addListener(map, 'dragend',updatemarker)
            google.maps.event.addListener(map, 'zoom_changed',updatemarker)

            this.bindInfoWindow(marker,infowindow)

            this.markerList.push(marker)

            map.setZoom(map.getZoom()) //setMarkerメソッドのデフォルトのmarkerはvisible:flaseより、zoom変化させてvisible:trueにする
        }
    }
    bindInfoWindow(marker,infoWindow){
        let self = this //thisのままだと、this.currentInfoWindow の this は marker を参照する
        //markerをクリックしたら、情報ウィンドウを閉じる
        marker.addListener('click',function (){
            if (self.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                self.currentInfoWindow.close();
                self.currentInfoWindow = null
            }
            infoWindow.open(this.map, marker);
            self.currentInfoWindow = infoWindow; // currentInfoWindowを更新
        })
        //情報ウィンドウの閉じるボタンをクリックしたら、localStorageのmapStateの削除
        google.maps.event.addListener(infoWindow, 'closeclick',  function() {
            infoWindow.close();
            localStorage.removeItem("mapState");
        });
    }
    removeMarkers(){
        for (let i = 0; i < this.markerList.length; i++) {
            this.markerList[i].setMap(null);
        }
        this.markerList = [];
    }
    saveMapState() {
        //mapの現在の状態(mapのzoom,mapのposition,情報ウィンドウの情報,情報ウィンドウに紐づくmarkerの情報)を保存する
        localStorage.removeItem("mapState");
        let marker = this.currentInfoWindow ? this.currentInfoWindow.getAnchor() : null;
        let iconPath = marker ? marker.getIcon().url :null;
        let infoWindowPosition = this.currentInfoWindow ? this.currentInfoWindow.getPosition() : null;
        //以下のマップの状態をlocalStorageに保存しています。
        let mapState = {
            center: this.map.getCenter(), //マップの中心座標
            zoom: this.map.getZoom(), //マップのズームレベル
            marker: marker ? JSON.stringify(marker,getCircularReplacer()) : null, //現在選択されているマーカー（InfoWindowオブジェクトに紐づく）
            iconPath: iconPath,
            infoWindowPosition: infoWindowPosition ? JSON.stringify(infoWindowPosition,getCircularReplacer()) : null, //現在選択されているInfoWindowの座標
            infoWindowContent: this.currentInfoWindow ? this.currentInfoWindow.getContent() : null, //現在選択されているInfoWindowの内容
        };
        localStorage.setItem("mapState", JSON.stringify(mapState,getCircularReplacer()));
    }
}


function initMap() {
    const allSpot = document.querySelector('#allspot');

    //google.maps.Mapオブジェクトを初期化し、特定のhtml要素内にGoogleMapを表示します
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 43.5882, lng: 142.467 },
      zoom: 6,
      maxZoom: 18,
      minZoom: 4,
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
    //localStrageにあるcampsite,spa,c-storeのデータの削除
    for(let i = 0; i < controlMap.category.length; i++){
        let savedResult = localStorage.getItem(`${controlMap.category[i]}Result`);
        if (savedResult) {
            localStorage.removeItem(`${controlMap.category[i]}Result`);
        }
    }
    /** 
    // ローカルストレージから地図の状態を復元する
    let savedMapState = localStorage.getItem("mapState");
    if (savedMapState) {
        savedMapState = JSON.parse(savedMapState);
         // Markerの復元
        const markerData = JSON.parse(savedMapState.marker);  //JSON形式のデータをobjectに変換
        //console.log(markerData)
        if (markerData) {
            map.setCenter(new google.maps.LatLng(savedMapState.center.lat, savedMapState.center.lng));
            map.setZoom(savedMapState.zoom);
            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(markerData.position.lat, markerData.position.lng),
                map: map,
                visible: true,
                icon: {
                    url: savedMapState.iconPath,
                    scaledSize: new google.maps.Size(32,45.76) // 新しいサイズを指定
                },
                zIndex: 1
            });
            controlMap.markerList.push(marker)
            google.maps.event.addListener(map, 'zoom_changed',()=>{
                if(map.getZoom() <= 6){
                    marker.setVisible(false)
                }
            })
            // InfoWindowの復元
            const infoWindowPosition = JSON.parse(savedMapState.infoWindowPosition); //JSON形式のデータをobjectに変換
            let infoWindow = new google.maps.InfoWindow({
                position: new google.maps.LatLng(infoWindowPosition.lat, infoWindowPosition.lng),
                content: savedMapState.infoWindowContent
            });
            // infoWindowを開く
            infoWindow.open(map,marker);
            controlMap.currentInfoWindow = infoWindow; // currentInfoWindowを更新
            //情報ウィンドウの閉じるボタンをクリックしたら、localStorageのmapStateの削除
            google.maps.event.addListener(controlMap.currentInfoWindow, 'closeclick',  function() {
                controlMap.currentInfoWindow.close();
                controlMap.currentInfoWindow = null;
                localStorage.removeItem("mapState");
            });
        }
    }

    window.addEventListener("beforeunload", function() {
        controlMap.saveMapState()
    });*/

    google.maps.event.addListener(map, 'zoom_changed',()=>{
        if(map.getZoom() <= 6){
            if (controlMap.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                controlMap.currentInfoWindow.close();
                controlMap.currentInfoWindow = null;
            } 
        }
    })

    allSpot.addEventListener('click',function(){
        controlMap.removeMarkers()
        controlMap.asynchronousprocessing()
        map.setZoom(map.getZoom())
    })

    for(let i = 0; i < controlMap.category.length; i++){
        let Squeeze = document.querySelector(`#${controlMap.category[i]}Squeeze`);
        Squeeze.addEventListener('click',function() {
            controlMap.removeMarkers()
            if (controlMap.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                controlMap.currentInfoWindow.close();
                controlMap.currentInfoWindow = null
            }
            controlMap.spotAsynchronousprocessing(`api/${controlMap.category[i]}/?format=json`)
            map.setZoom(map.getZoom()) //setMarkerメソッドのデフォルトのmarkerはvisible:flaseより、zoom変化させてvisible:trueにする
        })
    }
}