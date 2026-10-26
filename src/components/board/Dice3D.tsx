import React, { useState, useEffect } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_HEX } from '../../game/ludoEngine';
import { soundService } from '../../services/audio';

interface Dice3DProps {
  value: number | null;
  color: PlayerColor;
  canRoll: boolean;
  onRoll: () => void;
  rolling?: boolean;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  color,
  canRoll,
  onRoll,
  rolling = false,
}) => {
  const [internalRolling, setInternalRolling] = useState(false);
  const isRollActive = rolling || internalRolling;
  const theme = COLOR_HEX[color];

  const handleRollClick = () => {
    if (!canRoll || isRollActive) return;
    setInternalRolling(true);
    soundService.playDiceRoll();
    soundService.triggerVibrate([30, 20, 30]);

    setTimeout(() => {
      setInternalRolling(false);
      onRoll();
    }, 450);
  };

  // Render pips for face value 1 to 6
  const renderPips = (val: number | null) => {
    const num = val || 1;
    const pipStyle = "w-3 h-3 rounded-full bg-slate-900 shadow-inner";

    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-start"><div className={pipStyle} /></div>
            <div className="flex justify-end"><div className={pipStyle} /></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-start"><div className={pipStyle} /></div>
            <div className="flex justify-center"><div className={pipStyle} /></div>
            <div className="flex justify-end"><div className={pipStyle} /></div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
            <div className="flex justify-center"><div className={pipStyle} /></div>
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
            <div className="flex justify-between">
              <div className={pipStyle} /><div className={pipStyle} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <button
        type="button"
        onClick={handleRollClick}
        disabled={!canRoll || isRollActive}
        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-white to-slate-200 border-2 border-white/80 shadow-2xl flex items-center justify-center transition-all duration-300 transform ${
          canRoll && !isRollActive
            ? 'cursor-pointer hover:scale-105 active:scale-95 ring-4 ring-amber-400 animate-bounce'
            : 'opacity-90 cursor-default'
        } ${isRollActive ? 'animate-spin' : ''}`}
        style={{
          boxShadow: canRoll
            ? `0 0 25px ${theme.primary}88, inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.5)`
            : 'inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.4)',
        }}
        title={canRoll ? 'Click to Roll Dice' : 'Wait for turn'}
      >
        {/* Dice face reflection */}
        <div className="absolute top-1 left-2 right-2 h-4 rounded-t-xl bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />

        {/* Dice Content */}
        {value === null && !isRollActive ? (
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-black tracking-wider text-slate-800 uppercase font-sans">
              Roll
            </span>
          </div>
        ) : (
          renderPips(isRollActive ? Math.floor(Math.random() * 6) + 1 : value)
        )}
      </button>

      {/* Turn instruction pill */}
      <div className="mt-2 text-center">
        {canRoll ? (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md animate-pulse">
            Roll Dice!
          </span>
        ) : value !== null ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700">
            Rolled {value}
          </span>
        ) : null}
      </div>
    </div>
  );
};
