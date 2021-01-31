'use strict';

const header = document.querySelector('.header');
const buttonDonate = header.querySelector('.nav__link--donate');

buttonDonate.addEventListener('click', () => {
  header.classList.add('header--donate');
});

header.addEventListener('animationend', () => {
  header.classList.remove('header--donate');
});
