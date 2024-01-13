
'use strict';

(() => {


const gnavTriggerEl = document.querySelector('.main-header > .container > .gnavTrigger');
const searchOpenerEl = document.querySelector('.main-header > .container > .searchOpener');
const searchFormEl = document.querySelector('.main-header > .container > .searchForm');
const searchFormLabelEl = document.querySelector('.main-header > .container > .searchForm > .label > .icon');
const searchInputEl = document.querySelector('.main-header > .container > .searchForm > .label > .input');
const searchCloserEl= document.querySelector('.main-header > .container > .searchCloser');
const gNavEl = document.querySelector('.main-header > .gNav');
const searchResultEl = document.querySelector('.main-header > .searchResult');
const maskEl = document.querySelector('.page-wrapper > .content-mask');

const searchOpener = new DisplaySwitcher(searchOpenerEl);
const searchForm = new DisplaySwitcher(searchFormEl);
const searchFormLabel = new DisplaySwitcher(searchFormLabelEl);
const searchCloser = new DisplaySwitcher(searchCloserEl);
const searchResult = new DisplaySwitcher(searchResultEl);
const mask = new DisplaySwitcher(maskEl);

const gnavTrigger = new DisplaySwitcherBySingleTrigger(gnavTriggerEl, gNavEl, maskEl);



window.addEventListener('load', () => {

  gnavTriggerEl.addEventListener('click', () => {
    const isHidden = gnavTrigger.checkIsHidden();
    resetAll();
    if(isHidden) {gnavTrigger.show();}
    if(! isHidden) {gnavTrigger.hide();}
  });

  searchOpenerEl.addEventListener('click', () => {
    resetAll();
    searchOpener.close();
    searchCloser.open();
    mask.open();
    searchForm.open();
    searchResult.open();
    searchInputEl.focus();
  });

  searchInputEl.addEventListener('input', e => {
    if(e.target.value !== "") {
      if(searchFormLabel.checkIsHidden()) {return;}
      searchFormLabel.close();
    }
    if(e.target.value === "") {
      searchFormLabel.open();
    }
  });

  searchCloserEl.addEventListener('click', () => {
    resetAll();
  });

  maskEl.addEventListener('click', () => {
    resetAll();
  });

});



function resetAll() {
  searchOpener.reset();
  searchForm.reset();
  searchCloser.reset();
  searchResult.reset();
  mask.reset();
  gnavTrigger.reset();
}



})();