// =================================================================
// SERIEL — front-end behaviours
//
//   1. Issue line  — VOL = month (01–12), ISSUE = day. Localised:
//                    EN uses "VOL. 05 · ISSUE 3", DE uses "JG. 05 · NR. 3".
//   2. Theme       — INK / PAPER toggle, persisted in localStorage.
//                    Initial value applied in the inline blocking script
//                    in <head> to avoid the flash.
//   3. Language    — EN / DE toggle, also persisted. Initial value also
//                    applied in <head>; this script only handles clicks.
//   4. Reveal      — IntersectionObserver fades each spread up as it
//                    enters viewport. Skipped under reduced-motion.
// =================================================================

(function () {
    'use strict';

    // ---------- 1. Issue line ----------------------------------------

    function setIssueLine() {
        var d = new Date();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate());
        // VOL./ISSUE convention is kept in both languages — it's an
        // editorial flourish, not a translation surface.
        var label = 'VOL. ' + month + '  ·  ISSUE ' + day;

        var head = document.getElementById('issue-line');
        var foot = document.getElementById('footer-issue');
        if (head) head.textContent = label;
        if (foot) foot.textContent = label;
    }

    // ---------- 2. Theme toggle --------------------------------------

    function bindThemeToggle() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') || 'ink';
            var next = current === 'ink' ? 'paper' : 'ink';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('seriel.theme', next); } catch (e) {}
        });
    }

    // ---------- 3. Language toggle -----------------------------------

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'de') return;
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);
        try { localStorage.setItem('seriel.lang', lang); } catch (e) {}
        setIssueLine();
    }

    function bindLangToggle() {
        document.querySelectorAll('.masthead .lang-btn[data-lang-set]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang-set'));
            });
        });
    }

    // ---------- 4. Reveal-on-scroll ----------------------------------

    function bindReveal() {
        if (!('IntersectionObserver' in window)) return;
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        var targets = document.querySelectorAll(
            '.cover-headline, .cover-deck, .cover-cta, ' +
            '.toc-head, .toc-list, ' +
            '.spread-head, .spread-stage, ' +
            '.about-lead, .about-block, .about-attribution'
        );
        targets.forEach(function (el) { el.classList.add('reveal'); });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        targets.forEach(function (el) { io.observe(el); });
    }

    // ---------- Boot --------------------------------------------------

    function init() {
        setIssueLine();
        bindThemeToggle();
        bindLangToggle();
        bindReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
