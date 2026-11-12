/* Fotoprofile Katrin Bernhard · Richtung C «Kontaktbogen»
   Menü, Auslöser im Hero, Sucher der Leistungen, Filmstreifen, Bildansicht, Einblendungen.
   Ohne Abhängigkeiten. Ohne dieses Skript ist der gesamte Inhalt sichtbar. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqWide = window.matchMedia('(min-width: 1024px)');
  var reduced = mqReduce.matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- Betriebsarten ---------- */
  var pinMode = false;
  var viewerMode = false;
  var modeListeners = [];

  function setModes() {
    viewerMode = mqFine.matches && mqWide.matches;
    pinMode = viewerMode && !reduced && window.innerHeight >= 620;
    doc.classList.toggle('mode-viewer', viewerMode);
    doc.classList.toggle('mode-pin', pinMode);
    modeListeners.forEach(function (fn) { fn(); });
  }

  /* ---------- Menü ---------- */
  (function menu() {
    var nav = $('#menue');
    var toggle = $('.menu-toggle');
    var close = $('.menu__close');
    if (!nav || !toggle) return;
    var others = $$('body > :not(.menu):not(script)');

    function set(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      doc.style.overflow = open ? 'hidden' : '';
      others.forEach(function (el) { el.inert = open; });
      if (open) { close.focus({ preventScroll: true }); } else { toggle.focus({ preventScroll: true }); }
    }
    function isOpen() { return nav.classList.contains('is-open'); }

    toggle.addEventListener('click', function (e) { e.preventDefault(); set(!isOpen()); });
    toggle.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); set(!isOpen()); } });
    close.addEventListener('click', function (e) { e.preventDefault(); set(false); });
    close.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); set(false); } });
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link && link !== close) set(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) set(false); });
  })();

  /* ---------- Hero: Auslöser, Blitz, Abzüge wechseln den Platz ---------- */
  (function hero() {
    var hero = $('.hero');
    var fan = $('.fan');
    var button = $('.release__button');
    var number = $('.release__number');
    var flash = $('.hero__flash');
    if (!hero || !fan || !button) return;
    var prints = $$('.print', fan);

    function fire() {
      prints.forEach(function (print) {
        var slot = (Number(print.getAttribute('data-slot')) + 2) % 3; /* Mitte → links, rechts → Mitte, links → rechts */
        print.classList.toggle('is-behind', slot === 2);
        print.setAttribute('data-slot', String(slot));
        if (slot === 1) number.textContent = pad(prints.indexOf(print) + 1);
      });
      if (!reduced && flash) {
        flash.classList.remove('is-firing');
        void flash.offsetWidth;
        flash.classList.add('is-firing');
      }
    }

    /* Die Abzüge wechseln nur auf Knopfdruck: kein selbsttätiger Durchgang, kein Blitz ohne Auslöser */
    button.addEventListener('click', fire);

    if (!reduced) {
      /* Leichte Tiefe unter dem Mauszeiger */
      var raf = 0;
      var stage = $('.hero__stage');
      stage.addEventListener('pointermove', function (e) {
        if (!mqFine.matches) return;
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = 0;
          fan.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
          fan.style.setProperty('--rx', (y * -5).toFixed(2) + 'deg');
        });
      });
      stage.addEventListener('pointerleave', function () {
        fan.style.setProperty('--ry', '0deg');
        fan.style.setProperty('--rx', '0deg');
      });
    }
  })();

  /* ---------- Einblendungen ---------- */
  (function reveals() {
    $$('[data-reveal="title"]').forEach(function (el) {
      var inner = document.createElement('span');
      inner.className = 'title-inner';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    });
    var items = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.matches('.service__frame')) { el.style.setProperty('--delay', (shown * 0.09) + 's'); shown += 1; }
        io.unobserve(el);
        var img = el.querySelector('img');
        if (img && !img.complete) {
          img.loading = 'eager'; /* ein vollständig maskiertes Bild würde «lazy» nie laden */
          img.addEventListener('load', function () { el.classList.add('is-in'); }, { once: true });
          img.addEventListener('error', function () { el.classList.add('is-in'); }, { once: true });
        } else {
          el.classList.add('is-in');
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Intro: Text entwickelt sich Wort für Wort ---------- */
  (function develop() {
    var box = $('[data-develop]');
    if (!box || reduced) return;
    var words = [];
    $$('p', box).forEach(function (p) {
      var parts = p.textContent.split(/(\s+)/);
      p.textContent = '';
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { p.appendChild(document.createTextNode(' ')); return; }
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        p.appendChild(span);
        words.push(span);
      });
    });
    var lit = 0;
    var ticking = false;
    function update() {
      ticking = false;
      var r = box.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.12), 0, 1);
      var target = Math.round(p * words.length);
      while (lit < target) { words[lit].classList.add('is-lit'); lit += 1; }
      if (lit >= words.length) window.removeEventListener('scroll', onScroll);
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  })();

  /* ---------- Leistungen: Name wählt das Bild im Sucher ---------- */
  (function services() {
    var items = $$('.service');
    if (!items.length) return;
    var active = $('.service.is-active') || items[0];
    var timer = 0;

    function activate(item) {
      if (item === active || !viewerMode) return;
      items.forEach(function (el) { el.classList.remove('is-leaving'); });
      active.classList.remove('is-active');
      active.classList.add('is-leaving');
      var leaving = active;
      active = item;
      item.classList.add('is-active');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { leaving.classList.remove('is-leaving'); }, 600);
    }

    items.forEach(function (item) {
      item.addEventListener('pointerenter', function () { activate(item); });
      item.addEventListener('focusin', function () { activate(item); });
    });
  })();

  /* ---------- Portfolio: Filmstreifen läuft quer zur Scrollrichtung ---------- */
  var strip = $('.strip');
  (function filmstrip() {
    var pin = $('.portfolio__pin');
    var sticky = $('.portfolio__sticky');
    var current = $('.portfolio__current');
    if (!pin || !strip) return;
    var frames = $$('.frame', strip);
    var cssTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
    var travel = 0;      /* Weg des Streifens nach links, in px */
    var scrollLen = 0;   /* Scrollstrecke der Seite, auf der dieser Weg abläuft */
    /* Der Streifen läuft schneller als die Seite: sonst wäre der Abschnitt rund die Hälfte der ganzen Seite.
       0.27 ergibt bei 1440 × 900 etwa 18 Mausrad-Schritte vom Anheften bis «Über mich». */
    var SCROLL_RATIO = 0.27;
    var centers = [];
    var ticking = false;
    var lastIndex = -1;

    function measure() {
      if (!pinMode) { pin.style.removeProperty('--travel'); pin.style.removeProperty('--scroll'); strip.style.removeProperty('--p'); return; }
      travel = Math.max(0, strip.scrollWidth - sticky.clientWidth);
      scrollLen = Math.round(travel * SCROLL_RATIO);
      pin.style.setProperty('--travel', travel + 'px');
      pin.style.setProperty('--scroll', scrollLen + 'px');
      centers = frames.map(function (f) { return f.offsetLeft + f.offsetWidth / 2; });
      update();
    }

    function progress() {
      var header = parseFloat(getComputedStyle(doc).getPropertyValue('--header-h')) || 0;
      var top = pin.getBoundingClientRect().top - header;
      return scrollLen ? clamp(-top / scrollLen, 0, 1) : 0;
    }

    function update() {
      ticking = false;
      if (!pinMode) return;
      var p = progress();
      if (!cssTimeline) strip.style.setProperty('--p', p.toFixed(4));
      var mid = p * travel + sticky.clientWidth / 2;
      var index = 0;
      var best = Infinity;
      centers.forEach(function (c, i) { var d = Math.abs(c - mid); if (d < best) { best = d; index = i; } });
      if (index !== lastIndex && current) { lastIndex = index; current.textContent = pad(index + 1); }
    }

    window.addEventListener('scroll', function () {
      if (pinMode && !ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    modeListeners.push(measure);

    /* Entwicklung: im angehefteten Streifen nur ganz sichtbare Bilder, sonst einmalig beim Erscheinen */
    var wholeIO = null;
    var onceIO = null;
    var entered = false;

    /* Alle Bilder des Streifens laden, kurz bevor er ins Fenster kommt: auch die noch nicht
       entwickelten sind abgedunkelt zu sehen und dürfen keine leeren Felder sein. */
    if ('IntersectionObserver' in window) {
      var loadIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        loadIO.disconnect();
        frames.forEach(function (f) { var img = f.querySelector('img'); if (img) img.loading = 'eager'; });
      }, { rootMargin: '150% 0px 150% 0px' });
      loadIO.observe(pin);
    }
    function observeFrames() {
      if (wholeIO) { wholeIO.disconnect(); wholeIO = null; }
      if (onceIO) { onceIO.disconnect(); onceIO = null; }
      if (reduced || !('IntersectionObserver' in window)) {
        frames.forEach(function (f) { f.classList.add('is-in'); });
        return;
      }
      function ready(frame, on) {
        var img = frame.querySelector('img');
        if (on && img && !img.complete) {
          img.loading = 'eager';
          img.addEventListener('load', function () { if (frame.getAttribute('data-whole') === '1') frame.classList.add('is-in'); }, { once: true });
          return;
        }
        frame.classList.toggle('is-in', on);
      }
      if (pinMode) {
        /* waagrecht: ganz im Fenster (senkrecht zählt nicht, die Seite scrollt ja weiter) */
        wholeIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            var on = entry.intersectionRatio >= 0.995;
            entry.target.setAttribute('data-whole', on ? '1' : '0');
            if (entered || !on) ready(entry.target, on);
          });
        }, { rootMargin: '300% 0px 300% 0px', threshold: [0, 0.5, 0.9, 0.995, 1] });
        frames.forEach(function (f) { wholeIO.observe(f); });
        if (!entered) {
          onceIO = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            entered = true;
            onceIO.disconnect();
            var k = 0;
            frames.forEach(function (f) {
              if (f.getAttribute('data-whole') !== '1') return;
              window.setTimeout(function () { if (f.getAttribute('data-whole') === '1') ready(f, true); }, k * 110);
              k += 1;
            });
          }, { threshold: 0.5 });
          onceIO.observe(sticky);
        }
      } else {
        onceIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute('data-whole', '1');
            ready(entry.target, true);
            onceIO.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
        frames.forEach(function (f) { onceIO.observe(f); });
      }
    }
    modeListeners.push(observeFrames);

    /* Tastatur: fokussiertes Bild in die Mitte holen, ohne das Scrollen zu übernehmen */
    strip.addEventListener('focusin', function (e) {
      if (!pinMode) return;
      var frame = e.target.closest('.frame');
      if (!frame || !e.target.matches(':focus-visible')) return;
      var i = frames.indexOf(frame);
      var p = clamp((centers[i] - sticky.clientWidth / 2) / travel, 0, 1);
      var header = parseFloat(getComputedStyle(doc).getPropertyValue('--header-h')) || 0;
      var pinTop = pin.getBoundingClientRect().top + window.scrollY - header;
      window.scrollTo({ top: pinTop + p * scrollLen, behavior: 'auto' });
    });
  })();

  /* ---------- Sucher-Cursor ---------- */
  (function cursor() {
    if (!strip || reduced) return;
    var el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="cursor__label mono">Ansehen</span>';
    document.body.appendChild(el);
    var x = 0, y = 0, raf = 0;
    function draw() { raf = 0; el.style.translate = x + 'px ' + y + 'px'; }
    strip.addEventListener('pointermove', function (e) {
      if (!mqFine.matches) return;
      x = e.clientX; y = e.clientY;
      el.classList.toggle('is-on', !!e.target.closest('.frame__link'));
      if (!raf) raf = window.requestAnimationFrame(draw);
    });
    strip.addEventListener('pointerleave', function () { el.classList.remove('is-on'); });
    window.addEventListener('scroll', function () { el.classList.remove('is-on'); }, { passive: true });
  })();

  /* ---------- Bildansicht: wächst aus dem Bild des Streifens ---------- */
  (function lightbox() {
    var links = $$('.frame__link');
    if (!links.length || !window.HTMLDialogElement) return;

    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Bildansicht');
    dlg.innerHTML =
      '<figure class="lightbox__figure"><img class="lightbox__image" alt=""><figcaption class="lightbox__caption mono"></figcaption></figure>' +
      '<button class="lightbox__button lightbox__button--prev mono" type="button" aria-label="Vorheriges Bild">Zurück</button>' +
      '<button class="lightbox__button lightbox__button--next mono" type="button" aria-label="Nächstes Bild">Weiter</button>' +
      '<button class="lightbox__button lightbox__button--close mono" type="button">Schließen</button>';
    document.body.appendChild(dlg);

    var image = $('.lightbox__image', dlg);
    var caption = $('.lightbox__caption', dlg);
    var index = 0;
    var canMorph = !!document.startViewTransition && !reduced;

    function show(i) {
      index = (i + links.length) % links.length;
      var link = links[index];
      var thumb = $('img', link);
      var full = link.getAttribute('href');
      image.width = Number(link.getAttribute('data-w'));
      image.height = Number(link.getAttribute('data-h'));
      image.alt = thumb.alt;
      image.src = thumb.currentSrc || thumb.src;
      var loader = new Image();
      loader.onload = function () { if (links[index] === link) image.src = full; };
      loader.src = full;
      caption.textContent = pad(index + 1) + ' / ' + pad(links.length) + '  ' + link.parentNode.querySelector('.frame__caption').lastChild.textContent.trim();
    }

    function morph(thumb, change) {
      if (!canMorph) { change(); return; }
      thumb.style.viewTransitionName = 'shot';
      var t = document.startViewTransition(function () {
        thumb.style.viewTransitionName = '';
        change();
      });
      t.finished.then(function () { image.style.viewTransitionName = ''; thumb.style.viewTransitionName = ''; }, function () {});
    }

    function open(i) {
      var thumb = $('img', links[i]);
      morph(thumb, function () {
        show(i);
        dlg.showModal();
        image.style.viewTransitionName = 'shot';
      });
    }

    function close() {
      if (!dlg.open) return;
      var thumb = $('img', links[index]);
      if (!canMorph) { dlg.close(); return; }
      image.style.viewTransitionName = 'shot';
      var t = document.startViewTransition(function () {
        image.style.viewTransitionName = '';
        dlg.close();
        thumb.style.viewTransitionName = 'shot';
      });
      t.finished.then(function () { thumb.style.viewTransitionName = ''; }, function () {});
    }

    links.forEach(function (link, i) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        open(i);
      });
    });
    $('.lightbox__button--prev', dlg).addEventListener('click', function () { show(index - 1); });
    $('.lightbox__button--next', dlg).addEventListener('click', function () { show(index + 1); });
    $('.lightbox__button--close', dlg).addEventListener('click', close);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lightbox__figure')) close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    dlg.addEventListener('close', function () { links[index].focus({ preventScroll: true }); });
  })();

  /* ---------- Start ---------- */
  setModes();
  [mqFine, mqWide].forEach(function (mq) { mq.addEventListener('change', setModes); });
  mqReduce.addEventListener('change', function () { window.location.reload(); });
  window.addEventListener('resize', function () {
    var next = mqFine.matches && mqWide.matches && !reduced && window.innerHeight >= 620;
    if (next !== pinMode) setModes();
  });
})();
