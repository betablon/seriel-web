// =====================================================================
// Seriel — site behaviour
//
//   Language     EN / DE in one page; the root's data-lang picks one.
//                The first choice is made pre-paint in each page's <head>.
//   Theme        Light / dark switch; saved choice overrides the system.
//   Store link   Set APP_STORE_URL once Seriel is live and every
//                "Coming soon" badge becomes a link to the App Store.
//   Navigation   Mobile sheet, hairline once the page scrolls.
//   Reveal       Sections fade up as they enter the viewport.
//   Demos        The home page's iPhones: Today's check and rating,
//                Schedule's week strip, Library filters, the spoiler
//                switch and the Trakt sync choices.
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
    syncMergeLabels();
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

  // ---------- Light / dark -------------------------------------------
  //
  // No saved choice: follow the system (no data-theme on the root).
  // A click saves 'light' or 'dark' and sets data-theme, which the
  // stylesheet's token blocks key on. Only localStorage, never cookies.

  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  var themeMetaDefaults = [];

  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return systemDark.matches ? 'dark' : 'light';
  }

  function syncThemeUI() {
    var theme = effectiveTheme();
    document.querySelectorAll('button[data-theme-set]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-set') === theme));
    });
    // The browser chrome colour follows a manual choice too.
    var manual = root.hasAttribute('data-theme');
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta, i) {
      if (themeMetaDefaults[i] === undefined) themeMetaDefaults[i] = meta.getAttribute('content');
      meta.setAttribute('content', manual ? (theme === 'dark' ? '#0B0C10' : '#F5F2EB') : themeMetaDefaults[i]);
    });
  }

  function setTheme(theme) {
    try { localStorage.setItem('seriel.theme', theme); } catch (e) {}
    var swap = function () { root.setAttribute('data-theme', theme); syncThemeUI(); };
    // A soft cross-fade where the browser can do it, an instant swap otherwise.
    if (document.startViewTransition && !reduceMotion && theme !== effectiveTheme()) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }

  function bindTheme() {
    document.querySelectorAll('button[data-theme-set]').forEach(function (btn) {
      btn.addEventListener('click', function () { setTheme(btn.getAttribute('data-theme-set')); });
    });
    var onSystemChange = function () { syncThemeUI(); };
    if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemChange);
    syncThemeUI();
  }

  // ---------- Live dates in the app renderings -----------------------
  //
  // The app follows the device's language, so the dates on its screens
  // follow the page's.

  function renderDates() {
    var now = new Date();
    var lang = currentLang();
    var locale = lang === 'de' ? 'de-DE' : 'en-GB';
    var dayAfter = function (n) { var d = new Date(now); d.setDate(now.getDate() + n); return d; };
    var longDate = function (d) {
      var text = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
      return lang === 'en' ? text.replace(',', '') : text;
    };
    document.querySelectorAll('[data-date="app-long"], [data-date="lock"]').forEach(function (el) {
      el.textContent = longDate(now);
    });
    document.querySelectorAll('[data-week]').forEach(function (week) {
      week.querySelectorAll('[data-day]').forEach(function (cell, i) {
        var d = dayAfter(i);
        var wd = cell.querySelector('.wd');
        var dn = cell.querySelector('.dn');
        if (wd) wd.textContent = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
        if (dn) dn.textContent = String(d.getDate());
        if (cell.tagName === 'BUTTON') cell.setAttribute('aria-label', longDate(d));
      });
    });
    document.querySelectorAll('[data-day-label]').forEach(function (el) {
      var n = +el.getAttribute('data-day-label');
      el.textContent = n === 0 ? (lang === 'de' ? 'Heute' : 'Today')
        : n === 1 ? (lang === 'de' ? 'Morgen' : 'Tomorrow')
        : dayAfter(n).toLocaleDateString(locale, { weekday: 'long' });
    });
    document.querySelectorAll('[data-day-date]').forEach(function (el) {
      el.textContent = longDate(dayAfter(+el.getAttribute('data-day-date')));
    });
    document.querySelectorAll('[data-date^="plus"]').forEach(function (el) {
      var m = /^plus(\d+)(-short)?$/.exec(el.getAttribute('data-date'));
      if (!m) return;
      el.textContent = dayAfter(+m[1]).toLocaleDateString(locale, { day: 'numeric', month: m[2] ? 'short' : 'long' });
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

  // ---------- Demo: Today, mark watched, then rate --------------------
  //
  // As in the app: the hero moves straight on to the next episode and
  // "How was it?" comes up under it; a star rates it and the card goes.

  var TODAY_EPISODES = [
    ['S02E05', 'The Low Light', 52],
    ['S02E06', 'Undertow', 49],
    ['S02E07', 'Slack Water', 55],
    ['S02E08', 'High Tide', 58]
  ];

  function bindToday() {
    var screen = document.querySelector('[data-demo="today"]');
    if (!screen) return;
    var check = screen.querySelector('[data-today-check]');
    var ep = screen.querySelector('[data-today-ep]');
    var line = screen.querySelector('[data-today-line]');
    var rate = screen.querySelector('[data-today-rate]');
    var code = screen.querySelector('[data-rate-code]');
    var stars = rate.querySelectorAll('.app-stars button');
    var index = 0;
    var busy = false;
    var closeTimer = null;

    var clearStars = function () {
      stars.forEach(function (s) { s.classList.remove('is-on'); s.setAttribute('aria-pressed', 'false'); });
    };
    var showRating = function (show) {
      rate.classList.toggle('is-shown', show);
      if (show) rate.removeAttribute('inert'); else rate.setAttribute('inert', '');
    };

    check.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      clearTimeout(closeTimer);
      var marked = TODAY_EPISODES[index];
      var fromKeyboard = check.matches(':focus-visible');
      check.classList.remove('pulse');
      void check.offsetWidth;
      check.classList.add('is-done', 'pulse');
      setTimeout(function () {
        ep.classList.add('is-swapping');
        setTimeout(function () {
          index = (index + 1) % TODAY_EPISODES.length;
          var next = TODAY_EPISODES[index];
          line.textContent = next[0] + ' · ' + next[1] + ' · ' + next[2] + ' min';
          check.setAttribute('data-label-en', 'Mark Saltmarsh ' + next[0] + ' watched');
          check.setAttribute('data-label-de', 'Saltmarsh ' + next[0] + ' als gesehen markieren');
          check.setAttribute('aria-label', check.getAttribute('data-label-' + currentLang()));
          code.textContent = 'Saltmarsh · ' + marked[0];
          clearStars();
          check.classList.remove('is-done');
          ep.classList.remove('is-swapping');
          showRating(true);
          if (fromKeyboard) stars[0].focus({ preventScroll: true });
          busy = false;
        }, reduceMotion ? 0 : 280);
      }, reduceMotion ? 0 : 650);
    });

    stars.forEach(function (star, i) {
      star.addEventListener('click', function () {
        stars.forEach(function (s, j) {
          s.classList.toggle('is-on', j <= i);
          s.setAttribute('aria-pressed', String(j === i));
        });
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () {
          var hadFocus = rate.contains(document.activeElement);
          showRating(false);
          if (hadFocus) check.focus({ preventScroll: true });
        }, reduceMotion ? 300 : 750);
      });
    });
  }

  // ---------- Demo: Schedule, the week strip jumps to a day -----------

  function bindSchedule() {
    var screen = document.querySelector('[data-demo="schedule"]');
    if (!screen) return;
    var scroller = screen.querySelector('[data-sched-scroll]');
    screen.querySelectorAll('.week-pick [data-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = screen.querySelector('[data-day-section="' + btn.getAttribute('data-day') + '"]');
        if (!target) return;
        scroller.scrollTo({ top: target.offsetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  // ---------- Demo: Library filters ----------------------------------
  //
  // The pills on the phone and the notes beside it pick the same filter.

  function bindShelves() {
    var tabs = document.querySelectorAll('[data-shelf-tab]');
    if (!tabs.length) return;
    var picks = document.querySelectorAll('[data-shelf-pick]');
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
    picks.forEach(function (pick) {
      pick.addEventListener('click', function () {
        var tab = document.getElementById(pick.getAttribute('data-shelf-pick'));
        if (tab) select(tab);
      });
    });
    function select(tab) {
      if (tab.getAttribute('aria-selected') === 'true') return;
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
      picks.forEach(function (p) {
        p.setAttribute('aria-pressed', String(p.getAttribute('data-shelf-pick') === tab.id));
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

  // ---------- Demo: Trakt sync, Seriel's or Trakt's -------------------
  //
  // Each row's choice opens a pop-up menu, as in the app. The button at
  // the foot names what the sync will do, decided the way the app does:
  // anything that changes Trakt first, then anything new for Trakt.

  var MERGE_WORDS = {
    en: { seriel: 'Seriel’s', trakt: 'Trakt’s' },
    de: { seriel: 'Seriel', trakt: 'Trakt' }
  };

  function syncMergeLabels() {
    var words = MERGE_WORDS[currentLang()];
    document.querySelectorAll('.popup[data-merge]').forEach(function (b) {
      b.setAttribute('aria-label', b.getAttribute('data-title') + ': ' + words[b.getAttribute('data-choice')]);
    });
  }

  function bindMerge() {
    var sheet = document.querySelector('[data-demo="merge"] .sheet');
    if (!sheet) return;
    var menu = sheet.querySelector('[data-popmenu]');
    var items = menu.querySelectorAll('[data-pick]');
    var buttons = sheet.querySelectorAll('.popup[data-merge]');
    var openFor = null;

    var updateCta = function () {
      var c = {};
      buttons.forEach(function (b) { c[b.getAttribute('data-merge')] = b.getAttribute('data-choice'); });
      var changesTrakt = c.rating === 'seriel' || c.watchlist === 'seriel';
      var addsToTrakt = c.history === 'seriel';
      sheet.setAttribute('data-cta', changesTrakt ? 'update' : addsToTrakt ? 'add' : 'from');
    };

    var close = function (focusBack) {
      if (!openFor) return;
      menu.hidden = true;
      openFor.setAttribute('aria-expanded', 'false');
      if (focusBack) openFor.focus();
      openFor = null;
    };

    var open = function (btn) {
      openFor = btn;
      btn.setAttribute('aria-expanded', 'true');
      var choice = btn.getAttribute('data-choice');
      items.forEach(function (i) { i.setAttribute('aria-checked', String(i.getAttribute('data-pick') === choice)); });
      menu.hidden = false;
      // Below the button, or above it when the sheet runs out of room.
      var scale = sheet.getBoundingClientRect().width / sheet.offsetWidth || 1;
      var s = sheet.getBoundingClientRect();
      var b = btn.getBoundingClientRect();
      var below = (b.bottom - s.top) / scale + 4;
      var above = (b.top - s.top) / scale - menu.offsetHeight - 4;
      var fits = below + menu.offsetHeight < sheet.offsetHeight - 8;
      menu.style.top = (fits ? below : above) + 'px';
      menu.style.right = ((s.right - b.right) / scale) + 'px';
      menu.style.transformOrigin = fits ? 'top right' : 'bottom right';
      menu.style.animation = 'none';
      void menu.offsetWidth;
      menu.style.animation = '';
      (menu.querySelector('[aria-checked="true"]') || items[0]).focus({ preventScroll: true });
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = openFor === btn;
        close(false);
        if (!wasOpen) open(btn);
      });
    });
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!openFor) return;
        openFor.setAttribute('data-choice', item.getAttribute('data-pick'));
        updateCta();
        syncMergeLabels();
        close(true);
      });
    });
    menu.addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(items);
      var i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'Tab') {
        close(false);
      }
    });
    document.addEventListener('click', function (e) {
      if (openFor && !menu.contains(e.target)) close(false);
    });
    updateCta();
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
    bindTheme();
    bindStore();
    bindNav();
    bindReveal();
    bindStage();
    bindToday();
    bindSchedule();
    bindShelves();
    bindSpoilers();
    bindMerge();
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
