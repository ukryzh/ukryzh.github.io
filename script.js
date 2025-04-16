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

// Переменные для активного кейса и кнопки
let activeCase = null;
let activeButton = null;

// Загрузка кейса
function loadCase(file, buttonElement) {
  if (activeCase === file) {
    goBack();
    return;
  }

  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error('Файл не найден');
      }
      return response.text();
    })
    .then(html => {
      const container = document.getElementById('case-container');
      container.innerHTML = html;

      document.querySelector('.resume').style.display = 'none';
      document.querySelector('.back-bar').style.display = 'none'; // Отключаем панель

      history.pushState({ caseFile: file }, '', `?case=${file}`);

      // Обновление текста кнопок
      if (activeButton) {
        activeButton.innerHTML = activeButton.dataset.originalText;
      }

      activeCase = file;
      activeButton = buttonElement;
      activeButton.dataset.originalText = activeButton.innerHTML;
      activeButton.innerHTML = '← Назад к резюме';
    })
    .catch(error => {
      alert('Ошибка при загрузке кейса: ' + error.message);
    });
}

// Возврат к резюме
function goBack() {
  document.getElementById('case-container').innerHTML = '';
  document.querySelector('.resume').style.display = 'flex';
  document.querySelector('.back-bar').style.display = 'none';

  history.pushState({}, '', window.location.pathname);

  if (activeButton) {
    activeButton.innerHTML = activeButton.dataset.originalText;
  }

  activeCase = null;
  activeButton = null;
}

// Поддержка кнопки браузера "Назад"
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.caseFile) {
    // При навигации назад — открыть кейс
    const matchingButton = Array.from(document.querySelectorAll('.project-btn')).find(btn =>
      btn.innerHTML.includes(event.state.caseFile.split('.')[0])
    );
    if (matchingButton) {
      loadCase(event.state.caseFile, matchingButton);
    }
  } else {
    // Иначе — вернуться к резюме
    goBack();
  }
});
