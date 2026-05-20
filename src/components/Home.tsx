import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Users, Keyboard } from 'lucide-react';

interface HomeProps {
  onJoin: (roomId: string, username: string) => void;
  onCreate: (username: string) => void;
}

export function Home({ onJoin, onCreate }: HomeProps) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleCreate = () => {
    if (!username.trim()) return;
    onCreate(username.trim());
  };

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) return;
    onJoin(roomId.trim().toUpperCase(), username.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 className="w-10 h-10 text-emerald-400" />
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 to-indigo-500 bg-clip-text text-transparent">
            LexiBattle
          </h1>
        </div>
        <p className="text-neutral-400 font-medium">Real-time multiplayer word guessing.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-sm bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-2xl shadow-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              maxLength={12}
            />
          </div>

          {mode === 'menu' ? (
            <div className="grid gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={!username.trim()}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-neutral-950 font-bold py-3.5 px-4 rounded-xl transition-colors"
              >
                <Users className="w-5 h-5" />
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!username.trim()}
                className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-800 text-white font-bold py-3.5 px-4 rounded-xl transition-colors border border-neutral-700"
              >
                <Keyboard className="w-5 h-5" />
                Join Room
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5 ml-1">Room Code</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCD"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('menu')}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={!roomId.trim()}
                  className="flex-[2] bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
                >
                  Join
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
