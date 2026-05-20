import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Room } from '../types';
import { cn, evaluateGuess } from '../utils';
import { Keyboard } from './Keyboard';

interface GameBoardProps {
  room: Room;
  currentPlayerId: string;
  onGuess: (guess: string) => void;
  onRematch?: () => void;
}

export function GameBoard({ room, currentPlayerId, onGuess, onRematch }: GameBoardProps) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [isVibrating, setIsVibrating] = useState(false);

  const me = room.players[currentPlayerId];
  const opponent = Object.values(room.players).find(p => p.id !== currentPlayerId);

  const myTargetWord = opponent?.secretWord || '';
  const opponentTargetWord = me?.secretWord || '';
  const wordLen = myTargetWord.length || 8;
  const oppWordLen = opponentTargetWord.length || 8;

  const { status, winnerId } = room;
  const isFinished = status === 'finished';
  const iWon = winnerId === currentPlayerId;
  const iLost = winnerId === opponent?.id;

  // Keyboard state
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, 'correct'|'present'|'absent'|'unused'> = {};
    if (!myTargetWord) return statuses;

    me?.guesses.forEach(g => {
      const evald = evaluateGuess(g, myTargetWord);
      evald.forEach((res, i) => {
        const char = g[i];
        if (res.status === 'correct') statuses[char] = 'correct';
        else if (res.status === 'present' && statuses[char] !== 'correct') statuses[char] = 'present';
        else if (res.status === 'absent' && !statuses[char]) statuses[char] = 'absent';
      });
    });
    return statuses;
  }, [me?.guesses, myTargetWord]);

  // Handle typing shortcuts
  useEffect(() => {
    if (isFinished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') handleEnter();
      else if (e.key === 'Backspace') handleBackspace();
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentGuess, isFinished]);

  const handleKey = (key: string) => {
    if (currentGuess.length < wordLen) setCurrentGuess(prev => prev + key);
  };
  const handleBackspace = () => {
    setCurrentGuess(prev => prev.slice(0, -1));
  };
  const handleEnter = () => {
    if (currentGuess.length !== wordLen) {
      triggerVibrate();
      return;
    }
    onGuess(currentGuess);
    setCurrentGuess('');
  };
  const triggerVibrate = () => {
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 300);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-neutral-950 text-neutral-50 p-4 pt-10">
      
      {/* Header Info */}
      <div className="w-full max-w-4xl flex justify-between items-start mb-8 gap-4 px-2">
        <div className="space-y-2 flex-1">
          <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Your Board</div>
          <p className="text-xl font-black text-white">{me?.username}</p>
        </div>
        
        {/* Opponent Mini Board view */}
        <div className="flex-[0.5] bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col items-center space-y-1">
           <div className="text-xs font-bold text-neutral-500 mb-1">{opponent?.username}'s Progress</div>
           {Array.from({ length: 6 }).map((_, rIdx) => {
             const guess = opponent?.guesses[rIdx];
             return (
               <div key={rIdx} className="flex gap-[3px] justify-center w-full">
                 {Array.from({ length: oppWordLen }).map((_, cIdx) => {
                    let colorClass = "bg-neutral-800";
                    if (guess && opponentTargetWord) {
                      const res = evaluateGuess(guess, opponentTargetWord)[cIdx];
                      if (res?.status === 'correct') colorClass = "bg-emerald-500";
                      else if (res?.status === 'present') colorClass = "bg-amber-500";
                      else colorClass = "bg-neutral-900";
                    }
                    return <div key={cIdx} className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-sm sm:rounded flex-shrink-0", colorClass)} />
                 })}
               </div>
             )
           })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="grid grid-rows-6 gap-2 w-full max-w-[500px]">
          {Array.from({ length: 6 }).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === (me?.guesses.length || 0);
            const guess = isCurrentRow ? currentGuess : me?.guesses[rowIdx] || '';
            const isSubmitted = rowIdx < (me?.guesses.length || 0);
            const results = isSubmitted && myTargetWord ? evaluateGuess(guess, myTargetWord) : null;

            return (
              <motion.div 
                key={rowIdx} 
                className={cn("flex justify-center gap-1 sm:gap-2", isCurrentRow && isVibrating && "animate-shake")}
                animate={isCurrentRow && isVibrating ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: wordLen }).map((_, colIdx) => {
                  const letter = guess[colIdx] || '';
                  
                  let cellStyle = "border-neutral-800 bg-neutral-950 text-neutral-100";
                  if (letter && !isSubmitted) cellStyle = "border-neutral-600 bg-neutral-900 scale-[1.02]";
                  
                  if (results && results[colIdx]) {
                    const st = results[colIdx].status;
                    if (st === 'correct') cellStyle = "border-emerald-500 bg-emerald-500 text-neutral-950";
                    else if (st === 'present') cellStyle = "border-amber-500 bg-amber-500 text-neutral-950";
                    else cellStyle = "border-neutral-900 bg-neutral-900 text-neutral-600";
                  }

                  return (
                    <motion.div
                      key={colIdx}
                      initial={isSubmitted ? { rotateX: 90 } : false}
                      animate={isSubmitted ? { rotateX: 0 } : false}
                      transition={{ duration: 0.4, delay: colIdx * 0.1 }}
                      className={cn(
                        "w-[11vw] max-w-[56px] aspect-square flex items-center justify-center mb-1 rounded-lg sm:rounded-xl border-2 text-xl sm:text-3xl font-black uppercase transition-colors flex-shrink-0",
                        cellStyle
                      )}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Keyboard */}
      <div className="w-full pb-8">
        <Keyboard 
          letterStatuses={letterStatuses}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
        />
      </div>

      {/* Finished Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-md w-full text-center space-y-6"
          >
            <h2 className="text-4xl font-black mb-2">
              {iWon ? <span className="text-emerald-400">VICTORY</span> : <span className="text-red-400">DEFEAT</span>}
            </h2>
            <div className="py-4 space-y-2 border-y border-neutral-800/50">
               <p className="text-neutral-400 font-medium text-sm text-center">OPPONENT'S HIDDEN WORD</p>
               <div className="flex justify-center gap-2">
                  {myTargetWord.split('').map((c, i) => (
                    <div key={i} className="w-10 h-12 bg-neutral-800 rounded font-black text-2xl flex items-center justify-center text-white">{c}</div>
                  ))}
               </div>
            </div>

            <button 
              onClick={onRematch}
              className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg"
            >
              Request Rematch
            </button>
          </motion.div>
        </div>
      )}

      {/* Disconnect Overlay */}
      {opponent && !opponent.isConnected && !isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center relative">
              <span className="flex h-4 w-4 rounded-full bg-red-500 absolute top-0 right-0 animate-ping" />
              <span className="flex h-4 w-4 rounded-full bg-red-500 absolute top-0 right-0" />
            </div>
            <h2 className="text-2xl font-bold text-white">Opponent Disconnected</h2>
            <p className="text-neutral-400">Waiting for {opponent.username} to reconnect...</p>
          </div>
        </div>
      )}

    </div>
  );
}
