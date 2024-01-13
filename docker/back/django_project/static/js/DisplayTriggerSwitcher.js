
class DisplayTriggerSwitcher {
  constructor(element) {
    this.element = element;
  }
  checkIsExpanded() {
    if(this.element.getAttribute('aria-expanded') === 'true') {return true;}
    if(this.element.getAttribute('aria-expanded') === 'false') {return false;}
  }
  setClickEvent(callback) {
    this.element.addEventListener('click', callback);
  }
  expand() {
    if(this.checkIsExpanded()) {return;}
    this.element.setAttribute('aria-expanded', 'true');
  }
  shrink() {
    if(! this.checkIsExpanded()) {return;}
    this.element.setAttribute('aria-expanded', 'false');
  }
}