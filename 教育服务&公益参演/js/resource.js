document.addEventListener('DOMContentLoaded', function() {
    // 轮播功能
    const slides = document.querySelectorAll('.resource-banner .slide');
    const indicators = document.querySelectorAll('.slide-indicators .indicator');
    let currentIndex = 0;
    let slideInterval;
  
    // 显示指定幻灯片
    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));
      
      currentIndex = index;
      slides[currentIndex].classList.add('active');
      indicators[currentIndex].classList.add('active');
    }
  
    // 下一张幻灯片
    function nextSlide() {
      const newIndex = (currentIndex + 1) % slides.length;
      showSlide(newIndex);
    }
  
    // 启动轮播
    function startSlider() {
      slideInterval = setInterval(nextSlide, 5000); 
    }
  
    // 指示器点击事件
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(index);
        startSlider();
      });
    });
  
    // 鼠标悬停控制
    const banner = document.querySelector('.resource-banner');
    banner.addEventListener('mouseenter', () => clearInterval(slideInterval));
    banner.addEventListener('mouseleave', startSlider);
  
    // 初始化
    showSlide(0);
    startSlider();
  });