

class Slider {
  /**
   * @constructor
   * @param {HTMLElement} listElement - スライダーのlist要素
   * @param {HTMLElement} dotsElement - ドットのlist要素
   * @param {Number} interval - 自動スライドの間隔
   */
  constructor(listElement, dotsElement, interval = 3000) {
    /**
     * list要素
     * @type {HTMLElement}
     */
    this.listEl = listElement;
    /**
     * 子要素
     * @type {SliderItems}
     */
    this.items = new SliderItems(this.listEl.children);
    // スライドが1枚以下なら、リターン
    if(this.items.checkLessThanOne()) {return;}
    /**
     * 現在のインデックス
     * @type {SliderCurrentIndex}
     */
    this.currentIndex = new SliderCurrentIndex();
    /**
     * 自動スライドのインスタンス
     * @type {AutoSlider}
     */
    this.autoSlider = new AutoSlider(this.listEl, this.items, interval);
    /**
     * 現在のインデックスを表示するドットのリスト
     * @type {SliderDots}
     */
    this.dots = new SliderDots(dotsElement);
    // 初期化
    this.#init();
  }

  /**
   * 初期化する
   */
  #init() {
    this.dots.init(this.items.count);
    this.#setEvent();
  }

  /**
   * イベントを設定する
  */
 #setEvent() {
  // ユーザー操作によるスライド時も自動スライド時も発火する、scrollイベントリスナ
   this.listEl.addEventListener('scroll', () => {
     // 現在のスライドのインデックスを更新
     const scrollAmount = this.listEl.scrollLeft;
     const oldIndex = this.currentIndex.value;
     const newIndex = Math.round(scrollAmount/this.items.eachWidth);
     if(newIndex < this.items.count) {
       this.currentIndex.set(newIndex);
     }
     // インデックスが変わったら、経過時間をリセット
     if(oldIndex !== newIndex) {
       this.autoSlider.finishEach();
        this.autoSlider.restartEach();
      }
    });
    // ユーザーに操作されたら、経過時間をリセット
    this.listEl.addEventListener('wheel', () => {
      this.autoSlider.restartEach();
    });
    this.listEl.addEventListener('touchmove', () => {
      this.autoSlider.restartEach();
    });
  }

  /**
   * 更新する
   */
  update() {
    // スライドが1枚以下なら、何もしない
    if(this.items.checkLessThanOne()) {return;}
    // アクティブなドットを更新する
    this.dots.update(this.currentIndex.value);
     // スライド数の上限に達しているなら、自動スライダーを終了させる
     if(this.items.count - 1 <= this.currentIndex.value) {
      this.autoSlider.freeze();
      return;
    }
    // 自動スライダーを更新する
    this.autoSlider.update();
  }
}


class SliderItems {
  constructor(elements) {
    this.elements = elements;
    this.count = this.elements.length;
    if(! this.#checkWidthSame()) {
      console.error('SliderItems not same width');
    }
    this.eachWidth = elements[0].offsetWidth;
  }
  checkLessThanOne() {
    if(this.count <= 1) {return true;}
    return false;
  }
  #checkWidthSame() {
    for(let i = 0; i < this.count - 1; i++) {
      if(this.elements[i].offsetWidth !== this.elements[i + 1].offsetWidth) {
        return false;
      }
    }
    return true;
  }
}


class AutoSlider {
  constructor(listElement, items, interval) {
    /**
     * list要素
     * @type {HTMLElement}
     */
    this.listEl = listElement;
    /**
     * 子要素
     * @type {SliderItems}
     */
    this.items = items;
    /**
     * 経過時間
     * @type {SliderElapsedTime}
     */
    this.elapsed = new SliderElapsedTime(interval);
    /**
     * 自動スライド中かどうか
     * @type {Boolean}
     */
    this.isSliding = false;
    /**
     * 自動スライドが終了したかどうか
     * @type {Boolean}
     */
    this.isFinished = false;
  }
  /**
   * 自動でスライドする
  */
  #slide() {
    // 終了フラグが上がっているなら、何もしない
    if(this.isFinished) {return;}
    // スライド中なら、何もしない
    if(this.isSliding) {return;}
    // 左へ一つ分スライドする
    this.listEl.scrollBy({
      top: 0,
      left: this.items.eachWidth,
      behavior: 'smooth'
    });
    // スライド中フラグを上げる
    this.isSliding = true;
  }
  /**
   * 1つのスライドを終了する
   */
  finishEach() {
    // 終了フラグが上がっているなら、何もしない
    if(this.isFinished) {return;}
    // スライド中フラグを下げる
    this.isSliding = false;
  }
  /**
   * 1つのスライドをリスタートする
   */
  restartEach() {
    // 終了フラグが上がっているなら、何もしない
    if(this.isFinished) {return;}
    // 経過時間をリセットする
    this.elapsed.reset();
  }
  /**
   * 終了する
   */
  freeze() {
    this.isFinished = true;
  }
  /**
   * 更新する
   */
  update() {
    // 終了フラグが上がっているなら、何もしない
    if(this.isFinished) {return;}
    // 経過時間を更新する
    this.elapsed.update();
    // 経過時間がインターバルに満たないなら、何もしない
    if(! this.elapsed.checkOver()) {return;}
    // スライドさせる
    this.#slide();
  }
}


class SliderCurrentIndex {
  constructor(value = 0) {
    this.value = value;
  }
  set(input) {
    if(typeof input !== 'number') {return;}
    if(input < 0) {return;}
    this.value = input;
  }
}


class SliderDots {
  constructor(dotsElement) {
    this.element = dotsElement;
    this.items = [];
  }
  init(itemsCount) {
    for(let i = 0; i < itemsCount; i++) {
      const dot = new SliderDot();
      this.element.appendChild(dot.element);
      this.items.push(dot);
    }
  }
  #inactivateAll() {
    this.items.forEach(item => item.inactivate())
  }
  /**
   * 更新する
   * @param {Number} currentIndex
   */
  update(currentIndex) {
    this.#inactivateAll();
    this.items[currentIndex].activate();
  }
}


class SliderDot {
  constructor() {
    this.element = null;
    this.#init();
  }
  #init() {
    this.element = document.createElement('li');
    this.element.classList.add('item');
  }
  activate() {
    this.element.classList.add('-active');
  }
  inactivate() {
    this.element.classList.remove('-active');
  }
}


class SliderElapsedTime {
  constructor(interval) {
    /**
     * 経過時間
     * @param {Number}
     */
    this.value = null;
    this.startTime = Date.now();
    this.interval = interval;
  }
  checkOver() {
    if(this.value < this.interval) {return false;}
    return true;
  }
  reset() {
    this.startTime = Date.now();
    this.value = 0;
  }
  update() {
    this.value = Date.now() - this.startTime;
  }
}