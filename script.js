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

// Глобальные переменные для отслеживания активного кейса и кнопки
let activeCase = null;
let activeButton = null;

// Загрузка кейса
function loadCase(file, buttonElement) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error('Файл не найден');
      }
      return response.text();
    })
    .then(html => {
      // Скрыть основное резюме
      document.querySelector('.right-panel').style.display = 'none';

      // Показать блок с кейсом
      const container = document.getElementById('case-container');
      container.style.display = 'block';
      container.innerHTML = html;

      // Обновляем URL и состояние истории
      history.pushState({ caseFile: file }, '', `?case=${file}`);

      // Сохраняем кнопку и меняем текст
      if (activeButton && activeButton.dataset.originalText) {
        activeButton.innerHTML = activeButton.dataset.originalText;
      }

      activeCase = file;

      if (buttonElement) {
        activeButton = buttonElement;
        activeButton.dataset.originalText = activeButton.innerHTML;
        activeButton.innerHTML = '← Назад к резюме';
      } else {
        activeButton = null;
      }
    })
    .catch(error => {
      alert('Ошибка при загрузке кейса: ' + error.message);
    });
}

// Обработка нажатий на кнопки кейсов
document.querySelectorAll('.project-btn').forEach(button => {
  button.addEventListener('click', () => {
    const file = button.getAttribute('onclick').match(/'([^']+)'/)[1];

    if (activeCase === file) {
      goBack(); // Если кейс уже открыт — возврат
    } else {
      loadCase(file, button);
    }
  });
});

// Возврат к резюме
function goBack() {
  const container = document.getElementById('case-container');
  container.innerHTML = '';
  container.style.display = 'none';

  document.querySelector('.right-panel').style.display = 'block';

  if (activeButton && activeButton.dataset.originalText) {
    activeButton.innerHTML = activeButton.dataset.originalText;
  }

  activeCase = null;
  activeButton = null;

  history.pushState({}, '', location.pathname);
}

// Обработка кнопки "назад" в браузере
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.caseFile) {
    // Найдём соответствующую кнопку
    const matchingButton = Array.from(document.querySelectorAll('.project-btn')).find(btn =>
      event.state.caseFile.includes(btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1])
    );

    loadCase(event.state.caseFile, matchingButton);
  } else {
    goBack();
  }
});
