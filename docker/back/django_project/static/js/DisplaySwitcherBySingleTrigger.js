
class DisplaySwitcherBySingleTrigger {
  constructor(triggerElement, ...targetElementList) {
    this.triggerElement = triggerElement;
    this.trigger = new DisplayTriggerSwitcher(this.triggerElement);
    this.targetElementList = targetElementList;
    this.targetList = [];
    this.#init();
  }
  #init() {
    this.targetElementList.forEach(targetEl => {
      const instance = new DisplaySwitcher(targetEl);
      this.targetList.push(instance);
    })
  }
  checkIsHidden() {
    if(! this.trigger.checkIsExpanded()) {return true;}
    if(this.trigger.checkIsExpanded()) {return false;}
  }
  toggle() {
    if(this.checkIsHidden()) {
      this.show();
      return;
    }
    if(! this.checkIsHidden()) {
      this.hide();
      return;
    }
  }
  show() {
    if(! this.checkIsHidden()) {return;}
    this.trigger.expand();
    this.targetList.forEach(target => target.open());
  }
  hide() {
    if(this.checkIsHidden()) {return;}
    this.trigger.shrink();
    this.targetList.forEach(target => target.close())
  }
  reset() {
    this.trigger.shrink();
    this.targetList.forEach(target => target.reset())
  }
}