/* Fotoprofile Katrin Bernhard · Startseite
   Menü, Untermenüs und ruhiges Einblenden beim Scrollen. Ohne Abhängigkeiten. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var nav = document.getElementById('hauptnavigation');
  var burger = document.querySelector('.burger');
  var narrow = window.matchMedia('(max-width: 1279px)');

  /* --- Menü auf schmalen Bildschirmen --- */
  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    doc.style.overflow = open ? 'hidden' : '';
  }

  if (nav && burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    narrow.addEventListener('change', function () { setMenu(false); });
  }

  /* Auf schmalen Bildschirmen sind die Untermenüs immer offen: die Schalter sind dort nur Überschriften */
  function syncToggles() {
    Array.prototype.forEach.call(document.querySelectorAll('.nav__toggle'), function (toggle) {
      toggle.disabled = narrow.matches;
    });
  }
  syncToggles();
  narrow.addEventListener('change', syncToggles);

  /* --- Untermenüs auf breiten Bildschirmen --- */
  var subItems = Array.prototype.slice.call(document.querySelectorAll('.nav__item--sub'));

  function closeSubs(except) {
    subItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      item.querySelector('.nav__toggle').setAttribute('aria-expanded', 'false');
    });
  }

  subItems.forEach(function (item) {
    var toggle = item.querySelector('.nav__toggle');
    toggle.addEventListener('click', function () {
      if (narrow.matches) return;
      var open = !item.classList.contains('is-open');
      closeSubs(item);
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.nav__item--sub')) closeSubs();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeSubs();
    if (burger && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  /* --- Einblenden beim Scrollen --- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  items.forEach(function (el) { observer.observe(el); });
})();
