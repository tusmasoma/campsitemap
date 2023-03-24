

class ActivatedSubmit {
  constructor(submitElement) {
    this.element = submitElement;
  }
  checkDisabled() {
    return this.element.hasAttribute('disabled');
  }
  activate() {
    this.element.removeAttribute('disabled');
  }
  inactivate() {
    this.element.setAttribute('disabled', 'true');
  }
}


class SelectedInputListForActivateSubmit {
  constructor(inputElementList) {
    this.elementList = inputElementList;
  }
  checkSomeSelected() {
    let isSomeSelected = false;
    for(const element of this.elementList) {
      if(element.checked) {
        isSomeSelected = true;
        break;
      }
    }
    return isSomeSelected;
  }
}