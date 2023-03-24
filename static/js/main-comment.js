
'use strict';

(() => {

// コメント投稿画面の開閉のトリガー

const openTriggerEl = document.querySelector('.comment-group > .addTrigger');
const addCommentEl = document.querySelector('.add-comment');
const addCommentMaskEl = document.querySelector('.addComment-mask');

const closeTriggerEl = document.querySelector('.add-comment > .container > .head > .close');

// 初期化時にイベント設定
const switcher = new DisplaySwitcherByDoubleTrigger(openTriggerEl, closeTriggerEl, addCommentEl, addCommentMaskEl);

})();



(() => {

// コメント内ボードのトリガー

const triggerElList = document.querySelectorAll('.comment-list > .item > .head > .right > .trigger');
const boardElList = document.querySelectorAll('.comment-list > .item > .head > .right > .board');

setEvent();

function setEvent() {
  document.addEventListener('click', e => {
    if(e.target.closest('.trigger')) {
      const triggerEl = e.target.parentNode;
      const targetEl = triggerEl.nextElementSibling;
      if(triggerEl.getAttribute('aria-expanded') === 'false' && targetEl.getAttribute('aria-hidden') === 'true') {
        triggerEl.setAttribute('aria-expanded', 'true');
        targetEl.setAttribute('aria-hidden', 'false');
      } else if (triggerEl.getAttribute('aria-expanded') === 'true' && targetEl.getAttribute('aria-hidden') === 'false') {
        triggerEl.setAttribute('aria-expanded', 'false');
        targetEl.setAttribute('aria-hidden', 'true');
      }
    } else {
      triggerElList.forEach(triggerEl => {
        triggerEl.setAttribute('aria-expanded', 'false');
      })
      boardElList.forEach(boardEl => {
        boardEl.setAttribute('aria-hidden', 'true');
      })
    }
  })
}

})();