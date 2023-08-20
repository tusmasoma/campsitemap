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
        /** 
        * 1日以内に非同期処理が行われている場合、ローカルストレージに保存された結果を使用する。
        * それ以外の場合、非同期処理を行う。
        */
        const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 1日のミリ秒数
        const lastProcessTime = localStorage.getItem("lastProcessTime");
        if (lastProcessTime && Date.now() - lastProcessTime < ONE_DAY_IN_MS) {
            this._useStoredDataOrFetch();
        } else {
            this._fetchDataAndUpdateTime();
        }
    }
    _useStoredDataOrFetch() {
        for (let category of this.category) {
            const savedResult = localStorage.getItem(`${category}Result`);
            if (savedResult) {
                this.setMarker(JSON.parse(savedResult));
            } else {
                this._fetchSingleCategoryData(`api/${category}/?format=json`, category)
            }
        }
    }
    _fetchDataAndUpdateTime() {
        this._fetchAllCategoryData();
        localStorage.setItem("lastProcessTime", Date.now());
    }

    _fetchAllCategoryData() {
        const promises = this.category.map(category => this._fetchSingleCategoryData(`api/${category}/?format=json`, category));

        Promise.all(promises)
        .then(() => console.log('All data retrieved and markers set!'))
        .catch(error => console.error('Error fetching category data:', error));
    }

    _fetchSingleCategoryData(url,category) {
        return this._getData(url)
        .then( result => {
            localStorage.setItem(`${category}Result`, JSON.stringify(result)); 
            this.setMarker(result);
        })
        .catch(error => console.error(`Error fetching data for category ${category}:`, error));
    }

    _getData(url) {
        return fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( response => {
            if (!response.ok) {
                throw new Error(`Failed to load data from ${url}. Status: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
    }

    setMarker(jsonObj){
        /*
        setMarker関数は引数のspotの配列をもとにgooglemap上にspotのマーカーを配置します
        */
        const DEFAULT_IMAGE_URL = "https://thumb.ac-illust.com/39/3920178d66157451930de97cc5431a64_t.jpeg";
        
        jsonObj.forEach(spot => {
            if (spot.spot_image_url.length === 0) {
                spot.spot_image_url = [{'url':DEFAULT_IMAGE_URL}];
            }

            const infoWindow = this._createInfoWindow(spot);
            const marker = this._createMarker(spot);
            this._bindInfoWindow(marker,infoWindow);
            this.markerList.push(marker)
        });

        this.map.setZoom(this.map.getZoom()); //setMarkerメソッドのデフォルトのmarkerはvisible:flaseより、zoom変化させてvisible:trueにする
    }

    _createInfoWindow(spot) {
        const content = `
        <a href="spot/${spot.id}/detail">
            <div class="place-window">
                <img class="view" src="${spot.spot_image_url[0].url}" alt="デモ画像" decoding="async" style="width: 200px; height: 150px;">
                <div class="name">
                    <p class="body">${spot.name}</p>
                </div>
            </div>
        </a>
        `
        return new google.maps.InfoWindow({ content })
    }
    _createMarker(spot) {
        const marker = new google.maps.Marker({
            position: { lat: Number(spot.lat), lng: Number(spot.lng) },
            map: this.map,
            visible: false,
            icon: {
                url: spot.iconpath,
                scaledSize: new google.maps.Size(32, 45.76)
            },
            zIndex: spot.category === 'campsite' ? 1 : 0,
            name: spot.name,
            category: spot.category,
        });

        const updateMarkerVisibility = _.debounce(() => {
            const isMarkerInBounds = this.map.getBounds().contains(marker.getPosition());
            const zoomLevel = this.map.getZoom();
    
            if (isMarkerInBounds) {
                if (spot.category === 'campsite' && (zoomLevel >= spot.id % 7 + 6 || zoomLevel >= 9)) {
                    marker.setVisible(true);
                } else if (spot.category === 'spa' && (zoomLevel >= spot.id % 15 + 6 || zoomLevel >= 10)) {
                    marker.setVisible(true);
                } else {
                    marker.setVisible(false);
                }
            } else {
                marker.setVisible(false);
            }
        }, 1000);

        google.maps.event.addListener(this.map, 'dragend', updateMarkerVisibility);
        google.maps.event.addListener(this.map, 'zoom_changed', updateMarkerVisibility);
        
        return marker;
    }

    _bindInfoWindow(marker,infoWindow){
        //markerをクリックしたら、情報ウィンドウを閉じる
        marker.addListener('click',() => {
            if (this.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                this.currentInfoWindow.close();
                this.currentInfoWindow = null
            }

            infoWindow.open(this.map, marker);
            this.currentInfoWindow = infoWindow; // currentInfoWindowを更新
        })

        //情報ウィンドウの閉じるボタンをクリックしたら、localStorageのmapStateの削除
        google.maps.event.addListener(infoWindow, 'closeclick',  function() {
            infoWindow.close();
            localStorage.removeItem("mapState");
        });
    }

    removeMarkers(){
        this.markerList.forEach(marker => marker.setMap(null));
        this.markerList = [];
    }

    saveMapState() {
        //現在の情報ウィンドウがある場合のマーカーとその位置を取得
        const marker = this.currentInfoWindow ? this.currentInfoWindow.getAnchor() : null;
        const iconPath = marker ? marker.getIcon().url :null;
        const infoWindowPosition = this.currentInfoWindow ? this.currentInfoWindow.getPosition() : null;

        //マップの状態を保存するオブジェクトを作成
        const mapState = {
            center: this.map.getCenter(), 
            zoom: this.map.getZoom(), 
            marker: marker ? JSON.stringify(marker,getCircularReplacer()) : null, 
            iconPath: iconPath,
            infoWindowPosition: infoWindowPosition ? JSON.stringify(infoWindowPosition,getCircularReplacer()) : null, 
            infoWindowContent: this.currentInfoWindow ? this.currentInfoWindow.getContent() : null, 
        };

        // 以前のマップの状態を削除して新しい状態を保存
        localStorage.removeItem("mapState");
        localStorage.setItem("mapState", JSON.stringify(mapState,getCircularReplacer()));
    }
    
    // 5. Geolocation APIを使用して現在地を取得する
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // 取得成功時のコールバック関数
                (position) => {
                    // 現在地を取得する
                    const currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    // 6. 取得した現在地をマップ上に表示する
                    map.setCenter(currentLocation);
                    new google.maps.Marker({
                        position: currentLocation,
                        map: map,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#3366CC",
                            fillOpacity: 0.7,
                            strokeWeight: 1,
                            strokeColor: "#3366CC",
                            strokeOpacity: 0.8
                          },
                    });
                },
                // 取得失敗時のコールバック関数
                () => {
                    alert('現在地の取得に失敗しました。');
                }
            );
        } else {
            alert('現在地を取得する機能がありません。');
        }
    }
}


function mapApp() {
    const allSpot = document.querySelector('#allspot');

    let controlMap = new ControlMap(map);
    controlMap.control();

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
        controlMap.saveMapState();
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
        toggleBackgroundColor(allSpot);
        controlMap.removeMarkers();
        controlMap.control();
    })

    for(let i = 0; i < controlMap.category.length; i++){
        let Squeeze = document.querySelector(`#${controlMap.category[i]}Squeeze`);
        Squeeze.addEventListener('click',function() {
            toggleBackgroundColor(Squeeze);
            controlMap.removeMarkers();
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

function initMap() {
    /**googlemapを完全に読み込み終わってから、markerやらをsetする */

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

    google.maps.event.addListenerOnce(map, 'idle', mapApp)
}


function toggleBackgroundColor(itemElement) {
    const elements = document.querySelectorAll(".item");

    elements.forEach((element) => {
        if (element.style.backgroundColor === "rgb(221, 221, 221)") {
            element.style.removeProperty("background-color");
        }
    });
    if (itemElement.style.backgroundColor === "rgb(221, 221, 221)") {
        // background-colorが既に設定されている場合、削除する
        itemElement.style.removeProperty("background-color");
    } else {
        // background-colorが設定されていない場合、付与する
        itemElement.style.backgroundColor = "#DDDDDD";
    }
}