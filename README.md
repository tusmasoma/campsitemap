# CampsiteFinder
## 公開日
2023年3月29日

https://campfinderjp.com/

![campfinderQR](QR_194973.png)

## 開発動機
北海道をその日任せで自転車旅行している時に、最寄りのキャンプ場・温泉・コンビニの情報を求めたのですが、検索が煩雑な上に情報の内容も鮮度も劣り、苦労しました。自転車仲間も同じ不便さを嘆いていたことから、これを解決できるサイトを作ろうと思いました。

## サイトの特徴
「CampFinder」はGoogle map上にキャンプ場・温泉・コンビニのアイコンが並び、これをタッチすると画像が現れ、さらに詳細情報（住所、電話番号、営業期間、入場料など）が表示されます。また、サイドバーからスポットの絞り込みができ、キャンプ場、温泉、コンビニの個別表示も可能です。これにより、最寄りのスポットを検索する際の煩雑さを解消することができます。

特に、特徴的なのが各施設の” Description”の表記で、ChatGPT のAPIを用いて、数個から数十個あるGoogle 評価コメントを”Chat GPT” に読み込ませ、要約させている点。これにより情報の客観性と鮮度を自動的に得ています。要約時には悪意ある評価や過大な広告的な書き込みは無視されるよう ”Chat GPT” に指示しています。

## サイトの使い方
- デフォルトでいくつかのキャンプ場が表示されており、zoomすることにより表示される数が増えます。また、サイドバーから表示するスポットを絞り込めます。

<img src="S__91955202.jpg" width="320">　<img src="S__91955204.jpg" width="320">　<img src="S__91955208.jpg" width="320">

<br>

- スポットのiconをクリックすることで、情報ウィンドウが出現し、もう一度クリックすると詳細画面に飛びます
 
<img src="S__91955205.jpg" width="320">　　　　<img src="S__91955206.jpg" width="320">

<br>

- コメント機能、検索機能も実装しています。

<img src="S__91955207.jpg" width="320">　　　　<img src="S__91955209.jpg" width="320">

## 制作環境（サーバー環境や使用ツール）と使用言語
- フロントエンド言語 (HTML,CSS,JavaScript)
- バックエンド言語 (Python)
- フレームワーク (Django)
- データベース (PostgreSQL)
- webサーバー (Nginx)
- クラウドサービス (AWS)

## なぜPythonなのか？
バックエンド言語としてPythonを選んだ理由は二つあります。

①Django REST Frameworkを使用することで、APIを作成してGoogle Mapsとのデータのやり取りを簡単に行えるため。

②将来的に機械学習を利用したサービスを組み込む予定があるため、機械学習のライブラリが豊富なPythonを使えば、機械学習のモデル構築やデータの前処理を容易に行うことができるため。

以上の理由から、Pythonを選択した方が、APIの開発とGoogle Mapsとのデータ連携の効率化や将来的な機械学習の統合において有利であると考えました。

## なぜNginxなのか？
webサーバーとしてNginxを選んだ理由は二つあります。

①CampFinderでは多くの静的コンテンツ(画像)を提供しているため、Nginxをリバースプロキシとして動作させることで、Webアプリケーションのパフォーマンスの向上を図るため。

② Nginxは非同期イベント駆動のアーキテクチャを採用しており、多数の同時接続や高トラフィックの環境でも高いパフォーマンスを発揮するため。

以上の理由から、CampFinderのような静的コンテンツが多いサイトでは、Nginxを選択した方が、静的コンテンツの配信の最適化や高いパフォーマンスが実現できると考えました。

## 工夫した点
- 詳細ページから地図ページに戻ってきた場合、詳細ページへ推移する前の地図の状態で表示されるように、ブラウザバックやlocalStrageを活用しました。

- localStrageにスポットの情報を一定時間保存することで、サーバーとの無駄な非同期処理を減らすようにしました。

```
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

```




