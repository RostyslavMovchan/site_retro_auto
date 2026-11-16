(() => {
  'use strict';

  const rates = new Map([
    ["Ford Mustang 1967", 2900],
    ["Dodge Charger 1969", 3200],
    ["Volkswagen Beetle 1972", 1500],
    ["Mercedes-Benz 300 SL Gullwing 1954", 3800],
    ["Jaguar E-Type Series 1 1961", 3400],
    ["Rolls-Royce Silver Cloud III 1965", 4500],
  ]);
  const limits = { min: 2, max: 12 };
  const driverRate = 500;
  const decorFee = 1200;
  const currency = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

  function quoteRental({ car, rawHours, badInput = false, driver, decor }) {
    const rate = rates.get(car);
    const value = typeof rawHours === 'string' ? rawHours.trim() : '';
    const hours = Number(value);
    const errors = {};
    if (rate === undefined) errors.car = 'Оберіть автомобіль зі списку.';
    if (badInput) {
      errors.hours = 'Введіть цілу кількість годин.';
    } else if (!value) {
      errors.hours = 'Вкажіть тривалість оренди.';
    } else if (!/^-?\d+$/.test(value)) {
      errors.hours = 'Введіть цілу кількість годин без дробів або літер.';
    } else if (!Number.isSafeInteger(hours) || hours < limits.min || hours > limits.max) {
      errors.hours = 'Введіть від 2 до 12 годин.';
    }
    if (errors.car || errors.hours) return { errors, total: null };
    const total = (rate + (driver ? driverRate : 0)) * hours + (decor ? decorFee : 0);
    return { errors, car, hours, total };
  }

  function mountCalculator(modal) {
    if (!modal) return;
    const [car, hours, driver, decor, total, book, carError, hoursError] = [
      'calc-car', 'calc-hours', 'calc-driver', 'calc-decor', 'calc-total',
      'calc-book-action', 'calc-car-error', 'calc-hours-error',
    ].map(id => modal.querySelector('#' + id));
    if ([car, hours, driver, decor, total, book, carError, hoursError].some(node => !node)) return;

    function showError(field, messageNode, message = '') {
      field.setAttribute('aria-invalid', String(Boolean(message)));
      field.classList.toggle('!border-rose-400', Boolean(message));
      messageNode.textContent = message;
    }

    function update() {
      const quote = quoteRental({
        car: car.value,
        rawHours: hours.value,
        badInput: hours.validity.badInput,
        driver: driver.checked,
        decor: decor.checked,
      });
      showError(car, carError, quote.errors.car);
      showError(hours, hoursError, quote.errors.hours);
      total.textContent = quote.total === null ? '—' : currency.format(quote.total) + ' ₴';
      book.disabled = quote.total === null;
      return quote;
    }

    [car, driver, decor].forEach(control => control.addEventListener('change', update));
    hours.addEventListener('input', update);
    hours.addEventListener('change', update);
    book.addEventListener('click', () => {
      const quote = update();
      if (quote.total === null) return;
      modal.dispatchEvent(new CustomEvent('rental:quoted', { detail: quote }));
    });
    update();
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { quoteRental, mountCalculator };
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      mountCalculator(document.getElementById('calculator-modal'));
    });
  }
})();
