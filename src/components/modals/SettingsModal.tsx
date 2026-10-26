import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Zap, CheckCircle2, FlaskConical } from 'lucide-react';
import { soundService } from '../../services/audio';
import { runEngineTests } from '../../game/ludoEngine.test';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (v: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (v: boolean) => void;
  fastAnimation: boolean;
  setFastAnimation: (v: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  musicEnabled,
  setMusicEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  fastAnimation,
  setFastAnimation,
}) => {
  const [testResults, setTestResults] = useState<{ passed: boolean; results: string[] } | null>(null);

  if (!isOpen) return null;

  const handleRunTests = () => {
    const res = runEngineTests();
    setTestResults(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-wide">SETTINGS</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-100 block">Sound Effects</span>
                <span className="text-xs text-slate-400">Dice roll, moves, captures</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundService.setSoundEnabled(next);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-purple-400">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-100 block">Background Music</span>
                <span className="text-xs text-slate-400">Atmospheric game chords</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !musicEnabled;
                setMusicEnabled(next);
                soundService.setMusicEnabled(next);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                musicEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-100 block">Vibration Feedback</span>
                <span className="text-xs text-slate-400">Haptics on mobile phones</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !vibrationEnabled;
                setVibrationEnabled(next);
                if (next) soundService.triggerVibrate(40);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Fast Animations */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-sky-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-100 block">Turbo Move Speed</span>
                <span className="text-xs text-slate-400">Faster bot and turn transitions</span>
              </div>
            </div>
            <button
              onClick={() => setFastAnimation(!fastAnimation)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                fastAnimation ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  fastAnimation ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Engine Diagnostic Verification */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Game Engine Test Suite
                </span>
              </div>
              <button
                onClick={handleRunTests}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Run Tests
              </button>
            </div>
            {testResults && (
              <div className="mt-2 text-xs space-y-1 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                <div className="font-bold text-emerald-400 mb-1">
                  {testResults.passed ? 'All 9 Unit Tests Passed' : 'Some Tests Failed'}
                </div>
                {testResults.results.map((r, i) => (
                  <div key={i} className="text-slate-300 text-[11px] truncate">
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
