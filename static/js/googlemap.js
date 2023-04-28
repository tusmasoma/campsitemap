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
    control() {
        //ローカルストレージに "results" が保存されている場合にはその値を使ってマーカーをセットし、そうでない場合には非同期処理を開始するようになっています。
        //これにより無駄な非同期処理を減らします。
        //一定時間以上経過している場合には再度非同期処理を行う
        const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 1日のミリ秒数
        let lastProcessTime = localStorage.getItem("lastProcessTime");
        if (lastProcessTime && Date.now() - lastProcessTime < ONE_DAY_IN_MS) {
            // 1日以内に処理が行われているため、保存された結果を使用する
            for(let i = 0;i < this.category.length;i++){
                let savedResult = localStorage.getItem(`${this.category[i]}Result`);
                if (savedResult) {
                    savedResult = JSON.parse(savedResult);
                    this.setMarker(savedResult); 
                    console.log("localstorage")
                } else {
                    // データが保存されていない場合は再度非同期処理を行う
                    this.spotAsynchronousprocessing(`api/${this.category[i]}/?format=json`,this.category[i])
                    console.log("not localstorage")
                }
            }
        } else {
            // 前回の処理から1日以上経過している場合は再度非同期処理を行う
            this.asynchronousprocessing();
            // 現在時刻を保存する
            localStorage.setItem("lastProcessTime", Date.now());
        }
    }

    asynchronousprocessing() {
        /*
        非同期処理を開始します
        */
        let self = this;
        Promise.all([
            self.getData('api/campsite/?format=json').then(function(result) {
                localStorage.setItem('campsiteResult', JSON.stringify(result)); //localStorageにresultを保持することで無駄な非同期処理を減らす
                self.setMarker(result); // for campsite
            }),
            self.getData('api/spa/?format=json').then(function(result) {
                localStorage.setItem('spaResult', JSON.stringify(result)); //localStorageにresultを保持することで無駄な非同期処理を減らす
                self.setMarker(result); // for spa
            }),
            self.getData('api/conveniencestore/?format=json').then(function(result) {
                localStorage.setItem('conveniencestoreResult', JSON.stringify(result)); //localStorageにresultを保持することで無駄な非同期処理を減らす
                self.setMarker(result); // for conveniencestore
            })
        ]).then(function() {
            console.log('All data retrieved and markers set!');
        }).catch(function(error) {
            console.error(error);
        });
    }
    spotAsynchronousprocessing(url,category) {
        /**
         単独のspotの非同期処理
         */
        this.getData(url).then((result) => {
            this.setMarker(result);
            localStorage.setItem(`${category}Result`, JSON.stringify(result)); //localStorageにresultを保持することで無駄な非同期処理を減らす
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
                name: jsonObj[i].name, // マーカーの場所名を設定する
                category: jsonObj[i].category, //マーカーのcategory(campsite,spa,conviniencestore)を設定する
            });
            // 地図をズームして特定のレベルまでズームされた場合にマーカーを表示
            let updatemarker =  _.debounce(() => {
                const bounds = map.getBounds();
                if(bounds.contains(marker.getPosition())){
                    if(marker.category === 'campsite'){
                        if(map.getZoom() >= i%4+7 || map.getZoom() >=9){
                            marker.setVisible(true);
                        }else{
                            marker.setVisible(false);
                        }
                    }else if (marker.category === 'spa'){
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
        }
        map.setZoom(map.getZoom()) //setMarkerメソッドのデフォルトのmarkerはvisible:flaseより、zoom変化させてvisible:trueにする
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
    let controlMap = new ControlMap(map);
    controlMap.control()

    // ローカルストレージから地図の状態を復元する
    let savedMapState = localStorage.getItem("mapState");
    let savedNotHistoryBack = localStorage.getItem("notHistoryBack");
    if (savedMapState && savedNotHistoryBack === "true") {
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
        localStorage.removeItem("notHistoryBack") //localstrageに残っていると、初期化されるたびにmapstateが行われるのを防ぐ
    }

    window.addEventListener("beforeunload", function() {
        if (!(history.pushState && history.state !== undefined)) {
            controlMap.saveMapState()
        }
    });
    

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
        controlMap.control()
    })

    for(let i = 0; i < controlMap.category.length; i++){
        let Squeeze = document.querySelector(`#${controlMap.category[i]}Squeeze`);
        Squeeze.addEventListener('click',function() {
            controlMap.removeMarkers()
            if (controlMap.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                controlMap.currentInfoWindow.close();
                controlMap.currentInfoWindow = null
            }
            let savedResult = localStorage.getItem(`${controlMap.category[i]}Result`);
            savedResult = JSON.parse(savedResult);
            controlMap.setMarker(savedResult); 
        })
    }

    const searchInstace = new SearchMarker(controlMap)
    searchInstace.searchSpot()
}