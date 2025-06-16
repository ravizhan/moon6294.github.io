document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  // const loadingIndicator = document.getElementById('loading');
  const preview = document.getElementById('preview');
  const audioElement = document.getElementById('generated-audio');
  const downloadBtn = document.getElementById('download-btn');
  const resultContainer = document.querySelector('.result-container');


  // 显示/隐藏加载指示器和预览区域
  // function showLoading(show) {
  //   loadingIndicator.style.display = show ? 'flex' : 'none';
  //   preview.style.display = show ? 'none' : 'flex';
  // }

  // 显示成功消息
  function showSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>音乐生成完成！点击下方播放按钮试听</span>
    `;
    resultContainer.insertBefore(successMsg, preview);
  }

  function disabledButton(disabled) {
    if (disabled === true) {
      generateBtn.disabled = true;
      generateBtn.style['pointer-events'] = 'visible';
      generateBtn.style.cursor = 'not-allowed';
    } else {
      generateBtn.disabled = false;
      generateBtn.style['pointer-events'] = 'auto';
      generateBtn.style.cursor = 'pointer';
    }
  }

  function showStatus(status) {
    const existingStatus = document.getElementById('loading');
    if (existingStatus) {
      existingStatus.innerHTML = `
        <div class="loading-indicator" id="loading">
          <div class="hakka-spinner"></div>
          <span>🎵 当前状态：${status}🎵 </span>
        </div>
    `;
    } else {
      const statusMsg = document.createElement('div');
      statusMsg.innerHTML = `
          <div class="loading-indicator" id="loading">
            <div class="hakka-spinner"></div>
            <span>🎵 当前状态：${status}🎵 </span>
          </div>
      `;
      resultContainer.insertBefore(statusMsg, preview);
    }
  }

  // 检查任务状态
  async function checkTaskStatus(taskId) {
    try {
      const response = await fetch(`https://api.hf55bec9b.nyat.app:54450/status/${taskId}`);
      if (!response.ok) throw new Error('状态检查失败');
      return await response.json();
    } catch (err) {
      throw new Error(`状态检查错误: ${err.message}`);
    }
  }

  // 生成按钮点击事件
  generateBtn.addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value.trim();
    const duration = parseInt(document.getElementById('duration').value, 10);

    // 验证输入
    if (!prompt) {
      alert('请输入音乐描述');
      return;
    }
    if (isNaN(duration) || duration < 5 || duration > 30) {
      alert('持续时间必须是5-30秒之间的数字');
      return;
    }
    // 移除现有的成功消息（如果有）
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();
    preview.style.display = 'none';
    disabledButton(true);

    // 显示加载状态
    // showLoading(true);
    
    try {
      showStatus('正在提交请求...');
      // 1. 提交生成请求
      const response = await fetch('https://api.hf55bec9b.nyat.app:54450/generate_hakka_music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成请求失败');
      }
      
      const data = await response.json();
      const taskId = data.taskid;

      // 2. 轮询检查状态
      let statusData;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 每2秒检查一次
        statusData = await checkTaskStatus(taskId);
        
        // 检查是否出错
        if (statusData.status === 'failed') {
          showStatus('生成失败');
          throw new Error(statusData.reason);
        }
        if (statusData.status === 'running') {
          showStatus('处理中，请稍候...');
        }
        if (statusData.status === 'waiting') {
          showStatus(`任务已排队，等待处理，排队位置: ${statusData.waiting_position}`);
        }
      } while (statusData.status !== 'completed');
      // 3. 获取生成的音频
      const audioResponse = await fetch(`https://api.hf55bec9b.nyat.app:54450/download/${statusData.filename}`);
      if (!audioResponse.ok) throw new Error('获取音频失败');

      const blob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const existingStatus = document.getElementById('loading');
      if (existingStatus) existingStatus.remove();
      preview.style.display = 'flex';
      disabledButton(false);
      
      // 更新UI
      audioElement.src = audioUrl;
      audioElement.load(); // 重新加载音频
      showSuccessMessage(); // 显示成功消息
      // showLoading(false); // 隐藏加载指示器

      // 设置下载按钮
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `hakka_music_${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(audioUrl); // 释放内存
      };

    } catch (err) {
      // showLoading(false);
      preview.style.display = 'none';
      disabledButton(false);
      alert(`错误: ${err.message}`);
      console.error(err);
    }
  });

  // 初始化隐藏预览区域
  preview.style.display = 'none';
});     