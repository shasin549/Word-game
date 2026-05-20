import React, { useState } from 'react';
import { Room } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, CircleDashed, Copy, User, Link, Check } from 'lucide-react';

interface LobbyProps {
  room: Room;
  currentPlayerId: string;
}

export function Lobby({ room, currentPlayerId }: LobbyProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const players = Object.values(room.players);
  const p1 = players.find(p => p.isHost);
  const p2 = players.find(p => !p.isHost);

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 px-4 relative overflow-hidden">
      <div className="z-10 w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-neutral-200">Waiting for players</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-neutral-500 font-medium">Room Code:</span>
            <div 
              onClick={copyRoomId}
              className="group flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <span className="font-mono text-emerald-400 font-bold tracking-widest">{room.id}</span>
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              )}
            </div>
          </div>
          
          <button
            onClick={copyInviteLink}
            className="flex items-center justify-center gap-2 w-full max-w-[200px] mx-auto bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Copy Invite Link
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <PlayerSlot player={p1} label="Player 1 (Host)" />
          <PlayerSlot player={p2} label="Player 2" />
        </div>

      </div>
    </div>
  );
}

function PlayerSlot({ player, label }: { player: any, label: string }) {
  if (!player) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 border-dashed opacity-50">
        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center">
          <CircleDashed className="w-6 h-6 text-neutral-700 animate-spin-slow" />
        </div>
        <div>
          <p className="font-bold text-neutral-600">Waiting...</p>
          <p className="text-xs text-neutral-700">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-neutral-800/20 border border-emerald-500/20 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
        <User className="w-6 h-6 text-emerald-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-neutral-200">{player.username}</p>
          {player.isConnected ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          ) : (
             <span className="flex h-2 w-2 rounded-full bg-red-500" />
          )}
        </div>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    </motion.div>
  );
}
