import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GameStatus, Player, Room } from './src/types';

// Simple check just to verify format. 
// For real app, use a dictionary API or large txt file.
async function isValidWord(word: string) {
  if (word.length < 3 || word.length > 8 || !/^[A-Za-z]+$/.test(word)) return false;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return res.ok; 
  } catch (e) {
    return true; // Fallback to allow if API fails
  }
}

const rooms = new Map<string, Room>();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/api/validate-word', async (req, res) => {
    const word = req.query.word as string;
    if (!word) {
      return res.status(400).json({ valid: false });
    }
    const valid = await isValidWord(word);
    res.json({ valid });
  });

  io.on('connection', (socket) => {
    
    socket.on('join_room', ({ roomId, username }) => {
      let room = rooms.get(roomId);
      
      if (!room) {
        room = {
          id: roomId,
          players: {},
          status: 'waiting'
        };
        rooms.set(roomId, room);
      }

      if (Object.keys(room.players).length >= 2 && !room.players[socket.id]) {
        // Find if they are reconnecting
        const disconnectedPlayer = Object.values(room.players).find(p => p.username === username && !p.isConnected);
        if (disconnectedPlayer) {
           // Reconnect
           const oldId = disconnectedPlayer.id;
           disconnectedPlayer.isConnected = true;
           disconnectedPlayer.socketId = socket.id;
           socket.join(roomId);
           io.to(roomId).emit('room_update', room);
           return;
        } else {
           socket.emit('error', 'Room is full');
           return;
        }
      }

      const isHost = Object.keys(room.players).length === 0;

      room.players[socket.id] = {
        id: socket.id,
        socketId: socket.id,
        username,
        status: 'waiting',
        guesses: [],
        isConnected: true,
        isHost
      };

      socket.join(roomId);
      
      if (Object.keys(room.players).length === 2 && room.status === 'waiting') {
        room.status = 'selecting';
        Object.values(room.players).forEach(p => p.status = 'selecting');
      }

      io.to(roomId).emit('room_update', room);
    });

    socket.on('submit_word', async ({ roomId, word }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const player = room.players[socket.id];
      if (!player) return;

      player.secretWord = word.toUpperCase();
      player.status = 'ready';

      const allReady = Object.values(room.players).length === 2 && Object.values(room.players).every(p => p.status === 'ready');
      
      if (allReady) {
        room.status = 'countdown';
        room.countdown = 3;
        io.to(roomId).emit('room_update', room);

        const tick = setInterval(() => {
          if (room.countdown && room.countdown > 1) {
            room.countdown--;
            io.to(roomId).emit('room_update', room);
          } else {
            clearInterval(tick);
            room.status = 'playing';
            room.countdown = 0;
            Object.values(room.players).forEach(p => p.status = 'playing');
            io.to(roomId).emit('room_update', room);
          }
        }, 1000);
      } else {
        io.to(roomId).emit('room_update', room);
      }
    });

    socket.on('submit_guess', ({ roomId, guess }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') return;
      const player = room.players[socket.id];
      if (!player) return;

      const upperGuess = guess.toUpperCase();
      player.guesses.push(upperGuess);

      // check win
      const opponent = Object.values(room.players).find(p => p.id !== socket.id);
      if (opponent && opponent.secretWord === upperGuess) {
        room.status = 'finished';
        room.winnerId = socket.id;
      }

      io.to(roomId).emit('room_update', room);
    });

    socket.on('rematch', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'finished') return;

      room.status = 'waiting';
      room.winnerId = undefined;
      Object.values(room.players).forEach(p => {
        p.status = 'waiting';
        p.guesses = [];
        p.secretWord = undefined;
      });

      if (Object.keys(room.players).length === 2) {
        room.status = 'selecting';
        Object.values(room.players).forEach(p => p.status = 'selecting');
      }

      io.to(roomId).emit('room_update', room);
    });

    socket.on('disconnect', () => {
      // Find what room they were in
      for (const [roomId, room] of rooms.entries()) {
        const player = room.players[socket.id];
        if (player) {
          player.isConnected = false;
          io.to(roomId).emit('room_update', room);
          
          // Optionally remove room if empty for a while, but simple cleanup for now:
          const hasConnected = Object.values(room.players).some(p => p.isConnected);
          if (!hasConnected) {
             setTimeout(() => {
                const refreshed = rooms.get(roomId);
                if (refreshed && !Object.values(refreshed.players).some(p => p.isConnected)) {
                   rooms.delete(roomId);
                }
             }, 60000); // 1 min alive
          }
          break;
        }
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0' as any, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
