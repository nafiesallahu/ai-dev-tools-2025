const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// In-memory session store: { code, language }
const sessions = new Map();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/session', (_req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, { code: '', language: 'javascript' });
  res.json({ sessionId, shareUrl: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/session/${sessionId}` });
});

io.on('connection', (socket) => {
  socket.on('session:join', ({ sessionId }) => {
    if (!sessionId) return;

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { code: '', language: 'javascript' });
    }

    socket.join(sessionId);
    const state = sessions.get(sessionId);
    socket.emit('session:state', state);
  });

  socket.on('code:change', ({ sessionId, code }) => {
    if (!sessionId || typeof code !== 'string') return;
    const session = sessions.get(sessionId);
    if (!session) return;

    session.code = code;
    socket.to(sessionId).emit('code:update', { code });
  });

  socket.on('language:change', ({ sessionId, language }) => {
    if (!sessionId || !language) return;
    const session = sessions.get(sessionId);
    if (!session) return;

    session.language = language;
    io.to(sessionId).emit('language:update', { language });
  });
});

server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});


