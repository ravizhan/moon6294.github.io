// main.js
// 图片轮播效果
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
let slideInterval;

function showSlide(n) {
  currentSlide = (n + slides.length) % slides.length;
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
}
function nextSlide() {
  showSlide(currentSlide + 1);
}

function startSlideShow() {
  slideInterval = setInterval(nextSlide, 3000); // 3秒切换一次
}


function resetInterval() {
  clearInterval(slideInterval);
  startSlideShow();
}

// 绑定指示器点击和鼠标进出事件
indicators.forEach(indicator => {
  indicator.addEventListener('click', function() {
    const slideIndex = parseInt(this.getAttribute('data-slide'));
    showSlide(slideIndex);
    resetInterval();
  });
});

const banner = document.querySelector('.banner');
banner.addEventListener('mouseenter', () => clearInterval(slideInterval));
banner.addEventListener('mouseleave', () => resetInterval());

// 启动轮播
startSlideShow();
