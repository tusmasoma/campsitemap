
class DisplaySwitcherByDoubleTrigger {
  constructor(toOpenTriggerElement, toCloseTriggerElement, ...targetElementList) {
    this.opener = new DisplayTriggerSwitcher(toOpenTriggerElement);
    this.closer = new DisplayTriggerSwitcher(toCloseTriggerElement);
    this.targetElementList = targetElementList;
    this.targetList = [];
    this.#init();
  }
  #init() {
    this.targetElementList.forEach(targetElement => {
      const instance = new DisplaySwitcher(targetElement);
      this.targetList.push(instance);
    })
    this.opener.setClickEvent(() => {
      this.opener.expand();
      this.closer.expand();
      this.showAllTarget();
    });
    this.closer.setClickEvent(() => {
      this.opener.shrink();
      this.closer.shrink();
      this.hideAllTarget();
    });
  }
  showAllTarget() {
    this.targetList.forEach(target => target.open())
  }
  hideAllTarget() {
    this.targetList.forEach(target => target.close())
  }
}