import { PlayerColor, GameMoveRecord, Player, GameState } from '../types/game';

// Global start square on 52-square circuit for each color
export const START_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe squares on 52-square circuit (Star positions)
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Turn order clockwise: Red -> Green -> Yellow -> Blue
export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const COLOR_HEX: Record<PlayerColor, { primary: string; secondary: string; light: string; border: string }> = {
  red: {
    primary: '#ef4444',
    secondary: '#dc2626',
    light: '#fca5a5',
    border: '#b91c1c',
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    light: '#6ee7b7',
    border: '#047857',
  },
  yellow: {
    primary: '#eab308',
    secondary: '#ca8a04',
    light: '#fde047',
    border: '#a16207',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    light: '#93c5fd',
    border: '#1d4ed8',
  },
};

/**
 * 15x15 grid coordinate system for Ludo board
 * Rows: 0 to 14, Cols: 0 to 14
 */
export interface GridCoord {
  row: number;
  col: number;
}

// 52 track squares clockwise mapping around the 15x15 board
// Index 0: Red Start (col 1, row 6)
export const TRACK_COORDINATES: GridCoord[] = [
  // Red side going right: (row 6, cols 1..5)
  { row: 6, col: 1 },  // 0: Red start
  { row: 6, col: 2 },  // 1
  { row: 6, col: 3 },  // 2
  { row: 6, col: 4 },  // 3
  { row: 6, col: 5 },  // 4
  // Turning up towards Green quadrant: (cols 6, rows 5..0)
  { row: 5, col: 6 },  // 5
  { row: 4, col: 6 },  // 6
  { row: 3, col: 6 },  // 7
  { row: 2, col: 6 },  // 8: Safe star
  { row: 1, col: 6 },  // 9
  { row: 0, col: 6 },  // 10
  // Green top turn:
  { row: 0, col: 7 },  // 11
  { row: 0, col: 8 },  // 12
  // Down right side (Green column):
  { row: 1, col: 8 },  // 13: Green start (safe star)
  { row: 2, col: 8 },  // 14
  { row: 3, col: 8 },  // 15
  { row: 4, col: 8 },  // 16
  { row: 5, col: 8 },  // 17
  // Right arm towards Yellow:
  { row: 6, col: 9 },  // 18
  { row: 6, col: 10 }, // 19
  { row: 6, col: 11 }, // 20
  { row: 6, col: 12 }, // 21: Safe star
  { row: 6, col: 13 }, // 22
  { row: 6, col: 14 }, // 23
  // Yellow right turn:
  { row: 7, col: 14 }, // 24
  { row: 8, col: 14 }, // 25
  // Left along Yellow arm:
  { row: 8, col: 13 }, // 26: Yellow start (safe star)
  { row: 8, col: 12 }, // 27
  { row: 8, col: 11 }, // 28
  { row: 8, col: 10 }, // 29
  { row: 8, col: 9 },  // 30
  // Down towards Blue:
  { row: 9, col: 8 },  // 31
  { row: 10, col: 8 }, // 32
  { row: 11, col: 8 }, // 33
  { row: 12, col: 8 }, // 34: Safe star
  { row: 13, col: 8 }, // 35
  { row: 14, col: 8 }, // 36
  // Bottom turn:
  { row: 14, col: 7 }, // 37
  { row: 14, col: 6 }, // 38
  // Up Blue side:
  { row: 13, col: 6 }, // 39: Blue start (safe star)
  { row: 12, col: 6 }, // 40
  { row: 11, col: 6 }, // 41
  { row: 10, col: 6 }, // 42
  { row: 9, col: 6 },  // 43
  // Left along bottom-left arm:
  { row: 8, col: 5 },  // 44
  { row: 8, col: 4 },  // 45
  { row: 8, col: 3 },  // 46
  { row: 8, col: 2 },  // 47: Safe star
  { row: 8, col: 1 },  // 48
  { row: 8, col: 0 },  // 49
  // Up to complete circuit:
  { row: 7, col: 0 },  // 50
  { row: 6, col: 0 },  // 51
];

// 5 colored home-path squares for each color (steps 51 to 55)
export const HOME_PATHS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

// Home finish center triangles (step 56)
export const HOME_CENTER: Record<PlayerColor, GridCoord> = {
  red: { row: 7, col: 6 },
  green: { row: 6, col: 7 },
  yellow: { row: 7, col: 8 },
  blue: { row: 8, col: 7 },
};

// 4 Yard pod coordinates for each color
export const YARD_COORDINATES: Record<PlayerColor, GridCoord[]> = {
  red: [
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
  ],
  green: [
    { row: 2, col: 11 },
    { row: 2, col: 12 },
    { row: 3, col: 11 },
    { row: 3, col: 12 },
  ],
  yellow: [
    { row: 11, col: 11 },
    { row: 11, col: 12 },
    { row: 12, col: 11 },
    { row: 12, col: 12 },
  ],
  blue: [
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 12, col: 2 },
    { row: 12, col: 3 },
  ],
};

