/**
 * @type {HTMLUListElement}
 */
const menu = document.querySelector('.navigation-mobile-menu');

/**
 * @type {HTMLLIElement}
 */
const toggle = document.querySelector('.navigation-mobile-menu-toggle');

toggle.addEventListener('click', (e) => menu.classList.toggle('hidden'));
