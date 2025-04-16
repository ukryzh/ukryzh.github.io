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
      const container = document.getElementById('case-container');
      container.innerHTML = html;

      // Скрыть резюме и показать кейс
      document.querySelector('.resume').style.display = 'none';
      document.querySelector('.back-bar').style.display = 'block';

      activeCase = file;
      activeButton = button;

      // Обновим адресную строку
      history.pushState({ caseFile: file }, '', `#${file}`);
    })
    .catch(error => {
      alert('Ошибка при загрузке кейса: ' + error.message);
    });
}

function goBackToResume() {
  document.getElementById('case-container').innerHTML = '';
  document.querySelector('.resume').style.display = 'flex';
  document.querySelector('.back-bar').style.display = 'none';
  activeCase = null;
  activeButton = null;

  // Обновим адресную строку
  history.pushState({}, '', location.pathname);
}

// Назначаем обработчики на кнопки
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

// Назад в браузере
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.caseFile) {
    const file = event.state.caseFile;
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === file);
    loadCase(file, matchingButton);
  } else {
    goBackToResume();
  }
});

// Если перешли напрямую по ссылке типа #case1.html
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

