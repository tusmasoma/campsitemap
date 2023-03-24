
(() => {

const sliderEl = document.querySelector('.slider-group > .slider');
const dotsEl = document.querySelector('.slider-group > .dots');

// 初期化時にイベントを設定
const slider = new Slider(sliderEl, dotsEl, 5000);
requestAnimationFrame(update);

function update() {
  slider.update();
  requestAnimationFrame(update);
}

})();