/**
 * Get the Board Grid Coordinate (row, col) for any token given its color, token index, and relative step
 */
export function getTokenCoordinate(color: PlayerColor, tokenIndex: number, step: number): GridCoord {
  if (step === -1) {
    // In Yard
    return YARD_COORDINATES[color][tokenIndex] || { row: 0, col: 0 };
  }
  if (step >= 0 && step <= 50) {
    // Outer circuit
    const globalIdx = (step + START_OFFSETS[color]) % 52;
    return TRACK_COORDINATES[globalIdx];
  }
  if (step >= 51 && step <= 55) {
    // Home stretch (51 -> index 0, 55 -> index 4)
    return HOME_PATHS[color][step - 51];
  }
  // Step 56: Home center
  return HOME_CENTER[color];
}

/**
 * Convert relative step to global circuit index if on outer track
 */
export function getGlobalCircuitIndex(color: PlayerColor, step: number): number | null {
  if (step >= 0 && step <= 50) {
    return (step + START_OFFSETS[color]) % 52;
  }
  return null;
}

/**
 * Check if a specific token can legally move given the current roll
 */
export function canTokenMove(step: number, roll: number): boolean {
  if (step === 56) return false; // Already reached home
  if (step === -1) {
    return roll === 6; // Needs a 6 to leave yard
  }
  return step + roll <= 56; // Cannot overshoot home
}

/**
 * Returns list of token indexes [0..3] that can make a legal move with the given roll
 */
export function getLegalMoves(
  color: PlayerColor,
  roll: number,
  tokens: Record<PlayerColor, [number, number, number, number]>
): number[] {
  const playerTokens = tokens[color];
  const legal: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (canTokenMove(playerTokens[i], roll)) {
      legal.push(i);
    }
  }
  return legal;
}

export interface MoveExecutionResult {
  nextTokens: Record<PlayerColor, [number, number, number, number]>;
  capturedColor?: PlayerColor;
  capturedTokenIndex?: number;
  awardedExtraTurn: boolean;
  reachedHome: boolean;
  isGameWon: boolean;
  moveRecord: GameMoveRecord;
}

/**
 * Execute a move for a specific token
 */
export function executeMove(
  color: PlayerColor,
  tokenIndex: number,
  roll: number,
  tokens: Record<PlayerColor, [number, number, number, number]>
): MoveExecutionResult {
  const currentPos = tokens[color][tokenIndex];
  let newPos: number;

  if (currentPos === -1) {
    newPos = 0; // Spawn onto start square
  } else {
    newPos = currentPos + roll;
  }

  // Clone tokens
  const nextTokens: Record<PlayerColor, [number, number, number, number]> = {
    red: [...tokens.red],
    green: [...tokens.green],
    yellow: [...tokens.yellow],
    blue: [...tokens.blue],
  };

  nextTokens[color][tokenIndex] = newPos;

  let capturedColor: PlayerColor | undefined = undefined;
  let capturedTokenIndex: number | undefined = undefined;
  let awardedExtraTurn = roll === 6;
  const reachedHome = newPos === 56;

  if (reachedHome) {
    awardedExtraTurn = true;
  }

  // Check captures if landing on outer circuit (0 to 50)
  if (newPos >= 0 && newPos <= 50) {
    const landingGlobalIdx = (newPos + START_OFFSETS[color]) % 52;
    const isSafe = SAFE_SQUARES.includes(landingGlobalIdx);

    if (!isSafe) {
      // Look for opponent tokens sharing this landingGlobalIdx
      for (const oppColor of COLOR_ORDER) {
        if (oppColor === color) continue;
        for (let tIdx = 0; tIdx < 4; tIdx++) {
          const oppPos = nextTokens[oppColor][tIdx];
          if (oppPos >= 0 && oppPos <= 50) {
            const oppGlobalIdx = (oppPos + START_OFFSETS[oppColor]) % 52;
            if (oppGlobalIdx === landingGlobalIdx) {
              // Capture opponent token!
              capturedColor = oppColor;
              capturedTokenIndex = tIdx;
              nextTokens[oppColor][tIdx] = -1; // Send back to Yard
              awardedExtraTurn = true;
              break;
            }
          }
        }
        if (capturedColor) break;
      }
    }
  }

  // Check if player won (all 4 tokens at 56)
  const isGameWon = nextTokens[color].every(p => p === 56);

  const moveRecord: GameMoveRecord = {
    color,
    tokenIndex,
    from: currentPos,
    to: newPos,
    capturedColor,
    capturedTokenIndex,
    diceRoll: roll,
    timestamp: Date.now(),
  };

  return {
    nextTokens,
    capturedColor,
    capturedTokenIndex,
    awardedExtraTurn,
    reachedHome,
    isGameWon,
    moveRecord,
  };
}

