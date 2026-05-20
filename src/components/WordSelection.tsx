import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room } from '../types';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';
import { Keyboard } from './Keyboard';

interface WordSelectionProps {
  room: Room;
  currentPlayerId: string;
  onSubmit: (word: string) => void;
}

export function WordSelection({ room, currentPlayerId, onSubmit }: WordSelectionProps) {
  const [word, setWord] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const currentPlayer = room.players[currentPlayerId];
  const opponent = Object.values(room.players).find(p => p.id !== currentPlayerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (word.length !== 6) {
      setError('Word must be 6 letters long');
      return;
    }
    
    setError('');
    setIsValidating(true);
    
    try {
      const res = await fetch(`/api/validate-word?word=${word}`);
      const data = await res.json();
      if (!data.valid) {
        setError('Not a valid word according to dictionary');
      } else {
        onSubmit(word.toUpperCase());
      }
    } catch (e) {
       // fallback if api error, just accept it
       onSubmit(word.toUpperCase());
    } finally {
      setIsValidating(false);
    }
  };

  const handleKey = (key: string) => {
    if (word.length < 6) {
      setWord(w => w + key.toUpperCase());
      setError('');
    }
  };

  const handleBackspace = () => {
    setWord(w => w.slice(0, -1));
    setError('');
  };

  React.useEffect(() => {
    if (currentPlayer?.status === 'ready') return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [word, currentPlayer?.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 px-4">
      
      <div className="w-full max-w-lg mb-8 flex justify-between items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-3">
           <div className={cn("w-3 h-3 rounded-full", currentPlayer?.status === 'ready' ? "bg-emerald-500" : "bg-neutral-600 animate-pulse")} />
           <span className="font-medium text-neutral-300">You ({currentPlayer?.username})</span>
        </div>
        <div className="text-neutral-500 font-black">VS</div>
        <div className="flex items-center gap-3">
           <span className="font-medium text-neutral-300">{opponent?.username}</span>
           <div className={cn("w-3 h-3 rounded-full", opponent?.status === 'ready' ? "bg-emerald-500" : "bg-neutral-600 animate-pulse")} />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2 text-white">Choose your Secret Word</h2>
        <p className="text-neutral-500">Your opponent will try to guess this 6-letter word.</p>
      </div>

      {currentPlayer?.status === 'ready' ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-8 rounded-2xl flex flex-col items-center text-center max-w-sm w-full"
        >
          <CheckCircle2 className="w-16 h-16 mb-4 opacity-50" />
          <p className="font-bold text-xl mb-2">Word Locked In!</p>
          <p className="text-sm opacity-70">Waiting for {opponent?.username} to pick theirs...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-3xl font-black rounded-lg border-2 uppercase transition-all duration-200",
                  word[i] ? "border-emerald-500 bg-neutral-900 text-white scale-105" : "border-neutral-800 bg-neutral-950 text-transparent"
                )}
              >
                {word[i] || ''}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm font-medium text-center bg-red-950/30 p-2 rounded-lg border border-red-900/50"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={word.length !== 6 || isValidating}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-neutral-950 font-bold py-4 rounded-xl transition-all"
          >
            {isValidating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'Confirm Secret Word'
            )}
          </button>
        </form>
      )}

      {currentPlayer?.status !== 'ready' && (
        <div className="w-full mt-4 pb-8">
          <Keyboard 
            letterStatuses={{}}
            onKey={handleKey}
            onBackspace={handleBackspace}
            onEnter={() => {
              if (word.length === 6) {
                 // Trigger submit somehow, or just let them press the big confirm button
                 // we can mock a submit event if we really need to, but confirm button is fine
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
