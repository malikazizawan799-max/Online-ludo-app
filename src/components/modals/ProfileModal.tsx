import React, { useState } from 'react';
import { X, User as UserIcon, Trophy, Award, Flame, LogIn, LogOut, Check } from 'lucide-react';
import { UserProfile } from '../../types/game';
import { loginWithGoogle, logoutUser } from '../../services/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const AVATAR_OPTIONS = [
  { id: 'crown-gold', label: 'Ludo King', icon: '👑', color: 'from-amber-400 to-amber-600' },
  { id: 'tiger', label: 'Wild Tiger', icon: '🐯', color: 'from-orange-400 to-red-500' },
  { id: 'dragon', label: 'Fire Dragon', icon: '🐲', color: 'from-emerald-400 to-teal-600' },
  { id: 'robot', label: 'Cyborg Bot', icon: '🤖', color: 'from-cyan-400 to-blue-600' },
  { id: 'ninja', label: 'Shadow Ninja', icon: '🥷', color: 'from-purple-500 to-indigo-700' },
  { id: 'dice-master', label: 'Dice Ace', icon: '🎲', color: 'from-pink-500 to-rose-600' },
  { id: 'queen', label: 'Royal Queen', icon: '👸', color: 'from-fuchsia-400 to-purple-600' },
  { id: 'lion', label: 'Golden Lion', icon: '🦁', color: 'from-yellow-400 to-amber-600' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || 'crown-gold');
  const [loadingAuth, setLoadingAuth] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile({
      displayName: name.trim() || 'Player',
      avatar: selectedAvatar,
    });
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoadingAuth(true);
    try {
      const user = await loginWithGoogle();
      if (user.displayName) {
        setName(user.displayName);
        onUpdateProfile({
          displayName: user.displayName,
          isGuest: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onUpdateProfile({ isGuest: true });
    } catch (err) {
      console.error(err);
    }
  };

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-wide">PLAYER PROFILE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Player Name
            </label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Avatar Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Avatar
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map(av => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`relative p-2.5 rounded-2xl flex flex-col items-center justify-center transition-transform ${
                      isSelected
                        ? 'ring-4 ring-amber-400 bg-slate-800 scale-105 shadow-lg'
                        : 'bg-slate-900/80 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center text-2xl shadow-md`}
                    >
                      {av.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1 truncate w-full text-center">
                      {av.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Statistics Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{profile.wins}</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Wins
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <Award className="w-5 h-5 text-sky-400 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{profile.totalMatches}</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Matches
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <Flame className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <div className="text-xl font-black text-white">{winRate}%</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Win Rate
              </div>
            </div>
          </div>

          {/* Account Linking / Authentication status */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {profile.isGuest ? 'Playing as Guest' : 'Google Account Linked'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {profile.isGuest
                    ? 'Sign in with Google to sync stats across devices'
                    : 'Your cloud match history is protected'}
                </span>
              </div>
              {profile.isGuest ? (
                <button
                  onClick={handleGoogleLogin}
                  disabled={loadingAuth}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg transition-transform active:scale-95"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
