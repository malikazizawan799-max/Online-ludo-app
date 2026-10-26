import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Medal } from 'lucide-react';
import { Player, PlayerColor } from '../../types/game';
import { COLOR_HEX } from '../../game/ludoEngine';
import { soundService } from '../../services/audio';

interface GameOverModalProps {
  isOpen: boolean;
  winners: PlayerColor[];
  players: Player[];
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winners,
  players,
  onPlayAgain,
  onBackToHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundService.playVictory();
      // Blast celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winnerColor = winners[0];
  const winnerPlayer = players.find(p => p.color === winnerColor);
  const theme = winnerColor ? COLOR_HEX[winnerColor] : COLOR_HEX.red;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Crown & Trophy */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-2xl flex items-center justify-center mb-3">
          <Trophy className="w-10 h-10 text-slate-950" />
          <Crown className="w-6 h-6 text-amber-200 absolute -top-3" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
          Victory!
        </h2>
        <p className="text-sm font-bold text-amber-400 mt-1 uppercase tracking-widest">
          {winnerPlayer?.name || 'Champion'} Wins the Match!
        </p>

        {/* Podium Rankings */}
        <div className="my-6 space-y-2.5">
          {players.map(player => {
            const isFirst = winners[0] === player.color;
            const pTheme = COLOR_HEX[player.color];

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-amber-500/15 border-amber-400/50 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                    style={{ backgroundColor: pTheme.primary }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-100 block">
                      {player.name}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: pTheme.primary }}
                    >
                      {player.color}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-black text-sm">
                  {isFirst ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Medal className="w-3.5 h-3.5" /> 1st Place
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">Runner Up</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBackToHome}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
