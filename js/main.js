/**
 * Общий скрипт для всех страниц: мобильное меню, выпадающие списки,
 * слайдеры, хотспоты, видео-галерея и модальное окно.
 */
(function () {
  'use strict';

  /* ---------- Утилиты ---------- */
  var lastFocused = null;

  function lockScroll() {
    document.body.classList.add('no-scroll');
  }

  function unlockScroll() {
    document.body.classList.remove('no-scroll');
  }

  function getFocusable(root) {
    return root.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  /* ---------- Мобильное меню ---------- */
  var menu = document.querySelector('[data-mobile-menu]');
  var menuToggle = document.querySelector('[data-mobile-menu-toggle]');

  function openMenu() {
    if (!menu) return;
    lastFocused = document.activeElement;
    menu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    lockScroll();
    var first = getFocusable(menu)[0];
    if (first) first.focus();
  }

  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    unlockScroll();
    if (lastFocused) lastFocused.focus();
  }

  if (menu && menuToggle) {
    menuToggle.addEventListener('click', openMenu);
    menu.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-close]') || e.target === menu.querySelector('.mobile-menu__backdrop')) {
        closeMenu();
      }
    });
  }

  /* ---------- Выпадающие списки ---------- */
  var dropdownToggles = Array.prototype.slice.call(
    document.querySelectorAll('[data-dropdown-toggle]')
  );

  function closeAllDropdowns(except) {
    dropdownToggles.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel && btn !== except) {
        panel.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  dropdownToggles.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var isOpen = panel.classList.contains('is-open');
      closeAllDropdowns();
      panel.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-dropdown-toggle]') && !e.target.closest('.is-open')) {
      closeAllDropdowns();
    }
  });

  /* ---------- Слайдеры (hero, история бренда и т. п.) ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = slider.querySelectorAll('[data-slide]');
    var dots = slider.querySelectorAll('[data-slider-dot]');
    var prev = slider.querySelector('[data-slider-prev]');
    var next = slider.querySelector('[data-slider-next]');
    var current = 0;

    if (!slides.length) return;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === current);
        s.setAttribute('aria-hidden', String(i !== current));
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { goTo(i); });
    });

    goTo(0);
  });

  /* ---------- Хотспоты ---------- */
  document.querySelectorAll('.hotspot__point').forEach(function (point) {
    point.addEventListener('click', function () {
      var active = point.classList.toggle('is-active');
      point.setAttribute('aria-expanded', String(active));
    });
  });

  /* ---------- Видео-галерея: миниатюры меняют обложку ---------- */
  document.querySelectorAll('[data-video-gallery]').forEach(function (gallery) {
    var cover = gallery.querySelector('[data-video-cover]');
    var thumbs = gallery.querySelectorAll('[data-video-thumb]');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        var src = thumb.getAttribute('data-video-thumb');
        if (cover && src) cover.src = src;
      });
    });
  });

  /* ---------- Модальное окно ---------- */
  var modal = document.querySelector('[data-modal]');

  function openModal(mediaSrc) {
    if (!modal) return;
    lastFocused = document.activeElement;
    var media = modal.querySelector('[data-modal-media]');
    if (media && mediaSrc) media.src = mediaSrc;
    modal.classList.add('is-open');
    lockScroll();
    modal.querySelector('[data-modal-close]').focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    unlockScroll();
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-modal-open'));
    });
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]') || e.target.classList.contains('modal__backdrop')) {
        closeModal();
      }
    });

    /* Простая ловушка фокуса внутри модального окна */
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusable(modal);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Escape закрывает меню, модалку и дропдауны ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      closeMenu();
      closeAllDropdowns();
    }
  });

  /* ---------- Поиск в шапке (демо-валидация) ---------- */
  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  });
})();
