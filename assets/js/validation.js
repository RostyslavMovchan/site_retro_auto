/* ЛР 9. Клієнтська перевірка покращує UX, але не замінює перевірку сервера. */
(() => {
  'use strict';
  const length = value => Array.from(value.trim()).length;
  const REGEX_PHONE = /^\+380\d{9}$/;
  // Практичний ASCII email: локальна частина, @ та доменні мітки з крапкою.
  const REGEX_EMAIL = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
  const validators = {
    validateName(value) {
      if (length(value) < 2 || length(value) > 100) return 'Введіть ім’я від 2 до 100 символів.';
      return /^[\p{L}\p{M}]+(?:[ ’'ʼ-][\p{L}\p{M}]+)*$/u.test(value.trim())
        ? '' : 'Використовуйте літери, пробіли, апостроф або дефіс.';
    },
    validateEmail(value) {
      const email = value.trim();
      const local = email.split('@')[0];
      return email.length <= 150 && local.length <= 64 && !local.startsWith('.') &&
        !local.endsWith('.') && !local.includes('..') && REGEX_EMAIL.test(email)
        ? '' : 'Введіть email у форматі name@example.com.';
    },
    validatePhone(value) {
      // Не змінюємо введення: пробіли, дужки та локальний формат показують помилку.
      return REGEX_PHONE.test(value) ? '' : 'Введіть +380 і рівно 9 цифр, без пробілів: +380501234567.';
    },
    validateMessage(value) {
      return length(value) >= 10 && length(value) <= 1500 ? '' : 'Опишіть побажання: від 10 до 1500 символів.';
    },
    validateAgreement(checked) {
      return checked ? '' : 'Підтвердьте згоду на використання контактів для відповіді.';
    }
  };
  // Ті самі функції використовуються в автоматичних тестах без DOM.
  if (typeof module !== 'undefined' && module.exports) module.exports = validators;
  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('booking-form');
    const dialog = document.getElementById('booking-success');
    if (!form || !dialog) return;
    const submit = form.querySelector('[type="submit"]');
    const status = document.getElementById('booking-status');
    let submitting = false;
    let attempted = false;
    const fields = [
      ['client-name', field => validators.validateName(field.value)],
      ['client-email', field => validators.validateEmail(field.value)],
      ['client-phone', field => validators.validatePhone(field.value)],
      ['booking-date', field => field.value && field.validity.valid ? '' : 'Оберіть дату не раніше сьогодні.'],
      ['booking-duration', field => field.value && field.validity.valid ? '' : 'Вкажіть цілу тривалість від 2 до 24 годин.'],
      ['booking-comment', field => validators.validateMessage(field.value)],
      ['booking-consent', field => validators.validateAgreement(field.checked)]
    ].map(([id, validate]) => ({ field: document.getElementById(id), validate }));

    function showState(field, error) {
      field.setAttribute('aria-invalid', String(Boolean(error)));
      field.classList.toggle('is-invalid', Boolean(error));
      field.classList.toggle('is-valid', !error);
      const hint = document.getElementById(`${field.id}-error`);
      hint.textContent = error || '✓ Заповнено правильно';
      hint.classList.toggle('field-error', Boolean(error));
      hint.classList.toggle('field-success', !error);
      return !error;
    }
    function validateField(item) { return showState(item.field, item.validate(item.field)); }
    function clearStates() {
      attempted = false;
      for (const { field } of fields) {
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('is-invalid', 'is-valid');
        document.getElementById(`${field.id}-error`).textContent = '';
      }
    }
    for (const item of fields) {
      const interact = () => {
        validateField(item);
        if (attempted) {
          const remaining = fields.filter(({ field }) => field.getAttribute('aria-invalid') === 'true').length;
          status.textContent = remaining ? `Перевірте поля з помилками: ${remaining}.` : 'Поля виправлено. Можна сформувати заявку.';
        }
      };
      item.field.addEventListener('input', interact);
      item.field.addEventListener('change', interact);
      item.field.addEventListener('blur', interact);
    }
    form.addEventListener('reset', clearStates);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (submitting || dialog.open) return;
      attempted = true;
      const invalid = fields.filter(item => !validateField(item));
      if (invalid.length) {
        status.textContent = `Перевірте поля з помилками: ${invalid.length}.`;
        invalid[0].field.focus();
        return;
      }
      submitting = true;
      submit.disabled = true;
      // Передаємо знімок даних для попереднього перегляду листа, без fetch або надсилання.
      form.dispatchEvent(new CustomEvent('booking:validated', { detail: new FormData(form) }));
      form.reset();
      dialog.showModal(); // Нативний dialog ізолює фон і утримує клавіатурний фокус.
      dialog.querySelector('button').focus();
    });
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
      // У діалозі одна кнопка: обидва напрямки Tab залишають фокус на ній.
      if (event.key === 'Tab') {
        event.preventDefault();
        dialog.querySelector('button').focus();
      }
    });
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    // Escape закриває dialog нативно; повертаємо фокус і дозволяємо нову заявку.
    dialog.addEventListener('close', () => {
      submitting = false;
      submit.disabled = false;
      submit.focus({ preventScroll: true });
    });
  });
})();
