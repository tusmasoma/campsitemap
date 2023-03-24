

class TabMenu {
  constructor(tabElementArray) {
    this.tabElements = tabElementArray;
    this.tabs = new TabMenuTabs(this.tabElements);
    this.targets = new TabMenuTargets(this.tabs.list);
    this.#init();
  }
  #init() {
    this.tabs.init();
    this.targets.init();
    this.#setEvent();
  }
  #setEvent() {
    this.tabs.list.forEach(tab => {
      tab.element.addEventListener('click', () => {
        if(tab.checkIsActive()) {return;}
        const target = this.targets.list.find(target => target.name === tab.targetName);
        this.tabs.inactivateAll();
        tab.activate();
        this.targets.closeAll();
        target.open();
      });
    })
  }
}


class TabMenuTabs {
  constructor(tabElementArray) {
    this.elements = tabElementArray;
    this.list = [];
  }
  init() {
    this.elements.forEach(element => {
      this.list.push(new TabMenuTab(element));
    })
  }
  inactivateAll() {
    this.list.forEach(tab => {
      tab.inactivate();
    })
  }
}


class TabMenuTab {
  constructor(element) {
    this.element = element;
    this.targetName = this.element.getAttribute('aria-controls');
  }
  checkIsActive() {
    const isActive = this.element.getAttribute('aria-selected');
    if(isActive === 'true') {return true};
    if(isActive === 'false') {return false};
  }
  activate() {
    this.element.setAttribute('aria-selected', 'true');
    this.element.setAttribute('aria-expanded', 'true');
  }
  inactivate() {
    this.element.setAttribute('aria-selected', 'false');
    this.element.setAttribute('aria-expanded', 'false');
  }
}


class TabMenuTargets {
  constructor(tabsList) {
    this.tabsList = tabsList;
    this.list = [];
  }
  init() {
    this.tabsList.forEach(tab => {
      const name = tab.targetName;
      const element = document.getElementById(name);
      this.list.push(new TabMenuTarget(element, name));
    })
  }
  closeAll() {
    this.list.forEach(target => {
      target.close();
    })
  }
}


class TabMenuTarget {
  constructor(element, name) {
    this.element = element;
    this.name = name;
  }
  open() {
    this.element.setAttribute('aria-hidden', 'false');
  }
  close() {
    this.element.setAttribute('aria-hidden', 'true');
  }
}