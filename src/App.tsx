import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { Room } from './types';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { WordSelection } from './components/WordSelection';
import { GameBoard } from './components/GameBoard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setPlayerId(socket.id!);
      setError('');
    });

    socket.on('room_update', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setError('');
    });

    socket.on('error', (msg: string) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('connect_error', () => {
      setError('Connection lost. Retrying...');
    });

    return () => {
      socket.off('connect');
      socket.off('room_update');
      socket.off('error');
      socket.off('connect_error');
    };
  }, []);

  const handleCreateGroup = (username: string) => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('join_room', { roomId: newRoomId, username });
  };

  const handleJoinGroup = (roomId: string, username: string) => {
    socket.emit('join_room', { roomId, username });
  };

  const handleSubmitWord = (word: string) => {
    if (room) {
      socket.emit('submit_word', { roomId: room.id, word });
    }
  };

  const handleGuess = (guess: string) => {
    if (room && room.status === 'playing') {
      socket.emit('submit_guess', { roomId: room.id, guess });
    }
  };

  const handleRematch = () => {
     if (room) {
       socket.emit('rematch', { roomId: room.id });
     }
  };

  return (
    <>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!room && (
        <Home onJoin={handleJoinGroup} onCreate={handleCreateGroup} />
      )}

      {room && room.status === 'waiting' && (
        <Lobby room={room} currentPlayerId={playerId} />
      )}

      {room && room.status === 'selecting' && (
        <WordSelection 
          room={room} 
          currentPlayerId={playerId} 
          onSubmit={handleSubmitWord}
        />
      )}

      {room && (room.status === 'countdown' || room.status === 'playing' || room.status === 'finished') && (
        <>
          {room.status === 'countdown' && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                  key={room.countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="text-9xl font-black text-emerald-400"
                >
                  {room.countdown}
                </motion.div>
             </div>
          )}
          <GameBoard 
            room={room} 
            currentPlayerId={playerId} 
            onGuess={handleGuess} 
            onRematch={handleRematch}
          />
        </>
      )}
    </>
  );
}
