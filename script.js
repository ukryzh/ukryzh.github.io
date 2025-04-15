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

// Панель "Назад к резюме"
let backToResumeButton = document.querySelector('.back-bar button');
backToResumeButton.addEventListener('click', () => {
  window.history.back(); // возвращаемся на предыдущую страницу
});

// Динамическое отображение проекта
let projectButtons = document.querySelectorAll('.project-btn');
projectButtons.forEach(button => {
  button.addEventListener('click', function () {
    let projectId = this.dataset.projectId; // предполагается, что у кнопок есть data-атрибут с id проекта
    showProjectDetails(projectId);
  });
});

function showProjectDetails(projectId) {
  // Скрываем резюме и показываем проект
  document.querySelector('.resume').classList.add('hidden');
  document.querySelector(`.project-details[data-project-id="${projectId}"]`).classList.remove('hidden');
  document.querySelector('.back-bar').style.display = 'block'; // Показываем кнопку "Назад к резюме"
}

function loadCase(file) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error('Файл не найден');
      }
      return response.text();
    })
    .then(html => {
      const container = document.getElementById('case-container');
      container.innerHTML = `
        <button onclick="goBack()" style="position: sticky; top: 0; background: #fff; padding: 10px; border: none; cursor: pointer;">
          ← Назад к резюме
        </button>
        ${html}
      `;
      document.querySelector('.resume').style.display = 'none';
    })
    .catch(error => {
      alert('Ошибка при загрузке кейса: ' + error.message);
    });
}

function goBack() {
  document.getElementById('case-container').innerHTML = '';
  document.querySelector('.resume').style.display = 'flex';
}
