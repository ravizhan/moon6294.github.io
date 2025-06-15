document.addEventListener('DOMContentLoaded', function() {
  // 获取所有音频元素
  const audioPlayers = document.querySelectorAll('.music-player');
  
  // 为每个音频元素添加播放事件监听
  audioPlayers.forEach(player => {
    player.addEventListener('play', function() {
      // 暂停其他所有音频
      audioPlayers.forEach(otherPlayer => {
        if (otherPlayer !== player && !otherPlayer.paused) {
          otherPlayer.pause();
        }
      });
    });
  });
});   