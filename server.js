const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3081;
const MOVIE_PATH = path.join(__dirname, 'movies', 'movie.mp4'); // or .mkv
const SUBTITLE_PATH = path.join(__dirname, 'movies', 'sub.srt');

// Store current playback state
let playbackState = {
  isPlaying: false,
  currentTime: 0,
  lastUpdate: Date.now()
};

// Store connected users
let users = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

// Video streaming endpoint
app.get('/video', (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range header');
    return;
  }

  const videoSize = fs.statSync(MOVIE_PATH).size;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(MOVIE_PATH, { start, end });
  videoStream.pipe(res);
});

// Subtitle endpoint
app.get('/subtitle', (req, res) => {
  res.sendFile(SUBTITLE_PATH);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');
  
  // Add user to list
  socket.on('join', (username) => {
    users.push({ id: socket.id, username });
    io.emit('user list', users.map(u => u.username));
    // Send current playback state to new user
    socket.emit('playback state', playbackState);
  });

  // Handle playback updates
  socket.on('play', () => {
    playbackState.isPlaying = true;
    playbackState.lastUpdate = Date.now();
    io.emit('play');
  });

  socket.on('pause', () => {
    playbackState.isPlaying = false;
    playbackState.currentTime += (Date.now() - playbackState.lastUpdate) / 1000;
    playbackState.lastUpdate = Date.now();
    io.emit('pause');
  });

  socket.on('seek', (time) => {
    playbackState.currentTime = time;
    playbackState.lastUpdate = Date.now();
    io.emit('seek', time);
  });

  socket.on('forward', () => {
    playbackState.currentTime += 10;
    playbackState.lastUpdate = Date.now();
    io.emit('seek', playbackState.currentTime);
  });

  socket.on('backward', () => {
    playbackState.currentTime = Math.max(0, playbackState.currentTime - 10);
    playbackState.lastUpdate = Date.now();
    io.emit('seek', playbackState.currentTime);
  });

  // Handle chat messages
  socket.on('chat message', (msg) => {
    const user = users.find(u => u.id === socket.id);
    io.emit('chat message', { user: user.username, message: msg });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    users = users.filter(user => user.id !== socket.id);
    io.emit('user list', users.map(u => u.username));
  });
});

// Update current time periodically if playing
setInterval(() => {
  if (playbackState.isPlaying) {
    playbackState.currentTime += (Date.now() - playbackState.lastUpdate) / 1000;
    playbackState.lastUpdate = Date.now();
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});