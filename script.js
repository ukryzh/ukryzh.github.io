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
function loadCase(file, button) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error('Файл не найден');
      }
      return response.text();
    })
    .then(html => {
      // Вставляем содержимое файла в правую панель
      const container = document.getElementById('case-container');
      container.innerHTML = html;

      // Скрываем резюме и показываем выбранный кейс
      document.querySelector('.resume').style.display = 'none';
      document.querySelector('.right-panel').style.display = 'none'; // Прячем правую панель резюме
      document.querySelector('.back-bar').style.display = 'block'; // Показываем кнопку "Назад к резюме"

      // Активируем текущую кнопку
      activeButton = button;
      activeCase = file;
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
function goBack() {
  document.querySelector('.right-panel').style.display = 'block'; // Показываем резюме
  document.getElementById('case-container').innerHTML = ''; // Очищаем контейнер с кейсом
  document.querySelector('.resume').style.display = 'flex'; // Показываем основное резюме

  // Прячем кнопку "Назад к резюме"
  document.querySelector('.back-bar').style.display = 'none';
  activeButton = null; // Сбрасываем активную кнопку
  activeCase = null; // Сбрасываем активный кейс
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

// Обработка нажатий на кнопки кейсов
document.querySelectorAll('.project-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault(); // предотвращает переход на другую страницу

    const file = button.getAttribute('onclick').match(/'([^']+)'/)[1];

    if (activeCase === file) {
      goBack(); // Если уже открыт — возвращаемся к резюме
    } else {
      loadCase(file, button); // Загружаем новый кейс
    }
  });
});

