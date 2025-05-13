const currentLang = location.pathname.includes('en') ? 'en' : 'ru';
const contentContainer = document.getElementById("mainContent");
let resumeContent = contentContainer.innerHTML;

let activeCase = null;
let activeButton = null;

function loadCase(caseFile, clickedBtn = null) {
  if (!caseFile) return;

  activeCase = caseFile;
  activeButton = clickedBtn;

  contentContainer.classList.remove("fade-in");
  contentContainer.classList.add("fade-out");

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetch(caseFile)
      .then(res => res.text())
      .then(data => {
        contentContainer.innerHTML = data;
        contentContainer.classList.remove("fade-out");
        contentContainer.classList.add("fade-in");

        reinitializeDynamicContent();

      })
      .catch(() => {
        contentContainer.innerHTML = "<p>Ошибка загрузки кейса.</p>";
        contentContainer.classList.remove("fade-out");
        contentContainer.classList.add("fade-in");
      });

    history.pushState({ caseFile }, "", `#${caseFile}`);
  }, 150);
}

function goBackToResume() {
  activeCase = null;
  activeButton = null;

  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.classList.remove('active-case', 'back-mode');
    if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  });

  contentContainer.classList.remove("fade-in");
  contentContainer.classList.add("fade-out");

  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    contentContainer.innerHTML = resumeContent;
    contentContainer.classList.remove("fade-out");
    contentContainer.classList.add("fade-in");
    reinitializeDynamicContent();
  }, 150);

  history.replaceState({}, "", location.pathname);
}

function reinitializeDynamicContent() {
  // Спойлеры
  document.querySelectorAll(".toggle-report").forEach(btn => {
    const targetId = btn.dataset.target;
    const reportContent = document.getElementById(targetId);
    if (reportContent) {
      btn.addEventListener("click", () => {
        reportContent.classList.toggle("expanded");
        btn.classList.toggle("expanded");
      });
    }
  });

  // Модальные картинки и слайды
  const slideImgs = document.querySelectorAll('.zoomable-slide');
  const singleImgs = document.querySelectorAll('.zoomable-img');

  let slideSrcs = [...slideImgs].map(img => img.src);
  let currentSlideIndex = 0;

  function openModalWithSlides(src) {
    currentSlideIndex = slideSrcs.indexOf(src);
    openModal(src);
    document.onkeydown = (e) => {
      if (e.key === 'ArrowRight') {
        currentSlideIndex = (currentSlideIndex + 1) % slideSrcs.length;
        document.getElementById('modalImg').src = slideSrcs[currentSlideIndex];
      } else if (e.key === 'ArrowLeft') {
        currentSlideIndex = (currentSlideIndex - 1 + slideSrcs.length) % slideSrcs.length;
        document.getElementById('modalImg').src = slideSrcs[currentSlideIndex];
      }
    };
  }

  slideImgs.forEach(img => {
    img.addEventListener('click', () => openModalWithSlides(img.src));
  });

  singleImgs.forEach(img => {
    img.addEventListener('click', () => {
      openModal(img.src);
      document.onkeydown = null;
    });
  });
}

function openModal(src) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  modalImg.src = src;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Управление слайдами по стрелкам в модалке
document.getElementById('modalImg')?.addEventListener('click', function (e) {
  const bounds = this.getBoundingClientRect();
  const clickX = e.clientX;

  if (clickX < bounds.left + bounds.width / 3) {
    changeSlide(-1);
  } else if (clickX > bounds.right - bounds.width / 3) {
    changeSlide(1);
  }
});

function changeSlide(direction) {
  if (!window.slideSources || !window.slideSources.length) return;
  window.currentSlideIndex = (window.currentSlideIndex + direction + window.slideSources.length) % window.slideSources.length;
  document.getElementById('modalImg').src = window.slideSources[window.currentSlideIndex];
}

document.addEventListener('keydown', function (event) {
  const modal = document.getElementById('modal');
  if (modal.style.display === 'flex') {
    if (event.key === 'Escape') closeModal();
  }
});

// Кнопки прокрутки галереи
function scrollGallery(direction) {
  const gallery = document.getElementById("slideGallery");
  const slideWidth = gallery.querySelector("img")?.offsetWidth || 200;
  gallery.scrollBy({ left: direction * (slideWidth + 10), behavior: "smooth" });
}

document.getElementById('modalNext')?.addEventListener('click', () => changeSlide(1));
document.getElementById('modalPrev')?.addEventListener('click', () => changeSlide(-1));

// Кнопка "вверх"
document.addEventListener('DOMContentLoaded', function () {
  const scrollButton = document.querySelector('.scroll-to-top');
  function toggleScrollButton() {
    scrollButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
  }
  toggleScrollButton();
  window.addEventListener('scroll', toggleScrollButton);

  scrollButton?.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Назначение одного обработчика на project-btn
  document.querySelectorAll('.project-btn').forEach(button => {
    const fileBase = button.dataset.file;
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent.trim();
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();

      const isBack = button.textContent.trim() === (currentLang === 'en' ? 'Back to Resume' : 'Назад к резюме');

      if (isBack || activeCase === fileBase) {
        goBackToResume();
      } else {
        const caseFile = currentLang === 'en' ? `${fileBase}_en.html` : `${fileBase}.html`;
        button.textContent = currentLang === 'en' ? 'Back to Resume' : 'Назад к резюме';
        button.classList.add('active-case', 'back-mode');
        loadCase(caseFile, button);
      }

      document.querySelectorAll('.project-btn').forEach(btn => {
        if (btn !== button) {
          btn.classList.remove('active-case', 'back-mode');
          btn.textContent = btn.dataset.originalText;
        }
      });
    });
  });

  const hash = location.hash.slice(1);
  if (hash) {
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === hash);
    loadCase(hash, matchingButton);
  }
});

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
