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

        // === Повторная инициализация спойлеров ===
        const toggleButtons = document.querySelectorAll(".toggle-report");
        toggleButtons.forEach((btn) => {
          const targetId = btn.dataset.target;
          const reportContent = document.getElementById(targetId);
          if (reportContent) {
            btn.addEventListener("click", () => {
              reportContent.classList.toggle("expanded");
              btn.classList.toggle("expanded");
            });
          }
        });

        // === Повторная инициализация модалок со слайдами ===
        const slideImgs = document.querySelectorAll('.zoomable-slide');
        if (slideImgs.length > 0) {
          const slideSrcs = [...slideImgs].map(img => img.getAttribute('src'));
          slideImgs.forEach(img => {
            img.onclick = function () {
              openModalWithSlides(this.src, slideSrcs);
            };
          });
        }

        // === Одиночные картинки ===
        const singleImgs = document.querySelectorAll('.zoomable-img');
        singleImgs.forEach(img => {
          img.onclick = function () {
            const modal = document.getElementById('modal');
            const modalImg = document.getElementById('modalImg');
            modalImg.src = this.src;
            modal.style.display = 'flex';

            // очищаем слайды
            slideSources = [];
          };
        });

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
    btn.classList.remove('active-case');
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
    }
  });

  contentContainer.classList.remove("fade-in");
  contentContainer.classList.add("fade-out");
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(() => {
    contentContainer.innerHTML = resumeContent;
    contentContainer.classList.remove("fade-out");
    contentContainer.classList.add("fade-in");
  }, 150);

  // Чистим адресную строку и заменяем состояние
  history.replaceState({}, "", location.pathname);
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

window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (hash) {
    const matchingButton = [...document.querySelectorAll('.project-btn')]
      .find(btn => btn.dataset.file === hash);
    loadCase(hash, matchingButton);
  }
});

function openModal(src) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  slideSources = [];
  modalImg.src = src;
  modal.style.display = 'flex';
}



function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// === Навигация по слайдам в модальном окне ===
let slideSources = [];
let currentSlideIndex = 0;

function openModalWithSlides(src, allSrcs) {
  slideSources = allSrcs;
  currentSlideIndex = allSrcs.indexOf(src);

  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');

  modalImg.src = src;
  modal.style.display = 'block';
}

function changeSlide(direction) {
  if (slideSources.length === 0) return;

  currentSlideIndex += direction;
  if (currentSlideIndex < 0) currentSlideIndex = slideSources.length - 1;
  if (currentSlideIndex >= slideSources.length) currentSlideIndex = 0;

  document.getElementById('modalImg').src = slideSources[currentSlideIndex];
}

// Навешиваем кнопки вперед/назад (если они есть в HTML)
document.getElementById('modalNext')?.addEventListener('click', () => changeSlide(1));
document.getElementById('modalPrev')?.addEventListener('click', () => changeSlide(-1));




// Закрытие модального окна по клавише Esc
document.addEventListener('keydown', function (event) {
  const modal = document.getElementById('modal');
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

function scrollGallery(direction) {
  const gallery = document.getElementById("slideGallery");
  const slideWidth = gallery.querySelector("img")?.offsetWidth || 200;
  gallery.scrollBy({ left: direction * (slideWidth + 10), behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-report");

  toggleButtons.forEach((btn) => {
    const targetId = btn.dataset.target;
    const reportContent = document.getElementById(targetId);
    const arrow = btn.querySelector(".arrow");

    if (reportContent) {
      btn.addEventListener("click", () => {
        const isExpanded = reportContent.classList.contains("expanded");

        reportContent.classList.toggle("expanded");
        btn.classList.toggle("expanded");
      });
    }
  });
});




document.getElementById('modalImg').addEventListener('click', function (e) {
  const bounds = this.getBoundingClientRect();
  const clickX = e.clientX;

  if (clickX < bounds.left + bounds.width / 3) {
    changeSlide(-1);
  } else if (clickX > bounds.right - bounds.width / 3) {
    changeSlide(1);
  }
});
document.addEventListener('keydown', function (event) {
  const modal = document.getElementById('modal');
  if (modal.style.display === 'flex') {
    if (event.key === 'Escape') {
      closeModal();
    } else if (slideSources.length > 0) {
      if (event.key === 'ArrowLeft') {
        changeSlide(-1);
      } else if (event.key === 'ArrowRight') {
        changeSlide(1);
      }
    }
  }
});



document.addEventListener('DOMContentLoaded', function () {
  const scrollButton = document.querySelector('.scroll-to-top');

  function toggleScrollButton() {
    if (window.scrollY > 300) {
      scrollButton.style.display = 'flex';
    } else {
      scrollButton.style.display = 'none';
    }
  }

  // Показать/скрыть при загрузке и скролле
  toggleScrollButton();
  window.addEventListener('scroll', toggleScrollButton);

  // Прокрутка наверх по клику
  if (scrollButton) {
    scrollButton.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});


