export type PlayerStatus = 'waiting' | 'selecting' | 'ready' | 'playing' | 'disconnected';
export type GameStatus = 'waiting' | 'selecting' | 'countdown' | 'playing' | 'finished';

export interface Player {
  id: string;
  username: string;
  socketId: string;
  status: PlayerStatus;
  secretWord?: string;
  guesses: string[];
  isConnected: boolean;
  isHost: boolean;
}

export interface Room {
  id: string;
  players: Record<string, Player>;
  status: GameStatus;
  winnerId?: string;
  countdown?: number;
}

export interface GuessResult {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}
