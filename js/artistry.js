/**
 * Artistry™: счётчики количества в карточках товаров
 * и карусель «Бестселлеры Amway».
 */
(function () {
  'use strict';

  /* ---------- Счётчик количества ---------- */
  document.querySelectorAll('[data-qty]').forEach(function (qty) {
    var minus = qty.querySelector('[data-qty-minus]');
    var plus = qty.querySelector('[data-qty-plus]');
    var value = qty.querySelector('[data-qty-value]');
    if (!minus || !plus || !value) return;

    function current() {
      return parseInt(value.textContent, 10) || 1;
    }

    minus.addEventListener('click', function () {
      value.textContent = String(Math.max(1, current() - 1));
    });

    plus.addEventListener('click', function () {
      value.textContent = String(Math.min(99, current() + 1));
    });
  });

  /* ---------- Карусель бестселлеров ---------- */
  document.querySelectorAll('[data-best-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-best-track]');
    var prev = slider.querySelector('[data-best-prev]');
    var next = slider.querySelector('[data-best-next]');
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll('[data-best-dots] button')
    );
    if (!track) return;

    function step() {
      var item = track.querySelector('.art-best__item');
      if (!item) return track.clientWidth;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return item.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return track.scrollWidth - track.clientWidth;
    }

    function updateControls() {
      var x = track.scrollLeft;
      var max = maxScroll();
      if (prev) prev.disabled = x <= 1;
      if (next) next.disabled = x >= max - 1;
      if (dots.length) {
        var index = max > 0
          ? Math.round((x / max) * (dots.length - 1))
          : 0;
        dots.forEach(function (d, i) {
          d.classList.toggle('is-active', i === index);
        });
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var max = maxScroll();
        track.scrollTo({
          left: dots.length > 1 ? (max * i) / (dots.length - 1) : 0,
          behavior: 'smooth'
        });
      });
    });

    track.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    updateControls();
  });
})();
