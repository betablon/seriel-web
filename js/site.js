// =====================================================================
// Seriel — site behaviour
//
//   Language     EN / DE in one page; the root's data-lang picks one.
//                The first choice is made pre-paint in each page's <head>.
//   Store link   Set APP_STORE_URL once Seriel is live and every
//                "Coming soon" badge becomes a link to the App Store.
//   Navigation   Mobile sheet, hairline once the page scrolls.
//   Reveal       Sections fade up as they enter the viewport.
//   Demos        The check, rating stars, Library filters, spoiler
//                switch and the Trakt choices on the home page.
//   Docs         Help search and the table of contents highlight.
// =====================================================================

(function () {
  'use strict';

  var APP_STORE_URL = null; // e.g. 'https://apps.apple.com/app/id6760855284'

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Language ------------------------------------------------

  function currentLang() {
    return root.getAttribute('data-lang') === 'de' ? 'de' : 'en';
  }

  function applyLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    document.querySelectorAll('button[data-lang-set]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-set') === lang));
    });
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-placeholder-' + lang));
    });
    document.querySelectorAll('[data-label-' + lang + ']').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-label-' + lang));
    });
    renderDates();
  }

  function bindLang() {
    document.querySelectorAll('[data-lang-set]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var lang = btn.getAttribute('data-lang-set');
        try { localStorage.setItem('seriel.lang', lang); } catch (err) {}
        applyLang(lang);
        if (btn.tagName === 'A') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  // ---------- Live dates in the app renderings -----------------------

  function renderDates() {
    var now = new Date();
    var lang = currentLang();
    var locale = lang === 'de' ? 'de-DE' : 'en-GB';
    var long = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    // The app is in English, so dates inside its screens stay English.
    document.querySelectorAll('[data-date="app-long"]').forEach(function (el) {
      el.textContent = long.replace(',', '');
    });
    document.querySelectorAll('[data-date="lock"]').forEach(function (el) {
      el.textContent = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    });
    document.querySelectorAll('[data-week]').forEach(function (week) {
      var cells = week.querySelectorAll('[data-day]');
      cells.forEach(function (cell, i) {
        var d = new Date(now);
        d.setDate(now.getDate() + i);
        var wd = cell.querySelector('.wd');
        var dn = cell.querySelector('.dn');
        if (wd) wd.textContent = d.toLocaleDateString('en-GB', { weekday: 'short' });
        if (dn) dn.textContent = String(d.getDate());
      });
    });
    document.querySelectorAll('[data-date="year"]').forEach(function (el) {
      el.textContent = String(now.getFullYear());
    });
  }

  // ---------- App Store link -----------------------------------------

  function bindStore() {
    if (!APP_STORE_URL) return;
    document.querySelectorAll('[data-store]').forEach(function (badge) {
      var link = document.createElement('a');
      link.className = badge.className;
      link.href = APP_STORE_URL;
      link.innerHTML = badge.innerHTML;
      link.querySelectorAll('[data-store-soon]').forEach(function (n) { n.remove(); });
      link.querySelectorAll('[data-store-live]').forEach(function (n) { n.hidden = false; });
      badge.replaceWith(link);
    });
  }

  // ---------- Navigation ---------------------------------------------

  function bindNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var btn = nav.querySelector('.nav-menu-btn');
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 4); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!btn) return;
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav-sheet a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820 && nav.classList.contains('is-open')) setOpen(false);
    });
  }

  // ---------- Reveal on scroll ---------------------------------------

  function bindReveal() {
    var targets = document.querySelectorAll('.reveal, .reveal-scale, [data-observe]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---------- Hero: phones part a little as the page scrolls ---------

  function bindStage() {
    var stage = document.querySelector('.stage');
    if (!stage || reduceMotion) return;
    var ticking = false;
    var update = function () {
      ticking = false;
      var rect = stage.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height) * 1.6 - 0.35));
      stage.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---------- Demo: mark watched, then rate --------------------------

  function bindCheck() {
    var check = document.querySelector('[data-demo="check"]');
    var card = document.querySelector('[data-demo="rating"]');
    if (!check || !card) return;
    var stars = card.querySelectorAll('.stars button');
    var starWrap = card.querySelector('.stars');

    check.addEventListener('click', function () {
      var on = check.getAttribute('aria-pressed') !== 'true';
      check.setAttribute('aria-pressed', String(on));
      check.classList.remove('pulse');
      void check.offsetWidth;
      if (on) check.classList.add('pulse');
      card.classList.toggle('is-shown', on);
      card.setAttribute('aria-hidden', String(!on));
      stars.forEach(function (s) { s.tabIndex = on ? 0 : -1; });
      if (!on) {
        starWrap.classList.remove('is-rated');
        stars.forEach(function (s) { s.classList.remove('is-on'); s.setAttribute('aria-pressed', 'false'); });
      }
    });

    stars.forEach(function (star, i) {
      star.tabIndex = -1;
      star.addEventListener('click', function () {
        stars.forEach(function (s, j) {
          s.classList.toggle('is-on', j <= i);
          s.setAttribute('aria-pressed', String(j === i));
        });
        starWrap.classList.add('is-rated');
      });
    });
  }

  // ---------- Demo: Library filters ----------------------------------

  function bindShelves() {
    var tabs = document.querySelectorAll('[data-shelf-tab]');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
          next.focus();
          select(next);
        }
      });
    });
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var shelf = document.getElementById(t.getAttribute('aria-controls'));
        if (!shelf) return;
        shelf.hidden = !on;
        if (on) {
          shelf.classList.remove('is-entering');
          void shelf.offsetWidth;
          shelf.classList.add('is-entering');
        }
      });
    }
  }

  // ---------- Demo: spoilers -----------------------------------------

  function bindSpoilers() {
    var sw = document.querySelector('[data-demo="spoilers"]');
    var list = document.querySelector('[data-demo="episodes"]');
    if (!sw || !list) return;
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      list.classList.toggle('spoilers-on', on);
    });
  }

  // ---------- Demo: Seriel's / Trakt's -------------------------------

  function bindSegments() {
    document.querySelectorAll('.seg').forEach(function (seg) {
      var buttons = seg.querySelectorAll('button');
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        });
      });
    });
  }

  // ---------- Help: filter articles ----------------------------------

  function bindHelpSearch() {
    var input = document.querySelector('[data-help-search]');
    if (!input) return;
    var groups = document.querySelectorAll('.help-group');
    var empty = document.querySelector('.no-results');
    var topics = document.querySelector('.topics');
    var norm = function (s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    input.addEventListener('input', function () {
      var q = norm(input.value.trim());
      var lang = currentLang();
      var any = false;
      groups.forEach(function (group) {
        var shown = 0;
        group.querySelectorAll('details').forEach(function (d) {
          var langNodes = d.querySelectorAll('[lang="' + lang + '"]');
          var text = '';
          langNodes.forEach(function (n) { text += ' ' + n.textContent; });
          var match = !q || norm(text).indexOf(q) !== -1;
          d.hidden = !match;
          if (match) shown++;
          if (q && match && q.length > 2) d.open = true;
          if (!q) d.open = false;
        });
        group.hidden = shown === 0;
        if (shown) any = true;
      });
      if (topics) topics.hidden = !!q;
      if (empty) empty.classList.toggle('is-shown', !any);
    });
  }

  // ---------- Docs: highlight the section in view --------------------

  function bindToc() {
    var links = document.querySelectorAll('.toc a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var first = null;
      document.querySelectorAll('[data-toc-section]').forEach(function (s) {
        if (!first && visible[s.id] && s.offsetParent !== null) first = s.id;
      });
      if (!first) return;
      links.forEach(function (a) { a.classList.toggle('is-active', a === map[first]); });
    }, { rootMargin: '-80px 0px -55% 0px' });
    document.querySelectorAll('[data-toc-section]').forEach(function (s) { io.observe(s); });
  }

  // ---------- Open a FAQ answer named in the address -----------------

  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
  }

  // ---------- Boot ---------------------------------------------------

  function init() {
    applyLang(currentLang());
    bindLang();
    bindStore();
    bindNav();
    bindReveal();
    bindStage();
    bindCheck();
    bindShelves();
    bindSpoilers();
    bindSegments();
    bindHelpSearch();
    bindToc();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
