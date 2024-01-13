
'use strict';

(() => {

const ratingElList = document.querySelectorAll('.rating-display');

init();

function init() {
  ratingElList.forEach(ratingEl => {
    const rate = ratingEl.dataset.rating;
    const children = ratingEl.children;
    ratingEl.setAttribute('aria-label', `${rate}つ星`);
    for(let i = 0; i < rate; i++) {
      children[i].classList.add('-active');
    }
  })
}

})();