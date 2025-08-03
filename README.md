
# 🎬 Movie Streaming App with Subtitles and Chat

A **Node.js** application that streams movies with synchronized subtitles and includes a real-time chat feature for all connected users.

---

## ✨ Features

- **🎥 Video Streaming**  
  Streams MP4 or MKV files using HTTP range requests for efficient loading.

- **📝 Subtitles Support**  
  Displays `.srt` subtitles synced with the video.

- **⏱️ Synchronized Playback**  
  All connected users view the same playback position in real time.

- **🎛️ Interactive Controls**
  - Play / Pause
  - Forward / Backward 10 seconds
  - Timeline seeking
  - Fullscreen toggle
  - Subtitle timing sync

- **💬 Real-time Chat**  
  Built-in text chat for all online users.

- **👥 User List**  
  Shows a list of all connected users.

- **⌨️ Keyboard Shortcuts**
  - `Space` → Play/Pause
  - `←` → Rewind 10 seconds
  - `→` → Forward 10 seconds
  - `F` → Toggle fullscreen

---

## 🖼️ Screenshots

**Login Page**

![Login Page](https://movies.rxo.me/login.png)

**Player Interface**

![Player Interface](https://movies.rxo.me/player.png)

---

## 🚀 Installation

1. **Clone the Repository**
   ```bash
   git clone https://your-repo-url
   cd movie-stream-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add Media Files**
   - Place your video file (`movie.mp4` or `movie.mkv`) in the `/movies` folder
   - Place your subtitle file (`sub.srt`) in the same `/movies` folder

---

## ▶️ Usage

1. **Start the Server**
   ```bash
   node server.js
   ```

2. **Open Your Browser**
   ```
   http://localhost:3081
   ```

3. **Enter Your Username**
   - You’ll be redirected to the video player with controls and chat enabled

---

## 📁 File Structure

```
/movie-stream-app
├── /public
│   ├── index.html      # Login screen
│   ├── player.html     # Video player
│   ├── style.css       # Stylesheet
│   └── script.js       # Frontend logic
├── /movies
│   ├── movie.mp4       # Video file (can be .mkv)
│   └── sub.srt         # Subtitle file
├── server.js           # Node.js backend
└── README.md           # This file
```

---

## 📦 Dependencies

- **Express.js** — Web server framework  
- **Socket.io** — Real-time communication  
- **Node.js** — JavaScript runtime

---

## ⚙️ Configuration

- **Default Port**: `3081`  
  You can change this by modifying the `PORT` constant in `server.js`.

- **Default Paths**
  - Video: `/movies/movie.mp4` or `.mkv`
  - Subtitles: `/movies/sub.srt`

  To change paths, modify `MOVIE_PATH` and `SUBTITLE_PATH` in `server.js`.

---

## 🧠 Notes

- Ensure video and subtitle filenames match what’s expected by the server.
- Subtitles are synced client-side but based on a shared playback clock for all users.
- Use modern browsers like Chrome or Firefox for best compatibility.

---

## 📌 License

MIT License

---

Enjoy streaming and chatting with friends! 🍿💬
