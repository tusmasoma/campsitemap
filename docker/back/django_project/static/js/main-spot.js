
'use strict';

(() => {

const tabElementArray = [
  document.querySelector('.main-spot > .container > .tabMenu > .detail'),
  document.querySelector('.main-spot > .container > .tabMenu > .comment'),
];

// 初期化時にイベントを設定
const tabMenu = new TabMenu(tabElementArray);

})();