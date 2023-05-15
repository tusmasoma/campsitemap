
class SearchMarker{
    constructor(controlMap){
        this.input = document.querySelector('input[type="search"]');
        this.controlMap = controlMap
        this.searchOpenerEl = document.querySelector('.main-header > .container > .searchOpener');
        this.searchFormEl = document.querySelector('.main-header > .container > .searchForm');
        this.searchFormLabelEl = document.querySelector('.main-header > .container > .searchForm > .label > .icon');
        this.searchCloserEl= document.querySelector('.main-header > .container > .searchCloser');
        this.searchResultEl = document.querySelector('.main-header > .searchResult');
        this.maskEl = document.querySelector('.page-wrapper > .content-mask');
        this.gnavTriggerEl = document.querySelector('.main-header > .container > .gnavTrigger');
        this.gNavEl = document.querySelector('.main-header > .gNav');

    }
    /**
     * 検索窓に入力された情報からspotを検索
     * 検索結果からspotを選択し、選択されたspotのmarkerを表示する
     */
    searchSpot(){
        let self = this; // 変数selfを追加する
        // Enterキーが押された場合にsubmitイベントをキャンセルする
        self.input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });

        // 検索ボックスの値が変更されたら、検索を実行する
        self.input.addEventListener('input', function(event) {
            const keyword = event.target.value.trim();
            if (keyword !== '') {
                const filteredMarkerList = self.controlMap.markerList.filter(marker => marker.name.includes(keyword)).slice(0, 10);
                // 検索結果を resultList に挿入する
                self.searchResultEl.innerHTML = filteredMarkerList.map(marker => `
                <li class="item">
                <a class="link" href="#"><i class="icon -center ${self.getIconClassByCategory(marker.category)}"></i>
                <p class="title">${marker.name}</p>
                </a>
                </li>
                `).join('');
                
                //クリックした検索結果からmarkerを設置する
                if(filteredMarkerList.length > 0){
                    self.setResult(filteredMarkerList);
                }
            }else {
                // キーワードが空の場合は、結果をクリアする
                self.searchResultEl.innerHTML = '';
            }
        });
    }

    /**
     * 引数に指定したcategoryから適切なclass名を返す
     */
    getIconClassByCategory(category) {
        switch (category) {
            case 'campsite':
                return 'fa-solid fa-tent';
            case 'spa':
                return 'fa-solid fa-shower';
            case 'conveniencestore':
                return 'fa-sharp fa-solid fa-store';
            default:
                return 'fas fa-map-marker-alt';
        }
    }

    /**
     * 検索結果から選択したspotのmarkerを設置する
     */
    setResult(filteredMarkerList){
        //クリックした検索結果からmarkerを設置する
        //クリックしたmarkerのみ表示され、他のmarkerは消す
        let self = this
        self.searchResultEl.querySelectorAll('a').forEach((aTag) => {
            aTag.addEventListener('click', function(event) {
                event.preventDefault();
                const markerTitle = event.target.closest('.item').querySelector('.title').textContent;
                // マーカーnameに対応するマーカーを取得する
                const marker = filteredMarkerList.find(marker => marker.name === markerTitle);
                // マーカーが存在する場合は、その位置に地図の中心を移動する
                if (marker) {
                    self.resetAll() //検索前にresetする
                    self.setResultMarker(marker) //検索結果をmap上にセット
                    self.input.value = marker.name; //検索窓の中身を検索したspotnameに
                }
            })
        })
    }

    /**
     * 検索前にreset
     */
    resetAll(){
        const searchOpener = new DisplaySwitcher(this.searchOpenerEl);
        const searchForm = new DisplaySwitcher(this.searchFormEl);
        const searchCloser = new DisplaySwitcher(this.searchCloserEl);
        const searchResult = new DisplaySwitcher(this.searchResultEl);
        const mask = new DisplaySwitcher(this.maskEl);
        searchOpener.open();
        searchForm.close();
        searchCloser.close();
        searchResult.close();
        mask.close();
    }

    /**
     * setMarker
     */
    setResultMarker(marker){

        google.maps.event.clearListeners(map, 'zoom_changed'); //setZoom実行時に、既存のイベントによりmarkerの表示がされないため、イベントを初期化する
        google.maps.event.clearListeners(map, 'dragend');

        if (this.controlMap.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
            this.controlMap.currentInfoWindow.close();
            this.controlMap.currentInfoWindow = null;
        } 
        this.controlMap.markerList.forEach(m => m.setMap(null)); //mapに表示されているmarkerをすべて削除

        marker.visible = true //markerのデフォルトがvisible:fasleのものがあるため
        marker.setMap(this.controlMap.map);

        this.controlMap.map.fitBounds(this.controlMap.map.getBounds());  // 可視領域を更新しないと、markerが可視領域に入っていてもmap.getBounds().contains(marker.getPosition())がfalseになる

        this.zoomMapToLevel(marker)

    }

    zoomMapToLevel(marker) {
        const map = this.controlMap.map;
        
        // 指定したmarkerが現在のzoomレベルに入っている場合
        if (map.getBounds().contains(marker.getPosition())) {
            // マップの中心をマーカーに合わせる
            map.setZoom(10);
            map.setCenter(marker.getPosition());
            return;
        }

        const interval = setInterval(() => {
          // 現在のズームレベルを取得
          let currentZoom = map.getZoom();
      
          // 指定したmarkerが範囲に入るまでズームレベルまでズームアウト
          if (!map.getBounds().contains(marker.getPosition())) {
            map.setZoom(currentZoom - 1);
            map.fitBounds(map.getBounds()); // 可視領域を更新
          } else {
            clearInterval(interval);
            // ズームが終了した後に中心点を移動する
            const panOptions = {
                duration: 500, // 移動時間（ミリ秒）
                easing: "linear", // 移動アニメーションのタイプ
            };
            map.panTo(marker.getPosition(), panOptions);
        }
        }, 100);
    }      
}