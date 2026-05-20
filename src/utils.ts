import { GuessResult } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function evaluateGuess(guess: string, secret: string): GuessResult[] {
  const result: GuessResult[] = Array.from({ length: 6 }).map((_, i) => ({ letter: guess[i], status: 'absent' }));
  const secretChars = secret.split('');
  
  // First pass: correct positions
  for (let i = 0; i < 6; i++) {
    if (guess[i] === secretChars[i]) {
      result[i].status = 'correct';
      secretChars[i] = '*'; // Mark as used
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < 6; i++) {
    if (result[i].status !== 'correct') {
      const idx = secretChars.indexOf(guess[i]);
      if (idx !== -1) {
        result[i].status = 'present';
        secretChars[idx] = '*';
      }
    }
  }

  return result;
}
