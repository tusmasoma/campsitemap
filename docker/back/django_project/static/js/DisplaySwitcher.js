

class DisplaySwitcher {

  /**
   * @constructor
   * @param {HTMLElement} element - DOM要素
   */
  constructor(element){
    /**
     * DOM要素
     * @type {HTMLElement}
     */
    this.element = element;
    /**
     * 初期画面で非表示かどうかを保持
     * @type {boolean}
     */
    Object.defineProperty(
      this,
      'isHiddenDefault',
      {value: this.element.getAttribute('aria-hidden') === 'true'}
    );
  }

  /**
   * 非表示かどうかを返す
   */
  checkIsHidden() {
    if(this.element.getAttribute('aria-hidden') === 'true') {return true};
    if(this.element.getAttribute('aria-hidden') === 'false') {return false};
  }

  /**
   * 表示する
   */
  open() {
    if(! this.checkIsHidden()) {return;}
    this.element.setAttribute('aria-hidden', 'false');
  }

  /**
   * 隠す
   */
  close() {
    if(this.checkIsHidden()) {return;}
    this.element.setAttribute('aria-hidden', 'true');
  }

  /**
   * 初期状態に戻す
   */
  reset() {
    if(! this.isHiddenDefault) {this.open();}
    if(this.isHiddenDefault) {this.close();}
  }

}