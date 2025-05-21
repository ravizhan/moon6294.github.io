document.addEventListener('DOMContentLoaded', function() {
  // 搜索功能
  const searchInput = document.querySelector('.search-login input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          alert(`正在搜索: ${searchTerm}`);
          this.value = '';
        }
      }
    });
  }

  // 表格行悬停效果增强
  const tableRows = document.querySelectorAll('.schedule-table tr');
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s ease';
      this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
    
    row.addEventListener('mouseleave', function() {
      this.style.boxShadow = 'none';
    });
  });

  // 响应式调整
  function handleResize() {
    const performanceCard = document.querySelector('.performance-card');
    if (window.innerWidth < 768 && performanceCard) {
      performanceCard.style.margin = '0 0 30px';
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();
});

// 图片模态框功能
function openModal(imgElement) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const captionText = document.getElementById('caption');
  
  modal.style.display = 'block';
  modalImg.src = imgElement.src;
  captionText.innerHTML = imgElement.alt;
  
  // 点击模态框背景也可关闭
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeModal();
    }
  };
  
  // ESC键关闭
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function closeModal() {
  document.getElementById('imageModal').style.display = 'none';
}