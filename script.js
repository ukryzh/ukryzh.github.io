// Переключение языка
let languageSwitch = document.querySelector('.lang-switch');
languageSwitch.addEventListener('click', toggleLanguage);

let currentLang = 'ru'; // Стартовый язык

function toggleLanguage() {
  if (currentLang === 'ru') {
    currentLang = 'en';
    document.querySelectorAll('.ru-text').forEach((el) => el.classList.add('hidden'));
    document.querySelectorAll('.en-text').forEach((el) => el.classList.remove('hidden'));
  } else {
    currentLang = 'ru';
    document.querySelectorAll('.en-text').forEach((el) => el.classList.add('hidden'));
    document.querySelectorAll('.ru-text').forEach((el) => el.classList.remove('hidden'));
  }
}

// Сохраняем начальное содержимое
const contentContainer = document.getElementById("mainContent");
let resumeContent = contentContainer.innerHTML;

let activeCase = null;
let activeButton = null;

function loadCase(caseFile, clickedBtn = null) {
  if (!caseFile) return;

  activeCase = caseFile;
  activeButton = clickedBtn;

  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.classList.remove('active-case');
    btn.innerHTML = btn.dataset.originalText || btn.textContent;
  });

  if (clickedBtn) {
    clickedBtn.classList.add('active-case');
    if (!clickedBtn.dataset.originalText) {
      clickedBtn.dataset.originalText = clickedBtn.innerHTML;
    }
    clickedBtn.innerHTML = '❮ Назад к резюме';
  }

  contentContainer.classList.add("fade-out");
  setTimeout(() => {
    fetch(caseFile)
      .then(res => res.text())
      .then(data => {
        contentContainer.innerHTML = `<div class="fade-in">${data}</div>`;
      })
      .catch(() => {
        contentContainer.innerHTML = "<p>Ошибка загрузки кейса.</p>";
      })
      .finally(() => {
        contentContainer.classList.remove("fade-out");
        contentContainer.classList.add("fade-in");
      });

    history.pushState({ caseFile }, "", `#${caseFile}`);
  }, 300);

  document.getElementById("backBar").style.display = "block";
}

function goBackToResume() {
  activeCase = null;
  activeButton = null;

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
  history.pushState({}, "", location.pathname);
}

document.querySelectorAll('.project-btn').forEach(button => {
  const file = button.dataset.file;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (activeCase === file) {
      goBackToResume();
    } else {
      loadCase(file, button);
    }
  });
});

// Навигация по браузеру
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

// При загрузке с хэшем
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (hash) {
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === hash);
    loadCase(hash, matchingButton);
  }
});
