(function () {
  'use strict';

  // Включаем анимацию имени только если JS работает
  document.documentElement.classList.add('js');

  // Текущий год в подвале
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var toast = document.getElementById('toast');
  var timer;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  /* ---------- Копирование адреса почты ---------- */
  var copyBtn = document.getElementById('copy');
  var email = document.getElementById('email');

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'absolute';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  if (copyBtn && email) {
    copyBtn.addEventListener('click', function () {
      var text = email.textContent.trim();

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { showToast('Адрес скопирован'); },
          function () { showToast(fallbackCopy(text) ? 'Адрес скопирован' : 'Не удалось скопировать'); }
        );
      } else {
        showToast(fallbackCopy(text) ? 'Адрес скопирован' : 'Не удалось скопировать');
      }
    });
  }

  /* ---------- Форма: проверка и отправка через почтовую программу ---------- */
  var form = document.getElementById('form');

  function setError(input, message) {
    var field = input.closest('.field');
    var error = form.querySelector('.error[data-for="' + input.id + '"]');
    field.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message || '';
  }

  function validate(input) {
    var value = input.value.trim();
    if (!value) {
      setError(input, 'Заполните это поле');
      return false;
    }
    if (input.id === 'f-contact') {
      var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      var isPhone = /^[+\d][\d\s()\-]{6,}$/.test(value);
      if (!isEmail && !isPhone) {
        setError(input, 'Укажите почту или телефон');
        return false;
      }
    }
    setError(input, '');
    return true;
  }

  if (form) {
    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value) validate(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('invalid')) validate(input);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var to = email ? email.textContent.trim() : '';
      var subject = 'Заявка с сайта от ' + form.elements.name.value.trim();
      var body =
        'Имя: ' + form.elements.name.value.trim() + '\n' +
        'Контакт: ' + form.elements.contact.value.trim() + '\n\n' +
        form.elements.message.value.trim();

      window.location.href =
        'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      showToast('Открываю почтовую программу');
      form.reset();
    });
  }
})();
