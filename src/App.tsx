import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  GameState,
  Player,
  PlayerColor,
  RoomData,
  TurnPhase,
} from './types/game';
import {
  COLOR_HEX,
  getLegalMoves,
  executeMove,
  getNextTurn,
  selectBestBotMove,
  createInitialGameState,
} from './game/ludoEngine';
import { soundService } from './services/audio';
import {
  auth,
  getOrCreateGuestId,
  getCurrentPlayerId,
  syncUserProfile,
  recordGameStats,
  createOnlineRoom,
  joinOnlineRoom,
  subscribeToRoom,
  syncOnlineGameState,
  sendRoomReaction,
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { HomeScreen } from './components/home/HomeScreen';
import { LudoBoard } from './components/board/LudoBoard';
import { Dice3D } from './components/board/Dice3D';
import { PlayerBadge } from './components/board/PlayerBadge';
import { RuleModal } from './components/modals/RuleModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { LobbyModal } from './components/modals/LobbyModal';
import { GameOverModal } from './components/modals/GameOverModal';
import { EmojiReactions } from './components/modals/EmojiReactions';
import {
  Home,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Flame,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  displayName: 'Champion',
  avatar: 'crown-gold',
  isGuest: true,
  totalMatches: 0,
  wins: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  // Navigation Screens: 'home' | 'lobby' | 'playing'
  const [screen, setScreen] = useState<'home' | 'lobby' | 'playing'>('home');

  // Player Profile & Auth
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ludo_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [currentUserId, setCurrentUserId] = useState<string>('local_player');

  // Game Settings
  const [soundEnabled, setSoundEnabled] = useState(soundService.getSoundEnabled());
  const [musicEnabled, setMusicEnabled] = useState(soundService.getMusicEnabled());
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [fastAnimation, setFastAnimation] = useState(false);

  // Active Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Turn timers and announcements
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [rollingDice, setRollingDice] = useState(false);

  // Modals
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const roomUnsubscribeRef = useRef<(() => void) | null>(null);
  const botTurnTimeoutRef = useRef<number | null>(null);
  const turnTimerIntervalRef = useRef<number | null>(null);

  // 1. Initialize user ID and Google Auth state listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setCurrentUserId(user.uid);
        syncUserProfile(user, profile.displayName, profile.avatar).then(synced => {
          setProfile(synced);
          localStorage.setItem('ludo_profile', JSON.stringify(synced));
        }).catch(err => {
          console.warn('Could not sync user profile:', err);
        });
      } else {
        const guestId = getOrCreateGuestId();
        setCurrentUserId(guestId);
      }
    });

    return () => {
      unsubAuth();
      if (roomUnsubscribeRef.current) roomUnsubscribeRef.current();
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    };
  }, []);

  // Update profile handler
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    localStorage.setItem('ludo_profile', JSON.stringify(next));
    if (auth.currentUser) {
      syncUserProfile(auth.currentUser, next.displayName, next.avatar);
    }
  };

  const showNotification = (msg: string, duration: number = 2000) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(prev => (prev === msg ? null : prev));
    }, duration);
  };

  // 2. Start Offline Game
  const handleStartOfflineGame = (players: Player[]) => {
    const newGame = createInitialGameState(players, false);
    setGameState(newGame);
    setActiveRoom(null);
    setScreen('playing');
    setTurnTimeLeft(30);
    showNotification("Match Started! Roll the dice to begin.", 2500);
  };

  // 3. Create Online Room
  const handleCreateOnlineRoom = async (maxPlayers: number) => {
    setOnlineLoading(true);
    setOnlineError(null);
    try {
      const userId = getCurrentPlayerId();
      setCurrentUserId(userId);
      const { room } = await createOnlineRoom(
        userId,
        profile.displayName,
        profile.avatar,
        maxPlayers
      );
      setActiveRoom(room);
      setScreen('lobby');
      listenToRoomUpdates(room.id);
    } catch (err) {
      console.error(err);
      setOnlineError(err instanceof Error ? err.message : 'Failed to create room');
      showNotification('Could not create room. Please try again.', 3000);
    } finally {
      setOnlineLoading(false);
    }
  };

  // 4. Join Online Room
  const handleJoinOnlineRoom = async (code: string) => {
    setOnlineLoading(true);
    setOnlineError(null);
    try {
      const userId = getCurrentPlayerId();
      setCurrentUserId(userId);
      const { room } = await joinOnlineRoom(
        code,
        userId,
        profile.displayName,
        profile.avatar
      );
      setActiveRoom(room);
      setScreen(room.status === 'in_progress' ? 'playing' : 'lobby');
      if (room.gameState) {
        setGameState(room.gameState);
      }
      listenToRoomUpdates(room.id);
    } catch (err) {
      console.error(err);
      setOnlineError(err instanceof Error ? err.message : 'Room not found or full');
      showNotification(err instanceof Error ? err.message : 'Cannot join room', 3000);
    } finally {
      setOnlineLoading(false);
    }
  };

  // Real-time room listener
  const listenToRoomUpdates = (roomId: string) => {
    if (roomUnsubscribeRef.current) roomUnsubscribeRef.current();

    roomUnsubscribeRef.current = subscribeToRoom(
      roomId,
      updatedRoom => {
        setActiveRoom(updatedRoom);
        if (updatedRoom.status === 'in_progress' && updatedRoom.gameState) {
          setGameState(updatedRoom.gameState);
          setScreen('playing');
          if (updatedRoom.gameState.winners.length > 0) {
            setShowGameOver(true);
          }
        }
      },
      error => {
        console.error('Room subscription error:', error);
      }
    );
  };

  // Leave active room
  const handleLeaveRoom = () => {
    if (roomUnsubscribeRef.current) {
      roomUnsubscribeRef.current();
      roomUnsubscribeRef.current = null;
    }
    setActiveRoom(null);
    setGameState(null);
    setScreen('home');
    setShowExitConfirm(false);
  };

  // ----------------- IN-GAME LOGIC & TURN ENGINE -----------------

  const activePlayer = gameState?.players.find(p => p.color === gameState.currentTurn);
  const isMyTurn = gameState?.isOnline
    ? activePlayer?.id === currentUserId
    : activePlayer?.type === 'human';

  // Legal moves for current turn
  const legalMoveTokens =
    gameState && gameState.diceValue !== null && gameState.turnPhase === 'move'
      ? getLegalMoves(gameState.currentTurn, gameState.diceValue, gameState.tokens)
      : [];

  // Turn Countdown Timer
  useEffect(() => {
    if (screen !== 'playing' || !gameState || gameState.winners.length > 0) return;

    if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    setTurnTimeLeft(gameState.turnTimeLimit || 30);

    turnTimerIntervalRef.current = window.setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // Turn timeout! Force pass turn
          handleTurnTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (turnTimerIntervalRef.current) clearInterval(turnTimerIntervalRef.current);
    };
  }, [screen, gameState?.currentTurn, gameState?.winners.length]);

  const handleTurnTimeout = () => {
    if (!gameState) return;
    showNotification(`${gameState.currentTurn.toUpperCase()} timed out! Passing turn...`, 1500);
    passTurnToNextPlayer(gameState);
  };

  // Switch to next player
  const passTurnToNextPlayer = useCallback(
    (currentState: GameState) => {
      const nextColor = getNextTurn(
        currentState.currentTurn,
        currentState.activeColors,
        currentState.winners
      );

      const nextState: GameState = {
        ...currentState,
        currentTurn: nextColor,
        diceValue: null,
        diceRolled: false,
        turnPhase: 'roll',
        consecutiveSixes: 0,
        turnStartTime: Date.now(),
      };

      setGameState(nextState);

      if (nextState.isOnline && activeRoom) {
        syncOnlineGameState(activeRoom.id, nextState);
      }
    },
    [activeRoom]
  );

  // Roll Dice Action
  const handleRollDice = useCallback(() => {
    if (!gameState || gameState.turnPhase !== 'roll') return;
    setRollingDice(true);

    const rollValue = Math.floor(Math.random() * 6) + 1;
    let nextConsecutive = rollValue === 6 ? gameState.consecutiveSixes + 1 : 0;

    // Check 3 consecutive sixes rule
    if (nextConsecutive >= 3) {
      showNotification('Three consecutive 6s! Turn forfeited.', 2000);
      soundService.triggerVibrate([80, 50, 80]);
      setTimeout(() => {
        setRollingDice(false);
        passTurnToNextPlayer(gameState);
      }, 500);
      return;
    }

    setTimeout(() => {
      setRollingDice(false);
      const legal = getLegalMoves(gameState.currentTurn, rollValue, gameState.tokens);

      const updatedState: GameState = {
        ...gameState,
        diceValue: rollValue,
        diceRolled: true,
        turnPhase: legal.length > 0 ? 'move' : 'finished',
        consecutiveSixes: nextConsecutive,
      };

      setGameState(updatedState);

      if (updatedState.isOnline && activeRoom) {
        syncOnlineGameState(activeRoom.id, updatedState);
      }

      // If no legal moves available, auto-pass turn
      if (legal.length === 0) {
        showNotification('No legal moves available!', 1500);
        setTimeout(() => {
          passTurnToNextPlayer(updatedState);
        }, fastAnimation ? 700 : 1200);
      }
    }, 450);
  }, [gameState, activeRoom, fastAnimation, passTurnToNextPlayer]);

  // Execute Move Action
  const handleSelectToken = useCallback(
    (tokenIndex: number) => {
      if (
        !gameState ||
        gameState.turnPhase !== 'move' ||
        gameState.diceValue === null ||
        !legalMoveTokens.includes(tokenIndex)
      ) {
        return;
      }

      const moveResult = executeMove(
        gameState.currentTurn,
        tokenIndex,
        gameState.diceValue,
        gameState.tokens
      );

      // Sound triggers
      if (moveResult.reachedHome) {
        soundService.playTokenHome();
        showNotification('Token reached Home! 🌟 Extra roll awarded!', 2000);
      } else if (moveResult.capturedColor) {
        soundService.playCapture();
        showNotification(
          `Captured ${moveResult.capturedColor.toUpperCase()}! 💥 Extra roll awarded!`,
          2000
        );
      } else if (gameState.diceValue === 6) {
        soundService.playTokenSpawn();
        showNotification('Rolled a 6! 🎲 Extra roll awarded!', 1800);
      }

      const updatedWinners = [...gameState.winners];
      if (moveResult.isGameWon && !updatedWinners.includes(gameState.currentTurn)) {
        updatedWinners.push(gameState.currentTurn);
      }

      const isFirstWinner = updatedWinners.length === 1 && moveResult.isGameWon;

      // Update player tokens home count
      const updatedPlayers = gameState.players.map(p => {
        if (p.color === gameState.currentTurn) {
          const homeCount = moveResult.nextTokens[p.color].filter(pos => pos === 56).length;
          return { ...p, tokensHome: homeCount };
        }
        return p;
      });

      const nextState: GameState = {
        ...gameState,
        players: updatedPlayers,
        tokens: moveResult.nextTokens,
        winners: updatedWinners,
        lastMove: moveResult.moveRecord,
        diceValue: null,
        diceRolled: false,
        consecutiveSixes:
          moveResult.awardedExtraTurn && gameState.diceValue === 6
            ? gameState.consecutiveSixes
            : 0,
        turnPhase: moveResult.awardedExtraTurn ? 'roll' : 'finished',
      };

      if (isFirstWinner) {
        setShowGameOver(true);
        // Record stats
        if (gameState.currentTurn === 'red' || (!gameState.isOnline && activePlayer?.type === 'human')) {
          recordGameStats(profile.id, true);
          handleUpdateProfile({
            wins: profile.wins + 1,
            totalMatches: profile.totalMatches + 1,
          });
        }
      }

      setGameState(nextState);

      if (nextState.isOnline && activeRoom) {
        syncOnlineGameState(activeRoom.id, nextState);
      }

      // If no extra turn awarded and game not over, advance to next turn
      if (!moveResult.awardedExtraTurn && updatedWinners.length === 0) {
        setTimeout(() => {
          passTurnToNextPlayer(nextState);
        }, fastAnimation ? 200 : 400);
      }
    },
    [
      gameState,
      legalMoveTokens,
      activeRoom,
      fastAnimation,
      profile,
      activePlayer,
      passTurnToNextPlayer,
    ]
  );

  // Automated Bot Turn Engine
  useEffect(() => {
    if (screen !== 'playing' || !gameState || gameState.winners.length > 0) return;

    const currentP = gameState.players.find(p => p.color === gameState.currentTurn);
    if (!currentP || currentP.type !== 'bot') return;

    if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);

    const botDelay = fastAnimation ? 400 : 700;

    if (gameState.turnPhase === 'roll') {
      // Bot rolls dice
      botTurnTimeoutRef.current = window.setTimeout(() => {
        handleRollDice();
      }, botDelay);
    } else if (gameState.turnPhase === 'move' && gameState.diceValue !== null) {
      // Bot selects best move
      botTurnTimeoutRef.current = window.setTimeout(() => {
        const bestTokenIdx = selectBestBotMove(
          gameState.currentTurn,
          gameState.diceValue!,
          gameState.tokens
        );
        if (bestTokenIdx !== -1) {
          handleSelectToken(bestTokenIdx);
        } else {
          passTurnToNextPlayer(gameState);
        }
      }, botDelay);
    }

    return () => {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
    };
  }, [
    screen,
    gameState?.currentTurn,
    gameState?.turnPhase,
    gameState?.diceValue,
    fastAnimation,
    handleRollDice,
    handleSelectToken,
    passTurnToNextPlayer,
  ]);

  // Send reaction in online or offline mode
  const handleSendReaction = (emoji: string) => {
    if (gameState?.isOnline && activeRoom) {
      sendRoomReaction(activeRoom.id, currentUserId, emoji);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom?.code) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* ---------------- SCREEN 1: HOME ---------------- */}
      {screen === 'home' && (
        <HomeScreen
          profile={profile}
          onOpenProfile={() => setShowProfile(true)}
          onOpenRules={() => setShowRules(true)}
          onOpenSettings={() => setShowSettings(true)}
          onStartOfflineGame={handleStartOfflineGame}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
          onlineLoading={onlineLoading}
        />
      )}

      {/* ---------------- SCREEN 2: WAITING LOBBY ---------------- */}
      {screen === 'lobby' && activeRoom && (
        <LobbyModal
          isOpen={true}
          room={activeRoom}
          currentUserId={currentUserId}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* ---------------- SCREEN 3: ACTIVE GAMEPLAY ---------------- */}
      {screen === 'playing' && gameState && (
        <div className="relative min-h-screen flex flex-col justify-between p-2 sm:p-4 max-w-2xl mx-auto w-full">
          {/* Top In-Game Bar */}
          <header className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-md mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExitConfirm(true)}
                title="Return to Home"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors shadow"
              >
                <Home className="w-4 h-4" />
              </button>

              {gameState.isOnline && activeRoom && (
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <span>Room: {activeRoom.code}</span>
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* In-Game notification toast banner */}
            {bannerMessage && (
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-950 shadow-lg animate-bounce truncate max-w-[200px]">
                {bannerMessage}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  soundService.setSoundEnabled(next);
                }}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors shadow"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors shadow"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Top Player Badges (e.g. Red & Green) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {gameState.players.slice(0, 2).map(p => (
              <PlayerBadge
                key={p.id}
                player={p}
                isTurn={gameState.currentTurn === p.color}
                tokens={gameState.tokens[p.color]}
                turnTimeLeft={turnTimeLeft}
                maxTurnTime={gameState.turnTimeLimit}
              />
            ))}
          </div>

          {/* Center Ludo Board */}
          <main className="relative flex-1 flex flex-col items-center justify-center my-auto">
            <LudoBoard
              tokens={gameState.tokens}
              activeColors={gameState.activeColors}
              currentTurn={gameState.currentTurn}
              legalMoveTokens={legalMoveTokens}
              onTokenClick={handleSelectToken}
              lastMove={gameState.lastMove}
            />
          </main>

          {/* Bottom Player Badges (e.g. Blue & Yellow) */}
          {gameState.players.length > 2 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {gameState.players.slice(2, 4).map(p => (
                <PlayerBadge
                  key={p.id}
                  player={p}
                  isTurn={gameState.currentTurn === p.color}
                  tokens={gameState.tokens[p.color]}
                  turnTimeLeft={turnTimeLeft}
                  maxTurnTime={gameState.turnTimeLimit}
                />
              ))}
            </div>
          )}

          {/* Bottom Controls: Dice & Emoji Reactions */}
          <footer className="mt-3 flex items-center justify-between gap-4 p-2 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            {/* Quick Emoji Reaction Selector */}
            <EmojiReactions
              onSendEmoji={handleSendReaction}
              incomingReaction={activeRoom?.reaction}
            />

            {/* Current Turn Instruction */}
            <div className="flex-1 text-center min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Current Turn
              </span>
              <span
                className="text-sm sm:text-base font-black uppercase tracking-wider block truncate"
                style={{ color: COLOR_HEX[gameState.currentTurn].primary }}
              >
                {activePlayer?.name || gameState.currentTurn}
              </span>
              {activePlayer?.type === 'bot' && (
                <span className="text-[10px] text-purple-400 font-bold block animate-pulse">
                  AI is calculating...
                </span>
              )}
            </div>

            {/* Interactive 3D Dice */}
            <Dice3D
              value={gameState.diceValue}
              color={gameState.currentTurn}
              canRoll={Boolean(isMyTurn && gameState.turnPhase === 'roll' && !rollingDice)}
              onRoll={handleRollDice}
              rolling={rollingDice}
            />
          </footer>
        </div>
      )}

      {/* ---------------- MODALS & OVERLAYS ---------------- */}
      <RuleModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        vibrationEnabled={vibrationEnabled}
        setVibrationEnabled={setVibrationEnabled}
        fastAnimation={fastAnimation}
        setFastAnimation={setFastAnimation}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {showGameOver && gameState && (
        <GameOverModal
          isOpen={true}
          winners={gameState.winners}
          players={gameState.players}
          onPlayAgain={() => {
            setShowGameOver(false);
            if (gameState.isOnline && activeRoom) {
              setScreen('lobby');
            } else {
              handleStartOfflineGame(gameState.players);
            }
          }}
          onBackToHome={() => {
            setShowGameOver(false);
            handleLeaveRoom();
          }}
        />
      )}

      {/* Leave Game Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-white">Leave Current Match?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Your active match progress will be lost.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
              >
                Stay & Play
              </button>
              <button
                onClick={handleLeaveRoom}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm"
              >
                Leave Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
