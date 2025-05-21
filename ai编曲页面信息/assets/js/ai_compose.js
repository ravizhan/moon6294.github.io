document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const loadingIndicator = document.getElementById('loading');
  const preview = document.getElementById('preview');
  const audioElement = document.getElementById('generated-audio');
  const downloadBtn = document.getElementById('download-btn');

  function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    preview.style.display = show ? 'none' : 'flex';
  }

  generateBtn.addEventListener('click', () => {
    const prompt = document.getElementById('prompt').value.trim();
    const duration = parseInt(document.getElementById('duration').value, 10);

    if (!prompt) {
      alert('请输入描述内容');
      return;
    }
    if (!duration || duration < 5 || duration > 120) {
      alert('请输入5-120秒之间的持续时间');
      return;
    }

    showLoading(true);

    fetch('http://127.0.0.1:5000/generate_hakka_music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, duration })
    })
    .then(res => {
      if (!res.ok) throw new Error('生成失败');
      return res.blob();
    })
    .then(blob => {
      showLoading(false);
      const audioUrl = URL.createObjectURL(blob);
      audioElement.src = audioUrl;
      audioElement.load();
      audioElement.play();

      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'hakka_music.wav';
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
    })
    .catch(err => {
      showLoading(false);
      alert('生成失败，请检查后台服务');
      console.error(err);
    });
  });
});
