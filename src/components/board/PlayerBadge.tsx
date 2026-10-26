import React from 'react';
import { Player, PlayerColor } from '../../types/game';
import { COLOR_HEX } from '../../game/ludoEngine';
import { Bot, User as UserIcon, Wifi, WifiOff } from 'lucide-react';

interface PlayerBadgeProps {
  player: Player;
  isTurn: boolean;
  tokens: [number, number, number, number];
  turnTimeLeft?: number;
  maxTurnTime?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PlayerBadge: React.FC<PlayerBadgeProps> = ({
  player,
  isTurn,
  tokens,
  turnTimeLeft = 30,
  maxTurnTime = 30,
}) => {
  const theme = COLOR_HEX[player.color];
  const homeCount = tokens.filter(p => p === 56).length;
  const timePercent = Math.max(0, Math.min(100, (turnTimeLeft / maxTurnTime) * 100));

  return (
    <div
      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 backdrop-blur-md ${
        isTurn
          ? 'bg-slate-900/95 border-2 ring-4 shadow-xl scale-105'
          : 'bg-slate-900/70 border border-slate-700/60 opacity-85'
      }`}
      style={{
        borderColor: isTurn ? theme.primary : undefined,
        boxShadow: isTurn ? `0 0 20px ${theme.primary}66` : undefined,
      }}
    >
      {/* Player Color Pip & Avatar */}
      <div className="relative">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md border-2 border-white/80"
          style={{ backgroundColor: theme.primary }}
        >
          {player.type === 'bot' ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <UserIcon className="w-5 h-5 text-white" />
          )}
        </div>
        {/* Status dot */}
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px]"
          style={{ backgroundColor: theme.primary }}
        >
          {player.type === 'bot' ? 'AI' : player.isOnline === false ? '!' : '●'}
        </div>
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
            {player.name}
          </span>
          {player.type === 'bot' && (
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-500/30">
              BOT
            </span>
          )}
        </div>

        {/* Home Tokens Progress */}
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full border ${
                  idx < homeCount
                    ? 'border-amber-400 bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                    : 'border-slate-600 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-1">
            {homeCount}/4 Home
          </span>
        </div>

        {/* Turn Countdown Progress Bar */}
        {isTurn && (
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-200 ${
                timePercent > 30 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
