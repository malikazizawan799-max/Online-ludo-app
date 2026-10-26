import React, { useMemo } from 'react';
import { PlayerColor } from '../../types/game';
import {
  getTokenCoordinate,
  SAFE_SQUARES,
  TRACK_COORDINATES,
  COLOR_HEX,
  GridCoord,
} from '../../game/ludoEngine';
import { soundService } from '../../services/audio';

interface LudoBoardProps {
  tokens: Record<PlayerColor, [number, number, number, number]>;
  activeColors: PlayerColor[];
  currentTurn: PlayerColor;
  legalMoveTokens: number[]; // Token indexes of currentTurn that can move
  onTokenClick: (tokenIndex: number) => void;
  lastMove?: {
    color: PlayerColor;
    tokenIndex: number;
    from: number;
    to: number;
  } | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  tokens,
  activeColors,
  currentTurn,
  legalMoveTokens,
  onTokenClick,
  lastMove,
}) => {
  const CELL_SIZE = 40;
  const BOARD_SIZE = 600;

  // Star points generator for SVG
  const starPoints = (cx: number, cy: number, r: number) => {
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? r : r * 0.45;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  // Group all tokens by coordinate to handle stacking on same cell
  const tokenClusters = useMemo(() => {
    const map = new Map<string, { color: PlayerColor; tokenIndex: number; isLegal: boolean; pos: number }[]>();

    for (const color of activeColors) {
      for (let i = 0; i < 4; i++) {
        const pos = tokens[color][i];
        const coord = getTokenCoordinate(color, i, pos);
        const key = `${coord.row},${coord.col}`;
        const isLegal = color === currentTurn && legalMoveTokens.includes(i);

        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push({ color, tokenIndex: i, isLegal, pos });
      }
    }
    return map;
  }, [tokens, activeColors, currentTurn, legalMoveTokens]);

  const handleTokenSelect = (color: PlayerColor, tokenIndex: number, isLegal: boolean) => {
    if (!isLegal) return;
    soundService.playTokenStep();
    soundService.triggerVibrate(35);
    onTokenClick(tokenIndex);
  };

  return (
    <div className="relative w-full max-w-[580px] aspect-square mx-auto p-2 sm:p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-amber-500/40 select-none">
      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-lg pointer-events-none" />

      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        className="w-full h-full rounded-2xl bg-slate-900/90 shadow-inner drop-shadow-md"
      >
        <defs>
          {/* Gradients for Yard Bases */}
          <linearGradient id="redBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="greenBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="yellowBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="blueBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Token gradients */}
          <linearGradient id="tokenRed" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="tokenGreen" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="tokenYellow" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="tokenBlue" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Token shadow filter */}
          <filter id="tokenDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* ---------------- 1. BACKGROUND GRID & TRACKS ---------------- */}
        <rect width={BOARD_SIZE} height={BOARD_SIZE} fill="#f8fafc" />

        {/* ---------------- 2. FOUR YARDS (CORNERS) ---------------- */}
        {/* Red Yard: Top Left (Rows 0-5, Cols 0-5) */}
        <rect x={0} y={0} width={240} height={240} fill="url(#redBaseGrad)" stroke="#1e293b" strokeWidth="2" />
        <rect x={32} y={32} width={176} height={176} rx={22} fill="#ffffff" stroke="#ef4444" strokeWidth="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        {/* Yard circles */}
        <circle cx={76} cy={76} r={22} fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
        <circle cx={164} cy={76} r={22} fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
        <circle cx={76} cy={164} r={22} fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
        <circle cx={164} cy={164} r={22} fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />

        {/* Green Yard: Top Right (Rows 0-5, Cols 9-14) */}
        <rect x={360} y={0} width={240} height={240} fill="url(#greenBaseGrad)" stroke="#1e293b" strokeWidth="2" />
        <rect x={392} y={32} width={176} height={176} rx={22} fill="#ffffff" stroke="#10b981" strokeWidth="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <circle cx={436} cy={76} r={22} fill="#dcfce7" stroke="#10b981" strokeWidth="2.5" />
        <circle cx={524} cy={76} r={22} fill="#dcfce7" stroke="#10b981" strokeWidth="2.5" />
        <circle cx={436} cy={164} r={22} fill="#dcfce7" stroke="#10b981" strokeWidth="2.5" />
        <circle cx={524} cy={164} r={22} fill="#dcfce7" stroke="#10b981" strokeWidth="2.5" />

        {/* Yellow Yard: Bottom Right (Rows 9-14, Cols 9-14) */}
        <rect x={360} y={360} width={240} height={240} fill="url(#yellowBaseGrad)" stroke="#1e293b" strokeWidth="2" />
        <rect x={392} y={392} width={176} height={176} rx={22} fill="#ffffff" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <circle cx={436} cy={436} r={22} fill="#fef9c3" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx={524} cy={436} r={22} fill="#fef9c3" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx={436} cy={524} r={22} fill="#fef9c3" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx={524} cy={524} r={22} fill="#fef9c3" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Blue Yard: Bottom Left (Rows 9-14, Cols 0-5) */}
        <rect x={0} y={360} width={240} height={240} fill="url(#blueBaseGrad)" stroke="#1e293b" strokeWidth="2" />
        <rect x={32} y={392} width={176} height={176} rx={22} fill="#ffffff" stroke="#3b82f6" strokeWidth="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <circle cx={76} cy={436} r={22} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={164} cy={436} r={22} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={76} cy={524} r={22} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={164} cy={524} r={22} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />

        {/* ---------------- 3. TRACK SQUARES ---------------- */}
        {/* Draw all 52 track cells */}
        {TRACK_COORDINATES.map((coord, idx) => {
          const x = coord.col * CELL_SIZE;
          const y = coord.row * CELL_SIZE;
          const isSafe = SAFE_SQUARES.includes(idx);

          // Determine cell fill color
          let fill = '#ffffff';
          if (idx === 0) fill = '#ef4444'; // Red start
          else if (idx === 13) fill = '#10b981'; // Green start
          else if (idx === 26) fill = '#f59e0b'; // Yellow start
          else if (idx === 39) fill = '#3b82f6'; // Blue start
          else if (isSafe) fill = '#fef3c7'; // Safe star cells

          return (
            <g key={`track-${idx}`}>
              <rect
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={fill}
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              {/* Star on safe cells */}
              {isSafe && (
                <polygon
                  points={starPoints(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 11)}
                  fill={idx === 0 || idx === 13 || idx === 26 || idx === 39 ? '#ffffff' : '#f59e0b'}
                  stroke="#92400e"
                  strokeWidth="0.8"
                />
              )}
            </g>
          );
        })}

        {/* ---------------- 4. HOME PATH COLUMNS ---------------- */}
        {/* Red Home Path (Row 7, Cols 1..5) */}
        {[1, 2, 3, 4, 5].map(col => (
          <rect
            key={`red-home-${col}`}
            x={col * CELL_SIZE}
            y={7 * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="1"
          />
        ))}

        {/* Green Home Path (Col 7, Rows 1..5) */}
        {[1, 2, 3, 4, 5].map(row => (
          <rect
            key={`green-home-${row}`}
            x={7 * CELL_SIZE}
            y={row * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="#10b981"
            stroke="#047857"
            strokeWidth="1"
          />
        ))}

        {/* Yellow Home Path (Row 7, Cols 9..13) */}
        {[9, 10, 11, 12, 13].map(col => (
          <rect
            key={`yellow-home-${col}`}
            x={col * CELL_SIZE}
            y={7 * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="1"
          />
        ))}

        {/* Blue Home Path (Col 7, Rows 9..13) */}
        {[9, 10, 11, 12, 13].map(row => (
          <rect
            key={`blue-home-${row}`}
            x={7 * CELL_SIZE}
            y={row * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="1"
          />
        ))}

        {/* ---------------- 5. CENTER TRIANGLE ---------------- */}
        {/* Red Triangle */}
        <polygon points="240,240 300,300 240,360" fill="#ef4444" stroke="#1e293b" strokeWidth="1.5" />
        {/* Green Triangle */}
        <polygon points="240,240 300,300 360,240" fill="#10b981" stroke="#1e293b" strokeWidth="1.5" />
        {/* Yellow Triangle */}
        <polygon points="360,240 300,300 360,360" fill="#f59e0b" stroke="#1e293b" strokeWidth="1.5" />
        {/* Blue Triangle */}
        <polygon points="240,360 300,300 360,360" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />

        {/* Golden Center Crown Emblem */}
        <circle cx={300} cy={300} r={20} fill="#facc15" stroke="#78350f" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
        <polygon
          points={starPoints(300, 300, 12)}
          fill="#ffffff"
          stroke="#ca8a04"
          strokeWidth="1"
        />

        {/* ---------------- 6. TOKENS LAYER ---------------- */}
        {Array.from(tokenClusters.entries()).map(([key, cluster]) => {
          const [rowStr, colStr] = key.split(',');
          const row = parseInt(rowStr, 10);
          const col = parseInt(colStr, 10);
          const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
          const cellCenterY = row * CELL_SIZE + CELL_SIZE / 2;

          return (
            <g key={`cluster-${key}`}>
              {cluster.map((t, idx) => {
                // Calculate position offset if multiple tokens share cell
                let offsetX = 0;
                let offsetY = 0;
                const count = cluster.length;
                const tokenRadius = count > 1 ? 12 : 14;

                if (count === 2) {
                  offsetX = idx === 0 ? -6 : 6;
                  offsetY = idx === 0 ? -6 : 6;
                } else if (count === 3) {
                  const angle = (idx * 2 * Math.PI) / 3;
                  offsetX = Math.cos(angle) * 7;
                  offsetY = Math.sin(angle) * 7;
                } else if (count >= 4) {
                  const angle = (idx * 2 * Math.PI) / count;
                  offsetX = Math.cos(angle) * 8;
                  offsetY = Math.sin(angle) * 8;
                }

                const cx = cellCenterX + offsetX;
                const cy = cellCenterY + offsetY;

                let fillGradient = 'url(#tokenRed)';
                if (t.color === 'green') fillGradient = 'url(#tokenGreen)';
                if (t.color === 'yellow') fillGradient = 'url(#tokenYellow)';
                if (t.color === 'blue') fillGradient = 'url(#tokenBlue)';

                const isJustMoved =
                  lastMove &&
                  lastMove.color === t.color &&
                  lastMove.tokenIndex === t.tokenIndex;

                return (
                  <g
                    key={`token-${t.color}-${t.tokenIndex}`}
                    onClick={() => handleTokenSelect(t.color, t.tokenIndex, t.isLegal)}
                    className={`transition-transform duration-200 ${
                      t.isLegal ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Pulsing ring for legal moves */}
                    {t.isLegal && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={tokenRadius + 6}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3.5"
                        strokeDasharray="4 2"
                        className="animate-spin origin-center"
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                      />
                    )}

                    {/* Outer border & shadow */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={tokenRadius}
                      fill={fillGradient}
                      stroke="#ffffff"
                      strokeWidth={t.isLegal ? 2.5 : 1.8}
                      filter="url(#tokenDropShadow)"
                      className={t.isLegal ? 'animate-bounce' : ''}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />

                    {/* Inner highlight ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={tokenRadius * 0.55}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />

                    {/* Specular shine */}
                    <circle
                      cx={cx - tokenRadius * 0.3}
                      cy={cy - tokenRadius * 0.3}
                      r={tokenRadius * 0.25}
                      fill="#ffffff"
                      opacity="0.75"
                    />

                    {/* Token Number */}
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fontSize={tokenRadius * 0.8}
                      fontWeight="900"
                      fill="#ffffff"
                      className="pointer-events-none drop-shadow"
                    >
                      {t.tokenIndex + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
