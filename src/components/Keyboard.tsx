import React from 'react';
import { cn } from '../utils';
import { Delete } from 'lucide-react';

interface KeyboardProps {
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStatuses: Record<string, 'correct' | 'present' | 'absent' | 'unused'>;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export function Keyboard({ onKey, onEnter, onBackspace, letterStatuses }: KeyboardProps) {
  const getKeyStyle = (status: 'correct' | 'present' | 'absent' | 'unused') => {
    switch (status) {
      case 'correct': return 'bg-emerald-500 text-neutral-950 border-emerald-600';
      case 'present': return 'bg-amber-500 text-neutral-950 border-amber-600';
      case 'absent': return 'bg-neutral-800 text-neutral-500 border-neutral-900';
      default: return 'bg-neutral-700 text-neutral-100 border-neutral-800 hover:bg-neutral-600';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-2 flex flex-col gap-2 select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 sm:gap-2">
          {i === 2 && (
            <button 
              onClick={onEnter}
              className="px-2 sm:px-4 py-4 rounded-lg font-bold text-xs sm:text-sm bg-neutral-700 text-neutral-100 border-b-4 border-neutral-800 hover:bg-neutral-600 active:translate-y-1 active:border-b-0"
            >
              ENTER
            </button>
          )}
          {row.map(key => {
            const status = letterStatuses[key] || 'unused';
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={cn(
                  "flex-1 max-w-[40px] sm:max-w-[48px] py-4 rounded-lg font-bold text-sm sm:text-lg border-b-4 transition-colors",
                  "active:translate-y-1 active:border-b-0 flex justify-center items-center",
                  getKeyStyle(status)
                )}
              >
                {key}
              </button>
            );
          })}
          {i === 2 && (
            <button 
              onClick={onBackspace}
              className="px-3 sm:px-4 py-4 rounded-lg font-bold text-sm bg-neutral-700 text-neutral-100 border-b-4 border-neutral-800 hover:bg-neutral-600 active:translate-y-1 active:border-b-0 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
