/* Fotoprofile · Startseite B
   Ohne JS bleibt alles sichtbar und bedienbar; das Skript ergänzt Menü, Untermenüs und sanfte Einblendungen. */
(function () {
  'use strict';

  var html = document.documentElement;
  var desktop = window.matchMedia('(min-width: 1200px)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobiles Menü ---------- */
  var burger = document.querySelector('.header__burger');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    html.classList.toggle('has-menu', open);
  }

  if (burger && nav) {
    burger.setAttribute('role', 'button');
    burger.addEventListener('click', function (event) {
      event.preventDefault();
      setMenu(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    desktop.addEventListener('change', function () { setMenu(false); closeSubs(); });
  }

  /* ---------- Untermenüs ---------- */
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.nav__toggle'));

  function closeSubs(except) {
    toggles.forEach(function (t) { if (t !== except) t.setAttribute('aria-expanded', 'false'); });
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (desktop.matches) closeSubs(toggle);
      toggle.setAttribute('aria-expanded', String(!open));
    });
  });

  document.addEventListener('click', function (event) {
    if (desktop.matches && !event.target.closest('.nav__item--has-sub')) closeSubs();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var openToggle = toggles.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0];
    closeSubs();
    if (nav && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    else if (openToggle) openToggle.focus();
  });

  /* ---------- Einblendungen beim Scrollen ---------- */
  if (calm.matches || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.section__head, .intro__text, .service-card, .quick, .portfolio__row, .about__media, .about__text, .rating, .area__regions, .area__address, .contact__details, .contact__button'
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(targets, function (el) {
    var box = el.getBoundingClientRect();
    if (box.top < window.innerHeight) return; /* bereits sichtbar: nichts verstecken */
    el.classList.add('reveal');
    observer.observe(el);
  });
})();
