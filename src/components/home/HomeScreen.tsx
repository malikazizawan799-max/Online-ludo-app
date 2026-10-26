import React, { useState } from 'react';
import {
  Globe2,
  Users2,
  Bot,
  User,
  PlusCircle,
  KeyRound,
  Trophy,
  HelpCircle,
  Settings,
  Sparkles,
  Crown,
  Dice6,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, PlayerColor, Player } from '../../types/game';
import { soundService } from '../../services/audio';

interface HomeScreenProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onStartOfflineGame: (players: Player[]) => void;
  onCreateOnlineRoom: (maxPlayers: number) => void;
  onJoinOnlineRoom: (code: string) => void;
  onlineLoading?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onOpenProfile,
  onOpenRules,
  onOpenSettings,
  onStartOfflineGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onlineLoading = false,
}) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Offline game setup state
  const [offlinePlayerCount, setOfflinePlayerCount] = useState<2 | 3 | 4>(4);
  const [offlineBotConfigs, setOfflineBotConfigs] = useState<Record<number, boolean>>({
    0: false, // Player 1 (Human)
    1: true,  // Player 2 (Bot)
    2: true,  // Player 3 (Bot)
    3: true,  // Player 4 (Bot)
  });

  const [onlinePlayerCount, setOnlinePlayerCount] = useState<2 | 3 | 4>(4);

  const handleLaunchOffline = () => {
    soundService.playClick();
    const colors: PlayerColor[] =
      offlinePlayerCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

    const players: Player[] = colors.map((color, idx) => {
      const isBot = offlineBotConfigs[idx] ?? false;
      return {
        id: `offline_p_${idx + 1}`,
        name: idx === 0 ? profile.displayName : isBot ? `Bot ${color.toUpperCase()}` : `Player ${idx + 1}`,
        color,
        avatar: idx === 0 ? profile.avatar : 'dice-master',
        type: isBot ? 'bot' : 'human',
        tokensHome: 0,
      };
    });

    setShowOfflineModal(false);
    onStartOfflineGame(players);
  };

  const handleCreateRoom = (count: number) => {
    soundService.playClick();
    setShowCreateModal(false);
    onCreateOnlineRoom(count);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    soundService.playClick();
    setShowJoinModal(false);
    onJoinOnlineRoom(joinCode.trim());
    setJoinCode('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between py-6 px-4 max-w-xl mx-auto select-none">
      {/* ---------------- TOP HEADER ---------------- */}
      <header className="flex items-center justify-between gap-3">
        {/* Profile Card Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 p-2 pr-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-amber-500/50 shadow-lg transition-transform active:scale-95 backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-md">
            👑
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm text-white block truncate max-w-[120px]">
              {profile.displayName}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>{profile.wins} Wins</span>
            </div>
          </div>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onOpenRules();
            }}
            title="How to Play"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-md"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              onOpenSettings();
            }}
            title="Settings"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-md"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ---------------- CENTER BRANDING & LOGO ---------------- */}
      <div className="my-6 text-center">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" /> Official Online Multiplayer
        </div>

        <div className="relative inline-block">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
            LUDO KING PRO
          </h1>
          <Crown className="w-7 h-7 text-amber-300 absolute -top-5 right-2 -rotate-12 animate-pulse" />
        </div>

        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          The Ultimate Real-Time Ludo Experience
        </p>
      </div>

      {/* ---------------- MAIN GAME MODES ---------------- */}
      <div className="space-y-3.5 flex-1 max-w-md mx-auto w-full">
        {/* Play Online (Quick Match) */}
        <button
          onClick={() => {
            soundService.playClick();
            onCreateOnlineRoom(4);
          }}
          disabled={onlineLoading}
          className="group relative w-full p-4 rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 border-2 border-purple-500/40 hover:border-amber-400 shadow-[0_10px_30px_rgba(88,28,135,0.4)] transition-all duration-300 active:scale-98 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Globe2 className="w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-lg text-white block tracking-wide group-hover:text-amber-300 transition-colors">
                Play Online
              </span>
              <span className="text-xs text-purple-200/80 font-medium">
                Live match with real players worldwide
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Play with Friends (Private Room) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundService.playClick();
              setShowCreateModal(true);
            }}
            disabled={onlineLoading}
            className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 shadow-lg transition-transform active:scale-95 text-left flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">
                Create Room
              </span>
              <span className="text-[11px] text-slate-400">Host private match</span>
            </div>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setShowJoinModal(true);
            }}
            disabled={onlineLoading}
            className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 shadow-lg transition-transform active:scale-95 text-left flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">
                Join Room
              </span>
              <span className="text-[11px] text-slate-400">Enter room code</span>
            </div>
          </button>
        </div>

        {/* Play Offline (Pass & Play / vs Computer) */}
        <button
          onClick={() => {
            soundService.playClick();
            setShowOfflineModal(true);
          }}
          className="group relative w-full p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400/60 shadow-lg transition-all duration-300 active:scale-98 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-lg text-white block tracking-wide group-hover:text-amber-300 transition-colors">
                Play Offline
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Pass & Play or challenge AI bots (No internet needed)
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ---------------- BOTTOM STATUS / BADGE ---------------- */}
      <footer className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Server-Authoritative Anti-Cheat & Real Firebase Sync</span>
        </div>
      </footer>

      {/* ---------------- MODAL: CREATE ROOM ---------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white text-center mb-1">
              CREATE PRIVATE ROOM
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Choose the maximum number of players
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setOnlinePlayerCount(num as 2 | 3 | 4)}
                  className={`py-3 rounded-2xl font-black text-sm flex flex-col items-center gap-1 transition-all ${
                    onlinePlayerCount === num
                      ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Users2 className="w-5 h-5" />
                  <span>{num} Players</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateRoom(onlinePlayerCount)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: JOIN ROOM ---------------- */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleJoinSubmit}
            className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-black text-white text-center mb-1">
              JOIN ROOM
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Enter the 6-character room code from your friend
            </p>

            <input
              type="text"
              maxLength={8}
              autoFocus
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. LUDO78"
              className="w-full text-center text-2xl font-black tracking-widest uppercase px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400 mb-6"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- MODAL: PLAY OFFLINE CONFIG ---------------- */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white text-center mb-1">
              OFFLINE PASS & PLAY
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Configure players and computer bots
            </p>

            {/* Select player count */}
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setOfflinePlayerCount(num as 2 | 3 | 4)}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    offlinePlayerCount === num
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>

            {/* Configure Bot vs Human for each slot */}
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Player Types
            </label>
            <div className="space-y-2 mb-6">
              {Array.from({ length: offlinePlayerCount }).map((_, idx) => {
                const isBot = offlineBotConfigs[idx] ?? (idx > 0);
                const colors: PlayerColor[] =
                  offlinePlayerCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
                const color = colors[idx];

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700"
                  >
                    <span className="font-bold text-sm text-slate-200 capitalize">
                      {idx === 0 ? 'Player 1 (You)' : `Player ${idx + 1} (${color})`}
                    </span>
                    {idx === 0 ? (
                      <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        Human
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setOfflineBotConfigs(prev => ({
                            ...prev,
                            [idx]: !isBot,
                          }))
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isBot
                            ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40'
                            : 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40'
                        }`}
                      >
                        {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {isBot ? 'Bot AI' : 'Human'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchOffline}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
