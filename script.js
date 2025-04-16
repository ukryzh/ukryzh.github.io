// Переключение языка
let languageSwitch = document.querySelector('.lang-switch');
languageSwitch.addEventListener('click', toggleLanguage);

let currentLang = 'ru'; // Стартовый язык

function toggleLanguage() {
  if (currentLang === 'ru') {
    currentLang = 'en';
    document.querySelectorAll('.ru-text').forEach((element) => element.classList.add('hidden'));
    document.querySelectorAll('.en-text').forEach((element) => element.classList.remove('hidden'));
  } else {
    currentLang = 'ru';
    document.querySelectorAll('.en-text').forEach((element) => element.classList.add('hidden'));
    document.querySelectorAll('.ru-text').forEach((element) => element.classList.remove('hidden'));
  }
}

let activeCase = null;
let activeButton = null;

function loadCase(file, button) {
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error('Файл не найден');
      return response.text();
    })
    .then(html => {
      const container = document.getElementById('mainContent');
      container.innerHTML = html;

      // Обновим активную кнопку
      if (activeButton) {
        activeButton.innerHTML = activeButton.dataset.originalText;
      }
      activeButton = button;
      activeCase = file;

      // Сохраним оригинальный текст, если ещё не сохранён
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
      }
      button.innerHTML = 'Назад к резюме';

      // Обновим адресную строку
      history.pushState({ caseFile: file }, '', `#${file}`);
    })
    .catch(error => {
      alert('Ошибка при загрузке кейса: ' + error.message);
    });
}

function goBackToResume() {
  const container = document.getElementById('mainContent');
  container.innerHTML = originalMainContent; // восстановим сохранённый html

  if (activeButton && activeButton.dataset.originalText) {
    activeButton.innerHTML = activeButton.dataset.originalText;
  }

  activeCase = null;
  activeButton = null;

  history.pushState({}, '', location.pathname);
}

document.querySelectorAll('.project-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const file = button.dataset.file;

    if (activeCase === file) {
      goBackToResume();
    } else {
      loadCase(file, button);
    }
  });
});

// Сохраняем начальное содержимое правой панели
let originalMainContent = document.getElementById('mainContent').innerHTML;

// Навигация "назад" в браузере
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.caseFile) {
    const file = event.state.caseFile;
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === file);
    if (matchingButton) {
      loadCase(file, matchingButton);
    }
  } else {
    goBackToResume();
  }
});

// Если зашли напрямую по ссылке с #case1.html
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (hash) {
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === hash);
    if (matchingButton) {
      loadCase(hash, matchingButton);
    }
  }
});
