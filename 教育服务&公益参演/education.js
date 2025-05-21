// education.js
document.addEventListener('DOMContentLoaded', function() {
  // 教育项目悬停效果
  const educationItems = document.querySelectorAll('.education-item');
  
  educationItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
  });
  
  // 媒体报道链接效果
  const mediaLinks = document.querySelectorAll('.media-item a');
  
  mediaLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.fontWeight = 'bold';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.fontWeight = 'normal';
    });
  });
});