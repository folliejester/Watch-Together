document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  
  const videoPlayer = document.getElementById('videoPlayer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const backwardBtn = document.getElementById('backwardBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const timeline = document.getElementById('timeline');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const syncSubsBtn = document.getElementById('syncSubsBtn');
  const chatBox = document.getElementById('chatBox');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const userList = document.getElementById('userList');
  
  const socket = io();
  let isSyncingSubs = false;
  let syncOffset = 0;
  
  // Join with username
  socket.emit('join', username);
  
  // Video player setup
  videoPlayer.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(videoPlayer.duration);
    timeline.max = videoPlayer.duration;
  });
  
  videoPlayer.addEventListener('timeupdate', () => {
    if (!isSyncingSubs) {
      currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
      timeline.value = videoPlayer.currentTime;
    }
  });
  
  videoPlayer.addEventListener('play', () => {
    playPauseBtn.textContent = 'Pause';
  });
  
  videoPlayer.addEventListener('pause', () => {
    playPauseBtn.textContent = 'Play';
  });
  
  // Controls
  playPauseBtn.addEventListener('click', () => {
    if (videoPlayer.paused) {
      socket.emit('play');
    } else {
      socket.emit('pause');
    }
  });
  
  backwardBtn.addEventListener('click', () => {
    socket.emit('backward');
  });
  
  forwardBtn.addEventListener('click', () => {
    socket.emit('forward');
  });
  
  fullscreenBtn.addEventListener('click', () => {
    if (videoPlayer.requestFullscreen) {
      videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
      videoPlayer.webkitRequestFullscreen();
    } else if (videoPlayer.msRequestFullscreen) {
      videoPlayer.msRequestFullscreen();
    }
  });
  
  syncSubsBtn.addEventListener('click', () => {
    isSyncingSubs = !isSyncingSubs;
    syncSubsBtn.textContent = isSyncingSubs ? 'Syncing...' : 'Sync Subs';
    syncOffset = 0;
  });
  
  timeline.addEventListener('input', () => {
    socket.emit('seek', parseFloat(timeline.value));
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target === chatInput) return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (videoPlayer.paused) {
          socket.emit('play');
        } else {
          socket.emit('pause');
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        socket.emit('backward');
        break;
      case 'ArrowRight':
        e.preventDefault();
        socket.emit('forward');
        break;
      case 'KeyF':
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        }
        break;
    }
  });
  
  // Chat functionality
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      socket.emit('chat message', message);
      chatInput.value = '';
    }
  }
  
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Socket listeners
  socket.on('playback state', (state) => {
    const now = Date.now();
    const timeSinceUpdate = (now - state.lastUpdate) / 1000;
    
    if (state.isPlaying) {
      videoPlayer.currentTime = state.currentTime + timeSinceUpdate;
      videoPlayer.play();
    } else {
      videoPlayer.currentTime = state.currentTime;
      videoPlayer.pause();
    }
  });
  
  socket.on('play', () => {
    videoPlayer.play();
  });
  
  socket.on('pause', () => {
    videoPlayer.pause();
  });
  
  socket.on('seek', (time) => {
    videoPlayer.currentTime = time;
    currentTimeDisplay.textContent = formatTime(time);
    timeline.value = time;
  });
  
  socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span class="user">${data.user}:</span> ${data.message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
  
  socket.on('user list', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      userList.appendChild(li);
    });
  });
  
  // Subtitle sync feature
  videoPlayer.textTracks[0].oncuechange = function() {
    if (isSyncingSubs && this.activeCues && this.activeCues[0]) {
      const cue = this.activeCues[0];
      const expectedTime = cue.startTime + syncOffset;
      const actualTime = videoPlayer.currentTime;
      
      if (Math.abs(expectedTime - actualTime) > 0.5) {
        syncOffset = actualTime - cue.startTime;
        console.log(`Subtitle sync offset: ${syncOffset.toFixed(2)}s`);
      }
    }
  };
  
  // Helper function
  function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }
});