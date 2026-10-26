export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot' | 'remote';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  avatar: string;
  type: PlayerType;
  isHost?: boolean;
  isReady?: boolean;
  isOnline?: boolean;
  tokensHome: number;
}

// Relative token position:
// -1: in yard (home base)
// 0: start square on track
// 0 - 50: outer circuit track (51 squares total before entering home lane)
// 51 - 55: colored safe home path (5 squares)
// 56: Home target (finished)
export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  position: number; // -1 to 56
}

export type TurnPhase = 'roll' | 'move' | 'finished';

export interface GameMoveRecord {
  color: PlayerColor;
  tokenIndex: number;
  from: number;
  to: number;
  capturedColor?: PlayerColor;
  capturedTokenIndex?: number;
  diceRoll: number;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  activeColors: PlayerColor[];
  currentTurn: PlayerColor;
  diceValue: number | null;
  diceRolled: boolean;
  turnPhase: TurnPhase;
  consecutiveSixes: number;
  tokens: Record<PlayerColor, [number, number, number, number]>;
  winners: PlayerColor[]; // Ranked list of who finished all 4 tokens
  lastMove: GameMoveRecord | null;
  turnStartTime: number;
  turnTimeLimit: number; // in seconds (e.g., 30s)
  isOnline: boolean;
  roomCode?: string;
  roomId?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatar: string;
  isGuest: boolean;
  totalMatches: number;
  wins: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomData {
  id: string;
  code: string;
  hostId: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  maxPlayers: number;
  playerCount: number;
  players: Record<string, {
    id: string;
    name: string;
    avatar: string;
    color: PlayerColor;
    isHost: boolean;
    isReady: boolean;
    isOnline: boolean;
    joinedAt: number;
  }>;
  gameState?: GameState;
  reaction?: {
    userId: string;
    emoji: string;
    timestamp: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  animationSpeed: 'normal' | 'fast';
}
