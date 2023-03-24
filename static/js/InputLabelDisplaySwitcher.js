



class InputLabelDisplaySwitcher {

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
       * 子要素
       * @type {HTMLElement}
       */
      this.input = this.element.children[1];
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
     * アクティブかを返す
     */
    checkActive() {
      if(
        this.element.getAttribute('aria-hidden') === 'false' &&
        this.input.hasAttribute('required') &&
        ! this.input.hasAttribute('disabled')
      ) {return true};
      if(
        this.element.getAttribute('aria-hidden') === 'true' &&
        ! this.input.hasAttribute('required') &&
        this.input.hasAttribute('disabled')
      ) {return false};
    }
  
    /**
     * 表示する
     */
    open() {
      if(this.checkActive()) {return;}
      this.element.setAttribute('aria-hidden', 'false');
      this.input.removeAttribute('disabled');
      this.input.setAttribute('required', 'true');
    }
  
    /**
     * 隠す
     */
    close() {
      if(! this.checkActive()) {return;}
      this.element.setAttribute('aria-hidden', 'true');
      this.input.setAttribute('disabled', 'true');
      this.input.removeAttribute('required');
    }
  
    /**
     * 初期状態に戻す
     */
    reset() {
      if(! this.isHiddenDefault) {this.open();}
      if(this.isHiddenDefault) {this.close();}
    }
  
  }