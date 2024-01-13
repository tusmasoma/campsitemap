
'use strict';

(() => {
  
const spotTypeElList = document.querySelectorAll('input[name="spot-type"]');
const spotNameEl = document.querySelector('input[name="spot-name"]');
const addressEl = document.querySelector('input[name="address"]');
const telEl = document.querySelector('input[name="tel"]');
const periodEl = document.querySelector('textarea[name="period"]');
const periodLabelEl = periodEl.parentNode;
const priceEl = document.querySelector('textarea[name="price"]');
const priceLabelEl = priceEl.parentNode;
const describeEl = document.querySelector('textarea[name="describe"]');
const describeLabelEl = describeEl.parentNode;
const submitEl = document.querySelector('.main-post > .container > .form > .submit');

const periodLabel = new InputLabelDisplaySwitcher(periodLabelEl);
const priceLabel = new InputLabelDisplaySwitcher(priceLabelEl);
const describeLabel = new InputLabelDisplaySwitcher(describeLabelEl);

const spotTypeList = new SelectedInputListForActivateSubmit(spotTypeElList);

const submit = new ActivatedSubmit(submitEl);

const camp = {
  name: 'ABCキャンプ場',
  address: 'A県B市C町1-2-3',
  tel: '0123-45-6789',
  period: '4月~10月\n10:00~18:00\n年中無休',
  price: 'キャンプサイト\n大人620円、小人250円、幼児無料',
  describe: 'バーベキューができます。',
};
const onsen = {
  name: 'ABC温泉',
  address: 'A県B市C町1-2-3',
  tel: '0123-45-6789',
  period: '10:00~18:00\n年中無休',
  price: '大人620円、小人250円、幼児無料',
  describe: '肌に良いお湯です。',
};
const convenience = {
  name: 'ABCコンビニ',
  address: 'A県B市C町1-2-3',
  tel: '0123-45-6789',
  period: '10:00~18:00\n年中無休',
  describe: '豊富な品揃えです。',
};


window.addEventListener('load', () => {
  init();
  setEvent(); 
});


function init() {
  for(const spotTypeEl of spotTypeElList) {
    if(! spotTypeEl.checked) {continue;}
    switchDisplay(spotTypeEl.value);
  }
}


function setEvent() {
  spotTypeElList.forEach(spotTypeEl => {
    spotTypeEl.addEventListener('change', e => {
      switchDisplay(e.target.value);
      processSubmit();
    });
  })
  spotNameEl.addEventListener('input', processSubmit);
  addressEl.addEventListener('input', processSubmit);
  periodEl.addEventListener('input', processSubmit);
  priceEl.addEventListener('input', processSubmit);
  describeEl.addEventListener('input', processSubmit);
}


function switchDisplay(targetValue) {
  let data;
  switch(targetValue) {
    case 'キャンプ場':
      periodLabel.open();
      priceLabel.open();
      describeLabel.open();
      data = camp;
      break;
    case '温泉':
      periodLabel.open();
      priceLabel.open();
      describeLabel.open();
      data = onsen;
      break;
    case 'コンビニ':
      periodLabel.close();
      priceLabel.close();
      describeLabel.close();
      data = convenience;
      break;
  }
  spotNameEl.setAttribute('placeholder', data.name);
  addressEl.setAttribute('placeholder', data.address);
  telEl.setAttribute('placeholder', data.tel);
  periodEl.setAttribute('placeholder', data.period);
  priceEl.setAttribute('placeholder', data.price);
  describeEl.setAttribute('placeholder', data.describe);
}


function processSubmit() {
  submit.inactivate();
  if(! spotTypeList.checkSomeSelected()) {return;}
  if(spotNameEl.value === '') {return;}
  if(addressEl.value === '') {return;}
  if(periodLabel.checkActive() && periodEl.value === '') {return;}
  if(priceLabel.checkActive() && priceEl.value === '') {return;}
  if(describeLabel.checkActive() && describeEl.value === '') {return;}
  submit.activate();
}


})();