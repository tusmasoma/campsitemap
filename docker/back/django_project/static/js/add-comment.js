
'use strict';

{

const formEl = document.querySelector('.add-comment > .container > .form');
const ratingEl = document.querySelector('.add-comment > .container > .form > .content > .rating');
const ratingRadioElList = document.querySelectorAll('.add-comment > .container > .form > .content > .rating > .radio');
const ratingInputEl = document.querySelector('.add-comment > .container > .form > .content > .ratingInput');
const textInputEl = document.querySelector('.add-comment > .container > .form > .content > .textInput');
const submitEl = document.querySelector('.add-comment > .container > .form > .submit');

setEvent();

function setEvent() {
  ratingRadioElList.forEach(radioEl => {
    radioEl.addEventListener('click', () => {
      ratingRadioElList.forEach(radioEl => {
        radioEl.classList.remove('-active');
      })
      const rate = radioEl.dataset.rate;
      ratingEl.dataset.rating = rate;
      ratingInputEl.value = rate;
      for(let i = 0; i < parseInt(rate, 10); i++) {
        ratingRadioElList[i].classList.add('-active');
      };
      if(
        ratingInputEl.value == null ||
        ratingInputEl.value === "" ||
        textInputEl.value == null ||
        textInputEl.value === ""
      ) {
        submitEl.setAttribute('disabled', 'true');
        return;
      }
      submitEl.removeAttribute('disabled');
    });
  })
  textInputEl.addEventListener('input', () => {
    if(
      ratingInputEl.value == null ||
      ratingInputEl.value === "" ||
      textInputEl.value == null ||
      textInputEl.value === ""
    ) {
      submitEl.setAttribute('disabled', 'true');
      return;
    }
    submitEl.removeAttribute('disabled');
  });
  formEl.addEventListener('submit', e => {
    if(
      ratingInputEl.value == null ||
      ratingInputEl.value === "" ||
      textInputEl.value == null ||
      textInputEl.value === ""
    ) {
      e.preventDefault();
      submitEl.setAttribute('disabled', 'true');
      return;
    }
  });
}

}