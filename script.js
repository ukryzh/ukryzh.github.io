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

function loadCase(caseFile, clickedBtn = null) {
  const contentContainer = document.getElementById("mainContent");

  // Активный класс на кнопке
  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.classList.remove('active-case');
    btn.innerHTML = btn.innerHTML.replace('❮ Назад к резюме', btn.dataset.originalText || btn.textContent);
  });

  if (clickedBtn) {
    clickedBtn.classList.add('active-case');
    if (!clickedBtn.dataset.originalText) {
      clickedBtn.dataset.originalText = clickedBtn.textContent;
    }
    clickedBtn.innerHTML = '❮ Назад к резюме';
  }

  // Плавный переход
  contentContainer.classList.add("fade-out");

  setTimeout(() => {
    fetch(caseFile)
      .then(res => res.text())
      .then(data => {
        contentContainer.innerHTML = data;
        contentContainer.classList.remove("fade-out");
        contentContainer.classList.add("fade-in");
      })
      .catch(err => {
        contentContainer.innerHTML = "<p>Ошибка загрузки кейса.</p>";
        contentContainer.classList.remove("fade-out");
        contentContainer.classList.add("fade-in");
      });

    history.pushState({ caseFile }, "", `#${caseFile}`);
  }, 300); // задержка совпадает с CSS transition

  document.getElementById("backBar").style.display = "block";

function goBackToResume() {
  const contentContainer = document.getElementById("mainContent");

  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.classList.remove('active-case');
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
    }
  });

  contentContainer.classList.remove("fade-in");
  contentContainer.classList.add("fade-out");

  setTimeout(() => {
    contentContainer.innerHTML = resumeContent;
    contentContainer.classList.remove("fade-out");
    contentContainer.classList.add("fade-in");
  }, 300);

  document.getElementById("backBar").style.display = "none";
  history.pushState({}, "", location.pathname); // убираем hash
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
