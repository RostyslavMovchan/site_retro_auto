(() => {
  function mountGallery(section, lightboxAvailable) {
    const viewport = section.querySelector('.swiper');
    const controls = section.querySelector('.gallery-controls');
    const toggle = section.querySelector('.gallery-toggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let carousel;

    function stopAutoplay() {
      carousel?.autoplay.stop();
      toggle.textContent = 'Запустити автопрокрутку';
    }

    if (lightboxAvailable && window.Fancybox) {
      Fancybox.bind('#gallery [data-fancybox="retro-fleet"]', {
        Carousel: { transition: reducedMotion.matches ? false : 'slide' },
        Images: { zoom: !reducedMotion.matches },
        showClass: reducedMotion.matches ? false : 'f-fadeIn',
        hideClass: reducedMotion.matches ? false : 'f-fadeOut',
        on: { init: stopAutoplay },
      });
    }

    if (!window.Swiper) return;

    carousel = new Swiper(viewport, {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: reducedMotion.matches ? 0 : 450,
      rewind: true,
      keyboard: { enabled: true, onlyInViewport: true },
      autoplay: {
        enabled: !reducedMotion.matches,
        delay: 5500,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      },
      navigation: {
        prevEl: controls.querySelector('.gallery-prev'),
        nextEl: controls.querySelector('.gallery-next'),
      },
      pagination: {
        el: controls.querySelector('.gallery-pagination'),
        clickable: true,
        bulletElement: 'button',
      },
      a11y: {
        prevSlideMessage: 'Попереднє фото',
        nextSlideMessage: 'Наступне фото',
        paginationBulletMessage: 'Перейти до фото {{index}}',
        slideLabelMessage: '{{index}} з {{slidesLength}}',
      },
      on: {
        autoplayStop() { toggle.textContent = 'Запустити автопрокрутку'; },
      },
    });

    controls.hidden = false;
    if (reducedMotion.matches) stopAutoplay();

    toggle.addEventListener('click', () => {
      if (carousel.autoplay.running) {
        stopAutoplay();
      } else {
        carousel.autoplay.start();
        toggle.textContent = 'Зупинити автопрокрутку';
      }
    });

    section.addEventListener('focusin', (event) => {
      if (event.target !== toggle) stopAutoplay();
    });

    reducedMotion.addEventListener('change', (event) => {
      carousel.params.speed = event.matches ? 0 : 450;
      if (event.matches) stopAutoplay();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('gallery');
    if (!section) return;

    function loadVendor(filename, isStyle) {
      return new Promise((resolve, reject) => {
        const element = document.createElement(isStyle ? 'link' : 'script');
        if (isStyle) {
          element.rel = 'stylesheet';
          element.href = filename;
        } else {
          element.src = filename;
        }
        element.onload = resolve;
        element.onerror = reject;
        document.head.append(element);
      });
    }

    function enhance() {
      observer?.disconnect();
      Promise.allSettled([
        loadVendor('assets/vendor/swiper-bundle.min.css', true),
        loadVendor('assets/vendor/swiper-bundle.min.js', false),
        loadVendor('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.css', true),
        loadVendor('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.umd.js', false),
      ]).then(results => {
        if (results[0].status !== 'fulfilled' || results[1].status !== 'fulfilled') return;
        mountGallery(section, results[2].status === 'fulfilled' && results[3].status === 'fulfilled');
      });
    }

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) enhance();
        }, { rootMargin: '500px 0px' })
      : null;
    if (observer) observer.observe(section);
    else enhance();
  });
})();
