
class SearchMarker{
    constructor(controlMap){
        this.input = document.querySelector('input[type="search"]');
        this.resultList = document.querySelector('.searchResult');
        this.controlMap = controlMap
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
                self.resultList.innerHTML = filteredMarkerList.map(marker => `
                <li class="item">
                <a class="link" href="#"><i class="icon -center ${self.getIconClassByCategory(marker.category)}"></i>
                <p class="title">${marker.name}</p>
                </a>
                </li>
                `).join('');
                
                //クリックした検索結果からmarkerを設置する
                if(filteredMarkerList.length > 0){
                    self.setResultMarker(filteredMarkerList);
                }
            }else {
                // キーワードが空の場合は、結果をクリアする
                self.resultList.innerHTML = '';
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
    setResultMarker(filteredMarkerList){
        //クリックした検索結果からmarkerを設置する
        //クリックしたmarkerのみ表示され、他のmarkerは消す
        let self = this
        self.resultList.querySelectorAll('a').forEach((aTag) => {
            aTag.addEventListener('click', function(event) {
                event.preventDefault();
                const markerTitle = event.target.closest('.item').querySelector('.title').textContent;
                // マーカーnameに対応するマーカーを取得する
                const marker = filteredMarkerList.find(marker => marker.name === markerTitle);
                // マーカーが存在する場合は、その位置に地図の中心を移動する
                if (marker) {
                    if (self.controlMap.currentInfoWindow) { // 既に開いている情報ウィンドウがある場合は閉じる
                        self.controlMap.currentInfoWindow.close();
                        self.controlMap.currentInfoWindow = null;
                    } 
                    self.controlMap.markerList.forEach(m => m.setVisible(false));
                    marker.setVisible(true);
                    self.controlMap.map.setCenter(marker.getPosition());
                    self.resultList.innerHTML = ''; //検索結果を削除
                    self.input.value = marker.name; //検索窓の中身を検索したspotnameに
                }
            })
        })
    }
}