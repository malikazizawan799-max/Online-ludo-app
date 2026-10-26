import React, { useState } from 'react';
import { Copy, Check, Users, Crown, Play, X, ShieldAlert, Sparkles } from 'lucide-react';
import { RoomData, PlayerColor } from '../../types/game';
import { COLOR_HEX } from '../../game/ludoEngine';
import { startOnlineGame } from '../../services/firebase';

interface LobbyModalProps {
  isOpen: boolean;
  room: RoomData;
  currentUserId: string;
  onLeaveRoom: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  room,
  currentUserId,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  if (!isOpen) return null;

  const isHost = room.hostId === currentUserId;
  const playersList = Object.values(room.players || {});
  const canStart = isHost && playersList.length >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    try {
      await startOnlineGame(room.id, room);
    } catch (err) {
      console.error('Failed to start game:', err);
      setStarting(false);
    }
  };

  // Color order for slots
  const colorSlots: PlayerColor[] =
    room.maxPlayers === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">MATCH LOBBY</h2>
              <p className="text-xs text-slate-400">
                {playersList.length} of {room.maxPlayers} Players Joined
              </p>
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Code Card */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
              Private Room Code
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-widest mt-0.5">
              {room.code}
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Player Slots */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {colorSlots.map((color, idx) => {
            const player = playersList.find(p => p.color === color);
            const theme = COLOR_HEX[color];

            return (
              <div
                key={color}
                className={`p-3.5 rounded-2xl border transition-all ${
                  player
                    ? 'bg-slate-900/90 border-slate-700 shadow-md'
                    : 'bg-slate-900/30 border-dashed border-slate-800 flex flex-col items-center justify-center py-6'
                }`}
                style={{
                  borderLeftColor: player ? theme.primary : undefined,
                  borderLeftWidth: player ? '4px' : undefined,
                }}
              >
                {player ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {player.name}
                        </span>
                        {player.isHost && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: theme.primary }}
                      >
                        {color} Team
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-500 block">
                      Slot {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-600">Waiting for player...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status / Instructions */}
        <div className="text-center mb-5">
          {playersList.length < 2 ? (
            <p className="text-xs text-amber-400/90 font-medium animate-pulse">
              Share the room code above with friends to start the match! (Min 2 players required)
            </p>
          ) : isHost ? (
            <p className="text-xs text-emerald-400 font-bold">
              Ready to roll! Tap 'Start Match' when everyone is here.
            </p>
          ) : (
            <p className="text-xs text-slate-300 font-medium animate-pulse">
              Waiting for the host to launch the game...
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onLeaveRoom}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
          >
            Leave Lobby
          </button>
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart || starting}
              className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform ${
                canStart && !starting
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {starting ? 'Starting...' : 'Start Match'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