/**
 * Calculate the next turn in clockwise sequence among active colors
 */
export function getNextTurn(
  currentTurn: PlayerColor,
  activeColors: PlayerColor[],
  completedColors: PlayerColor[] = []
): PlayerColor {
  const eligible = activeColors.filter(c => !completedColors.includes(c));
  if (eligible.length <= 1) {
    return eligible[0] || currentTurn;
  }
  const currentIndex = COLOR_ORDER.indexOf(currentTurn);
  for (let step = 1; step <= 4; step++) {
    const nextCandidate = COLOR_ORDER[(currentIndex + step) % 4];
    if (eligible.includes(nextCandidate)) {
      return nextCandidate;
    }
  }
  return eligible[0];
}

/**
 * Intelligent Bot Move Selector
 */
export function selectBestBotMove(
  color: PlayerColor,
  roll: number,
  tokens: Record<PlayerColor, [number, number, number, number]>
): number {
  const legal = getLegalMoves(color, roll, tokens);
  if (legal.length === 0) return -1;
  if (legal.length === 1) return legal[0];

  let bestMove = legal[0];
  let highestScore = -Infinity;

  for (const tokenIdx of legal) {
    const currentPos = tokens[color][tokenIdx];
    const targetPos = currentPos === -1 ? 0 : currentPos + roll;
    let score = 0;

    // 1. Finishing home: huge reward
    if (targetPos === 56) {
      score += 2000;
    }

    // 2. Capturing an opponent: high priority
    if (targetPos >= 0 && targetPos <= 50) {
      const targetGlobal = (targetPos + START_OFFSETS[color]) % 52;
      if (!SAFE_SQUARES.includes(targetGlobal)) {
        for (const oppColor of COLOR_ORDER) {
          if (oppColor === color) continue;
          for (let i = 0; i < 4; i++) {
            const oppPos = tokens[oppColor][i];
            if (oppPos >= 0 && oppPos <= 50) {
              const oppGlobal = (oppPos + START_OFFSETS[oppColor]) % 52;
              if (oppGlobal === targetGlobal) {
                score += 1500;
              }
            }
          }
        }
      }
    }

    // 3. Leaving yard with a 6: very good opening
    if (currentPos === -1 && targetPos === 0) {
      // Prioritize bringing new tokens into play if we have fewer active
      const activeCount = tokens[color].filter(p => p >= 0 && p < 56).length;
      score += activeCount < 2 ? 800 : 400;
    }

    // 4. Entering home stretch: safe from captures
    if (currentPos <= 50 && targetPos >= 51) {
      score += 600;
    }

    // 5. Landing on a safe square
    if (targetPos >= 0 && targetPos <= 50) {
      const targetGlobal = (targetPos + START_OFFSETS[color]) % 52;
      if (SAFE_SQUARES.includes(targetGlobal)) {
        score += 300;
      }
    }

    // 6. Evasion: is current token in danger from behind?
    if (currentPos >= 0 && currentPos <= 50) {
      const currentGlobal = (currentPos + START_OFFSETS[color]) % 52;
      if (!SAFE_SQUARES.includes(currentGlobal)) {
        for (const oppColor of COLOR_ORDER) {
          if (oppColor === color) continue;
          for (let i = 0; i < 4; i++) {
            const oppPos = tokens[oppColor][i];
            if (oppPos >= 0 && oppPos <= 50) {
              const oppGlobal = (oppPos + START_OFFSETS[oppColor]) % 52;
              const dist = (currentGlobal - oppGlobal + 52) % 52;
              if (dist >= 1 && dist <= 6) {
                // Danger! Moving this token escapes threat
                score += 500;
              }
            }
          }
        }
      }
    }

    // 7. Progress distance bonus
    score += targetPos * 4;

    if (score > highestScore) {
      highestScore = score;
      bestMove = tokenIdx;
    }
  }

  return bestMove;
}

/**
 * Generate a random 6-character room code (e.g. "LUDO78", "KING24")
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Initialize default new game state
 */
export function createInitialGameState(players: Player[], isOnline: boolean = false): GameState {
  const activeColors = players.map(p => p.color);
  return {
    players,
    activeColors,
    currentTurn: activeColors[0] || 'red',
    diceValue: null,
    diceRolled: false,
    turnPhase: 'roll',
    consecutiveSixes: 0,
    tokens: {
      red: [-1, -1, -1, -1],
      green: [-1, -1, -1, -1],
      yellow: [-1, -1, -1, -1],
      blue: [-1, -1, -1, -1],
    },
    winners: [],
    lastMove: null,
    turnStartTime: Date.now(),
    turnTimeLimit: 30,
    isOnline,
  };
}
