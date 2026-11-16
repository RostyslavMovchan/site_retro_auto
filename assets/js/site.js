
    document.addEventListener('DOMContentLoaded', () => {

      // Відеофон: локальний ролик із плавним циклом, без звуку.
      const heroVideo = document.getElementById('hero-background-video');
      const heroVideoToggle = document.getElementById('hero-video-toggle');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let autoplayTimer;

      function syncHeroVideoControl() {
        const label = heroVideo.paused ? 'Відтворити відео' : 'Пауза відео';
        heroVideoToggle.setAttribute('aria-label', label);
        heroVideoToggle.querySelector('span').textContent = label;
        heroVideoToggle.querySelector('i').className = heroVideo.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
      }

      async function playHeroVideo() {
        if (!heroVideo.hasAttribute('src')) heroVideo.src = heroVideo.dataset.src;
        try { await heroVideo.play(); } catch { syncHeroVideoControl(); }
      }

      function scheduleHeroVideo() {
        if (reducedMotion.matches || navigator.connection?.saveData
            || !window.matchMedia('(min-width: 768px)').matches) return;
        autoplayTimer = setTimeout(() => {
          if (!reducedMotion.matches && !heroVideo.hasAttribute('src')
              && heroVideo.getBoundingClientRect().bottom > 0) playHeroVideo();
        }, 1800);
      }

      heroVideo.addEventListener('play', syncHeroVideoControl);
      heroVideo.addEventListener('pause', syncHeroVideoControl);
      heroVideoToggle.addEventListener('click', () => {
        clearTimeout(autoplayTimer);
        if (heroVideo.paused) playHeroVideo();
        else heroVideo.pause();
      });
      if (document.readyState === 'complete') scheduleHeroVideo();
      else window.addEventListener('load', scheduleHeroVideo, { once: true });
      reducedMotion.addEventListener('change', () => {
        clearTimeout(autoplayTimer);
        if (reducedMotion.matches) heroVideo.pause();
        else scheduleHeroVideo();
      });
      syncHeroVideoControl();

      document.querySelectorAll('[data-embed-src]').forEach(button => {
        button.addEventListener('click', () => {
          const frame = document.createElement('iframe');
          frame.src = button.dataset.embedSrc;
          frame.title = button.dataset.embedTitle;
          frame.referrerPolicy = 'strict-origin-when-cross-origin';
          frame.allowFullscreen = true;
          button.replaceWith(frame);
          frame.focus();
        }, { once: true });
      });


      
      // 1. Mobile Menu Toggle
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      const iconBars = document.getElementById('menu-icon-bars');
      const iconClose = document.getElementById('menu-icon-close');
      const mobileLinks = document.querySelectorAll('.mobile-nav-link');

      function toggleMobileMenu() {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
        iconBars.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
      }

      mobileMenuBtn.addEventListener('click', toggleMobileMenu);

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (!mobileMenu.classList.contains('hidden')) {
            toggleMobileMenu();
          }
        });
      });

      // 2. Dynamic ScrollSpy: Підсвічування активного пункту навігації
      const sections = document.querySelectorAll('section[id], footer[id]');
      const navLinks = document.querySelectorAll('nav a.nav-link');

      function updateActiveNav() {
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
              }
            });
          }
        });
      }

      window.addEventListener('scroll', updateActiveNav, { passive: true });
      updateActiveNav();

      // 3. Modals Management (Calendar & Calculator)
      const calendarModal = document.getElementById('calendar-modal');
      const calculatorModal = document.getElementById('calculator-modal');
      const openCalendarBtn = document.getElementById('hero-widget-calendar');
      const openCalcBtn = document.getElementById('hero-widget-calculator');
      const heroCalcCta = document.getElementById('hero-calc-cta');
      const closeButtons = document.querySelectorAll('.modal-close-btn');
      let modalTrigger = null;

      function openModal(modal, trigger) {
        modalTrigger = trigger;
        if (modal === calendarModal) renderCalendar();
        modal.classList.remove('hidden');
        document.querySelector('main').inert = true;
        document.getElementById('main-header').inert = true;
        document.querySelector('body > footer').inert = true;
        document.body.classList.add('overflow-hidden');
        modal.querySelector('.modal-close-btn').focus();
      }

      function closeModal(modal) {
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        document.querySelector('main').inert = false;
        document.getElementById('main-header').inert = false;
        document.querySelector('body > footer').inert = false;
        document.body.classList.remove('overflow-hidden');
        if (modalTrigger) modalTrigger.focus({ preventScroll: true });
      }

      if (openCalendarBtn) openCalendarBtn.addEventListener('click', event => openModal(calendarModal, event.currentTarget));
      if (openCalcBtn) openCalcBtn.addEventListener('click', event => openModal(calculatorModal, event.currentTarget));
      if (heroCalcCta) heroCalcCta.addEventListener('click', event => openModal(calculatorModal, event.currentTarget));

      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          closeModal(calendarModal);
          closeModal(calculatorModal);
        });
      });

      [calendarModal, calculatorModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal(modal);
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal(calendarModal);
          closeModal(calculatorModal);
        }
        if (e.key === 'Tab') {
          const modal = [calendarModal, calculatorModal].find(item => !item.classList.contains('hidden'));
          if (!modal) return;
          const controls = modal.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // 4. Transfer a validated quote to the existing booking form.
      calculatorModal.addEventListener('rental:quoted', ({ detail }) => {
        const bookingSection = document.getElementById('booking');
        const bookingCar = document.getElementById('car-select');
        const bookingDuration = document.getElementById('booking-duration');
        if (!bookingSection || !bookingCar || !bookingDuration) return;

        bookingCar.value = detail.car;
        bookingDuration.value = detail.hours;
        bookingDuration.dispatchEvent(new Event('input', { bubbles: true }));
        closeModal(calculatorModal);
        bookingDuration.focus({ preventScroll: true });
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        bookingSection.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
        bookingSection.classList.add('form-highlight-pulse');
        setTimeout(() => bookingSection.classList.remove('form-highlight-pulse'), 1500);
      });

      // 5. Calendar: local dates and demo availability (no server connected).
      const calendarApplyBtn = document.getElementById('calendar-apply-btn');
      const calendarDateInput = document.getElementById('calendar-date-input');
      const bookingDate = document.getElementById('booking-date');
      const calendarDays = document.getElementById('calendar-days');
      const calendarStatus = document.getElementById('calendar-selection-status');
      const demoAvailability = new Map();
      const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });
      const weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' });
      const fullDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

      function localDateValue(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      function syncCalendarSelection(showError = false) {
        const value = calendarDateInput.value;
        const status = demoAvailability.get(value);
        let error = '';
        if (!value) error = 'Оберіть дату в календарі або введіть її вручну.';
        else if (!calendarDateInput.validity.valid) error = 'Оберіть коректну дату, не раніше сьогодні.';
        else if (status === 'busy') error = 'Ця дата зайнята. Оберіть інший день.';
        else if (status === 'reserved') error = 'На цю дату діє тимчасова бронь. Оберіть інший день.';

        calendarDays.querySelectorAll('.calendar-day').forEach(button => {
          button.setAttribute('aria-pressed', String(button.dataset.date === value && !error));
        });
        const invalid = Boolean(error && (value || showError));
        calendarDateInput.setAttribute('aria-invalid', String(invalid));
        calendarStatus.classList.toggle('is-error', invalid);
        calendarStatus.textContent = error || `Обрано: ${fullDate.format(new Date(`${value}T12:00:00`))} Дату буде перенесено до заявки.`;
        return !error;
      }

      function renderCalendar() {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        calendarDateInput.min = localDateValue(today);
        demoAvailability.clear();
        calendarDays.replaceChildren();
        for (let offset = 1; offset <= 12; offset++) {
          const date = new Date(today);
          date.setDate(today.getDate() + offset);
          const value = localDateValue(date);
          // Sample statuses mirror the reference; replace with an availability API when connected.
          const status = [3, 8].includes(offset) ? 'busy' : offset === 5 ? 'reserved' : 'available';
          const label = status === 'busy' ? 'Зайнято' : status === 'reserved' ? 'Резерв' : 'Вільно';
          const icon = status === 'busy' ? 'fa-lock' : status === 'reserved' ? 'fa-clock' : 'fa-circle-check';
          demoAvailability.set(value, status);
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'calendar-day';
          button.dataset.date = value;
          button.dataset.status = status;
          button.disabled = status !== 'available';
          button.setAttribute('aria-label', `${fullDate.format(date)}, ${label}`);
          button.setAttribute('aria-pressed', 'false');
          button.innerHTML = `<span class="calendar-day-date">${shortDate.format(date)}</span><span>${weekday.format(date)}</span><span class="calendar-day-state"><i class="fa-solid ${icon}" aria-hidden="true"></i>${label}</span>`;
          button.addEventListener('click', () => {
            calendarDateInput.value = value;
            syncCalendarSelection();
          });
          calendarDays.append(button);
        }
        syncCalendarSelection();
      }

      calendarDateInput.addEventListener('input', () => syncCalendarSelection());

      if (calendarApplyBtn) {
        calendarApplyBtn.addEventListener('click', () => {
          if (!syncCalendarSelection(true)) {
            calendarDateInput.focus();
            return;
          }
          bookingDate.value = calendarDateInput.value;
          closeModal(calendarModal);
          const bookingSection = document.getElementById('booking');
          bookingSection.scrollIntoView({ behavior: 'smooth' });
          bookingDate.focus({ preventScroll: true });
        });
      }

      // 6. Quick car selection from cards to booking form
      const carButtons = document.querySelectorAll('.car-select-btn');
      const carSelect = document.getElementById('car-select');

      carButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const carName = btn.getAttribute('data-car');
          if (carSelect && carName) {
            for (let option of carSelect.options) {
              if (option.value === carName || option.text.includes(carName)) {
                carSelect.value = option.value;
                break;
              }
            }
          }
        });
      });


      // Static hosting: prepare an email draft; never claim that a server received a booking.
      const bookingForm = document.getElementById('booking-form');
      const bookingPreview = document.getElementById('booking-preview');
      const bookingEmailLink = document.getElementById('booking-email-link');
      let bookingText = '';
      bookingForm.addEventListener('booking:validated', (event) => {
        const fields = event.detail;
        bookingText = [
          'Заявка Retro Auto',
          `Авто: ${fields.get('car') || 'Потрібна допомога з підбором'}`,
          `Дата: ${fields.get('date')}`,
          `Тривалість: ${fields.get('duration')} год`,
          `Ім’я: ${fields.get('name')}`,
          `Email: ${fields.get('email')}`,
          `Телефон: ${fields.get('phone')}`,
          `Побажання: ${fields.get('comment') || 'Без додаткових побажань'}`
        ].join('\n');
        document.getElementById('booking-summary').textContent = bookingText;
        bookingEmailLink.href = `mailto:info@retroauto.lviv.ua?subject=${encodeURIComponent('Підбір ретро-авто — Retro Auto')}&body=${encodeURIComponent(bookingText)}`;
        bookingPreview.hidden = false;
        document.getElementById('booking-status').textContent = 'Заявку сформовано. Перевірте її та натисніть «Відкрити лист». Надсилання відбувається у вашій поштовій програмі.';
      });
      document.getElementById('booking-copy').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(bookingText);
          document.getElementById('booking-status').textContent = 'Текст заявки скопійовано.';
        } catch {
          document.getElementById('booking-status').textContent = 'Автоматичне копіювання недоступне. Виділіть текст заявки та скопіюйте його вручну.';
        }
      });

      /* ЛР №7: динамічний валютний віджет.
         Єдине зовнішнє джерело — публічний HTTPS API НБУ; ключ доступу не потрібен.
         Запитується курс на календарну дату в Europe/Kyiv, а не часовий пояс хостингу.
         Відповідь перевіряється: потрібні USD, EUR, додатні rate та дата курсу.
         Перерахунок: сума × курс вихідної валюти до UAH / курс цільової до UAH.
         Жодних вигаданих запасних курсів: при помилці показуємо повідомлення та повтор.
         Дані API додаються через textContent, не як довірений HTML.
      */
      const fxAmount = document.getElementById('fx-amount');
      const fxFrom = document.getElementById('fx-from');
      const fxTo = document.getElementById('fx-to');
      const fxOutput = document.getElementById('fx-output');
      const fxStatus = document.getElementById('fx-status');
      const fxRefresh = document.getElementById('fx-refresh');
      const numberFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 });
      let exchangeRates = null;
      let fxLoading = false;

      function convertCurrency() {
        if (!exchangeRates) return;
        const value = fxAmount.valueAsNumber;
        if (!Number.isFinite(value) || value < 0 || !fxAmount.checkValidity()) {
          fxOutput.textContent = 'Введіть коректну невід’ємну суму.';
          return;
        }
        const converted = value * exchangeRates[fxFrom.value] / exchangeRates[fxTo.value];
        fxOutput.textContent = `${numberFormat.format(value)} ${fxFrom.value} ≈ ${numberFormat.format(converted)} ${fxTo.value}`;
      }

      async function loadExchangeRates() {
        if (fxLoading) return;
        fxLoading = true;
        fxRefresh.disabled = true;
        document.getElementById('currency-widget').setAttribute('aria-busy', 'true');
        fxStatus.textContent = 'Завантажуємо офіційні курси НБУ…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
          const datePart = (type) => parts.find(part => part.type === type).value;
          const date = `${datePart('year')}${datePart('month')}${datePart('day')}`;
          const response = await fetch(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json`, { signal: controller.signal, credentials: 'omit' });
          if (!response.ok) throw new Error('NBU HTTP error');
          const data = await response.json();
          if (!Array.isArray(data)) throw new Error('Invalid response');
          const usd = data.find(item => item.cc === 'USD');
          const eur = data.find(item => item.cc === 'EUR');
          if (![usd, eur].every(item => item && Number.isFinite(item.rate) && item.rate > 0 && typeof item.exchangedate === 'string')) throw new Error('Missing rates');
          exchangeRates = { UAH: 1, USD: usd.rate, EUR: eur.rate };
          document.getElementById('fx-usd').textContent = `${numberFormat.format(usd.rate)} ₴`;
          document.getElementById('fx-eur').textContent = `${numberFormat.format(eur.rate)} ₴`;
          fxStatus.textContent = `Курс USD на ${usd.exchangedate}, EUR на ${eur.exchangedate}.`;
          convertCurrency();
        } catch {
          fxStatus.textContent = exchangeRates
            ? 'Не вдалося оновити курс. Залишено попередньо завантажені дані цієї сесії.'
            : 'Курси тимчасово недоступні. Перевірте з’єднання та натисніть «Оновити». ';
          if (!exchangeRates) fxOutput.textContent = 'Розрахунок з’явиться після завантаження курсів.';
        } finally {
          clearTimeout(timeout);
          fxLoading = false;
          fxRefresh.disabled = false;
          document.getElementById('currency-widget').setAttribute('aria-busy', 'false');
        }
      }
      fxAmount.addEventListener('input', convertCurrency);
      fxFrom.addEventListener('change', convertCurrency);
      fxTo.addEventListener('change', convertCurrency);
      fxRefresh.addEventListener('click', loadExchangeRates);
      // Завантажуємо зовнішні дані лише коли віджет наближається до області перегляду.
      if ('IntersectionObserver' in window) {
        const fxObserver = new IntersectionObserver((entries, observer) => {
          if (entries.some(entry => entry.isIntersecting)) {
            loadExchangeRates();
            observer.disconnect();
          }
        }, { rootMargin: '250px' });
        fxObserver.observe(document.getElementById('currency-widget'));
      } else {
        loadExchangeRates();
      }
      // Закриваємо мобільну навігацію при переході на десктоп або натисканні Escape.
      window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
        if (event.matches && mobileMenuBtn.getAttribute('aria-expanded') === 'true') toggleMobileMenu();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
          toggleMobileMenu();
          mobileMenuBtn.focus();
        }
      });
      document.querySelectorAll('[data-date-input]').forEach(input => {
        input.min = localDateValue(new Date());
      });
      // Фон сторінки недоступний для взаємодії, доки відкрите модальне вікно.
      // Підтримка inert у сучасних браузерах доповнює наявну пастку фокусу.
    });
